# Game Design Document v0.3

## Working title: **Dicehaven**

---

# Changelog v0.2 → v0.3 (pivotet)

Dette er en omskrivning, ikke en patch. v0.2's rygrad — dage, actions, shifts, exhaustion — er fjernet efter playtest af Step 1-2-prototypen. Spillet er nu et **ægte incremental**.

1. **Ny kerne: Incredicer × Melvor Idle.** Én aktiv skill ad gangen. Dens terninger ruller automatisk på en timer, indtil spilleren skifter skill.
2. **Dag/action/shift/exhaustion-strukturen er fjernet.** Spillet kører i realtid.
3. **Exhaustions job overtages af progression:** Spilleren starter med bevidst dårlige terninger og opgraderer sig ud af dem. Fremdriften ER valget.
4. **Threat er fjernet helt** (parkeret — se Appendix A). Ingen fare-systemer i denne version.
5. **Offline progression er parkeret** — men motoren bygges klar til det fra dag ét (`simulateTicks`).
6. **Upgrades er spillets hjerte:** roll speed, antal terninger (slots), face upgrades, nye terninger, multipliers.
7. **Crafting erstatter dagens puslespil:** Slibninger (face upgrades) koster skillens egen ressource, men alt stort — nye terninger, slots, roll speed-gear — craftes af materialer fra FLERE skills. Dét er incitamentet til at skifte aktiv skill.
8. **Skill XP kommer kun af at udføre skillen** — levels gør skillen stærkere via unlocks og konkrete milepæls-belønninger.
9. **Mobil-first UI er et MVP-krav:** foldbar skill-sidemenu, dice tray med auto-rul, flyvende ressourcer op til counterne i toppen, XP-bar pr. skill.
10. Reviewets 9 overlevende fund fra v0.2-prototypen er indarbejdet som krav (Appendix B).
11. **Alt spiller-vendt sprog er engelsk** — terningnavne, UI-copy, alt. GDD'en er fortsat på dansk som arbejdsdokument.

**Overlever fra v0.2:** Dice-as-engines (konkrete face-upgrades), skill-specifikke dice pools, producer/support/risk-terninger, effekt-rækkefølgen i motoren, ressourcekæden, UI'ets visuelle sprog.

---

# 1. High Concept

**Dicehaven** er et dice-baseret incremental game: en blanding af **Incredicer** og **Melvor Idle**.

Spilleren vælger én aktiv skill. Skillens terninger ruller automatisk, igen og igen, og producerer ressourcer og XP. Ressourcerne bruges på konkrete upgrades: slib en terningside fra 0 til 1, køb en ekstra terning, rul hurtigere, lås en bedre terning op. Spilleren skifter aktiv skill, når en upgrade kræver ressourcer fra en anden skill.

Kernefølelsen:

> "Mine terninger arbejder for mig. Hver upgrade kan ses direkte på terningen. Jeg skifter skill, fordi jeg *mangler* noget — ikke fordi spillet tvinger mig."

Spillet har i denne version ingen fare, ingen straf og ingen deadline. Kun vækst.

---

# 2. Core Fantasy

Spilleren leder stadig en settlement i en fantasy-verden, og alle aktiviteter udføres af work crews repræsenteret som terninger. Men fantasien er nu incremental-fantasien:

> "Jeg startede med én sløv økse, der ramte ved siden af halvdelen af tiden. Nu har jeg fire mesterterninger, der ruller hvert sekund. Og jeg kan huske hver eneste opgradering på vejen."

**Dice ER crewene.** En dårlig terning er et utrænet sjak. Face-upgrades er træning og bedre værktøj. Nye terninger er nye folk.

---

# 3. Design Pillars

## 3.1 Incremental first — for alvor denne gang

v0.2 sagde "incremental first" men byggede et turbaseret spil. v0.3 mener det:

* Spillet producerer *hele tiden*, mens den aktive skill kører.
* Tal vokser. Først langsomt, så mærkbart, så vildt.
* Der er ALTID en næste upgrade inden for synsvidde.
* Spilleren skal kunne lade spillet køre og kigge på det hvert halve minut — eller stirre fascineret på hvert rul. Begge dele skal fungere.

## 3.2 Dice as engines, not just randomness

Uændret fra v0.2 — og endnu vigtigere nu, hvor terningerne ruller tusindvis af gange:

* En dårlig side bliver erstattet. **Spilleren kan SE det på terningen.**
* En 1'er bliver til en 2'er.
* En d6 bliver til en d8 (to nye sider at opgradere!).
* En support-terning begynder at booste de andre.

Undgå abstrakte "+5% output"-upgrades så længe som muligt. Konkrete sider slår procenter.

## 3.3 One active skill — valget er opportunity cost

Melvor-modellen: kun én skill producerer ad gangen. Skift er gratis og øjeblikkeligt.

Det strategiske valg er *hvad du IKKE træner lige nu*. Cross-skill-omkostninger (3.4) gør valget aktivt: du står i Skovhugst og mangler sten til din næste økse-upgrade — så du skifter. Ikke fordi en regel siger det, men fordi din egen plan gør.

## 3.4 Crafting driver rytmen

Skill XP kommer KUN af at udføre skillen — at hugge træ gør dig til en bedre skovhugger, og levels gør skillen stærkere (unlocks + konkrete milepæls-belønninger). Ingen genveje.

Incitamentet til at skifte skill er **crafting**: alt stort i spillet — nye terninger, ekstra slots, roll speed-gear — craftes af materialer fra flere skills:

* Woodcutter's Axe kræver træ **+ sten** (øksehovedet).
* Copper Vein-terningen kræver sten **+ træ** (skaftet).
* Senere opskrifter væver alle skills ind i samme net.

Reglen: **slibninger (face upgrades) koster kun skillens egen ressource — det hurtige, selvkørende loop. Craft-opskrifter kræver altid mindst én anden skills materiale — det er dem, der sender dig videre.** Det skaber Melvor-rytmen: træn A, til opskriften mangler B, skift, gentag.

## 3.5 Ingen straf, ingen fare

Threat, raids, durability, wounds — alt er ude. Spilleren kan ikke træffe et forkert valg, kun et langsommere. Fare-systemer kan vende tilbage senere (Appendix A), men kun hvis kernen beviser sig uden dem.

---

# 4. Core Loop

## Moment-to-moment (sekunder)

**Aktiv skill ruller automatisk → ressourcer + XP tikker ind → progress-bar mod næste rul fyldes igen**

Spilleren gør ingenting — og det er pointen. Rullene skal være tilfredsstillende at *se på*: terningerne lander, tallene flyver op i ressource-chippen.

## Choice loop (halve/hele minutter)

**Se næste upgrade → har jeg råd? → køb (og SE terningen ændre sig) → eller skift aktiv skill for at farme flaskehals-ressourcen**

## Session loop (10-30 min)

**Ny terning låst op → nyt slot købt → roll speed op → skill level runder et gate-niveau → næste tier af upgrades åbner**

## Long-term loop (senere versioner)

**Alle skills modne → automation → offline → prestige** (parkeret, Appendix A)

---

# 5. Terminology

## Aktiv skill
Den ene skill, der producerer lige nu. Alle andre skills er passive (producerer intet — indtil senere automation).

## Rul
Ét automatisk rul af skillens samlede terninger. Sker hvert `rollInterval` sekunder.

## Roll interval / roll speed
Tiden mellem rul for en skill. Upgrades sænker den. Vises som progress-bar.

## Slot
En plads til en terning i en skill. Antal slots er en upgrade ("antal terninger").

## Face
En side på en terning. Face-upgrades er spillets primære progression.

## Producer / Support / Risk
Som v0.2: producers giver ressourcer; supports forbedrer de andre terninger i rullet (boost, 0-redning, fordobling); risk-terninger er høj-varians eller har driftsomkostninger (post-MVP).

---

# 6. Core Dice System

## 6.1 Auto-roll

Den aktive skills terninger (alle fyldte slots) ruller samlet hvert `rollInterval` sekund. Hvert rul resolves som ét samlet "shift" med motorens eksisterende effekt-rækkefølge:

1. **0-redning** (reroll): omruller KUN en producer, der rullede 0 — aldrig et godt rul *(krav fra review, Appendix B.4)*
2. **Fordobling** (doubleBest): fordobler rullets bedste producer
3. **Boost**: +N til alle andre terninger, der producerede noget

Determinisme bevares: seeded RNG, samme seed + samme handlinger = samme spil.

## 6.2 Startterninger er bevidst dårlige

Dette er svaret på "hvad erstatter exhaustions job": **afstanden mellem den terning, du har, og den terning, du kan se.**

Startterningen i hver skill rammer ved siden af halvdelen af tiden. Den første upgrade koster næsten ingenting og fjerner en 0'er. Spilleren mærker forbedringen i løbet af de første 60 sekunder — og er hooked på kurven.

## 6.3 Upgrade-akserne

| Akse | Effekt | Følelse |
| ---- | ------ | ------- |
| **Face upgrade** | Én side på én terning forbedres (0→1, 1→2, …) | Kernen. Konkret, synlig, billig i starten |
| **Nyt slot** | +1 terning ruller med | Stort hop i output |
| **Ny terning** | Bedre terning i et slot (den gamle beholdes/sælges) | Tier-progression |
| **Roll speed** | Kortere interval | Hele skillen accelererer |
| **Die size** (senere) | d6 → d8: to NYE sider at opgradere | Milestone — føles enorm |
| **Multipliers** (senere) | ×2 på en ressource m.m. | Late-game scaling, holdes væk fra early game |

## 6.4 Face upgrade-regler

* En upgrade targeter én specifik side på én specifik terning: "Slib: 0 → 1 træ".
* Prisen stiger med sidens nye værdi (fx ×3 pr. trin) — at gøre en god terning perfekt er dyrt, at redde en dårlig er billigt.
* En side kan maksimalt nå terningens tier-cap (startterning: cap 2; tier 2: cap 4; …), så nye terninger forbliver attraktive.

---

# 7. Skills

MVP: **Skovhugst** og **Minedrift**. Begge live fra start (cross-costs kræver det).

## 7.1 Skovhugst

* Producerer: træ
* Identitet: den stabile motor — lav varians, jævn kurve
* Craft-materialer udefra: sten (øksehoveder, slibehjul)

### Terninger (MVP — alle navne og al copy på engelsk, krav B.7)

**Dull Axe** *(start, gratis, slot 1)*
Sider: 0 / 0 / 0 / 1 / 1 / 1 wood — avg 0.5
*"It has seen better days. So has the crew."*

**Woodcutter's Axe** *(kræver Woodcutting 5)*
Sider: 1 / 1 / 1 / 2 / 2 / 2 wood — avg 1.5
*"Now we're talking."*

**Foreman** *(support, kræver Woodcutting 10)*
Sider: boost +1 / boost +1 / 0-redning / 1 wood / 2 wood / blank
*"Keeps the rest of the crew swinging."*

## 7.2 Minedrift

* Producerer: sten, senere kobber
* Identitet: mere varians, tier-2-ressourcen bor her
* Craft-materialer udefra: træ (skafter, afstivning)

### Terninger (MVP)

**Rusty Pickaxe** *(start, gratis, slot 1)*
Sider: 0 / 0 / 0 / 1 / 1 / 1 stone — avg 0.5
*"Rust is just ambitious patina."*

**Stone Pickaxe** *(kræver Mining 5)*
Sider: 1 / 1 / 1 / 2 / 2 / 2 stone — avg 1.5
*"Solid. Dependable. Stone."*

**Copper Vein** *(kræver Mining 10)*
Sider: 0 / 1 stone / 1 stone / 1 copper / 1 copper / 1 copper + 1 stone
*"It glints in the dark — sometimes."*

## 7.3 Senere skills (post-MVP, i rækkefølge)

1. **Farming** — mad/urter; langsom men passiv-venlig; første kandidat til "kør i baggrunden"-automation
2. **Smedning/Crafting** — konverterer råvarer til terninger og upgrade-materialer; giver kobber et rigtigt sink
3. **Research** — knowledge; låser multipliers, automation og die size-upgrades op
4. **Combat** — genindføres KUN sammen med et fare-system (Appendix A)

Hver ny skill skal tilføje en ny *mekanik*, ikke bare en ny ressource (v0.2 §24 Risk 2 gælder stadig).

---

# 8. Resources

MVP: **Træ**, **Sten**, **Kobber**.

* Træ og sten er tvillinge-valutaer, der køber hinandens skills' upgrades (3.4).
* Kobber er tier 2: sjældnere, dyrere upgrades (nye terninger, roll speed i den høje ende, senere Smedning).
* **Krav B.6:** Motorens effekt-targeting (fordobling/boost/0-redning) skal vægte ressourcer efter værdi — kobber vægter fx 3× sten — så support-effekter aldrig systematisk nedprioriterer den knappe ressource.

Ingen ressource er en skat (uændret princip fra v0.2): intet upkeep, ingen afgifter. Alt forbrug er upgrades, spilleren vælger.

---

# 9. Upgrades — spillets hjerte

## 9.1 MVP-upgradetræ, Skovhugst (illustrativt, tunes i playtest)

| # | Type | Upgrade | Pris | Kræver |
| - | ---- | ------- | ---- | ------ |
| 1 | Slib | Dull Axe: 0 → 1 | 5 træ | — |
| 2 | Slib | Dull Axe: 0 → 1 | 15 træ | — |
| 3 | Slib | Dull Axe: 0 → 1 | 30 træ | — |
| 4 | Craft | Slot 2 (+ Dull Axe #2) | 50 træ + 10 sten | Woodcutting 3 |
| 5 | Craft | Grindstone (roll speed 3,0 → 2,7s) | 40 træ + 15 sten | Woodcutting 4 |
| 6 | Slib | 1 → 2 (pr. side) | 60/90/120 træ | — |
| 7 | Craft | Woodcutter's Axe (ny terning) | 150 træ + 40 sten | Woodcutting 5 |
| 8 | Craft | Slot 3 | 300 træ + 80 sten + 5 kobber | Woodcutting 8 |
| 9 | Craft | Foreman (support) | 400 træ + 20 kobber | Woodcutting 10 |

Minedrift spejler strukturen med træ som craft-materiale udefra. Bemærk rytmen: **slibninger (1-3, 6) er ren egen ressource** — det øjeblikkelige loop — mens **opskrifterne (4, 5, 7, 8, 9) kræver den anden skills materialer** og tvinger det første frivillige skill-skift omkring 2-3-minutters-mærket.

## 9.2 Prisprincipper

* **Første upgrade inden for 30-60 sekunder.** Altid.
* Priser vokser geometrisk (~×2-3 pr. trin i samme akse), så hver akse har aftagende udbytte og spilleren roterer mellem akserne.
* Roll speed har et gulv (MVP: 1,8s) — hastighed må aldrig gøre rullene ulæselige. Senere tiers kan tilføje multi-rul i stedet for kortere interval.
* Vis ALTID de næste 2-3 upgrades, også de uopnåelige — de er gulerødder.

## 9.3 Skill XP og levels

* **XP kommer KUN fra at udføre skillen.** XP pr. rul = 1 + samlet ressourceudbytte i rullet (support-effekter tæller med). Intet andet giver skill-XP.
* Levels gør skillen stærkere ad to veje: de **gater** terninger og opskrifter (tabellen ovenfor), og milepæls-levels giver **konkrete belønninger** — fx level 3: en gratis slibning; level 5: Woodcutter's Axe-opskriften; level 8: +1 slot-cap. Konkret frem for procenter, som altid.
* Level-kravene: `XP til level n = 25 · n²` kumulativt (tunes).
* Level-ups skal fejres synligt (flash, lyd senere) — de er spillets trommeslag.

---

# 10. UI/UX

## 10.1 Mobil-first layout (MVP-krav)

UI'et designes til én smal kolonne først; desktop er den brede udgave af samme layout — aldrig omvendt.

```
┌──────────────────────────────┐
│ ☰   🌲 124   🪨 38   🥉 2    │  ← topbar: menu + ressource-countere
├──────────────────────────────┤
│ Skovhugst · Level 4          │
│ ████████████░░░░░  XP        │  ← XP-bar for den valgte skill
├──────────────────────────────┤
│                              │
│   ┌────┐  ┌────┐  ┌────┐     │
│   │ 🎲 │  │ 🎲 │  │ 🎲 │     │  ← dice tray: auto-rullende terninger
│   └────┘  └────┘  └────┘     │
│   ▓▓▓▓▓▓▓▓░░░░ næste rul     │
│                              │
├──────────────────────────────┤
│ SLIBNINGER                   │
│ [Slib: 0→1 · 15 træ]  KØB    │  ← upgrade/craft-panel (scroller)
│ OPSKRIFTER                   │
│ [Slot 2 · 50🌲 + 10🪨] mangler│
└──────────────────────────────┘
```

* **Topbar (altid synlig):** ressource-counterne er *målet* for de flyvende ressourcer (10.2) og pulserer, når værdien tikker op. Menu-knappen (☰) åbner sidemenuen.
* **Skill-sidemenu (foldbar):** glider ind over indholdet ved tryk på ☰; lukker ved skill-valg, tryk udenfor eller swipe. Hver skill vises med ikon, navn, level og aktiv-markering. På brede skærme kan menuen stå fast fremme.
* **Dice tray:** den valgte skills terninger ligger i en bakke og auto-ruller på skillens interval — landing, lille hop, tal-pop. Progress-bar mod næste rul under bakken.
* **XP-bar:** den valgte skills level + XP-progression, lige over trayen. Skifter man skill, følger baren med.
* **Upgrade/craft-panel:** under trayen — slibninger øverst (hurtige køb i egen ressource), opskrifter under med materialeliste, hvor det, der mangler, er fremhævet. Køb med ét tryk; terningen i trayen opdateres synligt.

## 10.2 Flyvende ressourcer (MVP-krav)

Hvert rul sender små ressource-ikoner flyvende fra terningerne op til topbarens countere, som tikker op ved ankomst. Det er spillets vigtigste feedback-loop — produktionen skal kunne *ses*, ikke bare aflæses. Ved høj roll speed klumpes partiklerne ("+7 🌲" som ét ikon), så skærmen aldrig sander til. Skal kunne slås fra (reduceret animation).

## 10.3 Terning-inspektion (krav B.3)

Tap/klik på enhver terning åbner et inspektionskort: alle 6 sider VIST med tekst (ikke kun glyffer), Ø-udbytte, tags, næste mulige face-upgrade. Skal virke på touch — ingen `title`-tooltips som eneste forklaring.

## 10.4 Copy-regler (krav B.7, B.8)

* **Alt spiller-vendt sprog er engelsk** — terningnavne, UI, effekt-tekster. Konsistent, aldrig blandet.
* Boost-tekst: "+1 to **all other** dice that produced something" — utvetydig kvantor.
* 0-redning: "Rerolls one die that rolled 0" + vis før/efter ved omrul ("0 → 2 Wood").
* Gennemsnit skrives "avg 1.5 per roll".

## 10.5 Tilgængelighed og læsbarhed (krav B.2, B.9)

* Minimum 4,5:1 kontrast på al læsbar tekst (ret `--color-ink-faint` eller reserver den til dekoration).
* Modaler/paneler med dialog-semantik og tastaturbetjening.
* Tal-formatering: 1.234 → 12,3K → 4,56M når tallene vokser.

---

# 11. Balancing Principles

1. **Tid-til-næste-upgrade er spillets puls.** Første time: aldrig over ~2 minutter mellem køb. Grafen over "sekunder mellem upgrades" skal stige blødt, ikke i hak.
2. **Opskrifter styrer skift-rytmen.** Playtest-mål: spilleren skifter aktiv skill hvert 2.-5. minut i den første time, fordi en opskrift mangler materialer — af egen fri vilje.
3. **Face upgrades > procenter.** Multipliers introduceres først, når face-akserne er mættet (post-MVP).
4. **Ingen døde valg.** Uden threat findes der ingen forkerte køb — kun rækkefølge. Alle upgrades skal forblive relevante (en tidlig terning kan sælges/genbruges senere).
5. **Simulér, ikke gæt.** Motoren er ren TS med seeded RNG: byg en balance-sim (Vitest), der spiller første time med greedy-strategi og udskriver upgrade-tidslinjen. Tun mod målene i punkt 1-2.

---

# 12. MVP Scope

## 12.1 Prototypen skal teste ét spørgsmål

> Er det tilfredsstillende at se sine terninger rulle af sig selv, købe en konkret upgrade hvert minut — og skifte skill, fordi ens egen plan kræver det?

## 12.2 I MVP

* Tick-motor: aktiv skill, auto-roll med interval, progress-bar
* 2 skills (Skovhugst, Minedrift), 3 ressourcer (træ, sten, kobber)
* 6 terninger (3 pr. skill), slibninger (face upgrades i egen ressource) + craft-opskrifter (slots, nye terninger, roll speed-gear i blandede materialer)
* Skill XP + levels med gates og milepæls-belønninger (9.3)
* **Mobil-first UI: foldbar skill-sidemenu, dice tray, flyvende ressourcer, XP-bar pr. skill (10.1-10.2)**
* Terning-inspektion (10.3)
* Save i localStorage **med version, migrate og validering + ErrorBoundary** (krav B.1)
* Balance-sim i testsuiten (11.5)

## 12.3 IKKE i MVP (parkeret, se Appendix A)

* Threat og alle fare-systemer
* Combat, dungeon
* Offline progression (men motoren bygges klar: `tick(state, elapsedMs)` er ét rent kald)
* Automation af inaktive skills
* Farming, Crafting, Research
* Prestige, buildings, seasons
* Multipliers og die size-upgrades (design er klart, men de skal ikke forstyrre MVP-kurven)

## 12.4 MVP-startstate

* Aktiv skill: Skovhugst
* Skovhugst: level 1, 1 slot, Dull Axe, interval 3,0s
* Minedrift: level 1, 1 slot, Rusty Pickaxe, interval 3,0s
* Ressourcer: 0 / 0 / 0

---

# 13. First 10 Minutes (målbillede)

**0:00** — Spillet starter i Skovhugst. Dull Axe ruller hvert 3. sekund: 0… 1… 0… Spilleren ser upgrade-panelet: "Slib: 0 → 1 træ — 5 træ".

**0:45** — Første køb. Terningen VISER nu [0,0,1,1,1,1]. Output mærkbart bedre. Næste upgrade synlig: 15 træ.

**2:30** — Tredje slib købt. Første opskrift lyser op: "Craft: Slot 2 — 50 træ + **10 sten**". Spilleren har 0 sten. Sidemenuen foldes ud, tryk på Minedrift. Rusty Pickaxe er lige så elendig, som Dull Axe var — og dér er slibe-upgraden til 5 sten…

**5:00** — Spilleren har nu to skills i gang, sten nok til Slot 2, og skifter tilbage. To terninger ruller sammen for første gang. Outputtet hopper.

**8:00** — Skovhugst level 5 runder: **Woodcutter's Axe låst op.** Første "nye terning"-køb. Spilleren ser den gamle og den nye side om side.

**10:00** — Roll speed-upgraden er inden for rækkevidde, Minedrift nærmer sig level 5, og Copper Vein lurer ved level 10. Tre gulerødder synlige. *Det er hooket.*

---

# 14. Teknisk retning (refaktorering, ikke omskrivning)

## 14.1 Overlever urørt

`rng.ts` · `resolveFaces` + tests (med B.4/B.6-justeringer) · content-as-data-mønstret · Face/DieDef-typerne · tema, FaceChip/terningkort-visualet · Zustand + persist-mønstret

## 14.2 Ændres

* `GameState`: day/actions/exhausted ud; ind: `activeSkill`, pr. skill `{ level, xp, rollIntervalMs, slots, dice[], rollProgressMs }`, `purchasedUpgrades`, `lastSavedAt`
* `rollShift`/`endDay` → `tick(state, elapsedMs)`: akkumulerer tid, afvikler hele rul deterministisk (seeded RNG bevares), returnerer `{ state, events[] }`. Offline bliver senere bare ét stort `tick`-kald.
* UI: foldbar sidemenu + dice tray + flyvende ressourcer + upgrade/craft-panel (10.1-10.2). ShiftTray/RollOverlay/NightOverlay slettes.
* Save: bump til version 2 **med migrate** (v1-saves konverteres eller resettes eksplicit), validering af defIds ved load, ErrorBoundary med nulstil-fallback (B.1). Storage-event-lytter mod to-faner-datatab (B.5).

## 14.3 Ny build order

1. **Tick-motor + Skovhugst alene** — auto-roll, face upgrades, XP. *Test: er 10 minutter alene med én skill tilfredsstillende?*
2. **Minedrift + craft-opskrifter** — skift-rytmen. *Test: skifter spilleren frivilligt, når en opskrift mangler materialer?*
3. **Slots, roll speed, nye terninger** — alle akser live. *Test: føles akse-rotationen naturlig?*
4. **Level-gates + balance-sim** — tun første times kurve.
5. **Polish** — inspektion, tal-formatering, animations-toggle, save-migration.

---

# 15. MVP Success Criteria

Prototypen lykkes, hvis spillere føler:

* "Jeg lod den bare køre, mens jeg planlagde næste køb."
* "Hver upgrade kunne ses direkte på terningen."
* "Jeg skiftede til Minedrift, fordi min opskrift krævede sten — ikke fordi spillet sagde det."
* "Der var altid noget nyt lige om hjørnet."
* "Da Woodcutter's Axe låste op, følte jeg mig rig."

Og fejler, hvis:

* Rullene føles som støj, man ignorerer (→ animation/feedback-problem)
* Spilleren "parkerer" i én skill i 20+ minutter (→ opskrifterne er for svage som trækkraft)
* Upgrade-panelet føles som en indkøbsliste af procenter (→ for få face-upgrades)

---

# 16. Open Design Questions

1. **Skal rul være samlede eller pr. terning?** MVP: samlet rul (alle slots på samme timer) — ét visuelt beat. Alternativ (hver terning sin timer) genbesøges, hvis scenen føles statisk.
2. **Sælges gamle terninger, eller beholdes de?** MVP: beholdes i inventar uden funktion. Crafting (senere) kan genbruge dem.
3. **Hvornår er "ingen fare" et problem?** Hvis playtests viser, at valgene føles vægtløse i time 2+, er det signalet til at genbesøge Appendix A — ikke før.
4. **Skal XP komme af rul eller af ressourcer?** MVP: begge (9.3). Hvis support-terninger XP-mæssigt udkonkurrerer producers, skift til ren rul-XP.

---

# 17. One-Sentence Pitch

**Dicehaven er et dice-baseret incremental — Incredicer møder Melvor Idle — hvor din aktive skills terninger ruller af sig selv, hver upgrade kan ses direkte på terningens sider, og din egen jagt på den næste opgradering er det, der driver dig fra skill til skill.**

---

# Appendix A: Parkerede systemer (fra v0.2)

Disse er bevidst taget ud — ikke slettet. v0.2-dokumentet er stadig kilden til detaljerne, når/hvis de genindføres.

* **Threat & raids** (v0.2 §12): Fjernet helt. Genbesøges kun, hvis "ingen fare" viser sig at gøre valgene vægtløse (16.3). Skal i så fald genopfindes til realtid: threat pr. rul fra risk-terninger, combat som aktiv skill der betaler ned.
* **Combat & dungeon** (v0.2 §13-14): Kommer kun sammen med et fare-system. Push-your-luck-dungeon er stadig en stærk idé — som *aktiv* gameplay-ø oven på idle-basen (Melvor-parallellen: dungeon-runs).
* **Offline progression**: Skal på, på sigt. Motorkravet (`tick(state, elapsedMs)` som ét rent kald) er allerede et MVP-krav, så featuren er senere ren UI (velkomst-opsummering + evt. offline-cap).
* **Buildings** (v0.2 §11): Kan genindføres som synlige milestone-upgrades (settlementen vokser visuelt med progression) — kosmetik først, funktion senere.
* **Prestige** (v0.2 §23), **seasons** (v0.2 §22.4), **risk-terninger med driftsomkostninger** (Sprængladning: −1 træ pr. rul, høj sten): alle post-MVP.

# Appendix B: Krav fra prototype-reviewet (v0.2, 15 verificerede fund)

De 9 fund, der overlever pivotet, er nu krav:

1. **Save-robusthed (high):** persist med migrate + validering af defIds ved load; ErrorBoundary med nulstil-fallback. Rammer os garanteret ved GameState-ændringen.
2. **Kontrast (high):** ≥4,5:1 på al læsbar tekst; `--color-ink-faint` (2,7:1) må ikke bruges til tekst.
3. **Terning-inspektion på touch (high):** face-forklaringer må ikke kun bo i `title`-tooltips (→ 10.2).
4. **0-redning, ikke tvangs-omrul (medium):** reroll-effekten må kun ramme terninger, der rullede 0 (verificeret: den gamle version forværrede resultatet i 83,5% af tilfældene i et konkret shift).
5. **To-faner-datatab (low):** storage-event-lytter eller anden-fane-blokering.
6. **Ressource-vægtning i effekt-targeting (low):** kobber ≈ 3× sten i gainTotal/primaryResource, så support-effekter følger faktisk værdi.
7. **Dansk copy hele vejen (medium):** terningnavne på dansk, intet "Die"-suffiks, "gns." i stedet for "Ø".
8. **Boost-formulering (medium):** "alle andre" — aldrig "hver anden"; vis før/efter ved omrul.
9. **Dialog-semantik og tastatur (low):** modaler med role="dialog", fokus-håndtering, Escape.

De 6 øvrige fund (finishDay/Enter-dags-skip, Afslut dagen-bekræftelse, døde shift-tilstande, CTA under folden, GDD §26-poolafvigelse, rul-overlayets skip) bortfalder med dag/shift-strukturen.
