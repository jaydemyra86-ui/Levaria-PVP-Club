import { world, system, ItemStack } from "@minecraft/server";
import { CONFIG, BUILTIN_KITS, rankFor } from "./config.js";

const safe = (fn) => { try { return fn(); } catch (e) { console.warn(`[LPC] ${e}`); return undefined; } };
const readJson = (key, fallback) => { const value = world.getDynamicProperty(key); if (typeof value !== "string") return fallback; try { return JSON.parse(value); } catch { return fallback; } };
const writeJson = (key, value) => world.setDynamicProperty(key, JSON.stringify(value));

export function getLobby() { return readJson(CONFIG.lobbyKey, undefined); }
export function setLobby(location) { writeJson(CONFIG.lobbyKey, location); }
export function getArenas() { return readJson(CONFIG.arenasKey, {}); }
export function setArenas(value) { writeJson(CONFIG.arenasKey, value); }
export function getCustomKits() { return readJson(CONFIG.customKitsKey, {}); }
export function allKits() { return { ...BUILTIN_KITS, ...getCustomKits() }; }

export function getStats(player) {
  const key = CONFIG.statsPrefix + player.id;
  const current = readJson(key, null);
  if (current) return current;
  const stats = { id: player.id, name: player.name, elo: CONFIG.defaultElo, wins: 0, losses: 0, kills: 0, deaths: 0, streak: 0, bestStreak: 0 };
  writeJson(key, stats); return stats;
}
export function saveStats(stats) { writeJson(CONFIG.statsPrefix + stats.id, stats); }
export function updateName(player) { const stats = getStats(player); stats.name = player.name; saveStats(stats); return stats; }
export function profileText(stats) { const kd = stats.deaths ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2); return `§l§b${stats.name}§r\n§7Rank: §f${rankFor(stats.elo)} §8(${stats.elo})\n§7Wins: §a${stats.wins} §7Losses: §c${stats.losses}\n§7K/D: §f${kd}\n§7Win streak: §e${stats.streak} §7(best ${stats.bestStreak})`; }

export function leaderboard(kind = "elo", limit = 10) {
  const result = [];
  for (const player of world.getPlayers()) result.push(getStats(player));
  const key = kind === "wins" ? "wins" : kind === "streak" ? "bestStreak" : "elo";
  return result.sort((a, b) => b[key] - a[key]).slice(0, limit);
}

export function isAdmin(player) { return player.hasTag(CONFIG.adminTag) || safe(() => player.commandPermissionLevel >= 2) === true; }
export function teleportLobby(player) { const l = getLobby(); if (l) safe(() => player.teleport(l, { dimension: world.getDimension(l.dimension ?? "overworld") })); }
export function clearInventory(player) { safe(() => player.runCommand("clear @s")); }
export function giveKit(player, kitName) {
  const kit = allKits()[kitName]; if (!kit) return false;
  clearInventory(player);
  for (const raw of kit.items) safe(() => { const parts = raw.split(" "); const stack = new ItemStack(parts[0], Number(parts[1] ?? 1)); player.getComponent("minecraft:inventory").container.addItem(stack); });
  return true;
}
export function heal(player) { safe(() => player.runCommand("effect @s instant_health 1 255 true")); safe(() => player.runCommand("effect @s saturation 1 255 true")); }
export function announce(message) { world.sendMessage(`§b[Levaria PvP] §r${message}`); }
