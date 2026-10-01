# ROADMAP

Plán rozšírenia stránky. **Pred prácou si prečítaj [AGENTS.md](AGENTS.md)**: obsahuje postup (vetva → PR → preview → merge), pravidlá pre dáta a limity Vercel free plánu. Tento dokument hovorí, *čo* robiť. AGENTS.md hovorí, *ako*.

Posledná aktualizácia: 2026-10-01 (stav: v1 nasadená, R1 implementovaná v PR #4; merge čaká na vlastníka, PR-only `main`).

## Ako roadmap používať

1. Vyber položku so stavom `TODO` podľa priority (P1 → P3), alebo tú, ktorú zadal vlastník. Drž sa jednej položky na PR.
2. Položku rozpracuj presne podľa jej **Kritérií hotovosti**. Čo nie je v kritériách, nerob (alebo navrhni ako novú položku).
3. V tom istom PR zmeň stav položky (`TODO` → `IN PROGRESS` → `DONE`) a doplň poznámky (odkazy na PR, rozhodnutia, čo sa nepodarilo).
4. Ak narazíš na blokujúcu otázku (platená funkcia, nejasný zdroj dát, zmena nastavení Vercelu/GitHubu), **zastav a spýtaj sa vlastníka**. Nevymýšľaj.
5. Nové nápady pridávaj na koniec do sekcie *Nápady (nezaradené)*, nie priamo do implementácie.

Stavy: `TODO` · `IN PROGRESS` · `DONE` · `BLOCKED` (s dôvodom).

## Princípy (platia pre každú položku)

- **Statická stránka.** Dáta sa stiahnu skriptom, uložia do repa a Vercel ich len servíruje. Za behu sa nevolajú žiadne API. Nulové náklady a žiadne limity Hobby plánu sa nepribližujú.
- **Dáta len z overeného zdroja** (Eurostat/ŠÚ SR). Nič nevymýšľať ani odhadovať. Texty počítať z dát.
- **Dizajn drží jednotný jazyk** (tmavá téma, dlaždice, farby z AGENTS.md sekcia 8). Mobil 375 px musí fungovať.
- **Nič platené.** Žiadne Vercel úložiská, AI Gateway, Pro funkcie. Plánované úlohy cez GitHub Actions.
- Každá zmena prejde `CI=true npm run build` a testami pred pushom.

## Prehľad

| ID | Položka | Priorita | Stav |
|---|---|---|---|
| R1 | Porovnanie krajín | P1 | DONE |
| R2 | Automatická aktualizácia dát (GitHub Action) | P1 | TODO |
| R3 | Narodení podľa veku matky | P2 | TODO |
| R4 | Populačná pyramída po rokoch | P2 | TODO |
| R5 | Projekcie Eurostatu | P2 | TODO |
| R6 | Regióny Slovenska (NUTS2) | P3 | TODO |
| R7 | Simulátor „čo ak" | P3 | TODO |
| R8 | Technické vylepšenia (OG obrázok, analytika, kontroly) | P2 | TODO |

Odporúčané poradie: **R1 → R2 → R3/R4 → ostatné**. R1 a R2 dávajú najviac za najmenej práce a R2 zároveň testuje celú pipeline s robotom.

---

## R1: Porovnanie krajín (P1)

**Stav: DONE — implementácia v [PR #4](https://github.com/aranej/demografia-react/pull/4), produkčný merge čaká na pokyn vlastníka.**

Overené 2026-10-01: všetkých 15 zdrojových radov; 4 testy importéra a 8 aplikačných/dátových testov; `CI=true` build; Vercel preview `READY`; desktop a mobil 375 px, prepínače, tabuľka, konzola bez chýb. Poradie používa spoločný rok vybraných krajín. Snapshot krajín má približne 3,9 kB gzip; opakovaný import je identický.

**Cieľ:** Ukázať, či je slovenský vývoj výnimočný. Porovnať SK s CZ, PL, HU a priemerom EÚ.

**Dáta:** `demo_find` (`TOTFERRT`, `AGEMOTH`) a `demo_gind` (`GBIRTHRT`) s `geo` = `SK`, `CZ`, `PL`, `HU`, `EU27_2020`. Overené (2026-09-30), že `demo_find` vracia TFR za 2023 pre `CZ`, `PL`, `HU` (1,55) aj `EU27_2020` (1,38). Dostupnosť rokov sa môže líšiť od SK, over ju pre každú krajinu a ukazovateľ.

**Kritériá hotovosti:**
- Skript v `scripts/` (Node, bez závislostí mimo štandardnej knižnice) stiahne rady pre všetky krajiny a zapíše ich do `src/data/` (napr. `countries.ts`). Skript a jeho použitie je popísaný v `AGENTS.md` alebo v hlavičke skriptu.
- Nová sekcia na stránke: graf s viacerými čiarami (farba na krajinu), prepínač ukazovateľa (TFR / hrubá miera / vek matky) a možnosť zapnúť/vypnúť krajiny. Slovensko je vizuálne zvýraznené.
- Text pod grafom je počítaný z dát (napr. poradie krajín v poslednom roku, rok, v ktorom TFR klesol pod 2,1 pre každú krajinu).
- Chýbajúce roky (`null`) sa zobrazia ako medzera, nie ako nula.
- Zdroj a dátum stiahnutia v pätičke sú aktualizované. Test sleduje, že rady sú súvislé a bez duplicít.

**Hobby:** len statické súbory, zanedbateľné.

## R2: Automatická aktualizácia dát (P1)

**Cieľ:** Raz za čas sa dáta sami obnovia. Robot stiahne Eurostat, a ak sa niečo zmenilo, otvorí PR. Ten prejde preview a vlastník ho zmerguje.

**Kritériá hotovosti:**
- `scripts/update-data.mjs` regeneruje `src/data/birthData.ts` zo zdrojov uvedených v AGENTS.md sekcia 4. Je **idempotentný** (bez zmeny dát nevznikne žiadny diff) a zapisuje desatinné čísla s bodkou (Node, nie PowerShell).
- `.github/workflows/update-data.yml`: spúšťa sa plánovane (napr. mesačne, pozri `schedule`) aj ručne (`workflow_dispatch`). Ak je diff, vytvorí vetvu `data/update-YYYY-MM` a otvorí PR s popisom, čo sa zmenilo (ktoré roky a hodnoty).
- Workflow používa iba `GITHUB_TOKEN` (žiadne nové tajomstvá). Na verejnom repe sú Actions zadarmo.
- **Akcia pre vlastníka (nerob sám):** v GitHub *Settings → Actions → General → Workflow permissions* treba povoliť „Read and write permissions" a „Allow GitHub Actions to create and approve pull requests". Uveď to v PR ako krok, ktorý musí vlastník urobiť.
- Over, že push z Actions spustí Vercel preview (Vercel build reaguje na push na vetvu). Ak nie, popíš obchádzku v poznámkach.
- Pätička s dátumom stiahnutia sa pri aktualizácii zmení automaticky (alebo je dátum uložený v dátovom súbore).

**Hobby:** nepoužívaj Vercel cron (na Hobby max raz za deň, ±59 min). GitHub Actions sú mimo Vercelu. Dodatočné Vercel builds sa započítajú do 100 nasadení za deň, čo pri mesačnom behu nie je problém.

## R3: Narodení podľa veku matky (P2)

**Cieľ:** Ukázať, ako sa posúva vek, v ktorom ženy rodia (rastúci priemerný vek matky má na grafe presnú „anatómiu").

**Dáta:** `demo_fasec` = živonarodení podľa veku matky (`unit=NR`, počty, nie miery), `geo=SK`, `sex=T` (obe pohlavia novorodenca; `M`, `F` sú tiež dostupné). Kontrola: `age=TOTAL`, `sex=T`, 2023 dáva 48 627, čo sa zhoduje s `LBIRTH` z `demo_gind`. **Dostupné len za roky 2007–2024** (overené 2026-09-30), teda kratší rad než zvyšok stránky. Dimenzia `age` obsahuje jednoročné veky (`Y15`…`Y49`) **aj** päťročné skupiny (`Y10-14`, `Y15-19`, …, `Y45-49`) a `Y_GE50`, `UNK` (neznámy vek). Skupiny sa prekrývajú s jednoročnými hodnotami, **nesčítaj ich dvakrát**. **Nevyberaj miery plodnosti**, pokiaľ nemáš overený počet žien podľa veku (`demo_pjan` existuje, napr. `sex=F&age=Y25`). Bez toho zobraz podiely alebo počty. Na stránke uveď, že rad je od 2007.

**Kritériá hotovosti:**
- Skript stiahne počty podľa päťročných skupín (alebo jednoduchú voľbu skupín, zdôvodni ju) a zapíše do `src/data/`.
- Vizualizácia (napr. skladaná plocha v percentách alebo heatmapa rok × vek matky) s tooltipom a legendou. Ukazuje posun vrcholu do vyššieho veku.
- Text počítaný z dát (napr. rozdiel podielu matiek 20–24 a 30–34 medzi 1990 a dnes).
- Mobil a prístupnosť (farby rozlíšiteľné, popisy).

## R4: Populačná pyramída po rokoch (P2)

**Cieľ:** Animovaná/posuvná pyramída veku a pohlavia Slovenska, vidno „Husákove deti" i dnešné zúženie báz.

**Dáta:** `demo_pjangroup` (populácia k 1. 1. podľa vekových skupín a pohlavia), dostupné **1960–2025** (overené 2026-09-30). `sex`: `T` (spolu), `M`, `F`. Dimenzia `age` obsahuje päťročné skupiny `Y_LT5`, `Y5-9`, … `Y75-79`, `Y80-84`, `Y_GE85` a zároveň **prekrývajúce sa súhrnné kategórie** `TOTAL`, `Y_GE75`, `Y_GE80` a `UNK` (neznámy vek). Pre pyramídu použi len disjunktné skupiny (`Y_LT5` … `Y80-84` a `Y_GE85`) a súčty si over proti `TOTAL`.

**Kritériá hotovosti:**
- Skript stiahne dáta po rokoch a skupinách, zapíše do `src/data/` (ak je objem veľký, zváž kompaktný formát a zmeraj veľkosť bundle).
- Komponent s posuvníkom roka a tlačidlom Prehrať/Pauza. Ľavá strana muži, pravá ženy, osi s rovnakým rozsahom naprieč rokmi, aby sa zmena dala porovnať.
- Dostupné z klávesnice (posuvník, tlačidlo). Mobil funguje.
- Celková veľkosť JS bundle nevzrastie o viac než rádovo desiatky kB gzip (over v build výpise).

## R5: Projekcie Eurostatu (P2)

**Cieľ:** Čo znamenajú dnešné trendy pre počet obyvateľov v budúcnosti. Zobraziť oficiálne projekcie Eurostatu, **nie vlastné odhady**.

**Dáta:** `proj_23np` = populácia k 1. 1. podľa veku, pohlavia a typu projekcie. Dimenzia `projection`: `BSL` (základný scenár), `LFRT`, `LMRT`, `HMIGR`, `LMIGR`, `NMIGR` (alternatívne scenáre). Pre celkovú populáciu `age=TOTAL`, `sex=T`, `geo=SK`. Rady pokrývajú **2022–2100** (overené 2026-09-30). Prvé roky projekcie sa prekrývajú so skutočnými údajmi, preto ich pri spájaní grafov vizuálne oddeľ a nezamieňaj za merania.

**Kritériá hotovosti:**
- Graf skutočnej populácie (z `demo_pjangroup` alebo `demo_gind`, `JAN`) nadväzujúci na projekcie, oddelené vizuálne (čiarkovaná čiara) s jasným označením „projekcia".
- Prepínač scenárov s krátkym vysvetlením každého (z metodiky Eurostatu, nie z hlavy). Uveď rok a verziu projekcie (`proj_23np` = projekcie z roku 2023).
- V texte jasne uveď, že ide o projekcie, nie predpovede, a že závisia od predpokladov.

## R6: Regióny Slovenska (P3)

**Cieľ:** Regionálne rozdiely v plodnosti.

**Dáta:** `demo_r_find2` = ukazovatele plodnosti podľa regiónov NUTS2 (`indic_de=TOTFERRT`, `unit=NR`, od 1990). Regióny: `SK01` Bratislavský kraj, `SK02` Západné Slovensko, `SK03` Stredné Slovensko, `SK04` Východné Slovensko. Pozor: tabuľka `demo_r_frate3` (NUTS3) v Eurostate **neexistuje**. Pre kraje na úrovni 8 krajov by bolo treba iný zdroj (napr. ŠÚ SR DATAcube), a to je samostatné rozhodnutie vlastníka.

**Kritériá hotovosti:**
- Dáta pre štyri regióny NUTS2 v `src/data/`.
- Čiarový graf štyroch regiónov a voliteľne jednoduchá mapa. Ak použiješ hranice (GISCO GeoJSON), uveď licenciu/atribúciu a zmenši súbor (zjednodušená geometria).
- Text z dát (napr. rozdiel medzi najvyššou a najnižšou hodnotou v poslednom roku).

## R7: Simulátor „čo ak" (P3)

**Cieľ:** Interaktívna hračka. Posuvník TFR ukáže, ako by sa menil počet narodených/populácia pri rôznych predpokladoch.

**Pozor:** toto je **jediná položka s vlastným modelom**, preto musí byť jasne označená ako ilustračná hračka, nie predpoveď, a musí mať popísané predpoklady (aj obmedzenia: zjednodušená kohortová logika, bez migrácie, ak tak rozhodneš). Nepreváňaj ju s R5 (oficiálne projekcie).

**Kritériá hotovosti:**
- Celý výpočet beží v prehliadači (žiadny backend). Čistá funkcia s unit testami (vstup: TFR, počet žien v plodnom veku, výstup: počet narodených na roky dopredu).
- Viditeľný popis predpokladov a varovanie „ilustračné".
- Vlastník schváli návrh modelu pred implementáciou (zastav a spýtaj sa).

## R8: Technické vylepšenia (P2)

Malé samostatné úlohy. Každú možno spraviť ako vlastný PR.

- [ ] **Social preview (OG obrázok) a meta tagy** (`og:title`, `og:description`, `og:image`, `twitter:card`), aby mal odkaz pri zdieľaní pekný náhľad. Obrázok statický (vygenerovaný raz, uložený v `public/`).
- [ ] **Vercel Web Analytics / Speed Insights** (Hobby: 50 000 udalostí/mesiac, 10 000 Speed Insights). **Najprv sa spýtaj vlastníka**, je to zmena nastavení projektu a súkromia návštevníkov (texty v pätičke).
- [ ] **Kontroly v PR cez GitHub Actions:** build + testy na každý PR (CI), voliteľne Lighthouse CI. Potom môže vlastník zapnúť tieto kontroly ako povinné v rulesete (to urobí vlastník).
- [ ] **Anglická verzia / prepínač SK/EN** (texty do jedného slovníka, formátovanie čísel podľa jazyka).
- [ ] **Svetlá téma** (CSS premenné v `index.css` sú na to pripravené, pridaj prepínač a `prefers-color-scheme`).
- [ ] **Migrácia z Create React App na Vite** (CRA je nepodporovaný). Samostatný PR, bez zmien v obsahu, po schválení vlastníka. Over, že build na Verceli funguje (zmení sa príkaz buildu a výstupný adresár, čo vyžaduje zmenu nastavení projektu alebo `vercel.json`, takže sa spýtaj).

---

## Nápady (nezaradené)

Sem pridávaj nápady, ktoré ešte nie sú rozpracované. Pridaj jednu vetu o dátach (zdroj) a o tom, či sa zmestí do Hobby plánu.

- Hrubá miera plodnosti vs. miera sobášnosti / podiel narodených mimo manželstva (`NMARPCT` je v `demo_find`).
- Poradie detí pri pôrode (`LBIRTHR1PC`…, tiež v `demo_find`): podiel prvorodených.
- Porovnanie s celým EÚ v jednom „rebríčku" (rok, rozdelenie krajín podľa TFR).

## Čo sa zámerne nerobí

- Žiadny backend, databáza ani prihlasovanie.
- Žiadne platené služby a funkcie Vercelu (pozri AGENTS.md sekcia 6).
- Žiadne vlastné „odhady" dát. Len zdroje a z nich vypočítané hodnoty.
- Komerčné použitie (Hobby plán je nekomerčný).
