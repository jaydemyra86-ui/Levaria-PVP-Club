export const CONFIG = {
  defaultElo: 1000,
  rankedKFactor: 32,
  countdownSeconds: 5,
  arenaResetRadius: 24,
  adminTag: "lpc.admin",
  lobbyKey: "lpc:lobby",
  arenasKey: "lpc:arenas",
  customKitsKey: "lpc:custom_kits",
  statsPrefix: "lpc:stats:",
  matchPrefix: "lpc:match:",
  queuePollTicks: 20
};

export const RANKS = [
  { name: "Copper", min: 0 },
  { name: "Iron", min: 1100 },
  { name: "Gold", min: 1300 },
  { name: "Emerald", min: 1500 },
  { name: "Diamond", min: 1750 },
  { name: "Netherite", min: 2050 },
  { name: "Champion", min: 2400 }
];

export const BUILTIN_KITS = {
  Sword: { icon: "⚔", items: ["minecraft:iron_sword", "minecraft:bow", "minecraft:arrow 16", "minecraft:cooked_beef 16", "minecraft:iron_helmet", "minecraft:iron_chestplate", "minecraft:iron_leggings", "minecraft:iron_boots"] },
  Axe: { icon: "🪓", items: ["minecraft:iron_axe", "minecraft:shield", "minecraft:cooked_beef 16", "minecraft:iron_helmet", "minecraft:iron_chestplate", "minecraft:iron_leggings", "minecraft:iron_boots"] },
  "Dia Pot": { icon: "💎", items: ["minecraft:diamond_sword", "minecraft:bow", "minecraft:arrow 32", "minecraft:diamond_helmet", "minecraft:diamond_chestplate", "minecraft:diamond_leggings", "minecraft:diamond_boots", "minecraft:splash_potion 5", "minecraft:enchanted_golden_apple 2"] },
  "Neth Pot": { icon: "🧪", items: ["minecraft:netherite_sword", "minecraft:netherite_helmet", "minecraft:netherite_chestplate", "minecraft:netherite_leggings", "minecraft:netherite_boots", "minecraft:splash_potion 12", "minecraft:ender_pearl 4", "minecraft:golden_apple 8"] },
  UHC: { icon: "❤", items: ["minecraft:diamond_sword", "minecraft:bow", "minecraft:arrow 32", "minecraft:golden_apple 6", "minecraft:water_bucket", "minecraft:lava_bucket", "minecraft:diamond_helmet", "minecraft:diamond_chestplate", "minecraft:diamond_leggings", "minecraft:diamond_boots"] },
  Mace: { icon: "🔨", items: ["minecraft:mace", "minecraft:wind_charge 16", "minecraft:water_bucket", "minecraft:diamond_helmet", "minecraft:diamond_chestplate", "minecraft:diamond_leggings", "minecraft:diamond_boots", "minecraft:golden_apple 4"] },
  "Mace SMP": { icon: "🔨", items: ["minecraft:mace", "minecraft:elytra", "minecraft:firework_rocket 32", "minecraft:totem_of_undying", "minecraft:golden_apple 8", "minecraft:netherite_helmet", "minecraft:netherite_chestplate", "minecraft:netherite_leggings", "minecraft:netherite_boots"] }
};

export function rankFor(elo) {
  return [...RANKS].reverse().find(r => elo >= r.min)?.name ?? "Copper";
}
