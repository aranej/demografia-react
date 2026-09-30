# demografia-react

Vizualizácia vývoja pôrodnosti na Slovensku 1960–2025 (Eurostat / ŠÚ SR).

- Produkcia: https://demografia-react.vercel.app
- Stack: Create React App (TypeScript), Recharts, Emotion, nasadenie Vercel (Hobby)
- Nasadenie: automaticky z GitHubu. PR → preview, merge do `main` → produkcia.

```bash
npm ci
npm start                              # http://localhost:3000
CI=true npm run build                  # produkčný build
CI=true npm test -- --watchAll=false   # testy
```

Pre AI agentov a nových prispievateľov: [AGENTS.md](AGENTS.md) (ako s projektom pracovať, pravidlá pre dáta, limity Vercel free plánu) a [ROADMAP.md](ROADMAP.md) (čo sa plánuje).

Údaje: Eurostat (`demo_gind`, `demo_find`), pôvodné dáta Štatistického úradu SR.
