import { world, system } from "@minecraft/server";
import { CONFIG } from "./config.js";
import { getArenas, setArenas, allKits, giveKit, heal, getStats, saveStats, teleportLobby, announce } from "./data.js";

const queues = new Map();
const matches = new Map();
const snapshots = new Map();
let nextMatch = 1;

export function queue(player, kit, ranked = false, team = false) {
  if (!allKits()[kit]) return player.sendMessage("§cUnknown kit.");
  if ([...queues.values()].some(q => q.player.id === player.id)) return player.sendMessage("§eYou are already queued.");
  if ([...matches.values()].some(m => m.players.some(p => p.id === player.id))) return player.sendMessage("§cYou are already in a match.");
  queues.set(player.id, { player, kit, ranked, team, joined: Date.now() });
  player.sendMessage(`§aQueued for ${ranked ? "ranked" : "unranked"} ${kit}. §7Use /lpc leave to cancel.`);
  tryMatch();
}
export function leave(player) { if (queues.delete(player.id)) player.sendMessage("§eQueue cancelled."); else if ([...matches.values()].some(m => m.players.some(p => p.id === player.id))) finish([...matches.values()].find(m => m.players.some(p => p.id === player.id)), player); else player.sendMessage("§7You are not queued or fighting."); }
function findArena(kit) { return Object.entries(getArenas()).find(([, a]) => a.kit === kit && ![...matches.values()].some(m => m.arena === a)); }
function tryMatch() {
  const list = [...queues.values()];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j]; if (a.kit !== b.kit || a.ranked !== b.ranked || a.team !== b.team) continue;
    const arenaEntry = findArena(a.kit); if (!arenaEntry) continue;
    queues.delete(a.player.id); queues.delete(b.player.id); start([a.player, b.player], a.kit, a.ranked, arenaEntry[1]); return;
  }
}
function start(players, kit, ranked, arena) {
  const match = { id: `M${nextMatch++}`, players, kit, ranked, arena, tick: 0, active: false };
  matches.set(match.id, match);
  for (const player of players) { snapshots.set(player.id, { location: player.location, dimension: player.dimension.id }); giveKit(player, kit); heal(player); player.sendMessage(`§bMatch found! §f${kit} §7(${ranked ? "Ranked" : "Unranked"})`); }
  system.runTimeout(() => { if (!matches.has(match.id)) return; match.active = true; players.forEach((p, i) => { const spawn = i ? arena.spawn2 : arena.spawn1; if (spawn) p.teleport(spawn, { dimension: world.getDimension(arena.dimension ?? "overworld") }); }); announce(`§f${players[0].name} §7vs §f${players[1].name} §7in §b${arena.name ?? "Arena"}§7!`); }, CONFIG.countdownSeconds * 20);
}
export function finish(match, winner) {
  if (!match || !matches.has(match.id)) return;
  const loser = match.players.find(p => p.id !== winner.id); const ws = getStats(winner), ls = loser ? getStats(loser) : undefined;
  ws.wins++; ws.streak++; ws.bestStreak = Math.max(ws.bestStreak, ws.streak); ws.kills++; if (match.ranked) ws.elo += CONFIG.rankedKFactor;
  saveStats(ws);
  if (ls) { ls.losses++; ls.streak = 0; ls.deaths++; if (match.ranked) ls.elo = Math.max(0, ls.elo - CONFIG.rankedKFactor); saveStats(ls); }
  for (const player of match.players) { safeRestore(player); player.sendMessage(player.id === winner.id ? `§aVictory! §7Elo: ${ws.elo}` : "§cDefeat."); teleportLobby(player); }
  matches.delete(match.id); system.runTimeout(tryMatch, 1);
}
function safeRestore(player) { const snap = snapshots.get(player.id); snapshots.delete(player.id); try { player.runCommand("clear @s"); } catch {} if (snap) try { player.teleport(snap.location, { dimension: world.getDimension(snap.dimension) }); } catch {} }
export function onDeath(player) { const match = [...matches.values()].find(m => m.players.some(p => p.id === player.id)); if (match) system.runTimeout(() => finish(match, match.players.find(p => p.id !== player.id)), 1); }
export function onLeave(player) { leave(player); }
export function listMatches() { return [...matches.values()]; }
export function setupArena(name, kit, location) { const arenas = getArenas(); arenas[name] = { name, kit, dimension: location.dimension, spawn1: location, spawn2: { ...location, x: location.x + 4 }, reset: location }; setArenas(arenas); }
export function setArenaPart(name, part, location) { const arenas = getArenas(); if (!arenas[name]) return false; arenas[name][part] = location; setArenas(arenas); return true; }
export function removeArena(name) { const arenas = getArenas(); delete arenas[name]; setArenas(arenas); }
