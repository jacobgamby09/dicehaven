# Dicehaven — Progress & Patch Notes

Dette er den løbende implementeringslog for greenfield-versionen i denne mappe. Nye spilbare features, balanceændringer og tekniske milepæle dokumenteres her, når de lander.

## Aktuel status

- **M0 — Auto-roll gathering:** Spilbar og verificeret med Upgrade Rush-progression.
- **M1 — Combat vertical slice:** Spilbar end-to-end gennem Forest Brute, Tier 2 crafting, Frontier Forge og første Wolf Den-encounter. Næste checkpoint er bruger-playtest og lyd/juice baseret på den faktiske oplevelse.
- **M2+ — Skill Tree-mekanikker, sustain og dybere settlement:** Ikke påbegyndt.

## 2026-07-12 — Dynamiske Combat Speed Bars

### Tilføjet

- Ny fælles **CombatSpeedBar** bruges af både Player Roll Speed og Enemy Attack Speed.
- Begge bars viser live `X.Xs until roll/attack`, fuldt interval og en kontinuerlig custom fill, der resetter efter hvert event.
- Player-baren bruger grøn skill-inspireret fill; enemy-baren bruger rød/orange attack-fill. Segmentmarkeringer gør forskellige rytmer lettere at sammenligne.
- Custom `scaleX`-fill erstatter native progress for combat-timing og følger dermed den Safari-stabile kontrakt fra gathering-skills.
- Progressbars eksponerer dynamisk `aria-valuenow` og `aria-valuetext`; reduced-motion fjerner transition uden at fjerne live state.

### Verificeret

- Browser-QA målte Player Roll fra 90% til 100%/`Rolling…` og Enemy Attack fra 84% til 96% i samme encounter.
- Efter `Savage Bite` resetter enemy-baren til næste 5,5s-cyklus, mens player-baren fortsætter uafhængigt.
- Mobil-QA ved 390 px viser begge dynamiske bars samtidig uden horisontalt overflow.
- Production-build og hele testsuiten består: 9 testfiler / 69 tests.

## 2026-07-12 — Combat 2.0: fuld automation & simplificeret flow

### Tilføjet

- Combat bruger nu to uafhængige real-time clocks: én Player Roll Speed og én Enemy Attack Speed. Hele player-loadoutet ruller samlet hvert 4,0 sekund; fjender beholder deres individuelle 4,5–7,0 sekunders angrebsrytme.
- Player-roll resolves først ved præcis samtidighed. Animationerne visualiserer events uden at pause den modsatte clock.
- Block bevarer ubrugt værdi efter et angreb og har et cap lig Player Max HP (`10`).
- Alle fjender har et navngivet og synligt næste angreb med Damage, speed og progressbar.
- Ny fire-state combat-rejse: **Prepare/Combat Hub → Fighting → Victory/Defeat → Fight again eller justér loadout**.
- Victory viser Combat XP, Monster Parts, antal loot-rolls, dice drops og en særskilt Scouted-bonus. Defeat giver konkret loadout-råd uden progressionstab.
- Combat fortsætter, når spilleren navigerer til andre tabs, mens appen er åben. Refresh giver ingen offline catch-up.

### Ændret

- Et encounter afsluttes nu efter én fjende. Næste fight startes eksplicit med `Fight again`, så rewards og årsag/virkning altid kan aflæses.
- Combat Hub viser kun zonevalg, encounter-preview, nuværende loadout og start-handlingen. Crafting forbliver i den dedikerede Crafting-tab.
- Combat Arsenal bruger owned dice som primær flade. Valg af en die viser faces og direkte `Equip here` / `Replace` / `Unequip` på hver slot; loadoutet er read-only under aktiv kamp.
- Fighting-UI prioriterer fjendens HP/intention, de to speed-bars, Player HP/Block og selve Combat Dice-rullet.
- Forest Brute bliver det næste eksplicitte Forest Edge-encounter efter 20 victories i stedet for at kædes automatisk ind i samme run.

### Verificeret

- Combat-simulationen dækker hurtigere/langsommere enemy clocks, player-first ties, persistent Block, Block Cap, Scouted-loot, retreat samt Victory/Defeat-stop.
- Browser-flow verificeret fra Combat Hub gennem direkte Arsenal-slot-replacement, automatisk kamp og Victory-state.
- Responsiv QA ved 390 px viser Hub og Fighting uden horisontalt overflow; aktiv kamp låser alle Arsenal-slots.
- Production-build og hele testsuiten består: 9 testfiler / 69 tests.

## 2026-07-11 — Combat Dice-identitet & Face Info

### Tilføjet

- Alle ti Combat Dice har nu datadrevet `material`, `tier`, `rarity` og `motion` oven på deres eksisterende rolle.
- Ny fælles **CombatDieVisual** bruges i Crafting, Combat Arsenal og selve combat-rullet, så samme fysiske die altid har samme identitet.
- Damage bruger rød/kobber-accent og strike/slash-impact; Block bruger blågrøn/stål og guard-ripple; Utility bruger rav/guld, glow og partikler.
- Materialer giver individuelle overflader til iron, wood, ember, bone, leather, cleaver, copper, oak og claw. Tier 2 samt rare/boss dice får ekstra ramme eller markering.
- Nyt responsivt **Face Info**-overlay: centreret dialog på desktop og bottom sheet på mobil.
- Face Info viser konkret effekt, plain-language regeltekst, `1 of 6` chance, resolution-timing, varighed, keyword og antal faces med samme præcise resultat.
- Overlayet understøtter direkte valg af alle seks faces, forrige/næste, backdrop, close, Escape, focus trap og fokus-retur.
- Landede Combat Dice kan åbne Face Info; terninger er ikke klikbare under roll-animationen.

### Ændret

- Alle Combat faces i Crafting og Combat Arsenal er nu semantiske knapper frem for statiske symbolfelter.
- Block-reglen forklarer eksplicit, at Block absorberer incoming Damage og varer, til den er brugt.
- Light-reglen forklarer Scouted, det ekstra loot-roll og at effekten ikke stacker.
- Reduced-motion slår rolleanimationer, partikler og overlay-transition fra, men bevarer alle states og informationer.

### Verificeret

- Browser-QA viser fem forskellige craftable Combat Dice-identiteter uden overflow eller Vite error overlay.
- Damage, Block og Utility bruger henholdsvis `strike`, `guard` og `spark` i Crafting og combat-tray.
- Face Info er verificeret for Block og Utility, inklusive body-scroll lock, initialt close-fokus og fokus-retur til det valgte face.
- Production-build og hele testsuiten består: 9 testfiler / 64 tests.

## 2026-07-11 — Dedikeret Crafting-katalog

### Tilføjet

- Ny **Crafting**-side i sidemenuen. Den står synligt som `Build Workshop` før unlock og viser derefter antal recipes, der kan craftes nu.
- Crafting har separate **Combat Dice**- og **Skill Dice**-tabs med fritekstsøgning samt rolle/skill-, tier- og craftable-filtre.
- Kompakte recipe-rækker viser navn, kategori, tier, pris, owned-antal og aktuel status; ét separat detailpanel viser beskrivelse, alle seks faces, station, equip-level og konkret `owned / required` for materialer.
- Ny fælles, datadrevet crafting-model samler kategori, item-id, rolle/skill, tier, station, blueprint-gate, pris og equip-level for alle fysiske dice-recipes.
- Rene selectors afgør recipe-visibility og craftability. Recipes bag en manglende settlement-bygning eller et uopdaget blueprint vises ikke i kataloget.
- Crafting-gaten forklarer Workshop-kravet og linker direkte til Settlement.

### Ændret

- **Combat** indeholder ikke længere recipes eller craft-knapper. Det nye **Combat Arsenal** viser kun ejede terninger og håndterer inspection samt equip.
- **Dice Rack** indeholder ikke længere Tier 2-crafting. Overlayet fokuserer nu udelukkende på ejede skill dice, faces og loadout.
- Oakheart Axe, Copper Prospector og alle craftable Combat Dice fremstilles nu fra samme Crafting-side.
- Workshop- og Frontier Forge-kortene viser deres konkrete recipe-unlocks og fortæller, at de nye recipes lander i Crafting.
- Skill Dice kræver nu både Workshop-systemet og deres Forest Brute-blueprint; Combat- og skill-levels er fortsat equip-gates og blokerer ikke crafting.
- Det gamle Recipes-placeholder er fjernet.

### Verificeret

- Ny selector-suite dækker skjulte building-locked recipes, Workshop T1-sættet, boss-unlocked Skill Dice, Forge-unlocked T2 Combat Dice samt craftability uafhængigt af equip-level.
- Store-tests bekræfter fortsat fysisk crafting, resource spend, bench-adfærd, multiple copies og level-gates.
- Browser-QA bekræfter den låste Crafting-side, direkte navigation til Settlement, konkrete building-unlocks samt fravær af overflow og Vite error overlay.
- Production-build og hele testsuiten består: 8 testfiler / 60 tests.

## 2026-07-11 — Direkte Dice Rack-loadout

### Ændret

- Den separate **Active dice pool** øverst i Dice Rack er fjernet, så inventoryet er den eneste primære loadout-flade.
- Inventory-headeren viser nu den samlede equipped-status, og hvert terningekort viser tydeligt, om terningen er udstyret og i hvilken slot.
- Et tryk på en terning åbner en handlingsrække direkte under samlingen med **Equip** eller **Unequip**.
- En ledig slot bruges automatisk. Hvis alle slots er fyldt, vælger spilleren eksplicit den udstyrede terning, som skal erstattes.
- Face-værdier og blueprint-link er bevaret som sekundære detaljer uden at gentage loadout-handlingen.

### Verificeret

- Browserflowet skifter korrekt mellem `1/1 equipped`, `0/1 equipped`, **Unequip** og **Equip die** uden horisontalt overflow.
- Production-build og hele testsuiten består: 7 testfiler / 55 tests.

## 2026-07-11 — Minimalistisk overlay-stabilisering

### Ændret

- Det organiske, fast-positionerede Skill Tree-canvas er erstattet af fire enkle upgrade-spor: starter-blueprint, roll rhythm, crew slots og Tier 2-specialist.
- Nodes er nu kompakte kort i almindeligt dokumentflow, så de aldrig lander uden for viewporten eller ser halvt indlæste ud.
- Mobilvisningen bruger én vertikal scrollbar og et kompakt sticky detail-/købspanel i stedet for separat canvas-scroll og et 360px detailområde.
- Dice Rack er gjort mere minimalistisk med normal overlay-højde, auto-fit inventory-grid og én stabil scroll-container.
- Woodcutting/Mining-specifik illustration og tunge node-animationer er parkeret til et senere polish-pass.
- Stemningsnavne som “Hone face”, “Steady swing” og “Deep rhythm” er fjernet fra upgrades. Hvert nodekort viser nu den præcise effekt og før/efter-værdi.
- Det mobile sticky købspanel er reduceret til én centreret række med effekt til venstre og `Buy · X XP` til højre.
- Dice stage har fået en tydelig **Roll Speed-HUD** med live countdown, progressbar, pause/inactive-state og aktuelt interval.
- Roll Speed-fill bruger nu en custom Safari-sikker CSS-transform i stedet for native `<progress>`, der kunne fremstå tom under kastet.
- HUD'en er flyttet helt ud af filt-scenen og ind i Dice Tray'ens eksisterende lyse kontrolsektion under headeren. Den læses nu som en del af tray-layoutet frem for et ekstra kort oven på terningerne, fylder til 100% under `Rolling…` og starter derefter næste cyklus.
- Skill Tree-headerens XP-balance viser nu altid enheden direkte, eksempelvis `264 XP`, i stedet for et nøgent tal.

### Verificeret

- iPhone-lignende viewport på 390×844 viser både Skill Tree og Dice Rack uden klippede nodes, tomme canvasområder eller horisontalt side-overflow.
- Browsermåling bekræfter, at Buy-knappen ligger inden for panelet og er vertikalt centreret.
- Mobil-browsertesten bekræfter både aktiv og inaktiv state: Roll Speed-baren er integreret i kontrolsektionen, animerer med gathering-clockens faktiske progressværdi, og XP-labelen er synlig uden overflow.
- Mobil-browsertesten fanger desuden `Rolling…` med synligt fuld fill og efterfølgende dynamisk opladning uden Safari-, konsol- eller overflow-fejl.
- Production-build og hele suiten består fortsat: 7 testfiler / 55 tests.

## 2026-07-11 — Dice Rack & visuelle Skill Trees

### Tilføjet

- Det smalle **Upgrade Workshop** er fjernet fra Woodcutting og Mining; dice tray bruger nu hele skill-siden.
- Nye header-actions ved siden af **Make Active**: **Dice Rack** med loadout-status og **Skill Tree** med disponibel skill-XP.
- Nyt responsivt **Dice Rack-overlay** med aktive slots, fysisk inventory, Tier 1/Tier 2/bench-filtre, face-inspector samt ét-kliks equip og unequip.
- Gathering-loadouts kan nu have reelt tomme slots. Et tomt loadout producerer ikke ressourcer og giver ikke gratis XP.
- Tier 2-blueprint, recipe cost, level-gate og crafting er flyttet ind i Dice Rack.
- Nyt datadrevet **Skill Tree** med 20 synlige nodes pr. gathering-skill: 12 blueprint-face-nodes, 4 roll-speed-nodes, 2 slot-milestones, startnode og Tier 2-gate.
- Woodcutting har et levende træ-tema med organiske grene; Mining genbruger systemet som en mineskakt med varme metal- og lanternetoner.
- Nodes viser locked, reachable, ready og purchased visuelt samt et fast detailpanel med effekt, pris og manglende krav.
- Face-upgrades er ændret fra per-instans til delte **dice blueprints**. Alle eksisterende og fremtidige kopier af samme type deler det højeste opnåede face-rank.
- Save-format opgraderet til v10. v9-saves samler individuelle kopier på deres højeste blueprint-rank uden at miste XP, inventory eller loadout.
- Det gamle globale Talents-placeholder er fjernet fra sidebaren; skillens progression åbnes nu direkte i dens egen header.

### Verificeret

- Dice Rack equip/unequip, tomme slots, blueprint-arv og v9→v10-migration har automatiske tests.
- Browser-QA består på mobil og desktop for begge skill-temaer uden konsolfejl, Vite error overlay eller horisontalt side-overflow.
- Production-build og hele suiten består: 7 testfiler / 54 tests.

## 2026-07-10 — Post-boss loop, Frontier Forge & Wolf Den

### Tilføjet

- Forest Brute first-clear viser nu et længere blueprint-reveal med Forest Trophy, Brute Cleaver, Oakheart Axe, Copper Prospector, Barracks og Frontier Forge.
- Resultatskærmen får ved first-clear et permanent “New blueprints unlocked”-panel med direkte navigation til Woodcutting, Mining og Settlement.
- Sidebaren markerer T2-paths, Forge-readiness og Wolf Den-unlock.
- Ny fysisk settlement-bygning: **Frontier Forge**, der koster 25 Oak Logs + 25 Copper Ore + 20 Monster Parts og kræver Forest Trophy uden at forbruge den.
- Frontier Forge åbner **Copper Longsword** og **Oakguard Shield** som fysiske Combat Level 5-dice.
- Copper Longsword koster 8 Oak Logs + 18 Copper Ore + 8 Monster Parts.
- Oakguard Shield koster 18 Oak Logs + 8 Copper Ore + 8 Monster Parts.
- Combat-inventory viser Forge-recipes tidligt som synlige mål, men crafting forbliver låst til bygningen findes.
- Ny separat combat-zone: **Wolf Den preview** med kontinuerlige Dire Wolf-encounters og permanent 0/10 survey-progress.
- Dire Wolf kan droppe den fysiske Level 6-die **Dire Wolf Claw**.
- Save-format opgraderet til v9 med migration af Frontier Forge, Wolf Den-progress, zone-id'er, unlock-feedback og de nye combat-dice.

### Balance og verificering

- Dire Wolf: 22 HP, 5 Damage, 5,5s attack interval.
- 500 runs: gammelt Brute Cleaver/Training Sword/Bandit Buckler-loadout vinder 10,6%.
- 500 runs: Brute Cleaver/Copper Longsword/Oakguard Shield vinder 79%, median 20s.
- 500 runs: balanceret fire-slot T2-loadout vinder 100% og slutter med gennemsnitligt 7,4 HP.
- Fresh-state end-to-end-test går fra første gathering-roll gennem Forest Brute, Level 5, begge specialistdice, Tier 2-ressourcer, Frontier Forge, begge T2 combat dice og ind i Wolf Den på højst 1.200 gathering-rolls.
- Production-build og hele suiten består: 6 testfiler / 49 tests.

## 2026-07-10 — Tier 2 gathering & adjustable dice pools

### Tilføjet

- Ny navngiven Tier 2-ressource til Woodcutting: **Oak Logs**. Copper vises nu konsekvent som **Copper Ore**.
- **Oakheart Axe** producerer både Wood og Oak Logs; craft koster 120 Wood + 80 Stone + 12 Monster Parts.
- **Copper Prospector** producerer både Stone og Copper Ore; craft koster 80 Wood + 120 Stone + 12 Monster Parts.
- Forest Brute first-clear fungerer som blueprint-gate. Dice må gerne craftes tidligt og ligge synligt på bænken, men kræver den relevante gathering-skill på Level 5 for equip.
- Begge specialistdice har seks egne face-trin til 30 / 45 / 70 / 110 / 170 / 260 skill XP.
- Specialist-faces blander basis- og rare-resource, så mastered T1-dice fortsat er bedst til ren Wood/Stone.
- Gathering-poolen viser nu hele det fysiske inventory, crew-position eller bench-status, tier og level-lock.
- Nyt crew-loadout-panel: vælg en fysisk die og swap den ind i et konkret slot. Allerede udstyrede instanser bytter plads og kan ikke duplikeres.
- Tier 2-blueprintkort viser unlock-status, recipe cost, level-gate, antal ejede kopier og manglende materialer.
- Rare-resource rolls vises på selve dien, i roll-summary, resource burst og topbaren.
- Save-format opgraderet til v8 med migration, der bevarer v7-dice, loadouts, roll speed og al tidligere progression samt tilføjer Oak-wallet sikkert.

### Verificeret

- Tests dækker specialist-face-profiler, bootstrap-reglen, blueprint-gate, fysisk crafting, Level 5-equip, slot-swap og v7→v8 migration.
- Fresh-state M1-ruten og alle tidligere combat-balance-guards består fortsat.
- Production-build og hele den automatiske suite består: 6 testfiler / 44 tests.

## 2026-07-10 — Upgrade Rush: gathering som mini-incremental

### Tilføjet

- Woodcutting og Mining har nu hver sit fysiske dice inventory og loadout med stabile terning-ID'er.
- Hver Dull Axe og Rusty Pickaxe opgraderes individuelt gennem seks synlige face-trin: `[0,0,0,1,1,1] → [1,1,1,2,2,2]`.
- Face-priserne er front-loadede til 5 / 8 / 12 / 18 / 28 / 45 skill XP.
- Fire skill-wide Roll Speed-trin sænker intervallet fra 4,0s til 3,6s / 3,2s / 2,8s / 2,4s.
- Second Slot koster 35 XP, Third Slot 180 XP; begge leverer straks en ny uslebet fysisk startterning.
- Nyt Upgrade Workshop-UI med dice selector, seks-face map, præcis før/efter-visning, XP-balance og separate køb for face, speed og crew-slots.
- Tier 2-horisonten vises som Oak Trail/Copper Vein og følger den planlagte hybrid: combat blueprint + skill-level gate + fysisk crafting.
- Save-format opgraderet til v7. Eksisterende saves migrerer gamle sharpen-levels og slots til individuelle dice uden at miste XP, ressourcer, buildings eller combat-progress.
- Separat Upgrade Rush-cadence-simulator, så early-game rytmen kan balances uden at gætte.

### Verificeret

- De første tre benchmark-køb lander ved ca. 20 / 52 / 100 aktive sekunder.
- En repræsentativ rute leverer 12–16 køb inden for de første 30 aktive minutter.
- Fresh-state M1-ruten består fortsat med den nye upgrade-strategi og den eksisterende guard på højst 550 gathering-rolls.
- Production-build og hele den automatiske suite består: 6 testfiler / 36 tests.

## 2026-07-10 — Balance simulation & fresh M1 verification

### Tilføjet

- Ren seeded combat matchup-simulator med samme Damage/Block-regler og event-prioritet som spillet.
- 500-run matchup-tests for hver normal Forest Edge-fjende og Forest Brute.
- Fresh-state integrationstest fra gathering-rolls gennem Workshop, crafting, Combat, Forest Trophy og Barracks.
- Pacing-guard: hele gathering-forberedelsen må højst kræve 550 aktive rolls med greedy early upgrades.

### Balanceændringer

- Training Sword ændret fra [0,0,1,1,1,2] til [0,1,1,1,2,2].
- Forest Wolf HP: 6 → 4.
- Wild Boar HP: 9 → 5.
- Bandit Scout HP: 7 → 4.
- Forest Brute HP tunet til 34 for at bevare gear-checket efter sword-buffet.

### Verificerede resultater

- Sword + Shield: 100% single-encounter win rate mod de tre normale enemies i 500 seeds.
- Median TTK: Forest Wolf 12s, Wild Boar 16s, Bandit Scout 12s.
- Forest Brute med rent crafted Sword/Sword/Shield: 35,2% win rate.
- Forest Brute med Sword/Shield/Wolf Fang: 57,8% win rate, median TTK 52s.
- Fresh M1 gathering-forberedelse: 494 rolls ≈ 32,9 minutter ved normal hastighed.
- 5 testfiler / 29 tests består.

## 2026-07-10 — Combat Feel Pass 1

### Tilføjet

- Combat-effects resolver nu på terningens landing i stedet for ved animationens start.
- Enemy attacks holdes tilbage, mens et player-roll er i luften; player-roll beholder prioritet ved samtidighed.
- Damage, Block og Light får separate, animerede resolution-badges.
- Animeret enemy-transition mellem kills.
- Midlertidig kill/loot-popup med XP, Monster Parts, Scouted-bonus og fundne dice.
- Run-dashboard med kills, XP, Parts og dice drops.
- Særskilt Forest Brute boss-reveal og visuel boss-state.
- Defeat-resultater forklarer, om loadout mangler Block, Damage eller generel styrke.
- Combat-die inspector viser alle seks faces, gennemsnit, source, ownership og level-gate.
- Level-låste dice fremstår som synlige kommende mål frem for udtonede kort.
- Save-format opgraderet til v6 med migration af kill-feedback og defeat-data.

### Verificeret

- 25 automatiske tests består, inklusive kill-feedback og defeat-diagnose.
- Production-build består.

## 2026-07-10 — Forest Edge, boss og Barracks

### Tilføjet

- Kontinuerlige Combat-runs: en ny fjende spawner automatisk efter hvert normalt kill.
- Forest Edge-pool med Forest Wolf, Wild Boar og Bandit Scout.
- Separat HP, damage, attack speed, XP og drop table pr. fjendetype.
- Zone-progress gemmes permanent og fyldes til 20/20.
- Forest Brute spawner automatisk ved fuld zone-bar.
- Forest Trophy og Brute Cleaver er garanterede first-clear rewards.
- Nye enemy drops: Boar Tusk og Bandit Buckler.
- Run-loot og Combat XP tildeles efter hvert kill og beholdes ved nederlag/retreat.
- Efter boss-clear kan Forest Edge patruljeres videre for drops og Monster Parts.
- Barracks kan bygges med Forest Trophy + resources og åbner det fjerde combat-slot.
- Barracks vises fysisk i Settlement, og sidebaren viser boss/building-status.
- Save-format opgraderet til v5 med migration af eksisterende Combat-inventory og sessions.

### Verificeret

- 25 automatiske tests består.
- Production-build består.

## 2026-07-10 — Combat foundation

### Tilføjet

- Combat som aktiv aktivitet, der midlertidigt stopper gathering.
- Tre loadout-slots med fysisk dice inventory og equip/unequip.
- Combat Level baseret på lifetime Combat XP; XP bruges ikke som valuta.
- Level-gates på combat dice.
- Craftable Training Sword, Wooden Shield og Torch.
- Forest Wolf som første komplet spilbare encounter.
- Automatiske combat-rolls, tidsbaserede enemy attacks, HP, Damage og Block.
- Torch/Light giver Scouted og præcis ét ekstra loot-roll.
- Monster Parts samt chance for det droppede Level 3-die Wolf Fang.
- Sejr, nederlag og retreat; ingen progression mistes, og gathering genoptages automatisk.
- Monster Parts i topbaren og Combat-status i sidebaren.
- Save-migration fra crafted booleans til inventory-antal og loadout.

### Verificeret

- 21 automatiske tests består.
- Production-build består.
- Localhost indlæser uden browserfejl.

## 2026-07-10 — Skill upgrade economy

- Historisk første pass; erstattet af Upgrade Rush-priserne ovenfor.
- Gathering-upgrades bruger skillens spendable XP.
- Sharpen-trin koster 10 / 25 / 50 XP.
- Second Slot koster 100 XP i den relevante skill.
- Lifetime XP og levels reduceres aldrig ved køb.
- Ressourcer er reserveret til bygninger, crafting og combat gear.

## 2026-07-10 — Greenfield prototype foundation

- Vite, React, TypeScript, Zustand persistence, Motion og Vitest.
- Responsiv Melvor-inspireret side navigation og global resource bar.
- Woodcutting og Mining med én bevidst svag startterning hver.
- Seeded deterministic roll-engine.
- Aktiv skill er adskilt fra den side, spilleren ser på.
- Workshop kan bygges i Settlement og åbner Combat crafting.
