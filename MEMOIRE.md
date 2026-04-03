# 🚀 GUINVESTOR - PLAN DE DÉVELOPPEMENT

## 📅 Date de création
3 Avril 2026

## 📂 Structure du Projet

```
D:\Guilhem\workspace\Guilvestor\
├── MEMOIRE.md                    # Ce fichier - plan complet
├── guilvestor-web	est	est.tsx     # Frontend Next.js + shadcn
│   ├── .env.example              # Variables d'environnement
│   ├── app\
│   │   ├── [ticker]\             # Page analyse action
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components\
│   │   ├── metrics	est	est.tsx     # 6 cartes métriques
│   │   ├── charts	est	est.tsx      # 9 graphiques Recharts  
│   │   ├── valuation	est.tsx        # Section DCF
│   │   └── layout	est	est.tsx      # Header, navigation
│   ├── lib\                     # Client API + calculs
│   └── __tests__\               # Tests unit + integration
│
├── guilvestor-api\              # Backend AWS Lambda
│   ├── .env.example
│   ├── src\
│   │   ├── handlers\            # 3 Lambda handlers
│   │   ├── services\            # FMP client + calculs
│   │   └── types\
│   ├── template.yaml            # SAM Infrastructure
│   └── __tests__\               # Tests backend
│
├── shared\                      # Types partagés
│   └── types\index.ts
│
└── .github\workflows\           # CI/CD
    ├── deploy-frontend.yml
    ├── deploy-backend.yml
    └── tests.yml
```

## 🎯 Objectif
Application d'analyse d'actions boursières avec :
- Frontend Next.js 16 + React 19 + shadcn/ui (preset b4huPoyDj)
- Backend AWS Lambda + API Gateway
- API Financial Modeling Prep
- Calculs financiers : CAGR, FCF, ROIC, DCF
- Déploiement GitHub Pages (front) + AWS (back)

## 🎨 Design Reference

### Layout Principal (basé sur les screenshots)
```
┌─────────────────────────────────────────────────────────────┐
│  Logo Graham    [Search Ticker ▼]  Superstocks  Watchlists │
├─────────────────────────────────────────────────────────────┤
│  Fiserv, Inc. (FISV)                              60,53 $  │
│  US - NASDAQ                                    Cap: 329M  │
├─────────────────────────────────────────────────────────────┤
│  Qualité | Valorisation | Transcripts | Bilan | Compte...  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ ✅ Croissance│ │ ✅ FCF Growth│ │ ✅ Super ROIC│        │
│  │   14,96%     │ │   19,54%     │ │   16,23%     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ ❌ Dette/FCF │ │ ❌ Shares    │ │ ✅ FCF Margin│        │
│  │   4,90       │ │   +11,39%    │ │   20,36%     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  [Revenue Chart]  [FCF Chart]  [FCF/Share Chart]          │
│  [ROIC Chart]     [Gross Margin] [FCF Margin]              │
│  [Shares Chart]   [Dividends]    [Cash/Debt]               │
│  [Revenue Pie Chart]                                       │
└─────────────────────────────────────────────────────────────┘
```

### Métriques à Afficher (6 cartes)

1. **Croissance du chiffre d'affaires**
   - Valeur: 14,96%
   - Période: 5 dernières années
   - Cible: > 10%
   - Statut: ✅ (vert)

2. **Croissance du free cash flow**
   - Valeur: 19,54%
   - Période: 5 dernières années
   - Cible: > 10%
   - Statut: ✅ (vert)

3. **Super ROIC**
   - Valeur: 16,23%
   - Période: moyenne sur 5 ans
   - Cible: > 15%
   - Statut: ✅ (vert)

4. **Dette nette / Free cash flow**
   - Valeur: 4,90
   - Période: dernier trimestre
   - Cible: < 3
   - Statut: ❌ (rouge)

5. **Nombre d'actions en circulation**
   - Valeur: +11,39%
   - Période: 5 dernières années
   - Cible: ≤ 0%
   - Statut: ❌ (rouge)

6. **Marge du free cash flow**
   - Valeur: 20,36%
   - Période: moyenne sur 5 ans
   - Cible: > 10%
   - Statut: ✅ (vert)

### Graphiques (9 graphiques)

1. **Chiffre d'affaires** - Barres
2. **Free cash flow et SBC** - Barres combinées
3. **Free Cash Flow par action** - Barres
4. **Super ROIC** - Ligne
5. **Marge brute** - Ligne
6. **Marge du Free Cash Flow** - Ligne
7. **Actions en circulation diluées** - Barres
8. **Dividendes** - Barres
9. **Cash et dette** - Barres combinées

### Section Valorisation (Onglet DCF)

**Inputs:**
- Multiple FCF (default: 15)
- Taux de croissance FCF (default: 10%)
- Nombre d'années (default: 10)
- Nombre d'actions (auto)

**Résultats:**
- Fair Value (entreprise)
- Target Price (par action)
- Upside/Downside (%)

## 📐 Types Partagés

```typescript
// StockData - Données complètes d'une action
interface StockData {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  marketCap: number;
  currency: string;
  metrics: Metrics;
  charts: ChartData;
  revenueBreakdown: RevenueSegment[];
}

// Metrics - Les 6 métriques principales
interface Metrics {
  revenueGrowth: MetricValue;
  fcfGrowth: MetricValue;
  roic: MetricValue;
  debtToFCF: MetricValue;
  shareDilution: MetricValue;
  fcfMargin: MetricValue;
}

// MetricValue - Structure d'une métrique
interface MetricValue {
  value: number;
  displayValue: string;
  period: string;
  target: string;
  status: 'success' | 'warning' | 'error';
  description: string;
}

// DCF Inputs
interface DCFInputs {
  currentFCF: number;
  growthRate: number;        // En décimal (0.10 = 10%)
  years: number;
  terminalMultiple: number;
  sharesOutstanding: number;
  discountRate?: number;     // Optionnel, default 10%
}

// DCF Results
interface DCFResult {
  enterpriseValue: number;
  equityValue: number;
  targetPrice: number;
  currentPrice: number;
  upside: number;            // En pourcentage
  projectedFCFs: YearlyFCF[];
}

interface YearlyFCF {
  year: number;
  fcf: number;
  presentValue: number;
}

// Chart Data
interface ChartData {
  revenue: YearlyData[];
  fcf: YearlyData[];
  fcfPerShare: YearlyData[];
  roic: YearlyData[];
  grossMargin: YearlyData[];
  fcfMargin: YearlyData[];
  sharesOutstanding: YearlyData[];
  dividends: YearlyData[];
  cashAndDebt: CashDebtData[];
}

interface YearlyData {
  year: number | string;
  value: number;
  cagr5y?: number;
  cagr10y?: number;
  cagr20y?: number;
}

interface CashDebtData {
  year: number | string;
  cash: number;
  debt: number;
}

interface RevenueSegment {
  name: string;
  percentage: number;
}
```

## 🔌 API Contract

### Endpoints Backend

#### GET /stock/{ticker}
Retourne les données complètes d'une action.

**Response 200:**
```json
{
  "ticker": "FISV",
  "name": "Fiserv, Inc.",
  "exchange": "NASDAQ",
  "price": 60.53,
  "marketCap": 32900000000,
  "currency": "USD",
  "metrics": { ... },
  "charts": { ... },
  "revenueBreakdown": [...]
}
```

#### POST /stock/{ticker}/dcf
Calcule la valorisation DCF avec les inputs fournis.

**Request Body:**
```json
{
  "growthRate": 0.10,
  "years": 10,
  "terminalMultiple": 15,
  "discountRate": 0.10
}
```

**Response 200:**
```json
{
  "enterpriseValue": 45000000000,
  "equityValue": 42000000000,
  "targetPrice": 75.20,
  "currentPrice": 60.53,
  "upside": 24.2,
  "projectedFCFs": [...]
}
```

#### GET /stock/{ticker}/chart?type={type}&period={period}
Retourne les données historiques pour un graphique spécifique.

**Query Params:**
- type: 'revenue' | 'fcf' | 'roic' | 'shares' | etc.
- period: '5y' | '10y' | '20y' | 'all'

**Response 200:**
```json
{
  "type": "revenue",
  "data": [
    {"year": "2020", "value": 14000000000},
    {"year": "2021", "value": 16000000000},
    ...
  ],
  "cagr5y": 0.1496,
  "cagr10y": 0.1498
}
```

## 🧮 Formules de Calcul

### CAGR (Compound Annual Growth Rate)
```
CAGR = (Valeur Finale / Valeur Initiale)^(1/n) - 1
```

### Free Cash Flow
```
FCF = Operating Cash Flow - CapEx
```

### ROIC (Return on Invested Capital)
```
ROIC = NOPAT / Invested Capital
NOPAT = Operating Income × (1 - Tax Rate)
Invested Capital = Total Equity + Total Debt - Cash & Cash Equivalents
```

### DCF Simplifié
```
pour chaque année i de 1 à n:
  FCF_i = FCF_(i-1) × (1 + growthRate)
  PV_i = FCF_i / (1 + discountRate)^i

Terminal Value = FCF_n × terminalMultiple / (1 + discountRate)^n

Enterprise Value = Σ(PV_i) + Terminal Value
Equity Value = Enterprise Value - Net Debt
Target Price = Equity Value / Shares Outstanding
```

### Share Dilution
```
Dilution = (Shares Finale / Shares Initiale)^(1/n) - 1
```

## 🎨 Spécifications Design

### Couleurs (Preset b4huPoyDj)
- Success (vert): `#22c55e` ou `bg-green-500`
- Error (rouge): `#ef4444` ou `bg-red-500`
- Warning (orange): `#f97316` ou `bg-orange-500`
- Primary: Couleur du preset shadcn
- Background: `bg-background`
- Card: `bg-card` avec `border-border`

### Typographie
- Titre métrique: `text-3xl font-bold`
- Label métrique: `text-sm text-muted-foreground`
- Valeur cible: `text-xs`

### Espacement
- Grid métriques: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Padding carte: `p-6`
- Gap sections: `gap-8`

## 🔧 Technologies

### Frontend
- Next.js 16.1.6
- React 19.2.3
- TypeScript 5.5+
- Tailwind CSS v4
- shadcn/ui (preset b4huPoyDj)
- Recharts (graphiques)
- next-themes (dark/light mode)

### Backend
- AWS Lambda (Node.js 20)
- API Gateway
- TypeScript
- SAM (Infrastructure as Code)
- Région: eu-west-1

### Testing
- Vitest (unit tests)
- Playwright (E2E)
- Target coverage: 80%+

### CI/CD
- GitHub Actions
- Déploiement auto sur push main

## 📝 Environnement

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api-guilvestor.execute-api.eu-west-1.amazonaws.com/prod
```

### Backend (.env)
```
FMP_API_KEY=your_api_key_here
REGION=eu-west-1
```

## ✅ Checklist de Validation

### Frontend
- [ ] Build passe: `npm run build`
- [ ] Lint propre: `npm run lint`
- [ ] Types valides: `npx tsc --noEmit`
- [ ] Tests passent: `npm run test`
- [ ] Coverage ≥ 80%

### Backend
- [ ] Build Lambda: `sam build`
- [ ] Tests passent: `npm run test`
- [ ] Handler retournent format correct
- [ ] Gestion erreurs appropriée

### Intégration
- [ ] Frontend appelle backend correctement
- [ ] Données FMP récupérées et affichées
- [ ] Calculs DCF fonctionnels
- [ ] Graphiques Recharts rendus correctement

### Déploiement
- [ ] GitHub Pages déploie frontend
- [ ] AWS SAM déploie backend
- [ ] CI/CD déclenché sur push main
- [ ] Variables d'environnement configurées

## 🚀 Roadmap Agents

| # | Agent | Phase | Statut | Priorité |
|---|-------|-------|--------|----------|
| 1 | setup-architect | 1 - Structure | ✅ Terminé | 🔴 Critique |
| 2 | types-contract-designer | 2 - Types/API | ⏳ En attente | 🔴 Critique |
| 3 | frontend-layout-dev | 3a - Layout | ⏳ En attente | 🟡 Parallèle |
| 4 | metrics-cards-dev | 3b - Métriques | ⏳ En attente | 🟡 Parallèle |
| 5 | charts-dev | 3c - Graphiques | ⏳ En attente | 🟡 Parallèle |
| 6 | valuation-dcf-dev | 3d - DCF | ⏳ En attente | 🟡 Parallèle |
| 7 | fmp-service-dev | 4a - FMP Client | ⏳ En attente | 🟡 Parallèle |
| 8 | calculator-dev | 4b - Calculs | ⏳ En attente | 🟡 Parallèle |
| 9 | lambda-handlers-dev | 4c - Handlers | ⏳ En attente | 🟡 Parallèle |
| 10 | infrastructure-devops | 4d - SAM | ⏳ En attente | 🟡 Parallèle |
| 11 | integration-tester | 5 - Intégration | ⏳ En attente | 🟢 Suite |
| 12 | cicd-devops | 6 - CI/CD | ⏳ En attente | 🟢 Suite |

## 🐛 Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Conflits fichiers parallèles | Élevé | Communication via ce fichier, merge fréquents |
| API FMP indisponible | Moyen | Données mockées pour dev, retry logic |
| CORS issues | Moyen | API Gateway config CORS permissive |
| Cold start Lambda | Faible | Pas de mitigation nécessaire (usage perso) |
| Quota FMP dépassé | Moyen | Cache client-side simple, retry avec backoff |

## 📞 Communication

Les agents doivent lire et mettre à jour ce fichier :
- Statut de leur phase
- Dépendances bloquantes
- Décisions prises
- Problèmes rencontrés

**Format de mise à jour:**
```
[AGENT: nom-agent] - [DATE]
- Statut: ✅ Terminé | 🔄 En cours | ⏳ En attente
- Livrables: liste des fichiers créés
- Dépendances: besoin de X avant de continuer
- Problèmes: description si bloqué
```

---

**Dernière mise à jour:** 3 Avril 2026 - Initialisation du plan

---

## 📝 Mise à Jour des Agents

**[AGENT: setup-architect] - [03/04/2026 17:30]**
- **Statut:** ✅ Terminé
- **Livrables créés:**
  - Structure complète du projet (D:\Guilhem\workspace\Guilvestor\)
  - guilvestor-web/ - Frontend Next.js 16 + shadcn/ui
    - package.json, tsconfig.json, next.config.js, tailwind.config.ts, components.json
    - app/[ticker]/page.tsx, layout.tsx, globals.css
    - lib/utils.ts
    - Dossiers components/{metrics,charts,valuation,layout}/.gitkeep
    - Dossiers types/.gitkeep, __tests__/.gitkeep
    - .env.example
  - guilvestor-api/ - Backend AWS Lambda
    - package.json, tsconfig.json, template.yaml (SAM)
    - Dossiers src/{handlers,services,types}/.gitkeep
    - Dossier __tests__/.gitkeep
    - .env.example
  - shared/types/index.ts - Types partagés
  - .github/workflows/ - CI/CD (deploy-frontend.yml, deploy-backend.yml, tests.yml)
  - Git initialisé avec branches main, frontend, backend
- **Validation:**
  - ✅ `cd guilvestor-web && npm install` - Succès (460 packages)
  - ✅ `cd guilvestor-api && npm install` - Succès (146 packages)
  - ✅ Structure des dossiers complète
  - ✅ Fichiers .env.example créés
- **Dépendances:** ⏳ En attente de types-contract-designer
- **Problèmes:** Aucun

---

**[AGENT: types-contract-designer] - [03/04/2026]**
- **Statut:** ⏳ En attente
- **Tâche:** Définir les types TypeScript partagés et contrats API
- **Dépend de:** setup-architect (✅ Terminé)
- **Livrables attendus:**
  - shared/types/index.ts (mise à jour)
  - shared/types/api.ts
  - Contrats API OpenAPI/Swagger
