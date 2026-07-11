import { randomIndex } from "./rng";

export type CombatDieId =
  | "trainingSword"
  | "woodenShield"
  | "torch"
  | "wolfFang"
  | "boarTusk"
  | "banditBuckler"
  | "bruteCleaver"
  | "copperLongsword"
  | "oakguardShield"
  | "direWolfClaw";

export type CombatEnemyId =
  | "forestWolf"
  | "wildBoar"
  | "banditScout"
  | "forestBrute"
  | "direWolf";

export type CombatZoneId = "forestEdge" | "wolfDen";

export type CombatRole = "Damage" | "Block" | "Utility";

export type CombatDieMaterial =
  | "iron"
  | "wood"
  | "ember"
  | "bone"
  | "leather"
  | "cleaver"
  | "copper"
  | "oak"
  | "claw";

export type CombatMotionPreset = "strike" | "guard" | "spark";

export interface CombatDieVisualDefinition {
  material: CombatDieMaterial;
  motion: CombatMotionPreset;
  rarity: "common" | "rare" | "boss";
  tier: 1 | 2;
}

export type CombatFace =
  | { type: "damage"; amount: number }
  | { type: "block"; amount: number }
  | { type: "light"; amount: number };

export interface CombatDieDefinition {
  id: CombatDieId;
  name: string;
  role: CombatRole;
  levelRequirement: number;
  source: "crafted" | "drop";
  sourceLabel: string;
  description: string;
  faces: readonly CombatFace[];
  visual: CombatDieVisualDefinition;
}

export interface CombatDieResult {
  dieId: CombatDieId;
  dieName: string;
  faceIndex: number;
  face: CombatFace;
}

export interface CombatRollEvent {
  id: number;
  results: CombatDieResult[];
  damage: number;
  block: number;
  light: number;
}

export interface CombatRollOutcome {
  nextSeed: number;
  event: CombatRollEvent;
}

export type CombatLootEntry =
  | { type: "nothing" }
  | { type: "monsterParts"; amount: number }
  | { type: "die"; dieId: CombatDieId };

export interface CombatLootOutcome {
  nextSeed: number;
  monsterParts: number;
  dice: Partial<Record<CombatDieId, number>>;
  rolls: CombatLootEntry[];
}

export interface CombatEnemyDefinition {
  id: CombatEnemyId;
  name: string;
  isBoss: boolean;
  maxHp: number;
  attack: number;
  attackIntervalMs: number;
  xpReward: number;
  guaranteedMonsterParts: number;
  lootTable: readonly CombatLootEntry[];
}

export interface EnemyAttackOutcome {
  damageTaken: number;
  blockUsed: number;
  playerHp: number;
}

export const COMBAT_DIE_IDS: readonly CombatDieId[] = [
  "trainingSword",
  "woodenShield",
  "torch",
  "wolfFang",
  "boarTusk",
  "banditBuckler",
  "bruteCleaver",
  "copperLongsword",
  "oakguardShield",
  "direWolfClaw",
];

export const COMBAT_DICE: Readonly<Record<CombatDieId, CombatDieDefinition>> = {
  trainingSword: {
    id: "trainingSword",
    name: "Training Sword",
    role: "Damage",
    levelRequirement: 1,
    source: "crafted",
    sourceLabel: "Workshop recipe",
    description: "A reliable first weapon for the Forest Edge.",
    visual: { material: "iron", motion: "strike", rarity: "common", tier: 1 },
    faces: [
      { type: "damage", amount: 0 },
      { type: "damage", amount: 1 },
      { type: "damage", amount: 1 },
      { type: "damage", amount: 1 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 2 },
    ],
  },
  woodenShield: {
    id: "woodenShield",
    name: "Wooden Shield",
    role: "Block",
    levelRequirement: 1,
    source: "crafted",
    sourceLabel: "Workshop recipe",
    description: "Stores protection against the enemy's next attack.",
    visual: { material: "wood", motion: "guard", rarity: "common", tier: 1 },
    faces: [
      { type: "block", amount: 0 },
      { type: "block", amount: 1 },
      { type: "block", amount: 1 },
      { type: "block", amount: 1 },
      { type: "block", amount: 2 },
      { type: "block", amount: 2 },
    ],
  },
  torch: {
    id: "torch",
    name: "Torch",
    role: "Utility",
    levelRequirement: 2,
    source: "crafted",
    sourceLabel: "Workshop recipe",
    description: "Light can Scout an enemy for one additional loot roll.",
    visual: { material: "ember", motion: "spark", rarity: "common", tier: 1 },
    faces: [
      { type: "light", amount: 0 },
      { type: "light", amount: 0 },
      { type: "light", amount: 0 },
      { type: "light", amount: 1 },
      { type: "light", amount: 1 },
      { type: "light", amount: 1 },
    ],
  },
  wolfFang: {
    id: "wolfFang",
    name: "Wolf Fang",
    role: "Damage",
    levelRequirement: 3,
    source: "drop",
    sourceLabel: "Forest Wolf drop",
    description: "A fast, vicious die found at the Forest Edge.",
    visual: { material: "bone", motion: "strike", rarity: "rare", tier: 1 },
    faces: [
      { type: "damage", amount: 0 },
      { type: "damage", amount: 1 },
      { type: "damage", amount: 1 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 3 },
    ],
  },
  boarTusk: {
    id: "boarTusk",
    name: "Boar Tusk",
    role: "Damage",
    levelRequirement: 3,
    source: "drop",
    sourceLabel: "Wild Boar drop",
    description: "A heavy damage die carved from a forest boar's tusk.",
    visual: { material: "bone", motion: "strike", rarity: "rare", tier: 1 },
    faces: [
      { type: "damage", amount: 0 },
      { type: "damage", amount: 1 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 3 },
      { type: "damage", amount: 3 },
    ],
  },
  banditBuckler: {
    id: "banditBuckler",
    name: "Bandit Buckler",
    role: "Block",
    levelRequirement: 3,
    source: "drop",
    sourceLabel: "Bandit Scout drop",
    description: "A quick defensive die taken from a defeated scout.",
    visual: { material: "leather", motion: "guard", rarity: "rare", tier: 1 },
    faces: [
      { type: "block", amount: 0 },
      { type: "block", amount: 1 },
      { type: "block", amount: 1 },
      { type: "block", amount: 2 },
      { type: "block", amount: 2 },
      { type: "block", amount: 3 },
    ],
  },
  bruteCleaver: {
    id: "bruteCleaver",
    name: "Brute Cleaver",
    role: "Damage",
    levelRequirement: 4,
    source: "drop",
    sourceLabel: "Forest Brute first-clear reward",
    description: "The Forest Brute's signature die. Brutal, heavy and reliable.",
    visual: { material: "cleaver", motion: "strike", rarity: "boss", tier: 1 },
    faces: [
      { type: "damage", amount: 1 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 3 },
      { type: "damage", amount: 3 },
      { type: "damage", amount: 4 },
    ],
  },
  copperLongsword: {
    id: "copperLongsword",
    name: "Copper Longsword",
    role: "Damage",
    levelRequirement: 5,
    source: "crafted",
    sourceLabel: "Frontier Forge recipe",
    description: "A balanced Tier 2 blade built to break into the Wolf Den.",
    visual: { material: "copper", motion: "strike", rarity: "common", tier: 2 },
    faces: [
      { type: "damage", amount: 1 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 3 },
      { type: "damage", amount: 3 },
    ],
  },
  oakguardShield: {
    id: "oakguardShield",
    name: "Oakguard Shield",
    role: "Block",
    levelRequirement: 5,
    source: "crafted",
    sourceLabel: "Frontier Forge recipe",
    description: "Layered oak and copper bands built for heavier enemy attacks.",
    visual: { material: "oak", motion: "guard", rarity: "common", tier: 2 },
    faces: [
      { type: "block", amount: 1 },
      { type: "block", amount: 1 },
      { type: "block", amount: 2 },
      { type: "block", amount: 2 },
      { type: "block", amount: 3 },
      { type: "block", amount: 3 },
    ],
  },
  direWolfClaw: {
    id: "direWolfClaw",
    name: "Dire Wolf Claw",
    role: "Damage",
    levelRequirement: 6,
    source: "drop",
    sourceLabel: "Dire Wolf drop",
    description: "A rare Wolf Den trophy with a vicious high floor.",
    visual: { material: "claw", motion: "strike", rarity: "rare", tier: 2 },
    faces: [
      { type: "damage", amount: 1 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 2 },
      { type: "damage", amount: 3 },
      { type: "damage", amount: 3 },
      { type: "damage", amount: 4 },
    ],
  },
};

export const FOREST_WOLF: CombatEnemyDefinition = {
  id: "forestWolf",
  name: "Forest Wolf",
  isBoss: false,
  maxHp: 4,
  attack: 2,
  attackIntervalMs: 6_000,
  xpReward: 5,
  guaranteedMonsterParts: 1,
  lootTable: [
    { type: "nothing" },
    { type: "nothing" },
    { type: "nothing" },
    { type: "monsterParts", amount: 1 },
    { type: "monsterParts", amount: 2 },
    { type: "die", dieId: "wolfFang" },
  ],
};

export const WILD_BOAR: CombatEnemyDefinition = {
  id: "wildBoar",
  name: "Wild Boar",
  isBoss: false,
  maxHp: 5,
  attack: 3,
  attackIntervalMs: 7_000,
  xpReward: 7,
  guaranteedMonsterParts: 2,
  lootTable: [
    { type: "nothing" },
    { type: "nothing" },
    { type: "nothing" },
    { type: "monsterParts", amount: 1 },
    { type: "monsterParts", amount: 2 },
    { type: "nothing" },
    { type: "nothing" },
    { type: "die", dieId: "boarTusk" },
  ],
};

export const BANDIT_SCOUT: CombatEnemyDefinition = {
  id: "banditScout",
  name: "Bandit Scout",
  isBoss: false,
  maxHp: 4,
  attack: 2,
  attackIntervalMs: 4_500,
  xpReward: 6,
  guaranteedMonsterParts: 1,
  lootTable: [
    { type: "nothing" },
    { type: "nothing" },
    { type: "nothing" },
    { type: "monsterParts", amount: 1 },
    { type: "monsterParts", amount: 2 },
    { type: "nothing" },
    { type: "nothing" },
    { type: "die", dieId: "banditBuckler" },
  ],
};

export const FOREST_BRUTE: CombatEnemyDefinition = {
  id: "forestBrute",
  name: "Forest Brute",
  isBoss: true,
  maxHp: 34,
  attack: 3,
  attackIntervalMs: 6_500,
  xpReward: 25,
  guaranteedMonsterParts: 10,
  lootTable: [
    { type: "monsterParts", amount: 2 },
    { type: "monsterParts", amount: 3 },
    { type: "monsterParts", amount: 4 },
    { type: "nothing" },
  ],
};

export const DIRE_WOLF: CombatEnemyDefinition = {
  id: "direWolf",
  name: "Dire Wolf",
  isBoss: false,
  maxHp: 22,
  attack: 5,
  attackIntervalMs: 5_500,
  xpReward: 12,
  guaranteedMonsterParts: 3,
  lootTable: [
    { type: "nothing" },
    { type: "nothing" },
    { type: "nothing" },
    { type: "nothing" },
    { type: "nothing" },
    { type: "monsterParts", amount: 1 },
    { type: "monsterParts", amount: 1 },
    { type: "monsterParts", amount: 2 },
    { type: "monsterParts", amount: 2 },
    { type: "nothing" },
    { type: "nothing" },
    { type: "die", dieId: "direWolfClaw" },
  ],
};

export const COMBAT_ENEMIES: Readonly<
  Record<CombatEnemyId, CombatEnemyDefinition>
> = {
  forestWolf: FOREST_WOLF,
  wildBoar: WILD_BOAR,
  banditScout: BANDIT_SCOUT,
  forestBrute: FOREST_BRUTE,
  direWolf: DIRE_WOLF,
};

export const FOREST_EDGE_ENEMY_IDS: readonly CombatEnemyId[] = [
  "forestWolf",
  "wildBoar",
  "banditScout",
];

export const PLAYER_MAX_HP = 10;
export const COMBAT_ROLL_INTERVAL_MS = 4_000;

export function createEmptyCombatInventory(): Record<CombatDieId, number> {
  return {
    trainingSword: 0,
    woodenShield: 0,
    torch: 0,
    wolfFang: 0,
    boarTusk: 0,
    banditBuckler: 0,
    bruteCleaver: 0,
    copperLongsword: 0,
    oakguardShield: 0,
    direWolfClaw: 0,
  };
}

export function selectForestEdgeEnemy(
  seed: number,
): { enemy: CombatEnemyDefinition; nextSeed: number } {
  const step = randomIndex(seed, FOREST_EDGE_ENEMY_IDS.length);

  return {
    enemy: COMBAT_ENEMIES[FOREST_EDGE_ENEMY_IDS[step.value]],
    nextSeed: step.seed,
  };
}

export function selectWolfDenEnemy(
  seed: number,
): { enemy: CombatEnemyDefinition; nextSeed: number } {
  return { enemy: DIRE_WOLF, nextSeed: seed };
}

export function resolveCombatRoll(
  seed: number,
  eventId: number,
  dice: readonly CombatDieDefinition[],
): CombatRollOutcome {
  let nextSeed = seed;

  const results = dice.map<CombatDieResult>((die) => {
    const step = randomIndex(nextSeed, die.faces.length);
    nextSeed = step.seed;

    return {
      dieId: die.id,
      dieName: die.name,
      faceIndex: step.value,
      face: die.faces[step.value],
    };
  });

  return {
    nextSeed,
    event: {
      id: eventId,
      results,
      damage: results.reduce(
        (total, result) =>
          total + (result.face.type === "damage" ? result.face.amount : 0),
        0,
      ),
      block: results.reduce(
        (total, result) =>
          total + (result.face.type === "block" ? result.face.amount : 0),
        0,
      ),
      light: results.reduce(
        (total, result) =>
          total + (result.face.type === "light" ? result.face.amount : 0),
        0,
      ),
    },
  };
}

export function resolveEnemyAttack(
  playerHp: number,
  block: number,
  attack: number,
): EnemyAttackOutcome {
  const safeBlock = Math.max(0, block);
  const safeAttack = Math.max(0, attack);
  const blockUsed = Math.min(safeBlock, safeAttack);
  const damageTaken = safeAttack - blockUsed;

  return {
    blockUsed,
    damageTaken,
    playerHp: Math.max(0, playerHp - damageTaken),
  };
}

export function resolveCombatLoot(
  seed: number,
  enemy: CombatEnemyDefinition,
  scouted: boolean,
): CombatLootOutcome {
  let nextSeed = seed;
  const rolls: CombatLootEntry[] = [];
  const dice: Partial<Record<CombatDieId, number>> = {};
  let monsterParts = enemy.guaranteedMonsterParts;
  const rollCount = scouted ? 2 : 1;

  for (let index = 0; index < rollCount; index += 1) {
    const step = randomIndex(nextSeed, enemy.lootTable.length);
    nextSeed = step.seed;
    const entry = enemy.lootTable[step.value];
    rolls.push(entry);

    if (entry.type === "monsterParts") {
      monsterParts += entry.amount;
    } else if (entry.type === "die") {
      dice[entry.dieId] = (dice[entry.dieId] ?? 0) + 1;
    }
  }

  return { nextSeed, monsterParts, dice, rolls };
}
