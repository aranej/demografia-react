# AGENTS.md: pokyny pre AI agentov

Tento súbor je určený pre AI agentov (Claude Code, Codex a pod.), ktorí v projekte začínajú bez kontextu. Prečítaj ho celý pred prvou zmenou. Čo sa má v projekte robiť, je v [ROADMAP.md](ROADMAP.md).

## 1. Čo je tento projekt

- Jednostránková vizualizácia **vývoja pôrodnosti na Slovensku 1960–2025** (narodení, plodnosť TFR, hrubá miera, vek matky, narodení vs. zomrelí).
- Produkcia: https://demografia-react.vercel.app (verejná, bez prihlásenia)
- Repo: https://github.com/aranej/demografia-react (verejné, vlastník `aranej`)
- Charakter: **hobby/experiment**, nekomerčný. Slúži aj ako cvičisko pre workflow „LLM agent → GitHub → automatické nasadenie".
- Jazyk používateľského rozhrania: **slovenčina**. Kód, commity a PR popisy: angličtina. Komunikácia s vlastníkom: v jazyku, v ktorom píše (zvyčajne slovensky).

## 2. Rýchly štart

Node 22, npm. Projekt je Create React App 5 (TypeScript), grafy Recharts, štýly Emotion.

```bash
npm ci                                   # čistá inštalácia
npm start                                # dev server, http://localhost:3000
CI=true npm run build                    # produkčný build; presne tak ako na Verceli
CI=true npm test -- --watchAll=false     # testy (jest, jsdom)
```

Vlastník používa **Windows 11 + PowerShell**. V PowerShelli sa premenná nastavuje takto: `$env:CI='true'; npm run build`. V bashi `CI=true npm run build`.

**Vždy pred pushom spusti build s `CI=true` a testy.** Pri `CI=true` sa ESLint varovania menia na chyby a práve tak buildí Vercel. Build, ktorý lokálne prejde bez `CI=true`, môže na Verceli zlyhať.

## 3. Štruktúra

```
src/
  App.tsx                  rozloženie stránky (hero, dlaždice, grafy, obdobia, pätička)
  index.css                CSS premenné témy (--bg, --surface, --accent, ...) a globálne štýly
  components/
    StatTile.tsx           dlaždica s jedným číslom
    MetricExplorer.tsx     graf s prepínačom ukazovateľov a obdobia
    NaturalChange.tsx      graf narodení vs. zomrelí
    Eras.tsx               karty s obdobiami (texty počítané z dát)
  data/
    birthData.ts           ročný rad 1960–2025 (GENEROVANÝ zo zdroja, pozri sekciu 4)
    derived.ts             odvodené hodnoty (vrchol, pokles, rok úbytku, ...) a formátovače
    annotations.ts         udalosti vyznačené v grafe
public/index.html          title, meta, font Inter
```

Konvencie: komponenty sú malé `styled` (Emotion) bloky, farby idú cez CSS premenné z `index.css`, čísla sa formátujú cez `nf` (celé) a `dec` (desatinné) z `data/derived.ts` (`sk-SK`). Medzera medzi číslom a `%` je nezlomiteľná (`&nbsp;`).

## 4. Dáta: pravidlá, ktoré sa nesmú porušiť

**Nikdy nevymýšľaj ani neodhaduj číselné údaje.** Pôvodná verzia projektu mala dáta vygenerované jazykovým modelom a boli zle (napr. vrchol pôrodnosti 1975 namiesto skutočného 1979). Každé číslo na stránke musí pochádzať zo zdroja alebo byť vypočítané z `birthData.ts`.

- **Zdroj:** Eurostat (pôvodné dáta Štatistického úradu SR), REST API bez kľúča:
  `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/<dataset>?geo=SK&indic_de=<kód>&format=JSON&lang=EN`
- **Použité tabuľky a ukazovatele (overené 2026-09-30):**
  - `demo_gind`: `LBIRTH` (živonarodení), `DEATH` (zomrelí), `GBIRTHRT` (hrubá miera pôrodnosti)
  - `demo_find`: `TOTFERRT` (TFR), `AGEMOTH` (priemerný vek matky), `AGEMOTH1` (vek pri prvom dieťati, dostupné až od 1999)
- **Stav dát:** 1960–2025. Za 2025 je len počet narodených, zomrelých a miera. TFR a vek matky Eurostat za 2025 zatiaľ nezverejnil (v `birthData.ts` je `null`). Najnovší rok sa môže ešte upraviť.
- Ďalšie tabuľky, ktoré sme overili a ktoré roadmap plánuje použiť: `demo_fasec` (narodení podľa veku matky, len 2007–2024), `demo_pjangroup` (populácia podľa vekových skupín 1960–2025), `demo_pjan` (populácia podľa jednoročného veku), `proj_23np` (projekcie 2022–2100), `demo_r_find2` (plodnosť podľa NUTS2 regiónov od 1990). Dimenzie niektorých tabuliek obsahujú prekrývajúce sa kategórie (súhrny a podskupiny), pozri detail v ROADMAP.md.
- Ak pridávaš ukazovateľ alebo krajinu, **najprv si over cez API, že tabuľka a dimenzie existujú** (nie každá tabuľka existuje, napr. `demo_r_frate3` vracia 404). Potom dáta stiahni skriptom a ulož do repa ako dáta (TS/JSON). Za behu stránky sa na Eurostat nevolá.
- Texty v popisoch (napr. `Eras.tsx`) **počítaj z dát**, nepíš čísla ručne. Ak do textu dáš nové tvrdenie („najväčší pokles", „od roku X"), over ho skriptom nad dátami.
- Kauzálne vysvetlenia („pokles kvôli X") nepíš bez zdroja. Drž sa opisu toho, čo dáta ukazujú.
- Pozor na lokalitu: PowerShell na slovenskom systéme vypisuje desatinné čísla s čiarkou. Pri generovaní TS/JSON používaj Node alebo invariantnú kultúru, aby v súbore boli desatinné bodky.
- V pätičke stránky musí ostať uvedený zdroj a dátum stiahnutia. Pri aktualizácii dát ich zmeň.

## 5. Pipeline: GitHub → Vercel

Nasadenie je plne automatické z GitHubu (Vercel Git integrácia, produkčná vetva `main`). Nikdy nenasadzuj ručne cez Vercel CLI/dashboard.

| Udalosť | Čo sa stane |
|---|---|
| Push na akúkoľvek vetvu | Vercel postaví **preview** s vlastnou URL (~40 s) |
| PR zlúčený do `main` | Vercel postaví a nasadí **produkciu** (~40 s) |

**`main` je chránená pravidlom (ruleset „main: pull request required").** Priamy push do `main` je zablokovaný pre všetkých, aj pre admina. Každá zmena ide cez vetvu a PR. Schvaľovanie recenzentom sa nevyžaduje (0 schválení), takže PR sa dá zlúčiť hneď po overení.

### Postup pri každej zmene

1. `git checkout main && git pull`, potom nová vetva (`feat/...`, `fix/...`, `docs/...`, `data/...`).
2. Zmena, potom `CI=true npm run build` a `CI=true npm test -- --watchAll=false`. Oboje musí prejsť.
3. Commit (angličtina, rozkazovací spôsob, stručný prvý riadok) a `git push -u origin <vetva>`.
4. Otvor PR: `gh pr create --base main --head <vetva> --title "..." --body "..."`.
5. Počkaj na preview a over ho. Stav buildu: `gh api repos/aranej/demografia-react/commits/<sha>/status --jq '.state'` (`pending` → `success` / `failure`). Ak je dostupný Vercel MCP, `list_deployments` s `projectId` a `get_deployment`, pri zlyhaní `list_deployment_events` (build logy).
6. **Merge do `main` (= nasadenie do produkcie):** urob ho iba vtedy, ak vlastník v tejto session výslovne povedal „mergni" alebo „nasaď". Inak nechaj PR otvorený a napíš vlastníkovi, že je pripravený. Merge: `gh pr merge <číslo> --merge`.
7. Po nasadení over produkciu (deployment `target: production`, stav `READY`) a zmaž zlúčené vetvy (`git push origin --delete <vetva>`, `git branch -d <vetva>`).

Zadanie typu „pozri roadmap, vymysli to a nasaď" znamená: implementuj položku podľa postupu vyššie, a keďže vlastník povedal „nasaď", po zelenom builde, prejdených testoch a overenom preview zlúč PR a over produkciu. Ak niečo z toho nie je zelené, nemerguj a povedz to.

### Identifikátory (nie sú tajné)

- Vercel projekt: `demografia-react`, ID `prj_VhxCnZkGFHNg03H3rg3RBlJb7lMm`, účet/team ID `team_osoEw7p45NrXW20IceQ5PpAq`, slug `jozeffs-projects-6c9f3736` (plán Hobby, osobný účet, žiadny tím).
- Framework v nastaveniach Vercelu: Create React App, Node 22.x, výstup `build/`. V repe nie je `vercel.json` a nie je potrebný.
- Ochrana nasadení (Vercel Authentication) je **vypnutá**, stránka aj previews sú verejné. Nemeň.

## 6. Vercel: čo dokáže free plán (Hobby)

Overené z oficiálnej dokumentácie 2026-09-30 (https://vercel.com/docs/plans/hobby, https://vercel.com/docs/cron-jobs/usage-and-pricing). Dokumentácia sa mení, pri väčšom rozhodnutí si limity znova over.

**Podmienka č. 1: Hobby je len na nekomerčné, osobné použitie** (žiadne reklamy, predaj ani práca pre klienta). Pri prekročení limitov sa funkcia na Hobby pozastaví (typicky na 30 dní), nie spoplatní.

| Zdroj | Hobby (zahrnuté) |
|---|---|
| Fast Data Transfer | 100 GB |
| Fast Origin Transfer | 10 GB |
| CDN Requests | 1 000 000 |
| Function Invocations | 1 000 000 |
| Active CPU / Provisioned Memory | 4 CPU-hod / 360 GB-hod |
| Image Transformations | 5 000 |
| Web Analytics | 50 000 udalostí / mesiac |
| Speed Insights | 10 000 udalostí / 30 dní (zdieľané) |
| Nasadení za deň | 100 |
| Projektov | 200 |
| Domén na projekt | 50 |
| Build | 2 vCPU, 8 GB pamäte, 32 GB disk |
| Max. trvanie funkcie | 300 s |
| Runtime logy | 1 hodina |
| WAF | max 3 IP blokovania a 3 vlastné pravidlá, DDoS ochrana zapnutá predvolene |
| Deployment Protection | Vercel Authentication a výnimky sú dostupné. **Password Protection je platená (Pro, 20 USD/mes. na projekt)** |
| Cron jobs | Povolené, ale **najviac raz za deň a s presnosťou ±59 min** (častejší výraz zlyhá pri nasadení) |

**Pravidlá pre tento projekt:**

- **Drž stránku statickú.** Dáta sú v repe, Vercel len servíruje súbory. To je zadarmo a bezpečné voči limitom.
- Nepridávaj nič, čo vyžaduje platený plán, kreditný účet alebo nastavenie platby: Vercel Postgres/Blob/iné úložiská, AI Gateway a kredity (v0, Agent), Password Protection, Pro funkcie, spend management. Ak to roadmap položka vyžaduje, **zastav a spýtaj sa vlastníka**.
- Plánované úlohy (napr. aktualizácia dát) rob cez **GitHub Actions** (na verejných repách zadarmo), nie cez Vercel cron (obmedzený na raz denne).
- Serverless funkcie len v nevyhnutnom prípade. Ak je niečo možné predpočítať pri builde alebo v skripte, predpočítaj to.
- Zmeny nastavení Vercel projektu (domény, env premenné, ochrana, fakturácia, pridanie integrácií) **nerob bez výslovného súhlasu vlastníka**. Sú mimo rozsahu bežnej práce na kóde.
- Vercel MCP (ak je k dispozícii) používaj na **čítanie** (deploymenty, logy, stav projektu). Zápisové nástroje (create/update/delete, nákupy) nepoužívaj bez súhlasu.

## 7. Bezpečnosť a hranice

- V repe nie sú a nemajú byť žiadne tajomstvá (API kľúče, tokeny). Stránka nepotrebuje žiadne. Nikdy nič také necommituj ani nevypisuj do odpovedí. Ak niečo nájdeš, upozorni vlastníka.
- Nepushuj do `main` (je zablokované). Nepoužívaj `--force`, `--no-verify` ani obchádzanie pravidiel repa. Pravidlo nevypínaj.
- Čokoľvek navonok viditeľné a ťažko vratné (merge, mazanie vetiev iných ako tvojich, zmena nastavení repa, vytváranie issues v mene vlastníka) rob až po potvrdení, ak ti to vlastník výslovne nepovolil.

## 8. Dizajn

Tmavá téma, pokojná, jeden limetkový akcent (`--accent: #b6f24a`), font Inter, veľká typografia, „bento" dlaždice a karty s jemným okrajom.

- Farby ukazovateľov: narodení `#b6f24a`, TFR `#8b9bff`, hrubá miera `#ffb454`, vek matky `#5eead4`, zomrelí `#ff7a59`. Nemeň bez dôvodu, sú naprieč stránkou konzistentné.
- **Nevracaj sa k neónovému cyan/magenta/žltému štýlu ani k „AI slop" vzhľadu.** Nový prvok musí zapadnúť do existujúcich dlaždíc a premenných.
- Stránka musí fungovať na mobile (375 px) bez horizontálneho scrollu. Na úzkych obrazovkách sa popisky anotácií v grafe skrývajú (CSS v `index.css`).
- Respektuj `prefers-reduced-motion` (už je v `index.css`).
- Ovládacie prvky sú `<button>` s `aria-pressed`. Zachovaj prístupnosť.

## 9. Známe pasce

- **Create React App je oficiálne nepodporovaný.** Nemigruj framework (napr. na Vite) bez roadmap položky alebo súhlasu vlastníka. `npm ci` vypíše deprecation varovania, sú neškodné.
- **`CI=true` = varovania sú chyby.** Nepoužité importy/premenné zhodia build na Verceli.
- jsdom nemá `ResizeObserver`, ktorý potrebuje Recharts. Je to riešené stubom v `src/setupTests.ts`.
- Recharts animuje graf pri načítaní. Ak robíš screenshot hneď po načítaní, môže byť graf prázdny, počkaj ~2–3 s.
- Varovania `LF will be replaced by CRLF` z gitu na Windows sú neškodné.
- `build/` a `node_modules/` sú v `.gitignore`.

## 10. Definition of done

- [ ] Zmena je na vetve, nie na `main`.
- [ ] `CI=true npm run build` prešiel bez varovaní a `CI=true npm test -- --watchAll=false` prešiel.
- [ ] Nové čísla a tvrdenia pochádzajú zo zdroja alebo z dát a sú overené.
- [ ] Vyzerá dobre na desktope aj na mobile (375 px), konzola bez chýb.
- [ ] Vercel preview je `success` a bol si ho pozrieť.
- [ ] PR má zrozumiteľný popis. Ak sa zmenili dáta, je v ňom uvedený zdroj a dátum.
- [ ] Položka v `ROADMAP.md` je aktualizovaná (stav, poznámky) v tom istom PR.
- [ ] Merge len po výslovnom pokyne vlastníka (pozri sekciu 5).
