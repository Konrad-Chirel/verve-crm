# Verve CRM

Application de gestion commerciale et de suivi des mandats pour cabinets de conseil, agences et structures de services B2B.

L'outil centralise le pipeline d'opportunités, le suivi des contacts décideurs, les prévisions de trésorerie et la génération de documents contractuels en PDF.

## Fonctionnalités

- **Pipeline commercial** : tableau Kanban en 5 étapes (qualification, cadrage, proposition, négociation, signé), drag & drop avec réordonnancement intra et inter-colonnes, bascule en vue liste.
- **Fiche dossier** : récapitulatif financier (honoraires HT, probabilité, valeur pondérée), progression des étapes, journal d'échanges (notes, comptes-rendus d'appel, relances) et génération de lettre de mission au format PDF.
- **Tableau de bord** : indicateurs de closing du mois/trimestre, répartition du portefeuille par étape et feuille de route des relances du jour.
- **Répertoire clients** : liste des entreprises, interlocuteurs principaux, volume d'affaires cumulé, filtres et export CSV.
- **Trésorerie & flux** : projection du chiffre d'affaires signé et pondéré, graphique mensuel interactif et métriques de conversion.
- **Responsive** : interface optimisée pour desktop, tablette et mobile (navigation basse avec actions rapides, sélecteur d'étape par onglets sur petit écran).

## Stack technique

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- jsPDF

## Démarrage rapide

### Prérequis

- Node.js 18.17 ou supérieur
- npm ou pnpm

### Installation

```bash
git clone https://github.com/Chirel-Konrad/verve-crm.git
cd verve-crm
npm install
```

### Développement

```bash
npm run dev
```

L'application démarre sur [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

## Structure du projet

```
src/
├── app/                  # Routes et pages Next.js (App Router)
│   ├── clients/          # Annuaire et répertoire des comptes
│   ├── dashboard/        # Synthèse et agenda du jour
│   ├── deals/[id]/       # Fiche dossier 360° et journal
│   ├── parametres/       # Configuration du profil et objectifs
│   ├── pipeline/         # Kanban commercial
│   └── rapports/         # Trésorerie et flux financiers
├── components/
│   ├── layout/           # Sidebar, topbar, mobile-nav, command palette
│   ├── modals/           # Modales de création (dossier, société)
│   ├── rapports/         # Composants graphiques
│   └── ui/               # Composants réutilisables (boutons, badges, inputs...)
├── context/              # Contextes React (données CRM, modales)
└── lib/                  # Données mockées, génération PDF et utilitaires
```

## Licence

MIT
