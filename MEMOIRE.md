# 🚀 GUINVESTOR - PLAN DE DÉVELOPPEMENT

## 📅 Date de création
3 Avril 2026

## 📂 Structure du Projet

```
D:\Guilhem\workspace\Guilvestor\
├── MEMOIRE.md                    # Ce fichier - plan complet
├── guilvestor-web\              # Frontend Next.js + API Routes
│   ├── .env.example              # Variables d'environnement
│   ├── .env.local                # Clé API FMP (local)
│   ├── app\
│   │   ├── [ticker]\             # Page analyse action
│   │   ├── api\                  # API Routes Next.js (backend)
│   │   │   └── stock\[ticker]\   # Endpoints API
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components\
│   │   ├── stock\                # Composants métier
│   │   │   ├── stock-analysis-page.tsx
│   │   │   ├── stock-header.tsx
│   │   │   ├── quality-metrics.tsx
│   │   │   └── *.tsx
│   │   └── ui\                  # 70+ composants shadcn/ui
│   ├── services\                # Services métier
│   │   ├── fmp-client.ts        # Client API FMP
│   │   └── calculations.ts      # Calculs financiers
│   ├── lib\                     # Utils + types
│   │   ├── types\fmp.ts         # Types TypeScript
│   │   ├── api-client.ts        # Client API frontend
│   │   └── utils.ts
│   ├── hooks\                   # React hooks
│   ├── __tests__\               # Tests unitaires
│   └── coverage\                # Rapports de couverture
│
├── shared\                      # Types partagés (legacy)
│   └── types\index.ts
│
└── .github\workflows\           # CI/CD
    ├── deploy.yml               # Déploiement Vercel
    └── tests.yml                # Tests CI
```

## 🎯 Objectif
Application d'analyse d'actions boursières avec :
- Frontend Next.js 16 + React 19 + shadcn/ui (preset b4huPoyDj)
- Backend : API Routes Next.js (serverless sur Vercel)
- API Financial Modeling Prep (FMP)
- Calculs financiers : CAGR, FCF, ROIC, DCF
- Déploiement : Vercel (frontend + backend unifié)

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

### Backend (API Routes Next.js)
- Next.js API Routes (serverless functions)
- TypeScript
- FMP API Client (axios/fetch)
- Calculs financiers (services/calculations.ts)
- Déploiement : Vercel Serverless Functions

### Testing
- Vitest (unit tests)
- Playwright (E2E)
- Target coverage: 80%+

### CI/CD
- GitHub Actions
- Déploiement auto sur push main

## 📝 Environnement

### Frontend + Backend (.env.local)
```
# Clé API Financial Modeling Prep (obligatoire)
FMP_API_KEY=your_api_key_here

# URL de l'API (vide pour utiliser les routes API Next.js locales)
NEXT_PUBLIC_API_URL=
```

**Note :** Avec Vercel, les routes API Next.js sont servies sur le même domaine que le frontend. Pas besoin de CORS ni d'URL externe.

## ✅ Checklist de Validation

### Frontend
- [ ] Build passe: `npm run build`
- [ ] Lint propre: `npm run lint`
- [ ] Types valides: `npx tsc --noEmit`
- [ ] Tests passent: `npm run test`
- [ ] Coverage ≥ 80%

### API Routes (Backend)
- [x] Routes API créées: `/api/stock/[ticker]`, `/api/stock/[ticker]/dcf`, `/api/stock/[ticker]/chart`
- [x] Tests routes API passent (57/57) ✅
- [x] Handlers retournent format correct
- [x] Gestion erreurs appropriée (404, 500, etc.)

### Intégration
- [x] Frontend appelle routes API correctement ✅
- [x] Données FMP récupérées et affichées ✅
- [x] Calculs DCF fonctionnels ✅
- [x] Graphiques Recharts rendus correctement ✅
- [x] Barre de recherche fonctionnelle ✅

### Déploiement Vercel
- [ ] Compte Vercel créé et lié au repo
- [ ] Variables d'environnement configurées sur Vercel (FMP_API_KEY)
- [ ] Déploiement auto sur push main
- [ ] Build passe sur Vercel

## 🚀 Roadmap Agents

| # | Agent | Phase | Statut | Priorité |
|---|-------|-------|--------|----------|
| 1 | setup-architect | 1 - Structure | ✅ Terminé | 🔴 Critique |
| 2 | types-contract-designer | 2 - Types/API | ✅ Terminé | 🔴 Critique |
| 3 | api-routes-dev | 3 - API Routes | ✅ Terminé | 🔴 Critique |
| 4 | frontend-layout-dev | 4a - Layout | ✅ Terminé | 🟡 Parallèle |
| 5 | metrics-cards-dev | 4b - Métriques | ✅ Terminé | 🟡 Parallèle |
| 6 | charts-dev | 4c - Graphiques | ✅ Terminé | 🟡 Parallèle |
| 7 | valuation-dcf-dev | 4d - DCF | ✅ Terminé | 🟡 Parallèle |
| 8 | fmp-service-dev | 5a - FMP Client | ✅ Terminé | 🟡 Parallèle |
| 9 | calculator-dev | 5b - Calculs | ✅ Terminé | 🟡 Parallèle |
| 10 | frontend-integration-dev | 6 - Intégration Frontend/API | ✅ Terminé | 🔴 Critique |
| 11 | cicd-devops | 7 - CI/CD Vercel | ⏳ En attente | 🟢 Suite |

**Changements majeurs (03/04/2026) :**
- ❌ Suppression de l'architecture AWS Lambda + SAM
- ✅ Passage aux API Routes Next.js (plus simple, déploiement unifié sur Vercel)
- ✅ Routes API déjà implémentées : `/api/stock/[ticker]`, `/api/stock/[ticker]/dcf`, `/api/stock/[ticker]/chart`

## 🐛 Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Conflits fichiers parallèles | Élevé | Communication via ce fichier, merge fréquents |
| API FMP indisponible | Moyen | Données mockées pour dev, retry logic |
| Quota FMP dépassé | Moyen | Cache côté client, retry avec backoff |
| Temps de build Vercel | Faible | Optimiser le bundle, utiliser edge functions si besoin |

**Risques éliminés (passage à Vercel) :**
- ❌ CORS issues : Plus de problème (même domaine frontend/backend)
- ❌ Cold start : Géré automatiquement par Vercel
- ❌ Complexité infra AWS : Plus de SAM, Lambda, API Gateway à gérer

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

**Dernière mise à jour:** 3 Avril 2026 - Migration vers Vercel + Routes API

---

## 📝 Mise à Jour des Agents

**[AGENT: opencode] - [03/04/2026 - Session 1]**
- **Statut:** ✅ Terminé
- **Tâche:** Migration architecture AWS → Vercel + Correction routes API
- **Actions réalisées:**
  1. ✅ Mise à jour MEMOIRE.md (suppression AWS Lambda/SAM, ajout Vercel)
  2. ✅ Correction signatures routes API (Next.js 16 - params comme Promise)
  3. ✅ Correction tests API (57/57 tests passent)
  4. ✅ Vérification TypeScript (0 erreurs sur les routes)
- **Routes API fonctionnelles:**
  - `GET /api/stock/[ticker]` - Données complètes action ✅
  - `POST /api/stock/[ticker]/dcf` - Calcul DCF ✅
  - `GET /api/stock/[ticker]/chart?type=xxx` - Données graphiques ✅
- **Architecture Clean respectée:**
  - `app/api/*` - Controllers (handlers HTTP)
  - `services/*` - Services métier (FMP client, calculs)
  - `lib/types/*` - Types/Domain
- **Prochaines étapes:** 
  - Compléter TODOs dans les routes (ROIC, margins, CAGR réels)
  - Connecter frontend aux routes API (remplacer mock-data)
  - Configurer déploiement Vercel

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

**[AGENT: opencode] - [03/04/2026 - Session 2]**
- **Statut:** ✅ Terminé
- **Tâche:** Complétion TODOs routes + Intégration Frontend/API
- **Actions réalisées:**
  1. ✅ Complété les TODOs dans `/api/stock/[ticker]/route.ts`:
     - Calcul ROIC data (calculateROIC)
     - Calcul Gross Margin
     - Calcul FCF Margin
     - Calcul CAGR réels (5y, 10y)
  2. ✅ Corrigé tests API (ajout mock calculateROIC)
  3. ✅ Connecté frontend aux routes API:
     - `stock-analysis-page.tsx` utilise `fetchStockData()`
     - Gestion états: loading, error, data
     - Affichage skeleton pendant chargement
     - Affichage erreur si API indisponible
  4. ✅ Rendu la barre de recherche fonctionnelle:
     - Navigation vers `/{ticker}`
     - Form submit avec Enter
  5. ✅ 57/57 tests passent
- **Routes API complètes:**
  - ✅ `GET /api/stock/[ticker]` - Toutes données (avec ROIC, margins, CAGR)
  - ✅ `POST /api/stock/[ticker]/dcf` - Calcul DCF
  - ✅ `GET /api/stock/[ticker]/chart` - Graphiques spécifiques
- **Frontend connecté:**
  - ✅ Données réelles FMP affichées
  - ✅ Barre de recherche fonctionnelle
  - ✅ États loading/error gérés
- **Prochaines étapes:**
  - Configurer déploiement Vercel
  - Ajouter section Valorisation (onglet DCF)
  - Tests E2E

---

**[AGENT: types-contract-designer] - [03/04/2026]**
- **Statut:** ✅ Terminé
- **Tâche:** Définir les types TypeScript partagés et contrats API
- **Livrables créés:**
  - `lib/types/fmp.ts` - Types complets FMP API
  - Types StockData, QualityMetric, DCFInputs, DCFResult, etc.

---

**[AGENT: opencode] - [05/04/2026 - Session 3]**
- **Statut:** ✅ Terminé
- **Tâche:** Correction gestion données manquantes + Affichage CAGR dynamique
- **Actions réalisées:**
  1. ✅ Migration de Finnhub vers Yahoo Finance (composite-adapter → yahoo-adapter direct)
     - Suppression dépendance concepts XBRL instables
     - Renommage composite-adapter.ts → composite-adapter-old.ts
  2. ✅ Correction calcul CAGR sur données réelles disponibles:
     - `buildCAGR()` calcule sur (dernière_année - première_année) au lieu de (nombre_points - 1)
     - Affichage "CAGR Xy" adapté au nombre d'années réelles (ex: META CA 2022→2025 = "3y")
  3. ✅ Gestion des données manquantes (N/A):
     - `getValidDataPoints()` filtre les valeurs > 0 pour les calculs
     - `fillMissingYearsWithNull()` complète années manquantes avec null
     - Graphiques affichent "N/A" dans tooltip quand valeur null/0
     - Métriques affichent "N/A" quand moins de 2 points de données
  4. ✅ Correction affichage descriptions métriques:
     - "en moyenne par an sur les X dernières années" au lieu de "CAGR Xy"
  5. ✅ Suppression affichages 10Y et 20Y (non calculables avec données limitées)
  6. ✅ Correction couleur graphique FCF par action (rouge #FB2C36)
- **Fichiers modifiés:**
  - `services/calculations.ts` - Helper getValidDataPoints, descriptions métriques
  - `services/use-cases/get-stock-analysis.ts` - fillMissingYearsWithNull, buildCAGR corrigé
  - `services/composite-adapter.ts` → `composite-adapter-old.ts` (archivé)
  - `app/api/stock/[ticker]/route.ts` - YahooAdapter direct
  - `components/stock/bar-chart-card.tsx` - Affichage CAGR Xy, N/A
  - `components/stock/line-chart-card.tsx` - Affichage N/A
  - `components/stock/quality-metrics.tsx` - Affichage N/A, statut neutral
  - `components/stock/stock-analysis-page.tsx` - Props CAGR corrigées
  - `lib/types.ts` - QualityMetric.value: number | null
  - `lib/types/fmp.ts` - CAGRData avec years/value/label optionnels
- **Tests:**
  - ✅ META: CA "CAGR 3y", FCF "CAGR 3y" (périodes réelles)
  - ✅ RMS.PA: Affichage "N/A" pour données manquantes
  - ✅ TypeScript: 0 erreurs sur les fichiers modifiés
- **Prochaines étapes:**
  - Ajouter onglet Valorisation (calcul DCF interactif)
  - Ajouter onglet Bilan/Compte de résultat détaillés
  - Tests avec plus de tickers européens (AIR.PA, etc.)

