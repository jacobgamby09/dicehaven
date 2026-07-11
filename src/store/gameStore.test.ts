import { beforeEach, describe, expect, it } from "vitest";
import { getGatheringDice, getGatheringDieFaces } from "../engine/content";
import { migratePersistedGameState, useGameStore } from "./gameStore";

describe("game store", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("only awards XP to the active skill", () => {
    useGameStore.getState().setActiveSkill("mining");
    useGameStore.getState().performRoll();

    const state = useGameStore.getState();
    expect(state.activeSkill).toBe("mining");
    expect(state.mining.lifetimeXp).toBe(1);
    expect(state.woodcutting.lifetimeXp).toBe(0);
  });

  it("migrates a v7 physical dice save and adds the Oak wallet safely", () => {
    const migrated = migratePersistedGameState(
      {
        resources: { wood: 17, stone: 9, copper: 2, monsterParts: 4 },
        activeSkill: "woodcutting",
        woodcutting: {
          lifetimeXp: 40,
          spendableXp: 12,
          slots: 1,
          rollSpeedLevel: 1,
          inventory: [
            { id: "woodcutting-die-1", kind: "dullAxe", upgradeLevel: 2 },
          ],
          loadout: ["woodcutting-die-1"],
        },
        mining: {
          lifetimeXp: 10,
          spendableXp: 10,
          slots: 1,
          rollSpeedLevel: 0,
          inventory: [
            { id: "mining-die-1", kind: "rustyPickaxe", upgradeLevel: 0 },
          ],
          loadout: ["mining-die-1"],
        },
      },
      7,
    );

    expect(migrated.resources).toEqual({
      wood: 17,
      oak: 0,
      stone: 9,
      copper: 2,
      monsterParts: 4,
    });
    expect(migrated.woodcutting?.inventory[0]).toEqual({
      id: "woodcutting-die-1",
      kind: "dullAxe",
      upgradeLevel: 2,
    });
    expect(migrated.woodcutting?.rollSpeedLevel).toBe(1);
    expect(migrated.buildings?.frontierForge).toBe(false);
    expect(migrated.combat?.inventory.copperLongsword).toBe(0);
    expect(migrated.combat?.wolfDenProgress).toBe(0);
  });

  it("buys Woodcutting slot two with Woodcutting XP and grants a physical die", () => {
    useGameStore.setState({
      woodcutting: {
        ...useGameStore.getState().woodcutting,
        lifetimeXp: 100,
        spendableXp: 35,
      },
    });

    useGameStore.getState().purchaseGatheringSlot("woodcutting");

    const state = useGameStore.getState();
    expect(state.woodcutting.lifetimeXp).toBe(100);
    expect(state.woodcutting.spendableXp).toBe(0);
    expect(state.woodcutting.slots).toBe(2);
    expect(
      getGatheringDice(
        state.woodcutting.inventory,
        state.woodcutting.loadout,
      ),
    ).toHaveLength(2);
    expect(state.woodcutting.inventory).toHaveLength(2);
  });

  it("does not buy a slot when skill XP is missing", () => {
    useGameStore.setState({
      woodcutting: {
        ...useGameStore.getState().woodcutting,
        lifetimeXp: 34,
        spendableXp: 34,
      },
    });

    useGameStore.getState().purchaseGatheringSlot("woodcutting");

    expect(useGameStore.getState().woodcutting.slots).toBe(1);
  });

  it("upgrades one exact die face while preserving lifetime XP", () => {
    const dieId = useGameStore.getState().woodcutting.inventory[0].id;
    useGameStore.setState({
      woodcutting: {
        ...useGameStore.getState().woodcutting,
        lifetimeXp: 5,
        spendableXp: 5,
      },
    });

    useGameStore
      .getState()
      .purchaseGatheringFaceUpgrade("woodcutting", dieId);

    const progression = useGameStore.getState().woodcutting;
    expect(progression.lifetimeXp).toBe(5);
    expect(progression.spendableXp).toBe(0);
    expect(
      getGatheringDieFaces(progression.inventory[0]).map((face) => face.amount),
    ).toEqual([1, 0, 0, 1, 1, 1]);
  });

  it("buys skill-wide roll speed with spendable XP", () => {
    useGameStore.setState({
      mining: {
        ...useGameStore.getState().mining,
        lifetimeXp: 20,
        spendableXp: 20,
      },
    });

    useGameStore.getState().purchaseGatheringRollSpeed("mining");

    expect(useGameStore.getState().mining.rollSpeedLevel).toBe(1);
    expect(useGameStore.getState().mining.spendableXp).toBe(0);
    expect(useGameStore.getState().mining.lifetimeXp).toBe(20);
  });

  it("crafts a Tier 2 gathering die from T1 resources and Monster Parts", () => {
    useGameStore.setState({
      resources: { wood: 120, oak: 0, stone: 80, copper: 0, monsterParts: 12 },
      combat: {
        ...useGameStore.getState().combat,
        forestTrophy: true,
      },
    });

    useGameStore.getState().craftTierTwoGatheringDie("woodcutting");

    const state = useGameStore.getState();
    expect(state.woodcutting.inventory).toHaveLength(2);
    expect(state.woodcutting.inventory[1].kind).toBe("oakheartAxe");
    expect(state.woodcutting.loadout).toEqual(["woodcutting-die-1"]);
    expect(state.resources).toEqual({
      wood: 0,
      oak: 0,
      stone: 0,
      copper: 0,
      monsterParts: 0,
    });
  });

  it("does not craft Tier 2 gathering dice before the Forest blueprint", () => {
    useGameStore.setState({
      resources: { wood: 120, oak: 0, stone: 80, copper: 0, monsterParts: 12 },
    });

    useGameStore.getState().craftTierTwoGatheringDie("woodcutting");

    expect(useGameStore.getState().woodcutting.inventory).toHaveLength(1);
    expect(useGameStore.getState().resources.wood).toBe(120);
  });

  it("keeps crafted Tier 2 dice on the bench until their level gate is met", () => {
    useGameStore.setState({
      resources: { wood: 80, oak: 0, stone: 120, copper: 0, monsterParts: 12 },
      combat: {
        ...useGameStore.getState().combat,
        forestTrophy: true,
      },
    });
    useGameStore.getState().craftTierTwoGatheringDie("mining");
    const specialistId = useGameStore.getState().mining.inventory[1].id;

    useGameStore.getState().equipGatheringDie("mining", specialistId, 0);
    expect(useGameStore.getState().mining.loadout).toEqual(["mining-die-1"]);

    useGameStore.setState({
      mining: {
        ...useGameStore.getState().mining,
        lifetimeXp: 250,
      },
    });
    useGameStore.getState().equipGatheringDie("mining", specialistId, 0);

    expect(useGameStore.getState().mining.loadout).toEqual([specialistId]);
    expect(useGameStore.getState().mining.inventory).toHaveLength(2);
  });

  it("swaps already-equipped gathering dice without duplicating an instance", () => {
    useGameStore.setState({
      woodcutting: {
        ...useGameStore.getState().woodcutting,
        lifetimeXp: 250,
        spendableXp: 35,
      },
    });
    useGameStore.getState().purchaseGatheringSlot("woodcutting");
    const [firstDieId, secondDieId] = useGameStore.getState().woodcutting.loadout;

    useGameStore.getState().equipGatheringDie("woodcutting", secondDieId, 0);

    expect(useGameStore.getState().woodcutting.loadout).toEqual([
      secondDieId,
      firstDieId,
    ]);
    expect(new Set(useGameStore.getState().woodcutting.loadout).size).toBe(2);
  });

  it("builds the Workshop and unlocks combat crafting", () => {
    useGameStore.setState({
      resources: { wood: 200, oak: 0, stone: 200, copper: 0, monsterParts: 0 },
    });

    useGameStore.getState().purchaseWorkshop();
    useGameStore.getState().craftCombatDie("trainingSword");

    const state = useGameStore.getState();
    expect(state.buildings.workshop).toBe(true);
    expect(state.combat.inventory.trainingSword).toBe(1);
    expect(state.resources.wood).toBe(55);
    expect(state.resources.stone).toBe(95);
  });

  it("cannot craft combat dice before the Workshop exists", () => {
    useGameStore.setState({
      resources: { wood: 100, oak: 0, stone: 100, copper: 0, monsterParts: 0 },
    });

    useGameStore.getState().craftCombatDie("woodenShield");

    expect(useGameStore.getState().combat.inventory.woodenShield).toBe(0);
  });

  it("keeps level-gated combat dice in inventory until they can be equipped", () => {
    useGameStore.setState({
      buildings: { ...useGameStore.getState().buildings, workshop: true },
      combat: {
        ...useGameStore.getState().combat,
        inventory: {
          ...useGameStore.getState().combat.inventory,
          torch: 1,
        },
      },
    });

    useGameStore.getState().equipCombatDie("torch");

    expect(useGameStore.getState().combat.inventory.torch).toBe(1);
    expect(useGameStore.getState().combat.loadout).toEqual([null, null, null]);
  });

  it("pauses gathering rolls while Combat is active", () => {
    useGameStore.setState({
      buildings: { ...useGameStore.getState().buildings, workshop: true },
      combat: {
        ...useGameStore.getState().combat,
        inventory: {
          ...useGameStore.getState().combat.inventory,
          trainingSword: 1,
        },
        loadout: ["trainingSword", null, null],
      },
    });
    useGameStore.getState().startCombat();
    useGameStore.getState().performRoll();

    const state = useGameStore.getState();
    expect(state.combat.session).not.toBeNull();
    expect(state.woodcutting.lifetimeXp).toBe(0);
    expect(state.resources.wood).toBe(0);
  });

  it("awards lifetime Combat XP and loot when an enemy is defeated", () => {
    useGameStore.setState({
      buildings: { ...useGameStore.getState().buildings, workshop: true },
      combat: {
        ...useGameStore.getState().combat,
        inventory: {
          ...useGameStore.getState().combat.inventory,
          trainingSword: 1,
        },
        loadout: ["trainingSword", null, null],
      },
    });
    useGameStore.getState().startCombat();

    for (let roll = 0; roll < 30; roll += 1) {
      if (useGameStore.getState().combat.zoneProgress >= 1) break;
      useGameStore.getState().performCombatRoll();
    }

    const state = useGameStore.getState();
    expect(state.combat.session).not.toBeNull();
    expect(state.combat.session?.encounterId).toBe(2);
    expect(state.combat.lifetimeXp).toBeGreaterThanOrEqual(5);
    expect(state.combat.zoneProgress).toBe(1);
    expect(state.resources.monsterParts).toBeGreaterThanOrEqual(1);
    expect(state.combat.lastKill?.xpGained).toBeGreaterThanOrEqual(5);
    expect(state.combat.lastKill?.zoneProgress).toBe(1);
  });

  it("returns to the previous gathering skill after defeat", () => {
    useGameStore.setState({
      activeSkill: "mining",
      buildings: { ...useGameStore.getState().buildings, workshop: true },
      combat: {
        ...useGameStore.getState().combat,
        inventory: {
          ...useGameStore.getState().combat.inventory,
          trainingSword: 1,
        },
        loadout: ["trainingSword", null, null],
      },
    });
    useGameStore.getState().startCombat();

    for (let attack = 0; attack < 5; attack += 1) {
      useGameStore.getState().performEnemyAttack();
    }

    const state = useGameStore.getState();
    expect(state.combat.session).toBeNull();
    expect(state.combat.lastResult?.type).toBe("defeat");
    expect(state.combat.lastResult?.defeatReason).toBe("noBlock");
    expect(state.activeSkill).toBe("mining");
  });

  it("spawns Forest Brute at 20 progress and grants first-clear rewards", () => {
    useGameStore.setState({
      buildings: { ...useGameStore.getState().buildings, workshop: true },
      combat: {
        ...useGameStore.getState().combat,
        lifetimeXp: 150,
        zoneProgress: 20,
        inventory: {
          ...useGameStore.getState().combat.inventory,
          trainingSword: 3,
        },
        loadout: ["trainingSword", "trainingSword", "trainingSword"],
      },
    });
    useGameStore.getState().startCombat();

    expect(useGameStore.getState().combat.session?.enemyId).toBe("forestBrute");
    useGameStore.setState((state) => ({
      combat: {
        ...state.combat,
        session: state.combat.session
          ? { ...state.combat.session, enemyHp: 1 }
          : null,
      },
    }));

    for (let roll = 0; roll < 10; roll += 1) {
      if (useGameStore.getState().combat.session === null) break;
      useGameStore.getState().performCombatRoll();
    }

    const state = useGameStore.getState();
    expect(state.combat.session).toBeNull();
    expect(state.combat.forestTrophy).toBe(true);
    expect(state.combat.inventory.bruteCleaver).toBe(1);
    expect(state.combat.lastResult?.trophyGained).toBe(true);
    expect(state.combat.lastResult?.unlocksGained).toEqual([
      "forestTrophy",
      "bruteCleaver",
      "oakheartBlueprint",
      "copperProspectorBlueprint",
      "barracksBlueprint",
    ]);
  });

  it("moves directly from the twentieth regular kill into the boss encounter", () => {
    useGameStore.setState({
      buildings: { ...useGameStore.getState().buildings, workshop: true },
      combat: {
        ...useGameStore.getState().combat,
        lifetimeXp: 150,
        zoneProgress: 19,
        inventory: {
          ...useGameStore.getState().combat.inventory,
          trainingSword: 3,
        },
        loadout: ["trainingSword", "trainingSword", "trainingSword"],
      },
    });
    useGameStore.getState().startCombat();
    useGameStore.setState((state) => ({
      combat: {
        ...state.combat,
        session: state.combat.session
          ? { ...state.combat.session, enemyHp: 1 }
          : null,
      },
    }));

    for (let roll = 0; roll < 10; roll += 1) {
      if (useGameStore.getState().combat.zoneProgress >= 20) break;
      useGameStore.getState().performCombatRoll();
    }

    const state = useGameStore.getState();
    expect(state.combat.zoneProgress).toBe(20);
    expect(state.combat.session?.enemyId).toBe("forestBrute");
    expect(state.combat.session?.encounterId).toBe(2);
  });

  it("builds Barracks after the boss and adds a fourth combat slot", () => {
    useGameStore.setState({
      resources: { wood: 80, oak: 0, stone: 60, copper: 0, monsterParts: 15 },
      combat: {
        ...useGameStore.getState().combat,
        forestTrophy: true,
      },
    });

    useGameStore.getState().purchaseBarracks();

    const state = useGameStore.getState();
    expect(state.buildings.barracks).toBe(true);
    expect(state.combat.loadout).toHaveLength(4);
    expect(state.resources).toEqual({
      wood: 0,
      oak: 0,
      stone: 0,
      copper: 0,
      monsterParts: 0,
    });
  });

  it("builds Frontier Forge from both Tier 2 resources", () => {
    useGameStore.setState({
      resources: { wood: 0, oak: 25, stone: 0, copper: 25, monsterParts: 20 },
      combat: {
        ...useGameStore.getState().combat,
        forestTrophy: true,
      },
    });

    useGameStore.getState().purchaseFrontierForge();

    const state = useGameStore.getState();
    expect(state.buildings.frontierForge).toBe(true);
    expect(state.resources).toEqual({
      wood: 0,
      oak: 0,
      stone: 0,
      copper: 0,
      monsterParts: 0,
    });
  });

  it("requires Frontier Forge for Tier 2 combat crafting", () => {
    useGameStore.setState({
      resources: { wood: 0, oak: 8, stone: 0, copper: 18, monsterParts: 8 },
      buildings: { ...useGameStore.getState().buildings, workshop: true },
    });

    useGameStore.getState().craftCombatDie("copperLongsword");
    expect(useGameStore.getState().combat.inventory.copperLongsword).toBe(0);

    useGameStore.setState({
      buildings: {
        ...useGameStore.getState().buildings,
        frontierForge: true,
      },
    });
    useGameStore.getState().craftCombatDie("copperLongsword");

    expect(useGameStore.getState().combat.inventory.copperLongsword).toBe(1);
  });

  it("gates Wolf Den behind Frontier Forge and tracks its own progress", () => {
    useGameStore.setState({
      buildings: { ...useGameStore.getState().buildings, workshop: true },
      combat: {
        ...useGameStore.getState().combat,
        inventory: {
          ...useGameStore.getState().combat.inventory,
          trainingSword: 1,
        },
        loadout: ["trainingSword", null, null],
      },
    });

    useGameStore.getState().startCombat("wolfDen");
    expect(useGameStore.getState().combat.session).toBeNull();

    useGameStore.setState({
      buildings: {
        ...useGameStore.getState().buildings,
        frontierForge: true,
      },
    });
    useGameStore.getState().startCombat("wolfDen");
    expect(useGameStore.getState().combat.session?.zoneId).toBe("wolfDen");
    expect(useGameStore.getState().combat.session?.enemyId).toBe("direWolf");

    useGameStore.setState((state) => ({
      combat: {
        ...state.combat,
        session: state.combat.session
          ? { ...state.combat.session, enemyHp: 1 }
          : null,
      },
    }));
    for (let roll = 0; roll < 10; roll += 1) {
      if (useGameStore.getState().combat.wolfDenProgress > 0) break;
      useGameStore.getState().performCombatRoll();
    }

    expect(useGameStore.getState().combat.wolfDenProgress).toBe(1);
    expect(useGameStore.getState().combat.zoneProgress).toBe(0);
    expect(useGameStore.getState().combat.session?.zoneId).toBe("wolfDen");
  });

  it("completes the path from a fresh state through Forge and Wolf Den", () => {
    const gatherUntil = (
      skill: "woodcutting" | "mining",
      resource: "wood" | "stone",
      target: number,
    ) => {
      useGameStore.getState().setActiveSkill(skill);

      const buyNextEngineUpgrade = () => {
        const progression = useGameStore.getState()[skill];
        const firstDie = progression.inventory[0];

        if (firstDie.upgradeLevel < 3) {
          useGameStore
            .getState()
            .purchaseGatheringFaceUpgrade(skill, firstDie.id);
          return;
        }
        if (progression.slots < 2) {
          useGameStore.getState().purchaseGatheringSlot(skill);
          return;
        }
        if (progression.rollSpeedLevel < 2) {
          useGameStore.getState().purchaseGatheringRollSpeed(skill);
          return;
        }

        const dieToImprove = progression.inventory.find(
          (instance) => instance.upgradeLevel < 6,
        );
        if (dieToImprove) {
          useGameStore
            .getState()
            .purchaseGatheringFaceUpgrade(skill, dieToImprove.id);
          return;
        }
        useGameStore.getState().purchaseGatheringSlot(skill);
      };

      for (let roll = 0; roll < 5_000; roll += 1) {
        if (useGameStore.getState().resources[resource] >= target) return;

        useGameStore.getState().performRoll();
        buyNextEngineUpgrade();
      }

      throw new Error(`${skill} did not reach the fresh-run resource target.`);
    };

    gatherUntil("woodcutting", "wood", 300);
    gatherUntil("mining", "stone", 220);
    useGameStore.getState().purchaseWorkshop();
    useGameStore.getState().craftCombatDie("trainingSword");
    useGameStore.getState().craftCombatDie("woodenShield");
    useGameStore.getState().craftCombatDie("torch");
    useGameStore.getState().equipCombatDie("trainingSword");
    useGameStore.getState().equipCombatDie("woodenShield");
    useGameStore.getState().startCombat();

    for (let encounter = 0; encounter < 25; encounter += 1) {
      if (useGameStore.getState().combat.forestTrophy) break;

      const session = useGameStore.getState().combat.session;
      expect(session).not.toBeNull();
      const encounterId = session?.encounterId;
      useGameStore.setState((state) => ({
        combat: {
          ...state.combat,
          session: state.combat.session
            ? { ...state.combat.session, enemyHp: 1 }
            : null,
        },
      }));

      for (let roll = 0; roll < 10; roll += 1) {
        const currentSession = useGameStore.getState().combat.session;
        if (
          currentSession === null ||
          currentSession.encounterId !== encounterId
        ) {
          break;
        }
        useGameStore.getState().performCombatRoll();
      }
    }

    expect(useGameStore.getState().combat.forestTrophy).toBe(true);
    expect(useGameStore.getState().combat.inventory.bruteCleaver).toBe(1);
    useGameStore.getState().purchaseBarracks();

    const finalState = useGameStore.getState();
    expect(finalState.buildings.workshop).toBe(true);
    expect(finalState.buildings.barracks).toBe(true);
    expect(finalState.combat.zoneProgress).toBe(20);
    expect(finalState.combat.loadout).toHaveLength(4);
    expect(finalState.rollCount).toBeLessThanOrEqual(550);

    for (let encounter = 0; encounter < 100; encounter += 1) {
      const state = useGameStore.getState();
      if (state.combat.lifetimeXp >= 250 && state.resources.monsterParts >= 60) {
        break;
      }
      if (state.combat.session === null) {
        state.startCombat("forestEdge");
      }
      const session = useGameStore.getState().combat.session;
      expect(session).not.toBeNull();
      const encounterId = session?.encounterId;
      useGameStore.setState((current) => ({
        combat: {
          ...current.combat,
          session: current.combat.session
            ? { ...current.combat.session, enemyHp: 1 }
            : null,
        },
      }));

      for (let roll = 0; roll < 10; roll += 1) {
        const currentSession = useGameStore.getState().combat.session;
        if (
          currentSession === null ||
          currentSession.encounterId !== encounterId
        ) {
          break;
        }
        useGameStore.getState().performCombatRoll();
      }
    }
    useGameStore.getState().retreatFromCombat();
    expect(useGameStore.getState().combat.lifetimeXp).toBeGreaterThanOrEqual(250);
    expect(useGameStore.getState().resources.monsterParts).toBeGreaterThanOrEqual(60);

    gatherUntil("woodcutting", "wood", 200);
    gatherUntil("mining", "stone", 200);
    useGameStore.getState().craftTierTwoGatheringDie("woodcutting");
    useGameStore.getState().craftTierTwoGatheringDie("mining");

    const gatherTierTwoResource = (
      skill: "woodcutting" | "mining",
      resource: "oak" | "copper",
      target: number,
    ) => {
      useGameStore.getState().setActiveSkill(skill);
      const specialist = useGameStore
        .getState()
        [skill].inventory.find((instance) =>
          skill === "woodcutting"
            ? instance.kind === "oakheartAxe"
            : instance.kind === "copperProspector",
        );
      expect(specialist).toBeDefined();

      for (let roll = 0; roll < 5_000; roll += 1) {
        const progression = useGameStore.getState()[skill];
        if (progression.lifetimeXp < 250) {
          useGameStore.getState().performRoll();
          continue;
        }

        if (!progression.loadout.includes(specialist!.id)) {
          useGameStore
            .getState()
            .equipGatheringDie(skill, specialist!.id, 0);
        }
        if (useGameStore.getState().resources[resource] >= target) return;

        useGameStore.getState().performRoll();
        useGameStore
          .getState()
          .purchaseGatheringFaceUpgrade(skill, specialist!.id);
      }

      throw new Error(`${skill} did not reach its Tier 2 resource target.`);
    };

    gatherTierTwoResource("woodcutting", "oak", 51);
    gatherTierTwoResource("mining", "copper", 51);
    useGameStore.getState().purchaseFrontierForge();
    useGameStore.getState().craftCombatDie("copperLongsword");
    useGameStore.getState().craftCombatDie("oakguardShield");

    for (let slot = 0; slot < useGameStore.getState().combat.loadout.length; slot += 1) {
      useGameStore.getState().unequipCombatSlot(slot);
    }
    useGameStore.getState().equipCombatDie("bruteCleaver");
    useGameStore.getState().equipCombatDie("copperLongsword");
    useGameStore.getState().equipCombatDie("oakguardShield");
    useGameStore.getState().startCombat("wolfDen");

    expect(useGameStore.getState().buildings.frontierForge).toBe(true);
    expect(useGameStore.getState().combat.session?.zoneId).toBe("wolfDen");
    expect(useGameStore.getState().combat.session?.enemyId).toBe("direWolf");
    expect(useGameStore.getState().rollCount).toBeLessThanOrEqual(1_200);
  });
});
