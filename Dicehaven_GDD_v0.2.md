# Game Design Document v0.2

## Working title: **Dicehaven**

Alternative working titles: **Rollstead**, **Dicebound Settlement**, **Hearthroll**, **Settlement of Six**

---

# Changelog v0.1 → v0.2

1. **Identitet omformuleret**: Turbaseret dice engine-builder med incremental progression. Ny kerneregel: *en dag = en tur*, ingen realtid.
2. **Dice Exhaustion tilføjet** (ny sektion 8.4): En die brugt i et shift er exhausted resten af dagen. Pool size får reel betydning, og shiftvalget kan aldrig blive "solved".
3. **Upkeep fjernet helt**: Ingen food upkeep, ingen fuel upkeep. Threat er spillets eneste overhængende fare.
4. **Food fjernet fra MVP**: Genindføres i Milestone 2/3 som *Rations/Supplies* — combat-brændstof (dungeon runs, healing), ikke en skat.
5. **Farming omdefineret**: Ude af MVP. Bliver senere en *Provisioning*-skill, der producerer rations og herbs til combat-økonomien.
6. **Building er et system, ikke en skill**: Bygninger koster ressourcer + et fast antal build-actions. Ingen terninger på forbrug.
7. **Threat re-balanceret**: Passiv gain skalerer med settlementens størrelse. Raid-reset sænket til 30. Threat-ændringer vises altid før rul. Patrol har deterministisk baseline.
8. **Dice ER crewene**: Alle worker-referencer fjernet. Træthed = exhaustion, skade = durability, erfaring = dice XP.
9. **Population, Morale og Storage-caps ude af MVP**: Stats uden spiller-håndtag i de første timer er klippet.
10. **Offline progression erstattet af Auto-Play**: Automation er fast-forward af ture, ikke realtidsproduktion.
11. **Loadouts omdefineret som prioritetslister**: Kompatible med exhaustion, bedre automation-fundament.
12. **MVP skåret ned**: Woodcutting + Mining + Building-system + Threat + primitiv Patrol. Combat er Milestone 2, dungeon er Milestone 3.

---

# 1. High Concept

**Dicehaven** er et turbaseret dice engine-builder settlement game med incremental progression. Spilleren udvikler en lille settlement ved at bruge skill-baserede dice pools. Hver dag har spilleren et begrænset antal actions. Ved hver action vælger spilleren en skill, sammensætter et lille "shift" af terninger fra den skills dice pool, ruller dem og får ressourcer, XP, progression eller risiko.

**Kerneregel: En dag = en tur.** Spillet har ingen realtid. Tid går kun, når spilleren bruger actions og afslutter dagen.

Spillet kombinerer:

* Dice rolling og board game-følelse
* Engine-building gennem konkrete dice-upgrades
* Worker/settlement management
* Skill progression inspireret af Melvor Idle
* Push-your-luck dungeon combat
* Threat som spillets ene, samlende pres — uden hard game over

Spillerens primære mål er at udvikle settlementen, optimere sine dice pools, unlocke nye skills, bygninger og automation, samt håndtere den fare, der opstår, når settlementen vokser og spilleren tager mere risikable valg.

---

# 2. Core Fantasy

Spilleren leder en voksende settlement i en farlig verden. Alle aktiviteter udføres af specialiserede work crews repræsenteret som terninger. Mining-crewet har sine egne mining dice. Woodcutting-crewet har sine egne woodcutting dice. Combat-crewet har combat dice, der kan craftes, forbedres og bruges i patrols, hunts og endless dungeon runs.

**Dice ER crewene.** Alt, hvad der kan ske for et crew, sker for dets dice: træthed er exhaustion, skade er durability damage, erfaring er dice XP. Der findes ikke et separat worker-lag.

Fantasien er:

> "Jeg bygger en settlement ved at udvikle små dice engines for hver skill. Jeg vælger, hvilke dice jeg bruger hver dag, presser min produktion hurtigere med risky dice, og håndterer konsekvenserne gennem combat og dungeon runs."

---

# 3. Design Pillars

## 3.1 Turbaseret engine-builder med incremental progression

Spillet er et turbaseret strategispil i sin kerne. Incremental-elementet ligger i progressionen — ikke i realtidsproduktion.

Spilleren skal konstant have følelsen af:

* "Jeg mangler kun lidt mere wood."
* "Hvis jeg tager én dag mere, kan jeg opgradere min Mining pool."
* "Hvis denne die leveler, bliver mit loadout meget bedre."
* "Jeg skal bare lige have ét dungeon floor mere."

Hooket er *Slay the Spire*-agtigt ("én tur mere"), ikke idle-agtigt ("mine tal vokser mens jeg sover"). Alle systemer skal støtte den følelse.

---

## 3.2 Dice as engines, not just randomness

Terninger er ikke kun tilfældige resultater. De er spillerens produktionsmotor.

Progression skal ofte være konkret og synlig:

* En dårlig side bliver erstattet.
* En die får en ny face.
* En d6 bliver til en d8.
* En risky side bliver stabiliseret.
* En support die begynder at skabe comboer.
* En hel skill pool får flere muligheder.

Spilleren skal kunne se, føle og forstå, at deres dice engine bliver bedre.

---

## 3.3 Meaningful daily choices

Hver dag har begrænsede actions, og brugte dice er exhausted resten af dagen. Spilleren skal vælge, hvad settlementen fokuserer på — og i hvilken rækkefølge.

Eksempler:

* Skal jeg bruge min bedste mining die nu, eller gemme den til senere på dagen?
* Skal jeg mine stone til en vigtig bygning eller hugge wood?
* Skal jeg tage risky mining for at få copper hurtigere?
* Skal jeg bruge en action på Patrol for at reducere Threat?
* Skal jeg tage en Dungeon Run for at få rare materials?

Spillet skaber pres gennem opportunity cost, ikke gennem hård straf. Der findes ingen tvangs-actions — ingen daglig skat, der skal betales, før de rigtige valg begynder.

---

## 3.4 One pressure: Threat

**Threat er spillets eneste overhængende fare.** Der er ingen upkeep, ingen sult, ingen vedligeholdelsesskat.

Spilleren skal ikke kunne tabe spillet permanent. Men dårlige eller grådige valg kan skabe konsekvenser:

* Threat stiger
* Bygninger tager damage
* Dice får durability damage
* Næste dag får færre actions
* Ressourcer går tabt
* Dungeon loot mistes

Det skal føles som et tilbageslag, ikke som en ødelæggelse af savefilen.

Og fordi passiv Threat skalerer med settlementens størrelse, mærker selv den forsigtige spiller verdens pres — bare langsommere.

---

## 3.5 Board game feel, automation as reward

Spillet skal have brætspilsagtige valg i starten:

* Vælg dice
* Sammensæt shift
* Rul
* Resolve outcomes
* Brug ressourcer

Men på sigt skal det udvikle sig mod automation — forstået som **fast-forward af ture**, ikke realtidsproduktion:

* Gem prioriterede loadouts
* Auto-run bestemte skills
* Opsæt regler og stop-betingelser
* Kør N dage automatisk med opsummering
* Long-term scaling

---

# 4. Target Experience

Spillet skal give følgende følelser:

* Tilfredsstillelse ved at rulle mange dice
* "Lige én dag mere"
* Små, konstante upgrades
* Strategisk optimering uden at blive tungt
* Risiko/belønning ved risky dice og dungeon
* Ejerfornemmelse over egne dice pools
* Fortrydelse, der lærer: "Jeg skulle have gemt min bedste die til action 3"
* Følelsen af en settlement, der gradvist bliver mere kompleks og effektiv

---

# 5. Core Gameplay Summary

Hver dag har spilleren et antal actions.

Ved hver action:

1. Spilleren vælger en skill (eller Building/Patrol).
2. Spilleren vælger et shift af *tilgængelige* (ikke-exhausted) dice fra den skills dice pool.
3. Dice rulles.
4. Resultater resolve.
5. Spilleren får ressourcer, XP, progress, threat, loot eller andre effekter.
6. Brugte dice bliver exhausted resten af dagen.
7. Dice og skill får XP.
8. Når dagens actions er brugt, går spillet til aftenfasen.
9. Spilleren bygger, opgraderer, crafter og planlægger.
10. Natten resolver threat, events og dice recovery.
11. En ny dag starter.

---

# 6. Core Loop

## Moment-to-moment loop

**Choose Skill → Choose Dice Shift (blandt friske dice) → Roll → Resolve → Gain Rewards/Consequences → Dice exhaust**

---

## Daily loop

**Morning → Actions → Evening Upgrades → Night Resolution → New Day**

### Morning

Spilleren ser:

* Antal actions for dagen
* Settlement status
* Threat level og dagens forventede threat-gain
* Dagens event/modifier
* Aktuelle mål
* Mulige upgrades

### Day

Spilleren bruger sine actions.

Eksempel:

* Action 1: Woodcutting
* Action 2: Mining
* Action 3: Building

### Evening

Spilleren bruger ressourcer på:

* Bygninger (igangsætning)
* Dice upgrades
* Crafting
* Research
* Combat dice
* Repairs
* Automation

### Night

Spillet resolver:

* Threat changes (passiv gain)
* Raid events (hvis Threat er 100)
* Building damage/events
* Dice recovery (alle exhausted dice bliver friske)
* Wounds/durability recovery

---

## Long-term loop

**Gather resources → Build settlement → Improve dice pools → Unlock riskier options → Manage threat → Enter dungeon → Gain rare materials → Unlock new systems → Scale further**

---

# 7. Terminology

## Skill

Et aktivitetsområde, fx Mining, Woodcutting, Research eller Combat.

## Dice Pool

Alle terninger, spilleren ejer inden for en bestemt skill.

## Shift

De terninger, spilleren vælger til én action. Kun friske (ikke-exhausted) dice kan vælges.

## Exhausted

En die, der er brugt i et shift i dag. Exhausted dice kan ikke bruges igen før i morgen. Alle dice restituerer ved Night Resolution.

## Face

En side på en terning.

Eksempel:

* 2 wood
* 1 copper
* +1 threat
* reroll one die
* block 2
* rare drop

## Trait / Tag

En kategori eller egenskab på en die.

Eksempel:

* Safe
* Risk
* Ore
* Gem
* Support
* Explosive
* Tool
* Magic
* Ancient
* Tireless (exhauster ikke — sjælden, sen trait)

## Loadout

En gemt **prioriteret liste** af dice for en skill. Systemet auto-udfylder shiftet med de højest prioriterede *tilgængelige* dice; spilleren kan justere før rul.

Eksempel:

* Stable Mining
* Copper Hunt
* Gem Gamble
* Low Threat Patrol
* Boss Combat

---

# 8. Core Dice System

Hver skill har sin egen dice pool. Når spilleren bruger en action på en skill, vælger spilleren et antal friske dice fra den pool.

Eksempel:

Mining Pool:

* 7 dice total
* 4 dice per shift

Spilleren vælger 4 friske dice og ruller dem. De 4 dice er derefter exhausted resten af dagen.

---

## 8.1 Pool Size vs Shift Size

Spillet bruger to vigtige progressionstal:

### Pool Size

Hvor mange dice spilleren ejer i en skill.

Med exhaustion betyder pool size: **hvor hårdt kan jeg presse denne skill på én dag?** Pool 7 / shift 4 betyder, at anden action på samme skill kun har 3 friske dice — naturligt aftagende udbytte uden hårde regler.

### Shift Size

Hvor mange dice spilleren må bruge i én action. Større shift betyder stærkere enkelt-actions.

Eksempel progression:

| Skill Level | Pool Size | Shift Size |
| ----------- | --------: | ---------: |
| Level 1     |         5 |          3 |
| Level 5     |         6 |          3 |
| Level 10    |         7 |          4 |
| Level 20    |         9 |          4 |
| Level 30    |        10 |          5 |

---

## 8.2 Dice Types

### Producer Dice

Giver direkte ressourcer.

* 1 wood
* 2 stone
* 1 knowledge

### Support Dice

Forbedrer andre dice.

* Reroll one 0
* +1 to all Ore dice
* Prevent 1 Threat
* Double one Stone result

### Risk Dice

Giver højere output, men negative effekter.

* +5 stone, +2 Threat
* 2 iron, damage this die
* Double output, +3 Threat
* Gain rare resource, raise Dungeon Danger

### Utility Dice

Giver særlige effekter.

* Reveal next dungeon room
* Add blueprint progress
* Increase loot chance
* Prevent ambush

### Combo Dice

Belønner bestemte kombinationer.

* If rolled with 2+ Ore dice, gain +1 copper
* If you rolled a Risk die, gain +2 XP
* If this shift has 3 different tags, gain insight

---

## 8.3 Dice Progression

### Level Up

Dice får XP, når de bruges i et shift.

Ved level up kan de få:

* Bedre faces
* Lavere risiko
* Nye tags
* Højere output
* Bedre comboer

### Face Upgrade

Spilleren kan ændre en specifik side.

* 0 wood → 1 wood
* 1 stone → 2 stone
* +2 threat → +1 threat
* miss → reroll one die

### Evolution

Ved bestemte levels kan en die specialiseres.

Basic Sword Die kan udvikle sig til:

* Duelist Die
* Cleaver Die
* Guardblade Die
* Cursed Blade Die

### Die Size Upgrade

Senere kan dice ændre størrelse.

* d6 → d8
* d8 → d10
* Special relic dice → d12

Dette bør føles som en stor milestone.

---

## 8.4 Dice Exhaustion

**Regel: En die, der bruges i et shift, bliver Exhausted resten af dagen. Alle dice restituerer ved Night Resolution.**

Hvorfor systemet findes:

* **Pool size får reel betydning.** Uden exhaustion er de dice, der ikke er i det matematisk bedste shift, permanent dødvægt. Med exhaustion er hele poolen dit daglige budget.
* **Shiftvalget kan aldrig blive "solved".** Action 1's valg begrænser action 3. "Bruger jeg min bedste die nu eller gemmer jeg den?" er et push-your-luck-lag, der koster nul ekstra UI.
* **Naturligt aftagende udbytte.** At køre samme skill to gange samme dag er svagere anden gang — spillet skubber blidt mod variation uden hårde regler.

Fremtidige knapper systemet giver gratis:

* **Tireless**-trait: dien exhauster ikke (sjælden, sen unlock)
* **Rested**-bonus: +1 hvis dien ikke blev brugt i går
* Bygninger/effekter, der refresher én exhausted die
* Events, der exhauster dice som konsekvens

UI-krav: Exhausted dice vises tydeligt (grå/liggende) i poolen, så budgettet altid er synligt.

---

# 9. Skills

MVP starter med Woodcutting og Mining. Øvrige skills tilføjes i milestones.

---

## 9.1 Woodcutting (MVP)

Primær funktion:

* Producerer wood
* Giver adgang til planks, bark, resin og rare wood
* Understøtter bygninger, tools, torches, bows og shields

Identitet:

* Stabil produktion
* Lav risiko
* God tidlig skill
* Kan senere have natur/spirit-risk gennem Ancient Grove dice

Eksempel dice:

### Chopper Die

* 1 wood / 1 wood / 2 wood / 2 wood / 3 wood / 3 wood

### Old Axe Die

* 0 / 1 wood / 2 wood / 3 wood / 4 wood / damage this die

### Bark Die

* 1 wood / 1 bark / 1 bark / 2 wood / bark + wood / 0

### Ancient Grove Die (senere unlock)

* 2 rare wood / 3 wood / 1 resin / +2 Threat / spirit event / rare drop

---

## 9.2 Mining (MVP)

Primær funktion:

* Producerer stone, copper, iron, gems og special ores
* Understøtter bygninger, weapons, tools og automation

Identitet:

* Mere variance end Woodcutting
* Højere chance for rare drops
* Flere risky dice
* Kan øge Threat

Eksempel dice:

### Stone Die

* 1 stone / 1 stone / 2 stone / 2 stone / 3 stone / 3 stone

### Copper Die

* 0 / 1 stone / 1 copper / 1 copper / 2 copper / 1 copper + 1 stone

### Support Beam Die

* prevent 1 Threat / reroll one Risk die / +1 output to Ore dice / prevent one 0 / +2 stone / stabilize tunnel

### Blast Die (senere unlock)

* 0 / 3 stone / 4 stone / 2 copper / double one Stone die / +2 Threat

---

## 9.3 Provisioning (Milestone 2 — tidligere "Farming")

Primær funktion:

* Producerer **rations** (combat-brændstof: dungeon supplies, healing, recovery)
* Producerer herbs, fiber og alchemy ingredients

Identitet:

* Servicerer combat-økonomien — rations er noget spilleren *vil have*, ikke noget spilleren *skylder*
* Timing-baseret: growth-dice skaber fremtidig værdi frem for instant value
* Bliver relevant, når dungeon runs og healing skaber efterspørgsel

**Vigtigt: Der er ingen upkeep.** Rations forbruges kun af ting, spilleren aktivt vælger (dungeon runs, healing, buffs).

Eksempel dice:

### Crop Die

* 1 ration / 1 ration / 2 rations / 2 rations / 3 rations / seed

### Seed Die

* 1 seed / 1 seed / growth +1 / growth +2 / future harvest +2 / no immediate reward

### Herb Die

* 1 herb / 1 herb / 1 ration / 2 herbs / potion ingredient / rare herb

### Compost Die

* +1 to all ration results / growth +1 / reroll one Crop die / 1 ration / 1 ration / no effect

---

## 9.4 Building (system, ikke skill)

Building er **ikke** en dice-skill. Randomness på produktion føles som spænding; randomness på forbrug føles som tyveri.

Regler:

* En bygning har en **ressourcepris** og en **byggetid i build-actions**.
* Ressourcerne betales, når byggeriet igangsættes (i Evening-fasen).
* En Build-action koster 1 action og tilføjer fast 1 progress.
* Bygningen står færdig, når progress = byggetid.

Eksempel:

| Bygning     | Pris                | Byggetid        |
| ----------- | ------------------- | --------------- |
| Shelter     | 10 wood             | 2 build-actions |
| Lumber Camp | 15 wood, 5 stone    | 2 build-actions |
| Quarry      | 20 wood, 10 stone   | 3 build-actions |
| Watchtower  | 25 wood, 15 stone   | 3 build-actions |
| Workshop    | 30 wood, 20 stone   | 4 build-actions |

Senere mulighed (test først uden): Builder-dice som *bonus* oven på deterministisk baseline — fx en die, der kan give +1 ekstra progress eller refundere materialer. Aldrig som erstatning for baseline.

---

## 9.5 Research (Milestone 2/3)

Primær funktion:

* Producerer knowledge
* Unlocker blueprints, automation, new dice types og advanced buildings

Identitet:

* Langsommere direkte output
* Høj strategisk værdi
* Kan forbedre alle andre skills
* Kan have risky "forbidden knowledge" dice

Eksempel dice:

### Study Die

* 1 knowledge / 1 knowledge / 2 knowledge / 2 knowledge / insight / blueprint progress

### Insight Die

* reroll one Research die / +1 knowledge to all Study dice / blueprint progress +2 / discover minor upgrade / 1 knowledge / no effect

### Forbidden Tome Die

* 3 knowledge / 5 knowledge / rare blueprint / +3 Threat / cursed event / damage this die

---

## 9.6 Combat (Milestone 2)

Primær funktion:

* Reducerer Threat
* Giver adgang til dungeon loot, monster parts, relic fragments og combat progression
* Beskytter settlementen
* Skaber push-your-luck gameplay

Identitet:

* Craft-baseret skill
* Højere risiko
* Bruger settlementens ressourcer
* Giver sjældne materialer og progression

Combat har tre primære action-typer:

1. Patrol
2. Hunt
3. Dungeon Run (Milestone 3)

Disse beskrives nærmere i Combat-sektionen.

---

# 10. Resources

**Designprincip: Ingen ressource er en skat.** Alle ressourcer forbruges kun af ting, spilleren aktivt vælger.

## MVP Resources

### Wood

Bruges til: buildings, tools, shields, bows, torches
Produceres af: Woodcutting

### Stone

Bruges til: buildings, walls, workshops, defensive structures
Produceres af: Mining

### Copper

Bruges til: better tools, basic weapons, workshop upgrades
Produceres af: Mining

### Threat

Ikke en ressource, men spillets centrale pres-tal. Beskrives i sektion 12.

---

## Milestone 2+ Resources

### Rations (tidligere "Food")

Bruges til: dungeon supplies, healing, recovery-buffs
Produceres af: Provisioning, Hunt
**Aldrig upkeep.** Rations er brændstof til de ting, spilleren vil — primært combat.

### Herbs

Bruges til: bandage dice, potions, healing, alchemy

### Iron

Bruges til: strong buildings, advanced weapons, armor dice, machinery

### Knowledge

Bruges til: research, blueprints, automation, advanced dice modifications

### Monster Parts

Bruges til: combat dice, special buildings, relic crafting

### Relic Fragments

Bruges til: permanent upgrades, prestige, rare dice evolutions, ancient buildings

---

# 11. Settlement System

Settlementen er spillerens base og hovedprogression.

Bygninger unlocker:

* Nye skills
* Nye dice
* Flere actions per day
* Threat control
* Automation
* Crafting
* Research
* Dungeon features

**Bemærk:** Jo mere settlementen vokser, jo hurtigere stiger passiv Threat (se 12.1). Vækst er aldrig gratis — verden lægger mærke til jer.

---

## 11.1 Core Settlement Stats

MVP har kun én settlement-stat ud over ressourcer: **Threat** (sektion 12).

Senere systemer (ikke MVP):

### Population

Genindføres som ren unlock-gate, ikke som simulation. Eksempel: "6. Mining die kræver population 8". Ingen upkeep, ingen sult.

### Morale

Kun hvis den får klare spiller-håndtag. Klippes indtil videre.

### Storage

Kun hvis runaway-vækst bliver et reelt problem i playtests. Klippes indtil videre.

---

## 11.2 Example Buildings

### Shelter

* Reducerer natlige events' effekt
* Unlocker første pool-upgrade

### Lumber Camp

* Unlocker Woodcutting upgrades
* Woodcutting dice gain +10% XP
* Unlocker Chopper Die crafting

### Quarry

* Mining output +1 på Stone dice én gang per action
* Unlocker Copper Die
* Unlocker Support Beam Die

### Workshop

* Unlocker dice crafting
* Unlocker face upgrades
* Unlocker tool dice

### Watchtower

* Reducerer passiv Threat gain med 1
* **Unlocker Patrol-action** (MVP-version: deterministisk, se 13.1)
* Reducerer raid damage

### Barracks (Milestone 2)

* Unlocker Combat skill
* Unlocker basic combat dice
* Opgraderer Patrol til dice-baseret version

### Research Hut (Milestone 2/3)

* Unlocker Research skill
* Unlocker blueprints
* Unlocker automation tech senere

### Dungeon Gate (Milestone 3)

* Unlocker Dungeon Runs
* Viser dungeon depth
* Unlocker dungeon loadouts
* Unlocker boss milestones

---

# 12. Threat and Danger System

Spillet bruger to relaterede, men separate systemer:

1. **Settlement Threat** — spillets eneste overhængende fare
2. **Dungeon Danger** — lokal push-your-luck-risiko i dungeon runs

---

## 12.1 Settlement Threat

Settlement Threat repræsenterer den fare, der opbygges omkring settlementen. Threat går fra 0 til 100.

### Passiv Threat gain skalerer med settlementens størrelse

| Settlement-stadie          | Passiv gain |
| -------------------------- | ----------: |
| Start (0-2 bygninger)      |      +1/dag |
| Voksende (3-5 bygninger)   |      +2/dag |
| Etableret (6+ bygninger)   |      +3/dag |

Dette erstatter upkeepens rolle som skalerende pres: selv den forsigtige spiller mærker verden, og presset peger direkte mod combat.

### Threat stiger derudover fra:

* Risk dice
* Exploration
* Failed dungeon runs
* Certain research dice
* Ignoring raids/events
* Ancient/cursed resources

### Threat falder fra:

* Patrol
* Successful dungeon runs
* Special events
* Research upgrades

### Gennemsigtighedsregel

**Threat-ændringer vises altid, før spilleren committer.** En risk die viser sit worst case ("denne action: op til +2 Threat") inden rul. Threat skal føles som et lån, spilleren *vælger* — aldrig som en overraskelse.

---

## 12.2 Threat Thresholds

### 0-24: Safe

Ingen eller minimale effekter.

### 25-49: Uneasy

Små events kan opstå: minor theft, risk dice bliver lidt farligere.

### 50-74: Dangerous

Højere chance for negative night events. Exploration mere farlig. Combat actions mere vigtige.

### 75-99: Critical

Raids kan trigge tidligt. Building damage-events. Dungeon enemies nær settlementen bliver stærkere.

### 100: Raid Event

Raid skal ikke være game over, men et tilbageslag:

* Mist 10% af én tilfældig ressource
* En bygning tager damage (mistet effekt indtil repareret)
* Næste dag: -1 action
* **Threat resetter til 30**

Reset-niveauet er bevidst lavt: reset til 50+ ville betyde, at raids kommer hurtigere og hurtigere, netop når spilleren er svagest — en dødsspiral. Senere kan reset-niveauet afhænge af, hvor godt raidet blev håndteret (forsvar = lavere reset).

---

## 12.3 Threat Philosophy

Threat skal føles som gæld.

Spilleren kan tage risky valg for at accelerere progression, men "låner" mod fremtidigt pres:

* Risky mining giver hurtig copper, men øger Threat.
* Forbidden research giver stærke blueprints, men øger Threat.
* Dungeon failure giver loot-tab og Threat.
* Combat betaler gælden ned.

Design statement:

> Threat er gælden, spilleren opbygger ved at spille grådigt — plus den rente, verden opkræver af en voksende settlement. Combat er måden, spilleren betaler den gæld ned på.

Balanceregel: Patrol-omkostningen (i actions) skal være *lidt* billigere end gevinsten ved grådighed. Er den dyrere, tager ingen risk dice; er den meget billigere, er risk gratis. Dette er spillets vigtigste balancepunkt.

---

## 12.4 Dungeon Danger

Dungeon Danger er lokal risiko inde i en dungeon run.

Påvirker: enemy difficulty, ambush chance, trap chance, loot multiplier, elite chance, boss spawn chance.

Stiger når: spilleren går dybere, bruger cursed/risky combat dice, vælger farlige rooms, fejler visse rolls.

Falder gennem: torch dice, scout dice, campfire events, leaving dungeon, certain utility dice.

Dungeon Danger er push-your-luck-systemet.

---

# 13. Combat System

Combat er en skill med egen dice pool (Milestone 2).

Combat bruges til: Patrol, Hunt, Dungeon Run, raid mitigation, boss progression.

Combat dice craftes af settlement resources.

---

## 13.1 Combat Actions

### Patrol

Lav risiko, lav reward. Spillets primære gældsafbetaling.

**MVP-version (via Watchtower, før Combat-skillen findes):**

* Koster 1 action, ingen dice
* Fjerner fast 8 Threat
* Formål: hele threat-gæld-loopet kan testes i MVP

**Milestone 2-version (via Barracks):**

* Spilleren vælger combat dice
* **Deterministisk baseline: Patrol fjerner altid mindst 5 Threat.** Terningerne afgør, hvor meget mere.
* Giver Combat XP og små monster parts
* Baseline-reglen sikrer, at gældsafbetaling er pålidelig og kan regnes ud i hovedet

### Hunt

Medium risiko, medium reward.

Rewards: rations, hide, bone, monster parts, Combat XP
Risks: dice durability loss, +Threat on failure

### Dungeon Run (Milestone 3)

Høj risiko, høj reward.

* Koster **2 actions + rations** (supplies)
* Giver rare materials, relic fragments, combat blueprints, boss trophies

---

## 13.2 Combat Dice Roles

### Damage Dice

Sword, Spear, Bow, Axe, Bomb — gør skade på enemies.

### Defense Dice

Shield, Armor, Dodge, Barrier — reducerer incoming damage.

### Sustain Dice

Bandage, Potion, Campfire, Regeneration — healer, forlænger dungeon runs.

### Utility Dice

Torch, Scout, Trap, Lockpick, Smoke Bomb — revealer rooms, øger loot, reducerer ambush.

### Risk Dice

Berserker, Cursed Blade, Blood Pact, Explosive Flask — meget stærke resultater, negative konsekvenser.

---

## 13.3 Example Combat Dice

### Rusty Sword Die

Cost: 10 wood, 5 copper
Faces: miss / 1 damage / 1 damage / 2 damage / 2 damage / 3 damage

### Wooden Shield Die

Cost: 15 wood, 5 hide
Faces: 1 block / 1 block / 2 block / 2 block / block + counter 1 / guard: reduce next hit

### Bow Die

Cost: 12 wood, 4 fiber, 3 copper
Faces: 1 damage / 1 damage / 2 damage / first strike 2 / 1 damage + loot chance / miss

### Bandage Die

Cost: 5 herbs, 2 cloth
Faces: heal 1 / heal 1 / heal 2 / cleanse minor wound / prevent 1 damage / no effect

### Torch Die

Cost: 5 wood, 2 fiber, 1 oil
Faces: reveal next room / prevent ambush / 1 fire damage / +1 loot chance / reduce Dungeon Danger / fizzle

---

# 14. Dungeon System (Milestone 3)

Dungeon er en endless push-your-luck mode. Spilleren bruger combat dice til at gå floor for floor.

Efter hvert floor vælger spilleren: Continue / Leave with loot / Take special room / Fight elite / Use camp.

---

## 14.1 Dungeon Flow

### Before Run

Spilleren vælger: dungeon type, combat shift, **rations/supplies** (adgangsbillet), eventuel modifier.

### During Run

For hvert floor:

1. Room genereres
2. Enemy/event/trap vises
3. Spilleren ruller combat dice
4. Damage/block/heal/utility resolves
5. Enemy angriber hvis den overlever
6. Rewards gives
7. Spilleren vælger fortsæt eller forlad

### After Run

Frivillig exit: beholder alt loot, får XP.
Slået ud: mister 50-70% af run loot, combat dice tager durability damage, Settlement Threat +10.

---

## 14.2 Dungeon Rewards

Dungeon giver rewards, som ikke kan farmes normalt:

* Monster Parts, Relic Fragments, Ancient Gears, Boss Trophies, Rare Dice Cores, Cursed Ore, Combat Blueprints, Automation Components, unique building materials

Dette sikrer, at dungeon bliver relevant for hovedprogression.

---

## 14.3 Dungeon Scaling

| Floor | Loot Multiplier | Danger Modifier |
| ----- | --------------: | --------------: |
| 1     |            x1.0 |             Low |
| 2     |            x1.1 |             Low |
| 3     |           x1.25 |          Medium |
| 4     |            x1.5 |          Medium |
| 5     |            x2.0 |       Mini-boss |
| 10    |            x3.5 |            Boss |
| 20    |            x8.0 |      Major boss |

---

## 14.4 Dungeon Failure

Ved defeat:

* Spilleren beholder 30-50% loot
* Combat dice får lidt durability damage
* Settlement Threat +10
* Run slutter

Pres, ikke frustration.

---

# 15. Progression Systems

## 15.1 Skill XP

Skill level unlocker: større pool size, større shift size, nye dice, nye actions, passive bonuses, automation.

## 15.2 Dice XP

Dice level unlocker: face upgrades, evolutions, reduced negative effects, new combos, trait changes (fx Tireless), die size upgrades.

## 15.3 Settlement Progress

Settlement milestones unlocker: flere actions per day, nye districts, nye skills, new resource tiers, dungeon access, prestige, automation.

**Husk:** settlement-vækst øger også passiv Threat — progression og pres følges ad.

## 15.4 Research Progress

Unlocker: dice blueprints, building blueprints, automation rules, threat management, resource conversion, dungeon information.

## 15.5 Combat Progress

Unlocker: new combat dice, larger combat shifts, dungeon types, boss access, raid defenses, better Patrol/Hunt outcomes.

---

# 16. Automation

Automation er et vigtigt midgame/late-game system — forstået som **fast-forward af ture**, aldrig realtidsproduktion.

## 16.1 Loadouts (prioritetslister)

Et loadout er en prioriteret liste af dice for en skill. Systemet auto-udfylder shiftet med de højest prioriterede *tilgængelige* (ikke-exhausted) dice; spilleren kan justere før rul.

Eksempler:

Mining: Stable Stone / Copper Hunt / Gem Gamble / Low Threat
Combat: Safe Patrol / Beast Hunt / Dungeon Push / Boss Defense

## 16.2 Auto Actions

Senere kan spilleren opsætte regler:

* Use Patrol if Threat > 70
* Use Mining until stone > 200
* Use Woodcutting if wood < 100
* Use Research if no building is queued

## 16.3 Auto-Play (erstatter offline progression)

Da spillet er turbaseret, findes "offline" ikke. I stedet:

> **Auto-Play**: Spilleren sætter en plan (prioriteret liste af auto-actions + stop-betingelser) og kører N dage automatisk med opsummering bagefter.

Regler:

* Dungeon runs kan ikke auto-plays tidligt
* Risky actions i auto-play kræver eksplicit opt-in
* Stop-betingelser: "stop hvis Threat > 80", "stop ved raid", "stop når bygning er færdig"

Eksempel-planer: Safe Growth / Resource Focus / Research Focus / Threat Control / Balanced

---

# 17. Failure and Recovery

Spillet har ingen hard game over.

Mulige setbacks:

* Ressourcetab
* Building damage
* Dice durability damage
* Reduced actions next day
* Increased Threat
* Lost dungeon loot

Recovery options:

* Patrol for threat
* Repair buildings (ressourcer + build-action)
* Dice recovery (rations/herbs kan senere accelerere durability-reparation)
* Research defensive systems

Setbacks skal være mærkbare, men ikke brutale.

---

# 18. MVP Scope

Første prototype skal teste én ting:

> Er det sjovt at vælge dice fra en skill pool, rulle dem, få progression og bruge rewards på upgrades — når exhaustion gør dagens rækkefølge til et puslespil, og Threat gør grådighed til et lån?

---

## 18.1 MVP Features

### Core

* Day system (en dag = en tur)
* Limited actions per day
* Skill dice pools med exhaustion
* Shift selection
* Dice rolling
* Resource rewards
* Skill XP + Dice XP
* Basic face upgrades
* Deterministisk building-system

### Skills

* Woodcutting
* Mining

### Resources

* Wood
* Stone
* Copper
* (Threat som pres-tal)

### Buildings

* Shelter
* Lumber Camp
* Quarry
* Workshop
* Watchtower

### Threat

* Threat meter 0-100
* Skalerende passiv gain (+1/+2/+3 efter settlement-størrelse)
* Risk dice threat gain (med preview før rul)
* Patrol via Watchtower (deterministisk: -8 Threat per action)
* Raid ved 100 (reset til 30)

### IKKE i MVP

* Food/rations, upkeep af enhver art
* Combat-skill, dungeon (Milestone 2/3)
* Population, Morale, Storage-caps
* Durability, wounds
* Research
* Seasons, prestige

---

## 18.2 MVP Numbers

Starting state:

* 3 actions per day
* 0 wood, 0 stone, 0 copper
* Threat: 10/100
* Woodcutting Pool: 5 dice, shift size 3
* Mining Pool: 5 dice, shift size 3

Threat:

* Passiv gain: +1/dag (0-2 bygninger), +2/dag (3-5), +3/dag (6+)
* Patrol (Watchtower): -8 Threat per action
* Watchtower passiv: -1 på daglig gain

Raid ved 100 Threat:

* Mist 10% af én tilfældig ressource
* En bygning tager damage (mistet effekt indtil repareret)
* Næste dag: -1 action
* Threat resetter til 30

---

## 18.3 Milestones efter MVP

**Milestone 2 — Combat:**
Barracks, Combat-skill, 5 combat dice, dice-baseret Patrol (baseline -5 + dice), Hunt, Provisioning-skill (rations/herbs), durability på combat dice.

**Milestone 3 — Dungeon:**
Dungeon Gate, endless dungeon, Dungeon Danger, rations som run-cost, monster parts/relic fragments som unikke rewards.

**Milestone 4 — Research & Automation:**
Research Hut, knowledge, blueprints, priority loadouts, auto-actions, Auto-Play.

---

# 19. Example First 10 Minutes

## Day 1

Player has 3 actions. Goal: Byg Shelter (10 wood, 2 build-actions).

**Action 1: Woodcutting.** Vælg 3 af 5 dice. Gain 6 wood. De 3 dice er nu exhausted.

**Action 2: Woodcutting igen.** Kun 2 friske dice tilbage — shiftet er svagere. Gain 3 wood. *Spilleren lærer: samme skill to gange samme dag giver aftagende udbytte.*

**Action 3: Mining.** 3 friske mining dice. Gain 5 stone.

**Evening:** 9 wood — ikke nok til Shelter endnu.

**Night:** Threat +1. Alle dice restituerer.

## Day 2

**Action 1: Woodcutting.** Gain 5 wood (14 total). Shelter igangsættes i Evening? Nej — kan igangsættes med det samme, da prisen er betalt: 10 wood trækkes.

**Action 2: Build.** +1 progress (1/2).

**Action 3: Build.** +1 progress (2/2). **Shelter færdig.**

Reward: Unlocker pool-upgrade + Lumber Camp blueprint.

## Day 3-5

Spilleren bygger Lumber Camp og Quarry. Unlocks: skill upgrades, dice XP-screen, første face upgrade ("erstat Old Axe-diens 0 med 1 wood").

Spilleren bemærker: Quarry unlocker en risky Blast Die — mere stone, men +2 Threat per dårligt rul. Preview viser risikoen før hvert rul.

## Day 6-8

Spilleren bruger risky mining til at få copper hurtigere. Threat stiger til 60. Spillet foreslår: Byg Watchtower.

## Day 9-10

Watchtower færdig. Patrol unlocked: 1 action = -8 Threat. Spilleren patruljerer, Threat falder til 35.

Spilleren har nu mærket hele kernen: produktion → grådighed → gæld → afbetaling. Barracks (Milestone 2) vises som næste store mål.

---

# 20. UI/UX Principles

## 20.1 Main Screen

* Current day + actions remaining
* Core resources
* Threat meter **med dagens forventede gain**
* Settlement buildings
* Current goal
* Skill buttons

## 20.2 Skill Screen

* Dice Pool — **exhausted dice tydeligt markeret** (grå/liggende)
* Current shift slots
* Saved loadouts (prioritetslister)
* Skill XP, Dice XP
* Available upgrades
* Recent roll history

## 20.3 Dice UI

Hver die viser: navn, tags, level, XP, faces, upgrade-indikator, risk-indikatorer, combo-tekst, **exhausted-status**.

Risky dice skal være visuelt tydelige, og deres worst case (fx "+2 Threat") skal kunne ses før rul.

## 20.4 Roll Screen

* Dice animation
* Results, combo triggers
* Resource gains, XP gains
* **Threat changes — altid previewet før rul, bekræftet efter**
* Rare drops

Roll summary skal være hurtig og skippable senere.

## 20.5 Evening Screen

* Available buildings (pris + byggetid i actions)
* Dice upgrades, crafting, repairs
* Threat warnings
* Suggested next goals

---

# 21. Balancing Principles

## 21.1 Actions are the main limiter

Dagens actions er spillets vigtigste valuta. Flere actions per day er en stor upgrade. Der findes ingen tvangs-actions — hver action er et frit valg.

## 21.2 Exhaustion is the second limiter

Pool size bestemmer, hvor hårdt en skill kan presses per dag. Pool-upgrades er derfor throughput-upgrades, ikke bare "flere muligheder".

## 21.3 Threat controls greed

Risk dice skal være matematisk attraktive — ofte stærkere end safe dice — men generere Threat. Patrol-omkostningen skal være lidt billigere end grådighedens gevinst, aldrig meget billigere. Dette er spillets vigtigste balancepunkt.

## 21.4 Upgrades should be frequent

* First 5 minutes: upgrade every 1-2 days
* First 30 minutes: upgrade every 3-5 days
* Midgame: multiple parallel upgrade goals

## 21.5 Dice upgrades should be concrete

Undgå abstrakte upgrades som "+5% output". Foretræk:

* Replace one 0 face
* Add one copper face
* Reduce Threat side
* Add reroll effect
* Increase shift size
* Add new die to pool

---

# 22. Content Expansion

Efter MVP + milestones, udvid gennem eras eller districts.

## 22.1 New Skills

Crafting, Trading, Exploration, Alchemy, Magic, Fishing, Engineering, Diplomacy.

## 22.2 New Biomes

Forest, Marsh, Ruins, Deep Caverns, Mountains, Ancient City, Underworld, Skylands.

## 22.3 New Dungeon Types

Cave, Ruins, Crypt, Beast Den, Forgotten Mine, Ancient Machine, Cursed Grove, Sunken Temple. Hver type favoriserer forskellige combat dice.

## 22.4 Seasons

Tilføjes efter core loop virker. Kan modulere skills (Spring: growth-bonus; Winter: bedre rare dungeon drops) — men aldrig som upkeep-skat.

---

# 23. Prestige System

Prestige tilføjes senere, ikke MVP.

## Found a New Settlement

Spilleren sender en ekspedition afsted.

Keeps: legacy dice, relic fragments, permanent knowledge, certain blueprints, global bonuses.
Resets: most buildings, basic resources, some skill progress.
Unlocks: new starting modifiers, new biomes, new dice types, faster early game, permanent settlement traits.

Alternativ fantasi: **Awaken the Ancient Core** — settlementen aktiverer et ældgammelt relikvie, resetter verdenscyklussen, beholder legacy power.

---

# 24. Design Risks

## Risk 1: Micro-management

Problem: At vælge dice hver action kan blive tedious.

Løsninger: Priority loadouts (auto-udfylder med tilgængelige dice), auto-actions, suggested shifts, skip roll animations. Exhaustion hjælper også: valget *ændrer sig* hver action, så det føles mindre som gentagelse.

## Risk 2: All skills feel the same

Problem: Hver skill bliver "choose dice, get resource".

Løsninger: unikke mekanikker per skill — Mining har rare drops og threat, Provisioning har delayed growth, Research har blueprint progress, Combat har HP og push-your-luck. Building er bevidst *ikke* en skill.

## Risk 3: Threat feels annoying

Problem: Threat føles som straf.

Løsninger: Threat er mest spiller-genereret; altid synlig og previewet før rul; Patrol er pålidelig (deterministisk baseline); raids er setbacks, ikke katastrofer; risky valg er tydeligt belønnende.

## Risk 4: Dungeon overtakes settlement

Problem: Combat bliver den eneste sjove del.

Løsninger: Dungeon koster actions + rations (settlement-produktion); dungeon-rewards føder settlement-progression; daily actions begrænser dungeon-spam.

## Risk 5: Randomness feels unfair

Problem: Dårlige rolls føles for straffende.

Løsninger: Flere dice per action, support dice, rerolls, pity-mekanikker, XP uanset resultat, variance-reducerende upgrades.

## Risk 6: No pressure for cautious players

Problem: Uden upkeep kan en 100% forsigtig spiller aldrig mærke verden.

Løsninger: Passiv Threat skalerer med settlement-størrelse — vækst opkræver rente. Midgame-progression kræver dungeon-materialer (soft mandatory combat). Forsigtigt spil er lovligt, bare langsommere.

## Risk 7: Exhaustion feels like punishment

Problem: "Mine bedste dice er brugt" kan føles begrænsende frem for interessant.

Løsninger: Recovery er altid fuld og gratis (hver nat); pool-upgrades giver mærkbart mere dagsbudget; Rested-bonus og Tireless-traits gør systemet til en kilde af positive overraskelser, ikke kun begrænsning. Test tidligt om reglen skal være "exhausted resten af dagen" eller mildere ("kan bruges igen med -1 penalty").

---

# 25. Prototype Build Order

## Step 1: Dice rolling foundation

Build: dice data structure, faces, skill pools, shift selection, **exhaustion**, roll resolution, resource gain.

Test: **Er det sjovt at vælge 3 af 5 dice, når valget i action 1 begrænser action 3?**

## Step 2: Day/action system

Build: day counter, actions per day, morning/day/evening/night loop, dice recovery ved night.

Test: Skaber dagsstrukturen god pacing?

## Step 3: Basic settlement

Build: resources, deterministisk building-system (pris + byggetid), simple unlock tree.

Test: Føles building progression belønnende — også uden terninger?

## Step 4: Dice XP/upgrades

Build: skill XP, dice XP, face upgrades, pool size upgrades, shift size upgrades.

Test: Føles dice progression vanedannende?

## Step 5: Threat

Build: threat meter, skalerende passiv gain, risk dice threat gain med preview, Watchtower + deterministisk Patrol, raid event med reset til 30.

Test: Skaber threat pres uden frustration? Er risk dice fristende, når prisen er synlig?

## Step 6: Combat (Milestone 2)

Build: combat skill, 5 combat dice, dice-baseret Patrol med baseline, Hunt, basic HP/damage/block, Provisioning/rations.

Test: Føles combat som en naturlig del af økonomien?

## Step 7: Endless dungeon (Milestone 3)

Build: floor progression, enemy scaling, loot multiplier, rations som run-cost, continue/leave choice, defeat consequence.

Test: Virker "one more floor"?

## Step 8: Loadouts and automation (Milestone 4)

Build: priority loadouts, quick-select, auto actions, Auto-Play med stop-betingelser.

Test: Bliver spillet smoothere over tid?

---

# 26. Example MVP Dice Pools

## Woodcutting Pool

1. Chopper Die
2. Chopper Die
3. Old Axe Die
4. Bark Die
5. Bark Die

Shift size: 3. Ancient Grove Die unlocks senere.

## Mining Pool

1. Stone Die
2. Stone Die
3. Copper Die
4. Support Beam Die
5. Cracked Stone Die

Shift size: 3. Blast Die unlocks via Quarry.

## Milestone 2 Pools

**Provisioning:** Crop Die x2, Seed Die, Herb Die, Compost Die.
**Combat:** Rusty Sword Die, Wooden Shield Die, Bow Die, Bandage Die, Torch Die.

---

# 27. Main Player Goals

## Short-term goals

* Finish current building
* Reduce Threat før den bliver kritisk
* Level a die
* Craft a new die
* Reach next dungeon floor

## Medium-term goals

* Unlock new skill
* Increase pool/shift size
* Build Workshop, Watchtower
* Craft better combat dice
* Clear first boss floor

## Long-term goals

* Fully develop settlement
* Automate early skills (Auto-Play)
* Unlock rare dice evolutions
* Reach deep dungeon milestones
* Unlock prestige

---

# 28. Current Recommended Direction

Den stærkeste version af spillet er:

> Et turbaseret dice-pool settlement-spil, hvor hver skill er sin egen udviklende dice engine. Hver dag bruger spilleren begrænsede actions på shifts fra skill pools — og brugte dice er exhausted resten af dagen, så rækkefølgen er et puslespil. Risky dice accelererer vækst men skaber Threat; settlementens egen vækst gør det samme. Combat dice craftes af settlementens ressourcer og bruges til at patruljere, jage og presse dybere ned i en endless dungeon efter rare progression-materialer.

Retningen giver spillet:

* Ét klart pres-system (Threat) i stedet for to lavvandede
* Et shiftvalg, der aldrig bliver solved (exhaustion)
* Meaningful daily decisions uden tvangs-actions
* Board game-identitet med incremental progression
* Risk/reward-tension med fuld gennemsigtighed
* En god grund til at combat eksisterer
* Et stærkt "one more day / one more roll / one more floor"-hook

---

# 29. Open Design Questions

## Question 1

Skal Dungeon Run koste 2 actions + rations, eller en hel dag?

Anbefaling: Start med 2 actions + rations.

## Question 2

Skal exhaustion være hård (utilgængelig resten af dagen) eller blød (-1 penalty ved genbrug)?

Anbefaling: Start hårdt — det er det klareste valg-pres. Blødgør kun hvis playtests viser frustration.

## Question 3

Skal dice have durability?

Anbefaling: Kun combat/risk dice, og først i Milestone 2. Durability + exhaustion på alle dice samtidig er for meget friktion tidligt.

## Question 4

Skal rations være hard requirement for dungeon runs eller en buff?

Anbefaling: Hard requirement (adgangsbillet) — det giver Provisioning en klar rolle. Men lav prisen lav i starten.

## Question 5

Skal der være seasons?

Anbefaling: Ikke i MVP. Tilføj efter core loop virker — og aldrig som upkeep.

## Question 6

Skal der være permanent død/failure?

Anbefaling: Nej. Kun setbacks.

## Question 7

Skal combat være optional?

Anbefaling: Soft mandatory. Man kan ignorere det i et stykke tid, men midgame-progression kræver dungeon-materialer, og skalerende passiv Threat gør Patrol attraktiv for alle.

---

# 30. MVP Success Criteria

Prototypen lykkes, hvis spillere føler:

* "Jeg vil have én dag mere."
* "Jeg vil opgradere denne die."
* "Jeg fortryder nogle gange, hvilken die jeg brugte først." *(beviset på at exhaustion virker)*
* "Risky dice er fristende — og jeg ved præcis, hvad de koster."
* "Threat gør mig nervøs, men aldrig overrasket."
* "Min settlement bliver mere magtfuld — og verden lægger mærke til det."
* "Automation føles som en belønning for at mestre de tidlige systemer."

Hvis prototypen ikke skaber de følelser, simplificér systemerne indtil core loopet virker.

---

# 31. One-Sentence Pitch

**Dicehaven er et turbaseret dice engine-builder settlement-spil, hvor hver skill er en udviklende dice pool, hver dag er et lille strategisk puslespil af begrænsede actions og trætte terninger — og hvor enhver risky genvej, og selve din settlements vækst, trækker faren tættere på, medmindre dine craftede combat dice kan holde mørket tilbage.**
