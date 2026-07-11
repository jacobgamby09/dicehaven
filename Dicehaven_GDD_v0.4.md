# Dicehaven — Game Design Document v0.4 (gældende)

**Dette dokument er den eneste gældende GDD.** Tidligere versioner er arkiv:

| Version | Status | Indhold |
| ------- | ------ | ------- |
| v0.2 | Arkiv | Turbaseret settlement-spil (dage/actions/shifts/threat). Kilde til parkerede systemer. |
| v0.3 | Arkiv | Pivot til auto-roll incremental. Implementeret som Milestone 0 (se §13). |
| Combat-udkast | Input | Jacobs reviderede design med combat som hovedprogression — grundstammen i dette dokument. |
| **v0.4** | **Gældende** | Konsolidering uden modsigelser. Principper og mål frem for udtømmende indholdslister. |

Sprogregel: GDD'en er på dansk (arbejdssprog). **Al spiller-vendt tekst i spillet er engelsk** — terningnavne, UI, alt.

*Revision 2026-07-09: Skill-XP er en forbrugsvaluta (§3.2, §5.1, §7.1, §7.3) — hver skill er sit eget lille incremental game.*
*Revision 2026-07-09 (2, erstattet 2026-07-10): Tidligere combat-die upgrade/Ascend-model; arkiveret af collection + level-gate-modellen nedenfor.*
*Revision 2026-07-10: Gathering-slots er skill-interne XP-køb. Combat XP er lifetime-only og fungerer som level-gate; alle combat dice craftes eller droppes som loot og har ingen XP- eller ressourcebetalte face-ladders (§3.4, §5, §7.4, §11.5).*
*Revision 2026-07-10 (2): “Upgrade Rush” gør gathering-dice fysiske og individuelt opgraderbare, udvider startterningen til seks konkrete face-trin, tilføjer fire roll-speed-trin og tre crew-slots samt fastlægger hybridmodellen for Tier 2 (§7.1–§7.4, §9, §14).*
*Revision 2026-07-10 (3): Første Tier 2-slice er konkretiseret og implementeret med Oakheart Axe/Copper Prospector, Oak Logs/Copper Ore, fysisk crafting, Level 5-equip-gate og bench/swap-loadouts (§7.3–§7.4, §9, §13).*
*Revision 2026-07-10 (4): Post-boss-loopet er lukket med blueprint-reveal, Frontier Forge, Copper Longsword/Oakguard Shield og Dire Wolf som første Wolf Den-balanceanker (§10, §11.4–§11.6, §12–§14).*
*Revision 2026-07-11: Det smalle Upgrade Workshop er erstattet af Dice Rack og skill-specifikke Skill Trees. Gathering-face-upgrades deles nu pr. dice-blueprint, mens fysiske instanser fortsat ejes og udstyres individuelt (§7.3–§8, §12).*
*Revision 2026-07-11 (2): Skill Tree og Dice Rack prioriterer et minimalistisk, mobilstabilt layout med almindeligt dokumentflow. Organiske canvas-træer og tung skill-theming er udsat til et senere polish-pass (§8, §12).*
*Revision 2026-07-11 (3): Dice stage viser en fremtrædende Roll Speed-HUD med countdown, interval og progressbar. Skill Tree-balancen skriver altid XP-enheden direkte ved tallet (§12).*
*Revision 2026-07-11 (4): Roll Speed bruger en custom Safari-sikker fill frem for native progress. Timeren er en full-width del af dice stage, står fuld under selve kastet og nulstiller derefter til næste cyklus (§12).*

---

# 1. High Concept

**Dicehaven** er et dice-based incremental RPG. Spilleren kan kun have **én aktiv skill ad gangen**. Den aktive skill ruller automatisk sine egne terninger og genererer ressourcer og XP.

**Combat er hovedprogressionen.** Alle non-combat skills eksisterer for at gøre spilleren stærkere i combat. Zoner og bosses gater spillets store unlocks. Settlementen er support-motoren, der binder skills sammen og gør maskinen stærkere.

Spilleren skifter løbende mellem skills for at forberede sig på næste combat-milestone — og alle valg peger mod ét spørgsmål:

> *"Hvordan bliver jeg stærk nok til næste boss?"*

## Pitch

Et dice-based incremental RPG, hvor hver skill har sin egen auto-rullende dice pool, men kun én skill kan være aktiv ad gangen; du træner gathering og crafting og bygger din settlement for at blive stærkere i combat, slå bosses og unlocke næste lag af progression.

---

# 2. Core Fantasy

Spilleren leder en lille settlement i en farlig verden — men settlementen er ikke et survival-system. Den er basen, der støtter din vækst.

**Dice ER crewene.** En dårlig terning er et utrænet sjak; slibninger er træning og bedre værktøj; nye terninger er nye folk. Du startede med én sløv økse, der ramte ved siden af halvdelen af tiden — nu ruller fire mesterterninger hvert andet sekund, og du kan huske hver opgradering på vejen.

Combat er eksamen: *"Combat tester, om resten af din progression er stærk nok."*

---

# 3. Design Pillars

## 3.1 Incremental first

Automatisk rolling, hyppige små upgrades, konstant XP, numbers go up. Der er ALTID en næste upgrade inden for synsvidde. Spilleren skal kunne stirre fascineret på hvert rul — eller lade spillet køre og kigge til det hvert halve minut. Begge dele skal fungere.

## 3.2 Hver skill er sit eget lille incremental game

**Den vigtigste følelse i spillet.** En skill starter med 1 dårlig terning, der ruller automatisk — men langsomt. Hvert rul tjener lidt XP, og XP'en bruges på netop dén skills interne upgrades: slib terningens sider, rul hurtigere. Skillen har sin egen generator (rullene), sin egen valuta (XP) og sin egen shop — et komplet, selvkørende mini-incremental.

Kun én skill producerer ad gangen — også Combat. Skift er gratis og øjeblikkeligt; det strategiske valg er, hvad du IKKE træner lige nu. Inactive skills producerer intet i early game; begrænset passiv produktion unlockes efter første boss (§10) og må aldrig true den aktive skills dominans.

Ressourcerne er til gengæld **meta-spillet**: de bruges aldrig på skillens egne interne upgrades, men på verden — opskrifter, bygninger, combat gear — og binder dermed mini-spillene sammen.

**Combat er den bevidste undtagelse til spendable-XP-shoppen.** Combat har stadig XP og levels, men XP'en bruges ikke. Level fungerer som proficiency-gate for de terninger, spilleren kan udstyre; Combat-skiftets progression kommer fra collection, crafting, drops og loadout-valg.

## 3.3 Combat is the why

Combat unlocker zoner, bygninger, opskrifter, talent-grene og ressource-tiers. Vigtige unlocks kræver boss trophies, så ren ressource-grind aldrig kan købe sig forbi eksamen. Non-combat skills får deres mening fra combat: Mining = våben, Woodcutting = gear og bygninger, Farming = sustain, Crafting = konvertering af ressourcer til magt.

## 3.4 Én akse, én rolle

Spillets vigtigste anti-modsigelses-regel. Hver upgrade-akse ejer ÉT domæne, så systemerne aldrig konkurrerer om de samme tal:

| Akse | Valuta | Ejer | Eksempler |
| ---- | ------ | ---- | --------- |
| **Skill-interne upgrades** (slibninger, roll speed, gathering-slots) | **XP** (skill-bundet, tjenes pr. rul) | Skillens egen styrke | 0→1 Wood, Second Slot, 4,0s→3,5s |
| **Opskrifter** (nye terningtyper, gear, bygninger) | **Ressourcer** (cross-skill) | Verden/meta-spillet | Woodcutter's Axe, Workshop, Training Sword |
| **Combat dice** (gear, §11.5) | **Crafting eller loot + Combat Level-gate** | Combat-styrke og collection | Craft Training Sword, find Wolf Fang, equip ved Level 3 |
| **Buildings** | Ressourcer + combat-materialer | Multipliers & systemer | +10% wood, unlock combat dice |
| **Loadout** | — | Combat-sammensætning | Hvilke dice udfylder dine combat slots |

Skill Trees indeholder ALDRIG generiske "+X%"-nodes — procenter bor i buildings, rå tal bor i blueprint-faces og konkrete roll-regler. Ressourcer bruges ALDRIG på en gathering-skills interne upgrades. **Combat dice er gear og collection.** De craftes med ressourcer eller findes som loot; Combat Level afgør, om de kan udstyres. Bedre combat-faces kommer fra nye terninger og tiers, ikke ved at købe face-upgrades på en ejet combat die.

## 3.5 Ingen straf

Ingen threat, intet upkeep, ingen hard failure, ingen game over. At tabe til en boss betyder *"jeg er ikke stærk nok endnu"* — aldrig *"jeg blev straffet"*. Alle resets er delvise (§11.2).

---

# 4. Core Loops

**Moment-to-moment:** Aktiv skill ruller → ressourcer + XP tikker ind → progress-bar fyldes igen.

**Choice loop (minutter):** Se næste upgrade/opskrift → køb (og SE terningen/settlementen ændre sig) → eller skift aktiv skill, fordi planen kræver en anden ressource.

**Session loop (10-30 min):** Ny blueprint-node → nyt slot → ny terning → ny bygning → klar til næste combat-forsøg.

**Arc loop (timer):** Gather → Upgrade → Craft → **Fight** → Unlock → Expand → Repeat. Hver boss åbner næste lag.

---

# 5. Hard Rules (spillets grundlov)

Disse regler må ingen fremtidig feature bryde. Ændringer kræver en ny GDD-version.

1. **XP kommer KUN fra at udføre skillen.** Gathering-XP findes både som spendable XP til interne upgrades og lifetime XP til levels. Combat XP er lifetime-only: det bruges aldrig, men bestemmer hvilke combat dice der må udstyres.
2. **Én aktiv skill ad gangen** — inklusive Combat. Passiv produktion (post-boss-1) er kapp'et og bygningsdrevet.
3. **Prisregler:** Skill-interne upgrades — inklusive gathering-slots — koster skillens egen XP. Bygninger, nye terningtyper og crafted combat dice koster ressourcer fra flere skills. Combat dice opgraderes ikke individuelt; stærkere terninger craftes eller findes som loot og gates af Combat Level. Store unlocks kræver derudover boss trophies. Ressourcer bruges aldrig på en gathering-skills interne upgrades.
4. **Én akse, én rolle** (§3.4). Skill Trees ejer skillens XP-upgrades; buildings ejer procenter; fysiske dice og blueprints ejer face-tal.
5. **Ingen skat:** intet upkeep, ingen afgifter, intet forfald. Alt forbrug er køb, spilleren vælger.
6. **Soft failure:** boss-nederlag koster aldrig loot/XP; kun boss-encounterens HP resetter (zone-fremgang består).
7. **Motor-renhed:** Al spillogik i `src/engine/` (ren TS, ingen React). Seeded RNG — samme seed + samme handlinger = samme rul. `tick(state, elapsedMs)` er hele tidsmodellen; offline er senere ét stort kald.
8. **Al spiller-vendt copy er engelsk.** Konkret frem for abstrakt ("0 → 1 Wood", ikke "+8% efficiency").

---

# 6. Skills

| Skill | Rolle | Producerer | Combat-relation | Indgår fra |
| ----- | ----- | ---------- | ---------------- | ---------- |
| **Woodcutting** | Den stabile motor | Wood (senere bark, resin) | Bows, shields, torches, bygninger | M0 ✅ |
| **Mining** | Varians + tier 2-materialer | Stone, copper (senere iron, gems) | Våben, armor, stations | M0 ✅ |
| **Combat** | Hovedprogression | Monster parts, hide, bone, trophies | — (er selve målet) | M1 |
| **Farming** | Sustain-økonomien | Food, herbs (senere fiber) | Bandages, potions, buffs | M2 |
| **Crafting** | Konvertering | (ingen råvarer) | Combat dice, gear, upgrades | System i M1; evt. aktiv skill senere (§17) |
| **Research** | Dybde-unlocks | Knowledge, blueprints | Advanced systems | Parkeret (§17) |

Regler for skill-design: Hver ny skill skal tilføje en ny *mekanik*, ikke bare en ny ressource. En skill uden en klar combat-relation kommer ikke ind i spillet.

---

# 7. Dice System

## 7.1 Auto-roll

Den aktive skills terninger ruller samlet hvert `rollInterval`. **Basis 4,0s — bevidst langsomt** (starten skal føles som et lille, tålmodigt maskineri, man selv accelererer). Den implementerede M1-ladder er **4,0 → 3,6 → 3,2 → 2,8 → 2,4 sekunder** og koster 20 / 55 / 140 / 350 gathering-XP. Senere bygninger kan nærme sig det visuelle gulv 1,8s; hurtigere produktion end 1,8s erstattes af multi-rul, så rullene forbliver læselige. Combat starter også på 4,0s, men fremtidige speed-kilder kommer fra gear/buildings frem for spendable Combat XP.

Effekt-rækkefølge pr. rul (implementeret): **0-redning** (redder KUN en terning, der rullede 0) → **fordobling** (bedste terning, vægtet) → **boost** (+N til alle andre, der producerede). Effekt-targeting vægter ressourcer efter værdi (copper 3× stone/wood), så support aldrig nedprioriterer den knappe ressource.

## 7.2 Startterninger er bevidst dårlige

Progressionens motor er afstanden mellem terningen, du har, og terningen, du kan se. Startterningerne (Dull Axe, Rusty Pickaxe) rammer ved siden af halvdelen af tiden; første slibning købes inden for det første minut.

## 7.3 Slibninger (face upgrades)

Hver gathering-terningtype har en **fælles blueprint-ladder** defineret som data. M1-startterningerne bruger seks konkrete trin med priserne **5 / 8 / 12 / 18 / 28 / 45 XP**: `[0,0,0,1,1,1] → [1,1,1,2,2,2]`, én synlig side ad gangen. Et køb forbedrer alle nuværende og fremtidige kopier af samme type; den fysiske instans ejer fortsat sin plads i inventory og loadout, men spilleren skal ikke genslibe identiske værktøjer. Når blueprint-ladderen er tom, er næste horisont en ny specialist- eller tier-terning.

## 7.4 Slots og tiers

**Gathering-slots** (antal terninger, der ruller) er skill-interne upgrades købt med skillens spendable XP og er en af de vigtigste milestones. Hver skill starter med én fysisk terning; Second Slot koster 35 XP og Third Slot 180 XP, og hvert køb leverer straks en ny startterning, der arver det aktuelle blueprint-niveau. Hver skill ejer sit eget inventory og loadout, så terninger kan bænkes, slots kan stå tomme, og loadoutet kan justeres efter den ressource, spilleren mangler.

**Tier 2 bruger en hybrid-gate:** Combat/boss progression giver blueprintet, skillens lifetime Level afgør om tier-terningen må bruges, og selve terningen craftes fysisk. Den første T2-terning koster T1-ressourcer + Monster Parts og kræver aldrig sin egen T2-output; dermed undgås et bootstrap-deadlock. T2 er specialistvalg, ikke en automatisk erstatning: T1-terninger forbliver relevante til basisressourcen, mens eksempelvis Oak- og Copper-dice vægter deres navngivne T2-ressource.

Den konkrete første slice låses af **Forest Brute first-clear** og indeholder:

* **Oakheart Axe:** 120 Wood + 80 Stone + 12 Monster Parts; producerer både Wood og Oak Logs.
* **Copper Prospector:** 80 Wood + 120 Stone + 12 Monster Parts; producerer både Stone og Copper Ore.
* Begge må craftes straks efter blueprintet, men kræver den relevante gathering-skill på **Level 5** for at blive udstyret.
* Base-specialistens faces er `[basis 1, rare 0, basis 1, rare 1, basis 2, rare 1]`. Den rene T1-master er derfor stadig bedre til basisressourcen, mens T2-dien vinder på adgang til den sjældne ressource.
* Specialistens seks face-trin koster 30 / 45 / 70 / 110 / 170 / 260 skill-XP. Rare- og basis-faces forbedres skiftevis, så hvert køb ændrer den synlige outputprofil.
* Craftede dice lander på bænken. Spilleren vælger en fysisk die og erstatter et konkret crew-slot; en instans kan aldrig ligge i flere slots samtidig.

## 7.5 Dice-roller

* **Producers** — rå ressourcer (langt de fleste terninger)
* **Support** — boost/0-redning/fordobling (Foreman, Support Beam-typen)
* **Combat-roller** — damage, block, heal, utility (§11.4)
* **Risk** (senere) — driftsomkostning pr. rul for højt output (fx Blast Die: −1 wood/rul, høj stone)

Dice XP/levels og evolutions er **parkeret** (§17) — slibe-ladders + tiers dækker behovet, indtil de mangler.

---

# 8. Skill Trees

Hver gathering-skill har et stort, visuelt **Skill Tree**, der er den primære shop for skillens spendable XP. Det er ikke et ekstra talent-point-system: de eksisterende incremental upgrades — face-forbedringer, roll speed og dice-slots — er selve nodestrukturen.

Første version har **20 synlige nodes pr. gathering-skill**:

* 6 face-nodes til startterningens blueprint
* 4 roll-speed-nodes
* Second og Third Slot som store milestones
* En synlig boss/blueprint-gate til Tier 2
* 6 face-nodes til specialist-terningens blueprint

Alle senere nodes er synlige som aspiration, men kun den næste node på en gren kan købes. Tidlige nodes ligger tæt og billigt; afstanden og priserne vokser frem mod speed-, slot- og Tier 2-milestones. Skill Trees åbnes fra skill-headeren ved siden af **Make Active** og viser altid disponibel skill-XP.

Første visuelle pass er bevidst minimalistisk: nodes vises i fire stabile spor — face upgrades, roll speed, dice slots og Tier 2-specialist — med kompakte kort og tydelige states. Upgrade-nodes bruger ikke stemningsnavne; labelen beskriver altid den konkrete effekt, eksempelvis `Face 4: 1 → 2 Stone`, `Roll interval: 3.6s → 3.2s` eller `Unlock dice slot 2`. Mobil bruger ét vertikalt scroll-flow og et kompakt sticky købspanel. Mere illustrerede Woodcutting/Mining-metaforer parkeres, indtil informationshierarki, pacing og mobiladfærd er playtestet.

Senere mechanic-changing nodes som rerolls, crit harvest og specialiseringer udvider de eksisterende grene; de bliver ikke en separat valuta eller en konkurrerende menu.

---

# 9. Resources

**Ingen ressource er en skat.** Alt forbrug er køb.

| Tier | Ressource | Kilde | Primære sinks |
| ---- | --------- | ----- | ------------- |
| 1 | Wood | Woodcutting | Bygninger, gear, alt tidligt |
| 1 | Stone | Mining | Bygninger, stations, gear |
| 2 | Oak Logs | Woodcutting-specialist die (combat blueprint + level-gate) | Tier 2-bygninger og gear |
| 2 | Copper Ore | Mining-specialist die (combat blueprint + level-gate) | Tier 2-terninger, Workshop-upgrades |
| 2 | Food / Herbs | Farming (M2) | Sustain: bandages, potions, buffs |
| Combat | Monster Parts | Zone-kills | Combat-terninger, Barracks, tiers |
| Combat | Boss Trophies | Bosses (1. kill garanteret) | De store gates: bygninger, talent-grene, næste act |
| M2 | Hide, bone | Zone 2-drops | Tier 2-gear (Shield/Bow), Bandage |
| Senere | Iron, gems, fiber, resin, relic fragments | Act 2+ | Parkeret indhold (§17) |

Vægtningsregel i motoren: copper 3× — udvides pr. tier, når nye ressourcer kommer ind.

---

# 10. Settlement

Settlementen er **support-motoren** — vigtig, aldrig hovedmålet. Teknisk er bygninger bare opskrifter med permanente effekter (genbruger det byggede recipe-system).

Bygningernes domæne (jf. §3.4): multipliers, roll speed, storage-frie unlocks af systemer, slots og senere passiv produktion.

Kanonisk M1-M3-sæt (effekter er mål, ikke endelige tal):

| Bygning | Pris (retning) | Effekt | Milestone |
| ------- | -------------- | ------ | --------- |
| **Workshop** | 120 wood + 90 stone | Unlocks T1 combat dice-opskrifter | M1 |
| **Frontier Forge** | 25 Oak Logs + 25 Copper Ore + 20 Monster Parts + **Forest Trophy-gate** | Unlocks T2 combat crafting og Wolf Den | M1 post-boss |
| **Lumber Camp** | Wood + stone | Woodcutting +10% output | M3 |
| **Quarry** | Wood + stone | Mining +10% output | M3 |
| **Farmstead** | Wood + stone | Unlocks Farming-boost, food storage | M3 |
| **Barracks** | 80 wood + 60 stone + 15 monster parts + **Forest Trophy-gate** | +1 combat slot; Combat-talenter følger i M2 | M1/M2 |
| **Training Yard** | Wood + stone + iron + parts | Combat roll speed-gear, boss practice | Act 2 |

**Passiv produktion** unlockes efter første boss via bygninger: inactive skills producerer 5-10% (mid: 15-30%, late: 40-60%). Aktiv skill skal altid være mindst 2× bedste passive.

---

# 11. Combat

Combat er en skill: at kæmpe betyder, at ingen gathering kører imens. Det er buildcrafting + eksamen, ikke et turbaseret minispil.

## 11.1 Zone Combat (eneste mode i M1)

Spilleren vælger en zone. Fjender spawner én ad gangen fra zonens pool. Combat-terningerne ruller på skillens interval; fjenden angriber på sit eget faste interval. Kills fylder zone-baren; fuld bar → boss.

## 11.2 Tick-resolution (den konkrete kontrakt)

1. Combat dice ruller hvert `rollInterval` (4,0s basis — samme motor).
2. **Damage**-resultater trækker fra fjendens HP. **Block** lægges i en pulje, der absorberer fjendens næste angreb. **Heal** genopretter spillerens HP. **Utility** påvirker loot/progress.
3. Fjenden angriber hvert `attackInterval` (typisk 3,5-5s, telegraferet med en lille bar): skade = fjendens attack − akkumuleret block (min 0); block-puljen nulstilles efter angrebet.
4. Fjende død → loot (monster parts m.m.) + Combat XP + zone-progress; ny fjende spawner.
5. Spiller-HP 0 → run slutter: **alt loot og XP beholdes**, boss-encounterens HP resetter, zone-fremgang består. Uden for combat er HP altid fuld (ingen ventetid, ingen hospital).

## 11.3 Tuning-mål (sim ejer tallene)

* Fjende-TTK tidligt: 8-16 sekunder; boss-forsøg: 45-120 sekunder. Verificeret M1-baseline: Sword + Shield giver median 12s Wolf / 16s Boar / 12s Scout; Sword + Shield + Wolf Fang giver 52s median mod Forest Brute.
* Boss = gear-check: uden anbefalet gear taber man *langsomt nok til at se hvorfor* (UI viser dps ind/ud)
* Player HP basis er foreløbig 10 i M1-prototypen; skaleres senere af bygninger, food-buffs og gear — aldrig af talents (aksereglen)

## 11.4 Combat slots og loadouts

Combat har egne slots (start 3; Barracks +1). Spilleren vælger, hvilke combat-terninger der udfylder dem — dét er buildcrafting: Balanced (sword/shield/bandage), Aggressive (sword/bow/torch), Farming (bow/trap/torch). Kanoniske T1-terninger er **Training Sword** (damage), **Wooden Shield** (block) og **Torch** (utility). Frontier Forge åbner **Copper Longsword** (8 Oak Logs + 18 Copper Ore + 8 Monster Parts) og **Oakguard Shield** (18 Oak Logs + 8 Copper Ore + 8 Monster Parts); begge kræver Combat Level 5. **Bandage** (heal) kommer med Farming i M2.

## 11.5 Combat dice: collection, crafting, drops og level-gates

Combat progression bygger et fysisk arsenal:

> **Gather → craft basis-gear → combat → find nye terninger → nå deres level-gates → byg et stærkere loadout.**

### Reglerne

1. **Combat XP er lifetime-only.** Det bruges aldrig som valuta. Combat Level afgør, hvilke combat dice der må udstyres.
2. **Alle combat dice skal ejes fysisk.** De kommer enten fra instant crafting-opskrifter eller som enemy/boss drops. Inventory registrerer antal; loadout kan aldrig bruge flere kopier, end spilleren ejer.
3. **Level-gaten gælder equip, ikke ejerskab.** En stærk terning må gerne droppe tidligt og ligge synligt låst i inventory som et kommende mål.
4. **Combat dice har ingen individuelle face-upgrades i M1.** En bedre face-konfiguration er en ny terningtype eller et nyt tier, som craftes eller findes. Det holder loot spændende og adskiller Combat tydeligt fra gathering-skillsenes XP-betalte slibninger.
5. **Crafting giver stabile basisværktøjer; drops giver specialisering.** Obligatorisk hovedprogression må aldrig afhænge af et sjældent drop. Første boss-kill giver derfor en garanteret signature die eller recipe; senere kills bruger den almindelige drop table.
6. **Duplicates registreres fra starten.** Spilleren kan udstyre flere kopier, hvis slots og inventory tillader det. Salvage eller anden duplicate-sink er parkeret til efter M1.

### M1-teringer (kanonisk prototype)

| Terning | Rolle | Krav | Kilde | Faces / funktion |
| ------- | ----- | ---- | ----- | ---------------- |
| **Training Sword** | Damage | Combat L1 | Craft: 25 wood + 15 stone | [0,1,1,1,2,2] damage |
| **Wooden Shield** | Block | Combat L1 | Craft: 20 wood + 25 stone | [0,1,1,1,2,2] block |
| **Torch** | Utility | Combat L2 | Craft: 30 wood + 10 stone | 3 dark / 3 Light; Light giver Scouted |
| **Wolf Fang** | Damage | Combat L3 | Forest Wolf drop | [0,1,1,2,2,3] damage |
| **Boar Tusk** | Damage | Combat L3 | Wild Boar drop | [0,1,2,2,3,3] damage |
| **Bandit Buckler** | Block | Combat L3 | Bandit Scout drop | [0,1,1,2,2,3] block |
| **Brute Cleaver** | Damage | Combat L4 | Forest Brute first-clear | [1,2,2,3,3,4] damage |

**Scouted-kontrakten:** Light markerer den aktuelle fjende. Status stacker ikke. Når en Scouted fjende dør, rulles dens drop table præcis én ekstra gang. Bonus-rullet kan give monster parts, materialer, recipes eller combat dice — ikke kun en flad part-multiplier.

### Navngivning (så økonomierne aldrig blandes sammen)

* Gathering-terninger: **Sharpen** — konkrete face-trin, koster skill-XP
* Combat-terninger: **Craft / Find / Equip** — ingen face-shop; Combat Level er brugskravet

Ascend, traits og individuelle combat-die upgrade-ladders er ikke del af M1. De genbesøges kun efter collection/loadout-loopet er playtestet.

## 11.6 Zoner og acts

Zoner er kurrikulum: hver zone tester én ting og unlocker svaret på den næste.

**Act 1: The Wilds** (kanonisk)

* **Zone 1 — Forest Edge** (M1): Forest Wolf, Wild Boar, Bandit Scout. Boss: **Forest Brute** ved 20/20 permanente kills. Normale kills spawner straks næste fjende og giver loot/XP med det samme; spiller-HP bæres gennem runnet. Boss first-clear giver Forest Trophy + Brute Cleaver og annoncerer Oakheart Axe, Copper Prospector, Barracks og Frontier Forge som nye paths. Efter clear kan zonen patruljeres videre uden at genaktivere bossen automatisk.
* **Zone 2 — Wolf Den preview** (M1 post-boss): Frontier Forge åbner et første kontinuerligt Dire Wolf-encounter med separat 0/10 survey-progress og chance for Level 6-dien **Dire Wolf Claw**. Dire Wolf er tunet som et T2-loadout-check: gammelt Forest-gear ca. 10,6% single-encounter win rate; Brute Cleaver + Copper Longsword + Oakguard Shield ca. 79%; et balanceret fire-slot Barracks-loadout overlever patrols stabilt. **Alpha Wolf**, hide/bone og sustain-presset kommer i M2.

**Act 2+ (kun skitse, designes når Act 1 er bevist):** The Quarry (armor-check, iron), The Marsh (status/potions, Research), Ancient Ruins (relics, Endless Dungeon). Endless Dungeon er sen-content — aldrig MVP.

---

# 12. UI

Bygger videre på det implementerede mobil-first-layout (topbar med ressource-countere + flyvende ressourcer, foldbar sidemenu, dice tray med progress-bar og XP-bar pr. skill). Det gamle smalle Upgrade Workshop-panel er fjernet; dice tray bruger nu hele arbejdsbredden.

Udvidelser pr. milestone:

* **Sidemenuen** er navigationen til Skills, **Combat**, **Settlement** og tværgående opskrifter. Skill Trees åbnes lokalt fra den relevante skill-header, så konteksten aldrig mistes.
* **Dice Rack:** stort overlay med aktive slots, fysisk inventory, filtre, face-inspector, equip/unequip/swap og synlige Tier 2-blueprints. Tomme slots producerer og træner ikke.
* **Skill Tree:** minimalistisk overlay med fire upgrade-spor, tydelige locked/reachable/ready/purchased-states og et detailpanel med før/efter, pris og krav. Ingen fast canvas eller todimensionel panorering i første stabile version.
* **Roll Speed-HUD:** ligger som en integreret full-width topstribe på selve dice stage. Den bruger en custom CSS-fill frem for browserens native progress-element, viser live countdown, pause/inactive-state og aktuelt interval, og står fuld under `Rolling…`, før næste cyklus begynder.
* **XP-enheder:** XP-balancer må aldrig vises som nøgne tal. Skill Tree-headeren viser eksempelvis `264 XP`, også når den forklarende label skjules på mobil.
* **Combat-skærm**: genbruger dice tray-komponenten; tilføjer fjende-kort (navn, HP-bar, attack-telegraf), spillerens HP-bar, zone-progress-bar, loadout-vælger og en kompakt "dps ind/ud"-linje (Risk 3-mitigering: man skal kunne SE, hvorfor man taber)
* **Impact-kontrakt:** Damage, Block og Light anvendes mekanisk ved terningens visuelle landing — aldrig før. Enemy attacks venter, mens et player-roll er i luften; player-roll har prioritet ved præcis samtidighed.
* **Kill-feedback:** normale kills viser en kort enemy-transition og loot-popup, mens næste encounter starter. Run-dashboardet viser akkumulerede kills, XP, Monster Parts og dice drops.
* **Combat-die inspector:** alle seks faces, gennemsnit, source, ownership og level-gate skal kunne ses før equip. En tidligt droppet locked die vises som et kommende mål, ikke som skjult indhold.
* **Defeat-feedback:** resultatkortet peger på den sandsynlige loadout-svaghed (manglende Block, for lav Damage eller generelt for svagt gear) uden at tage progression fra spilleren.
* Faste regler: dialog-semantik + Escape, ≥4,5:1 kontrast på læsbar tekst, engelsk copy, reduceret animation respekteres, tal formateres K/M ved vækst

---

# 13. Milestones (erstatter monolitisk MVP)

Hver milestone er spilbar og playtestes, før næste påbegyndes. Udviklingsrækkefølgen validerer combat-hypotesen tidligst muligt.

## M0 — Auto-roll-kernen ✅ *(implementeret og verificeret i greenfield-versionen)*

Woodcutting + Mining, individuelle fysiske dice, seks XP-betalte blueprint-face-trin pr. startterning, fire roll-speed-trin, Second/Third Slot, levels, Dice Rack, visuelle Skill Trees, mobil-first UI og seeded engine. Den målbare benchmark giver de første køb ved ca. 20 / 52 / 100 sekunder og 12–16 køb i en repræsentativ første halve time. Svarede på: *"Er auto-roll + konkrete upgrades tilfredsstillende?"*

## M1 — Combat vertical slice ✅ *(spilbar end-to-end; fortsat åben for feel-playtest)*

Workshop-bygning → crafted basis-dice (Training Sword, Wooden Shield, Torch) → Combat Level-gates → Combat-skill → Forest Edge (3 fjender, zone-bar) → dropped dice → Forest Brute → tydelig blueprint-reveal → Barracks/T2 gathering → Frontier Forge → T2 combat dice → Dire Wolf i Wolf Den. Tick-resolution jf. §11.2; alle combat dice craftes eller droppes jf. §11.5.
**Tester:** *Føles combat som hovedprogression? Er boss-nederlag motiverende ("jeg ved, hvad jeg skal forbedre")? Og er det spændende at bygge en fysisk dice collection med synlige level-gates?*

## M2 — Skill Tree-mekanikker + sustain

Udvid de eksisterende Skill Trees med mechanic-changing nodes som rerolls, crit harvest og konkrete unlocks; tilføj Combat-progressionens tilsvarende visuelle struktur, Farming-skill (Crop Die, herbs), Bandage Die (Cleanse), Bow Die (First Strike), hide/bone-materialer og Alpha Wolf i Wolf Den.
**Tester:** *Føles de nye nodes som ændringer af spillestilen frem for et regneark? Trækker Zone 2 spilleren over i Farming af egen vilje?*

## M3 — Settlement-laget

Lumber Camp / Quarry / Farmstead (multipliers), passiv produktion (5-10%, post-boss-gated), flere tiers (Copper-gear).
**Tester:** *Gør settlementen maskinen mærkbart stærkere uden at stjæle fokus?*

## M4+ — Dybden

Act 2 (The Quarry, iron, Training Yard), Crafting som aktiv skill (hvis spillet føles for tyndt uden — ellers forbliver opskrifter instant), Research, offline progression, flere talent-grene. Prioriteres efter M1-M3-playtests.

---

# 14. Balancing Principles

1. **Upgrade-kadencen er pulsen:** de første tre køb lander omkring 20 / 52 / 100 sekunder; derefter må pauserne gradvist vokse fra ca. 45–90 sekunder til 2–4 minutter. Benchmarken sigter efter 12–16 gathering-køb i de første 30 aktive minutter. Første combat efter 15-25 min.; første boss-forsøg 25-40 min.; første boss-kill 35-50 min.
2. **Skift skal være selvvalgt:** opskrifter og combat-gates skaber behovet; playtest-mål er skift hvert 2-5 min. i første time — af egen fri vilje.
3. **Combat-gates forhindrer ren grind:** de store unlocks kræver trophies, ikke kun ressourcer.
4. **Aktiv > passiv, altid:** aktiv skill ≥ 2× bedste passive produktion, hele spillet igennem.
5. **Simulér, ikke gæt:** balance-simmen (greedy bot) udvides pr. milestone. Suiten kører 500 seeded matchups pr. nøgle-loadout/enemy, en fresh-state progressionstest og en separat Upgrade Rush-cadence-sim. Aktuelle guards: normale Forest-encounters 12-16s median; crafted-only Forest Brute-loadout <50%; Level 3-drop-loadout ≥55%; tre første gathering-køb ≤100 sekunder; Dire Wolf gammel gear ≤20%, forventet tre-slot T2 70–90%, balanceret fire-slot 100% single-encounter; hele fresh-state-ruten til Wolf Den ≤1.200 gathering-rolls.

---

# 15. Design Risks

| Risiko | Mitigering |
| ------ | ---------- |
| **Venten føles passiv** (én aktiv skill) | Hyppige tidlige køb, korte roll-timere, synlige rul + flyvende ressourcer, altid 2-3 synlige mål |
| **Non-combat skills føles som pligter** | Hver skill unlocker konkret combat-gear; slibninger er tilfredsstillende i sig selv; rare drops |
| **Combat er uklar** | dps ind/ud vises; boss-nederlag efterlader en tydelig "mangler damage/sustain"-besked; anbefalede upgrades |
| **Settlement bliver dekoration** | Nøglesystemer KRÆVER bygninger (Workshop → combat dice; Barracks → slots/talents); trophies bruges i byggepriser |
| **For mange systemer for tidligt** | Milestone-planen (§13) er værnet: intet system før dets test-spørgsmål er nået |
| **Upgrade-akserne smelter sammen** | Hard Rule 4 (én akse, én rolle) håndhæves i review af alt nyt indhold |

---

# 16. Success Criteria

**M1 (combat slice) lykkes, hvis spillere føler:**

* "Jeg vil lige lade den rulle lidt længere."
* "Jeg ved præcis, hvad jeg skal forbedre før næste boss-forsøg."
* "Monster parts gjorde mine gathering-timer meningsfulde med tilbagevirkende kraft."
* "Jeg fandt eller craftede en ny terning og ændrede mit loadout, fordi det føltes som MIT valg."

**Spillet som helhed lykkes, hvis:**

* "Hver upgrade kan ses — på terningen, i settlementen eller i combat."
* "Jeg skiftede skill, fordi MIN plan krævede det."
* "Combat giver alt andet formål." / "Min settlement gør mine skills stærkere."

Fejlsignaler: spilleren parkerer 20+ min. i én skill uden grund (gates for svage); upgrade-panelet føles som procent-regneark (aksereglen brudt); boss-nederlag føles som straf (feedback mangler).

---

# 17. Parkerede systemer

Bevidst ude — genbesøges tidligst efter M3, med arkiv-GDD'erne som kilde:

* **Threat/raids/survival-pres** (v0.2 §12) — genindføres kun, hvis "ingen fare" gør late game fladt
* **Endless Dungeon** (combat-udkast §19) — post-Act 2-scaling-content, aldrig før zonerne er bevist
* **Per-die XP og individuelle combat-die face-upgrades** — M1 bruger collection + Combat Level-gates; genbesøges kun, hvis loot/loadout mangler attachment
* **Ascend og traits** — ikke del af M1; genbesøges først efter collection/loadout-loopet er bevist
* **Tier-specialiseringsgrene** (fx Sharp/Serrated/Balanced Blade) — vent til talents (M2+) har bevist sig; ét trait pr. type er nok i M1
* **Dice evolutions** for gathering-terninger — slibe-ladders + tiers dækker; evolutions er en senere wow-akse
* **Crafting som aktiv skill** — opskrifter er instant i M1-M3; opgraderes kun hvis spillet føles tyndt
* **Research, iron/gems/fiber/relics, alchemy** — Act 2+-indhold
* **Offline progression** — motoren er klar (`tick` med stort dt + caps); featuren venter på automation
* **Prestige, seasons, districts** — post-Act-arc

---

# 18. Open Questions (de ægte)

1. **Hvor aktiv skal boss-combat være?** Anbefaling: automatisk med loadout-valg; bosses får synlig telegraf og evt. ét aktivt valg (retreat-timing) — aldrig turbaseret. Afgøres i M1-playtest.
2. **Skal fjendens angreb time-baseres eller rul-baseres?** Anbefaling: tidsbaseret (§11.2) — mere læseligt og roll-speed-uafhængigt. Verificeres i combat-simmen.
3. **Hvornår d6 → d8?** To ekstra sider er en kæmpe milestone; foreslået som Act 2-belønning. Afgøres efter M2.
4. **Passiv produktions loft** — 40-60% late game er udkastet; simmen afgør, hvor grænsen for "aktiv skal føles nødvendig" reelt går.

---

# 19. Final Design Statement

Dicehaven handler om at bygge magt gennem fokuseret træning. Du vælger én skill, ser dens dice engine rulle, konverterer ressourcer til bedre terninger og bygninger — og tester det hele i combat. Combat skubber verden fremad; settlementen gør maskinen stærkere; terningerne gør hver eneste upgrade synlig.
