# Verve CRM — Pilotage Commercial & Mandats B2B

![CI Status](https://github.com/Konrad-Chirel/verve-crm/actions/workflows/ci.yml/badge.svg)

Application web SaaS de gestion commerciale, de suivi des mandats et de pilotage de trésorerie conçue pour les **cabinets de conseil**, **agences digitales** et **structures de services B2B**.

L'outil associe une direction artistique éditoriale (**« Noble Emerald »**, disponible en **Mode Clair** et **Mode Sombre**) à une architecture full-stack sécurisée (**Next.js App Router + Supabase Auth & PostgreSQL RLS**) dotée d'un **mode hybride Cloud / Démonstration** permettant de tester l'intégralité des fonctionnalités en un clic sans configuration préalable.

---

## Fonctionnalités principales

### 1. Pipeline commercial interactif (`/pipeline`)
- **Tableau Kanban en 5 étapes** : *Qualification (25 %)*, *Cadrage (50 %)*, *Proposition (70 %)*, *Négociation (85 %)* et *Mandat signé (100 %)*.
- **Drag & Drop avancé** : réordonnancement intra-colonne (priorité libre) et déplacement inter-colonnes avec recalcul automatique du chiffre d'affaires pondéré.
- **Contrôles rapides & accessibilité** : boutons de priorité (*Monter / Descendre*), bascule d'étape directe (*Reculer / Avancer*), filtres par portefeuille/montant/probabilité et **vue Registre tabulaire**.

### 2. Fiche Dossier 360° & Propositions PDF (`/deals/[id]`)
- **Synthèse financière** : honoraires HT, probabilité de closing, valeur pondérée, échéance de relance et progression d'étape en un clic.
- **Journal d'activité horodaté** : consignation des notes d'associés, comptes-rendus d'appels et relances avec filtrage par catégorie.
- **Génération de Lettre de Mission PDF** : export instantané d'une proposition commerciale structurée et chiffrée au nom du cabinet via `jsPDF`.
- **Suppression sécurisée** : modale de confirmation dédiée avec rappel du montant et du client avant retrait définitif.

### 3. Répertoire des Comptes & Décideurs (`/clients`)
- **CRUD complet des sociétés** : création, **modification complète en modale** (raison sociale, secteur, ville, interlocuteur, fonction, e-mail, téléphone, volume d'affaires HT, conditions de règlement, statut) et suppression avec modale de confirmation responsive.
- **Synchronisation bidirectionnelle** : toute mise à jour d'une société répercute automatiquement les coordonnées du décideur et le nom du compte sur les mandats associés du pipeline.
- **Export CSV compatible Excel** : extraction encodée en UTF-8 BOM avec échappement anti-injection de formules CSV (`=`, `+`, `-`, `@`).

### 4. Trésorerie, Flux & Rapport Exécutif PDF (`/rapports`)
- **Projections de trésorerie sur 6 mois** : double visualisation interactive (* Barres comparatives * et * Courbes d'aires SVG *) croisant le **CA signé sécurisé** et le **flux pondéré prévisionnel** face à la cible mensuelle du cabinet.
- ** Simulateur de closing en temps réel** : sélectionnez ou désélectionnez les dossiers en négociation ou proposition pour visualiser instantanément l'impact sur l'objectif trimestriel.
- **Export PDF « Synthèse Financière »** : génération d'un rapport exécutif A4 complet (KPIs consolidés, tableau prévisionnel sur 6 mois et portefeuille de mandats actifs).

### 5. Expérience Utilisateur & Design System
- **Thème Clair & Mode Sombre (« Noble Emerald Dark »)** : bascule instantanée depuis la barre supérieure, les pages d'authentification ou les paramètres, avec persistance sans flash (`anti-FOUC`).
- **Palette de commandes globale (`Ctrl+K` / `⌘K`)** : recherche instantanée de dossiers, sociétés, décideurs et actions rapides au clavier.
- **Responsive Mobile-First** : barre de navigation basse sur mobile, sélecteur d'étapes Kanban par onglets tactiles et modales adaptatives.

---

## Architecture Backend & Cybersécurité

- **Authentification Supabase SSR (`@supabase/ssr`)** :
  - Connexion et inscription par **E-mail / Mot de passe** et **Google OAuth 2.0 (flux PKCE)**.
  - Synchronisation temps réel avec les tables PostgreSQL (`verve_profiles`, `verve_companies`, `verve_deals`, `verve_activities`, `verve_tasks`, `verve_relances`).
- **Isolation multi-tenant stricte (Row Level Security)** :
  - Politiques PostgreSQL `USING (auth.uid() = user_id)` et `WITH CHECK (auth.uid() = user_id)` sur toutes les tables + trigger `SECURITY DEFINER` avec `search_path = public` verrouillé.
- **Défense en profondeur (Audit OWASP)** :
  - **Middleware Edge « Default-Deny »** : protection par défaut de toutes les routes applicatives et nettoyage complet du `localStorage` à la déconnexion.
  - **En-têtes HTTP de sécurité** : `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` et `Permissions-Policy`.
  - **Protection anti-Open Redirect & Host Header Poisoning** sur le callback OAuth (`/auth/callback`) et la redirection post-login.
  - **Cron Keep-Alive sécurisé (`/api/keepalive`)** : maintien en éveil de la base Supabase planifié dans `vercel.json` (`0 8 * * *`) avec support d'authentification `Bearer CRON_SECRET`.

---

## Stack technique

- **Framework** : Next.js 15 (App Router) & React 19
- **Langage** : TypeScript 5 (typage strict)
- **Styles & Typographie** : Tailwind CSS + `next/font/google` (*Outfit* & *Plus Jakarta Sans*)
- **Backend & Auth** : Supabase (`@supabase/supabase-js`, `@supabase/ssr`, PostgreSQL RLS)
- **Génération documentaire** : `jsPDF` (Lettres de mission & Bilans financiers PDF)
- **Icônes** : `lucide-react`

---

## Installation & Démarrage rapide

### 1. Cloner et installer les dépendances

```bash
git clone https://github.com/Konrad-Chirel/verve-crm.git
cd verve-crm
npm install
```

### 2. Configurer les variables d'environnement

Copiez le fichier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Renseignez vos identifiants Supabase (ou laissez vide pour utiliser uniquement le mode démonstration local) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
NEXT_PUBLIC_SITE_URL=https://verve-crm.vercel.app
CRON_SECRET=votre-secret-cron-optionnel
```

### 3. Initialiser la base PostgreSQL (Supabase)

Exécutez le script SQL [supabase/schema.sql](./supabase/schema.sql) dans l'éditeur SQL de votre projet Supabase pour créer les tables, les politiques RLS et le trigger de création automatique de profil.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```text
verve-crm/
├── .github/workflows/ci.yml  # Pipeline CI (TypeScript, Audit sécurité, Build Next.js)
├── supabase/
│   └── schema.sql            # Schéma PostgreSQL + Politiques RLS (USING & WITH CHECK)
├── src/
│   ├── app/
│   │   ├── api/keepalive/    # Route Cron de maintien en activité Supabase
│   │   ├── auth/callback/    # Callback OAuth PKCE sécurisé
│   │   ├── clients/          # Répertoire des comptes (CRUD, synchro deals, export CSV)
│   │   ├── dashboard/        # Synthèse exécutive & feuille de route du jour
│   │   ├── deals/[id]/       # Fiche dossier 360°, journal & PDF lettre de mission
│   │   ├── login/            # Authentification & accès démo en un clic
│   │   ├── parametres/       # Objectifs du cabinet, thème Clair/Sombre & statut Cloud
│   │   ├── pipeline/         # Tableau Kanban 5 étapes & vue Registre
│   │   ├── rapports/         # Trésorerie, simulateur de closing & rapport PDF
│   │   ├── register/         # Création de compte cabinet
│   │   ├── error.tsx         # Garde-fou d'erreur runtime
│   │   ├── icon.tsx          # Favicon dynamique Verve
│   │   ├── loading.tsx       # Squelette de chargement fluide
│   │   ├── not-found.tsx     # Page 404 personnalisée
│   │   ├── opengraph-image.tsx # Vignette sociale OpenGraph 1200x630
│   │   ├── robots.ts         # Règles d'indexation robots.txt
│   │   └── sitemap.ts        # Plan de site dynamique sitemap.xml
│   ├── components/
│   │   ├── layout/           # AppShell, Sidebar, Topbar, MobileNav, CommandPalette
│   │   ├── modals/           # Modales de création (Nouveau Dossier, Nouvelle Société)
│   │   ├── rapports/         # Graphiques financiers interactifs (Barres & Aires SVG)
│   │   └── ui/               # Système de composants (Button, Input, StageChip...)
│   ├── context/              # CRMContext (synchro Supabase + localStorage + Thème)
│   ├── lib/                  # Clients Supabase SSR, générateur PDF, utilitaires
│   └── middleware.ts         # Middleware Edge d'authentification Default-Deny
└── vercel.json               # Planification du Cron quotidien (/api/keepalive)
```

## Licence

MIT — Réalisé par **Chirel Konrad**.
