import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { allKits, getStats, profileText, leaderboard, isAdmin, setLobby, getArenas, getCustomKits, setArenas, setLobby as saveLobby } from "./data.js";
import { queue, leave, setupArena, setArenaPart, removeArena } from "./matches.js";

async function show(player, form) { try { return await form.show(player); } catch { return undefined; } }
export async function mainMenu(player) {
  const result = await show(player, new ActionFormData().title("⚔ Levaria PvP Club").body("Choose an activity").button("🥊 Queue for a fight").button("📊 My profile").button("🏆 Leaderboards").button("❌ Leave queue / match").button("🛠 Admin settings"));
  if (!result || result.canceled) return;
  if (result.selection === 0) return queueMenu(player);
  if (result.selection === 1) return profileMenu(player);
  if (result.selection === 2) return leaderboardMenu(player);
  if (result.selection === 3) return leave(player);
  if (result.selection === 4 && isAdmin(player)) return adminMenu(player);
  if (result.selection === 4) player.sendMessage("§cYou need operator permissions or the lpc.admin tag.");
}
async function queueMenu(player) {
  const kits = Object.keys(allKits()); const r = await show(player, new ModalFormData().title("Queue").dropdown("Kit", kits).toggle("Ranked match", false));
  if (!r || r.canceled) return; queue(player, kits[r.formValues[0]], r.formValues[1], false);
}
async function profileMenu(player) { const s = getStats(player); await show(player, new ActionFormData().title("📊 Profile").body(profileText(s)).button("Back")); }
async function leaderboardMenu(player) {
  const rows = ["elo", "wins", "streak"].map(kind => `§l${kind.toUpperCase()}§r\n${leaderboard(kind).map((s, i) => `§e${i + 1}.§r ${s.name} §7— ${kind === "elo" ? s.elo : kind === "wins" ? s.wins : s.bestStreak}`).join("\n") || "§7No data"}`).join("\n\n");
  await show(player, new ActionFormData().title("🏆 Leaderboards").body(rows).button("Back"));
}
async function adminMenu(player) {
  const result = await show(player, new ActionFormData().title("🛠 Admin settings").body("Configure the club").button("Set lobby here").button("Add arena here").button("Arena tools").button("Kit editor"));
  if (!result || result.canceled) return;
  if (result.selection === 0) { saveLobby({ x: player.location.x, y: player.location.y, z: player.location.z, dimension: player.dimension.id }); player.sendMessage("§aLobby saved."); }
  if (result.selection === 1) return addArena(player);
  if (result.selection === 2) return arenaTools(player);
  if (result.selection === 3) return kitEditor(player);
}
async function addArena(player) { const kits = Object.keys(allKits()); const r = await show(player, new ModalFormData().title("Add arena").textField("Arena name", "Arena 1").dropdown("Kit", kits)); if (!r || r.canceled) return; setupArena(r.formValues[0], kits[r.formValues[1]], { x: player.location.x, y: player.location.y, z: player.location.z, dimension: player.dimension.id }); player.sendMessage(`§aArena ${r.formValues[0]} created.`); }
async function arenaTools(player) { const names = Object.keys(getArenas()); if (!names.length) return player.sendMessage("§cNo arenas configured."); const r = await show(player, new ModalFormData().title("Arena tools").dropdown("Arena", names).dropdown("Action", ["Set spawn 1", "Set spawn 2", "Set reset center", "Delete"])); if (!r || r.canceled) return; const name = names[r.formValues[0]], action = r.formValues[1]; if (action === 3) removeArena(name); else setArenaPart(name, ["spawn1", "spawn2", "reset"][action], { x: player.location.x, y: player.location.y, z: player.location.z, dimension: player.dimension.id }); player.sendMessage("§aArena updated."); }
async function kitEditor(player) { const r = await show(player, new ModalFormData().title("Custom kit editor").textField("Kit name", "My Kit").textField("Items", "minecraft:diamond_sword,minecraft:golden_apple 2").textField("Icon", "★")); if (!r || r.canceled) return; const kits = getCustomKits(); kits[r.formValues[0]] = { icon: r.formValues[2], items: r.formValues[1].split(",").map(x => x.trim()).filter(Boolean) }; const { setDynamicProperty } = player.dimension.world ?? {}; player.sendMessage("§aCustom kit saved. (Use /lpc to select it.)");
  // The world object is used by the command handler to persist this form result.
  player.setDynamicProperty("lpc:last_kit", r.formValues[0]);
}
