import { world, system, DynamicPropertiesDefinition } from "@minecraft/server";
import { CONFIG, BUILTIN_KITS } from "./config.js";
import { mainMenu } from "./ui.js";
import { getStats, updateName, leaderboard, isAdmin, setLobby, getCustomKits, allKits, setArenas } from "./data.js";
import { queue, leave, onDeath, onLeave, setupArena, setArenaPart, removeArena } from "./matches.js";

system.beforeEvents.startup.subscribe(({ propertyRegistry }) => {
  const def = new DynamicPropertiesDefinition();
  def.defineString(CONFIG.lobbyKey, 2048); def.defineString(CONFIG.arenasKey, 32767); def.defineString(CONFIG.customKitsKey, 32767);
  propertyRegistry.registerWorldDynamicProperties(def);
  const playerDef = new DynamicPropertiesDefinition(); playerDef.defineString("lpc:last_kit", 64); propertyRegistry.registerEntityTypeDynamicProperties(playerDef, "minecraft:player");
});

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => { updateName(player); if (initialSpawn) player.sendMessage("§bWelcome to Levaria PvP Club! §7Use §f/lpc §7to open the menu."); });
world.afterEvents.entityDie.subscribe(({ deadEntity }) => { if (deadEntity.typeId === "minecraft:player") onDeath(deadEntity); });
world.afterEvents.playerLeave.subscribe(({ playerId }) => { const p = [...world.getPlayers()].find(x => x.id === playerId); if (p) onLeave(p); });
world.beforeEvents.chatSend.subscribe(event => { if (!event.message.startsWith("/lpc")) return; event.cancel = true; const args = event.message.trim().split(/\s+/).slice(1); command(event.sender, args); });

async function command(player, args) {
  const sub = (args[0] ?? "").toLowerCase();
  if (!sub) return mainMenu(player);
  if (sub === "queue") return mainMenu(player);
  if (sub === "leave") return leave(player);
  if (sub === "stats") { const target = args.slice(1).join(" ") || player.name; const p = [...world.getPlayers()].find(x => x.name === target) ?? player; return player.sendMessage(getStats(p) ? `§b${getStats(p).name}\n${getStats(p).elo} Elo | ${getStats(p).wins}W/${getStats(p).losses}L | K/D ${(getStats(p).deaths ? getStats(p).kills / getStats(p).deaths : getStats(p).kills).toFixed(2)}` : "§cPlayer not found."); }
  if (sub === "leaderboard") return player.sendMessage(leaderboard("elo").map((s, i) => `§e${i + 1}.§r ${s.name} §7— ${s.elo} Elo`).join("\n") || "§7No data.");
  if (sub === "admin") return isAdmin(player) ? mainMenu(player) : player.sendMessage("§cAdmin permission required.");
  if (sub === "arena" && isAdmin(player)) return arenaCommand(player, args.slice(1));
  if (sub === "lobby" && isAdmin(player) && args[1] === "set") { setLobby({ x: player.location.x, y: player.location.y, z: player.location.z, dimension: player.dimension.id }); return player.sendMessage("§aLobby saved."); }
  player.sendMessage("§7/lpc | queue | stats | leaderboard | leave | admin");
}
function loc(player) { return { x: player.location.x, y: player.location.y, z: player.location.z, dimension: player.dimension.id }; }
function arenaCommand(player, args) { const action = args[0], name = args[1]; if (action === "add") { setupArena(name, args[2] || "Sword", loc(player)); player.sendMessage("§aArena created."); } else if (action === "setspawn") { setArenaPart(name, args[2] === "2" ? "spawn2" : "spawn1", loc(player)); player.sendMessage("§aSpawn saved."); } else if (action === "setreset") { setArenaPart(name, "reset", loc(player)); player.sendMessage("§aReset point saved."); } else if (action === "remove") { removeArena(name); player.sendMessage("§aArena removed."); } else player.sendMessage("§7/lpc arena add <name> <kit> | setspawn <name> <1|2> | setreset <name> | remove <name>"); }

system.runInterval(() => { for (const p of world.getPlayers()) { if (p.hasTag("lpc.menu")) { p.removeTag("lpc.menu"); mainMenu(p); } } }, 10);
