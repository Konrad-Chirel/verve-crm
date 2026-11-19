export type StageId = 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won';

export interface Deal {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyCity?: string;
  companySector?: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  contactAvatar?: string;
  companyInitials: string;
  companyColor: string;
  amount: number;
  probability: number;
  stageId: StageId;
  statusBadge: string;
  statusBadgeColor?: string;
  badgeType?: 'hot' | 'normal' | 'urgent';
  nextAction?: string;
  nextActionDate?: string;
  metaInfo?: string[];
  notes?: string;
  documentName?: string;
  documentSize?: string;
  documentPath?: string;
  createdAt: string;
}

export interface Stage {
  id: StageId;
  number: number;
  name: string;
  shortName: string;
  colorHex: string;
  chipBg: string;
  chipText: string;
  dotColor: string;
  defaultProbability: number;
}

export interface Relance {
  id: string;
  dealId: string;
  timeSlot: string;
  timeLabel: string;
  contactName: string;
  contactRole: string;
  companyName: string;
  companyInitials: string;
  companyColor: string;
  avatarUrl: string;
  dealTitle: string;
  contextLine: string;
  amount: number;
  statusTag: string;
  actionType: 'call' | 'email' | 'dossier';
  actionLabel: string;
  done: boolean;
}

export interface Company {
  id: string;
  primaryDealId: string;
  name: string;
  sector: string;
  city: string;
  initials: string;
  color: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    initials: string;
  };
  activeDealsCount: number;
  activeDealsDescription: string;
  cumulativeValue: number;
  paymentTerms: string;
  status: 'Offre en cours' | 'Client Récurrent' | 'Négociation' | 'Client Actif' | 'Découverte';
  statusColor: 'stage-3' | 'primary' | 'stage-4' | 'stage-2';
}

export interface Activity {
  id: string;
  dealId?: string;
  companyName?: string;
  type: 'relance' | 'visio' | 'appel' | 'note' | 'contrat';
  title: string;
  badgeText: string;
  badgeStyle: 'urgent' | 'mint' | 'lilac' | 'amber';
  timestamp: string;
  duration?: string;
  content: string;
  assignedTo?: string;
  attachment?: {
    name: string;
    size: string;
    time?: string;
    path?: string;
  };
  status?: string;
  author: string;
}

export const STAGES: Stage[] = [
  {
    id: 'lead',
    number: 1,
    name: 'Qualification',
    shortName: 'Qualification',
    colorHex: '#0D9488',
    chipBg: '#F0FDFA',
    chipText: '#0F766E',
    dotColor: '#0D9488',
    defaultProbability: 25,
  },
  {
    id: 'discovery',
    number: 2,
    name: 'Cadrage',
    shortName: 'Cadrage',
    colorHex: '#0284C7',
    chipBg: '#F0F9FF',
    chipText: '#0369A1',
    dotColor: '#0284C7',
    defaultProbability: 50,
  },
  {
    id: 'proposal',
    number: 3,
    name: 'Proposition',
    shortName: 'Proposition',
    colorHex: '#D97706',
    chipBg: '#FFFBEB',
    chipText: '#B45309',
    dotColor: '#D97706',
    defaultProbability: 70,
  },
  {
    id: 'negotiation',
    number: 4,
    name: 'Négociation',
    shortName: 'Négociation',
    colorHex: '#059669',
    chipBg: '#ECFDF5',
    chipText: '#047857',
    dotColor: '#059669',
    defaultProbability: 85,
  },
  {
    id: 'won',
    number: 5,
    name: 'Mandat signé',
    shortName: 'Signé',
    colorHex: '#047857',
    chipBg: '#D1FAE5',
    chipText: '#065F46',
    dotColor: '#047857',
    defaultProbability: 100,
  },
];

export const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Cadrage Stratégique Tech',
    companyId: 'comp-solis',
    companyName: 'Solis Media',
    companyCity: 'Paris',
    companySector: 'Média & Édition Digitale',
    contactName: 'Marc Leroux',
    contactRole: 'VP Production',
    contactEmail: 'm.leroux@solismedia.fr',
    contactPhone: '+33 6 12 34 56 78',
    companyInitials: 'SM',
    companyColor: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    amount: 12000,
    probability: 20,
    stageId: 'lead',
    statusBadge: 'Reçu hier',
    nextAction: 'Demain à 11h00',
    metaInfo: ['Demain à 11h00', 'Cahier des charges reçu'],
    notes: 'Besoin d’un audit complet de la chaîne de publication avant refonte Q3.',
    documentName: 'Cahier_des_Charges_Solis_2026.pdf',
    documentSize: '2.1 Mo',
    createdAt: '2026-03-23',
  },
  {
    id: 'deal-2',
    title: 'Atelier Positionnement de Marque',
    companyId: 'comp-altis',
    companyName: 'Altis Lab',
    companyCity: 'Bordeaux',
    companySector: 'Biotech & Santé',
    contactName: 'Claire Delacroix',
    contactRole: 'Directrice Marque',
    contactEmail: 'claire@altislab.com',
    contactPhone: '+33 6 98 76 54 32',
    companyInitials: 'AL',
    companyColor: 'bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]',
    amount: 7500,
    probability: 25,
    stageId: 'lead',
    statusBadge: 'Approche directe',
    nextAction: 'Relance à planifier',
    metaInfo: ['Relance à planifier'],
    notes: 'Série d’ateliers dirigeants pour structurer le discours institutionnel.',
    documentName: 'Note_Intention_AltisLab.pdf',
    documentSize: '1.4 Mo',
    createdAt: '2026-03-21',
  },
  {
    id: 'deal-3',
    title: 'Audit Acquisition & Visibilité',
    companyId: 'comp-neofin',
    companyName: 'NeoFin',
    companyCity: 'Paris',
    companySector: 'Fintech B2B',
    contactName: 'Arnaud Berthelot',
    contactRole: 'Chief Marketing Officer',
    contactEmail: 'arnaud@neofin.eu',
    contactPhone: '+33 6 45 67 89 01',
    companyInitials: 'NF',
    companyColor: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    amount: 4500,
    probability: 30,
    stageId: 'lead',
    statusBadge: 'Demande entrante',
    nextAction: 'Qualification vend. 10h',
    metaInfo: ['Qualification vend. 10h'],
    notes: 'Diagnostic SEO et parcours de conversion sur le simulateur crédit pro.',
    documentName: 'Diagnostic_Acquisition_NeoFin.pdf',
    documentSize: '1.8 Mo',
    createdAt: '2026-03-20',
  },
  {
    id: 'deal-4',
    title: 'Refonte Design System & Interface',
    companyId: 'comp-helia',
    companyName: 'Helia Cloud',
    companyCity: 'Lyon',
    companySector: 'Infrastructure Cloud',
    contactName: 'David Ségur',
    contactRole: 'Head of Product',
    contactEmail: 'david.s@heliacloud.io',
    contactPhone: '+33 6 56 78 90 12',
    companyInitials: 'HC',
    companyColor: 'bg-primary text-white',
    amount: 18000,
    probability: 50,
    stageId: 'discovery',
    statusBadge: 'Entretien le 26/03',
    nextAction: 'Appel fixé jeu. 14h30',
    metaInfo: ['Appel fixé jeu. 14h30', '2 annexes'],
    notes: 'Harmonisation de 45 composants React et documentation Storybook.',
    documentName: 'Audit_UI_HeliaCloud_v1.pdf',
    documentSize: '3.6 Mo',
    createdAt: '2026-03-18',
  },
  {
    id: 'deal-5',
    title: 'Accompagnement Structuration Produit',
    companyId: 'comp-archipel',
    companyName: 'Groupe Archipel',
    companyCity: 'Paris',
    companySector: 'Fonds d’Investissement',
    contactName: 'Marc Delorme',
    contactRole: 'Directeur Général',
    contactEmail: 'm.delorme@archipel.vc',
    contactPhone: '+33 6 67 89 01 23',
    companyInitials: 'GA',
    companyColor: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    amount: 22000,
    probability: 60,
    stageId: 'discovery',
    statusBadge: 'Budget validé',
    nextAction: 'Arbitrage acompte 10h30',
    metaInfo: ['Enveloppe 22 k€ validée'],
    notes: 'Portail LP et tableau de bord de suivi des participations.',
    documentName: 'Cadrage_Portail_Archipel.pdf',
    documentSize: '2.9 Mo',
    createdAt: '2026-03-15',
  },
  {
    id: 'deal-6',
    title: 'Diagnostic Expérience Client',
    companyId: 'comp-bloom',
    companyName: 'Bloom Retail',
    companyCity: 'Lille',
    companySector: 'Distribution Spécialisée',
    contactName: 'Élodie Tanguy',
    contactRole: 'Directrice Expérience Client',
    contactEmail: 'elodie@bloomretail.fr',
    contactPhone: '+33 6 78 90 12 34',
    companyInitials: 'BR',
    companyColor: 'bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]',
    amount: 6000,
    probability: 40,
    stageId: 'discovery',
    statusBadge: 'Présentation faite',
    nextAction: 'Point prévu vendredi',
    metaInfo: ['Point prévu vendredi'],
    notes: 'Cartographie du parcours omnicanal sur 18 points de vente.',
    documentName: 'Synthese_CX_Bloom.pdf',
    documentSize: '1.9 Mo',
    createdAt: '2026-03-12',
  },
  {
    id: 'deal-lumina',
    title: 'Refonte Identité & Plateforme Web B2B',
    companyId: 'comp-lumina',
    companyName: 'Lumina Studio',
    companyCity: 'Nantes',
    companySector: 'Studio Créatif & Architecture',
    contactName: 'Alexandre Dumas',
    contactRole: 'Co-fondateur & CEO',
    contactEmail: 'alexandre@luminastudio.fr',
    contactPhone: '+33 6 42 18 90 24',
    companyInitials: 'LS',
    companyColor: 'bg-primary text-white',
    amount: 28000,
    probability: 75,
    stageId: 'proposal',
    statusBadge: 'Relance ce jour',
    badgeType: 'urgent',
    nextAction: 'Appeler Alexandre à 10h30',
    metaInfo: ['J+4 après envoi', 'Devis v2 transmis'],
    notes:
      'L’équipe Lumina vise une mise en production avant fin juin en amont de leur levée Série A. Garantir le planning de 8 semaines lors de l’appel de ce matin.',
    documentName: 'Proposition_Commerciale_Verve_v2.pdf',
    documentSize: '4.2 Mo',
    createdAt: '2026-02-12',
  },
  {
    id: 'deal-8',
    title: 'Cadrage Architecture Data & IA',
    companyId: 'comp-zenith',
    companyName: 'Zenith Group',
    companyCity: 'Nantes',
    companySector: 'Holding Industrielle',
    contactName: 'Éléonore Blanc',
    contactRole: 'Directrice Innovation',
    contactEmail: 'e.blanc@zenith.com',
    contactPhone: '+33 6 89 01 23 45',
    companyInitials: 'ZG',
    companyColor: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    amount: 17000,
    probability: 65,
    stageId: 'proposal',
    statusBadge: 'Transmis il y a 2j',
    nextAction: 'Revue technique merc.',
    metaInfo: ['Consulté 4 fois par le comité'],
    notes: 'Mise en place d’un socle documentaire unifié pour 3 filiales.',
    documentName: 'Propale_Architecture_Zenith.pdf',
    documentSize: '3.1 Mo',
    createdAt: '2026-03-10',
  },
  {
    id: 'deal-9',
    title: 'Refonte Identité & Architecture de Marque',
    companyId: 'comp-nexus',
    companyName: 'Nexus Conseil',
    companyCity: 'Bruxelles',
    companySector: 'Cabinet Conseil Direction',
    contactName: 'Alexandre Monet',
    contactRole: 'Associé Gérant',
    contactEmail: 'a.monet@nexusgroup.be',
    contactPhone: '+32 2 543 21 00',
    companyInitials: 'NC',
    companyColor: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    amount: 22000,
    probability: 85,
    stageId: 'negotiation',
    statusBadge: 'Comité de direction',
    nextAction: 'Ajustement contrat 16h45',
    metaInfo: ['Ajustement contrat', 'Signature proche'],
    notes: 'Validation finale du calendrier de déploiement sur les bureaux de Bruxelles et Luxembourg.',
    documentName: 'Contrat_Cadre_Nexus_2026.pdf',
    documentSize: '2.7 Mo',
    createdAt: '2026-02-28',
  },
  {
    id: 'deal-10',
    title: 'Mandat Conseil Annuel',
    companyId: 'comp-kinetix',
    companyName: 'Kinetix Advisory',
    companyCity: 'Genève',
    companySector: 'Stratégie & Finance',
    contactName: 'Marc Vasseur',
    contactRole: 'Directeur Général',
    contactEmail: 'm.vasseur@kinetix.ch',
    contactPhone: '+41 22 765 43 21',
    companyInitials: 'KA',
    companyColor: 'bg-primary text-white',
    amount: 8000,
    probability: 80,
    stageId: 'negotiation',
    statusBadge: 'Validation juridique',
    nextAction: 'Retour juridique jeu.',
    metaInfo: ['Accords de confidentialité signés'],
    notes: 'Renouvellement de l’accompagnement trimestriel direction générale.',
    documentName: 'Avenant_Conseil_Kinetix.pdf',
    documentSize: '1.5 Mo',
    createdAt: '2026-03-01',
  },
  {
    id: 'deal-11',
    title: 'Déploiement Portail Client Q3',
    companyId: 'comp-veloce',
    companyName: 'VeloTech',
    companyCity: 'Lyon',
    companySector: 'SaaS Logistique',
    contactName: 'Sophie Renoir',
    contactRole: 'VP Finance',
    contactEmail: 's.renoir@velotech.com',
    contactPhone: '+33 6 33 22 11 00',
    companyInitials: 'VT',
    companyColor: 'bg-primary text-white',
    amount: 35000,
    probability: 100,
    stageId: 'won',
    statusBadge: 'Signé ce mois',
    nextAction: 'Démarrage 1er avril',
    metaInfo: ['Démarrage 1er avril', 'Acompte encaissé'],
    notes: 'Contrat signé et acompte de 40% réceptionné. Kick-off programmé le 1er avril.',
    documentName: 'Contrat_Signe_VeloTech_Q3.pdf',
    documentSize: '5.0 Mo',
    createdAt: '2026-03-05',
  },
  {
    id: 'deal-12',
    title: 'Audit Organisationnel & Outils Internes',
    companyId: 'comp-kinetix',
    companyName: 'Kinetix Advisory',
    companyCity: 'Genève',
    companySector: 'Stratégie & Finance',
    contactName: 'Marc Vasseur',
    contactRole: 'Directeur Général',
    contactEmail: 'm.vasseur@kinetix.ch',
    contactPhone: '+41 22 765 43 21',
    companyInitials: 'KA',
    companyColor: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    amount: 15000,
    probability: 100,
    stageId: 'won',
    statusBadge: 'En production',
    nextAction: 'Livrable intermédiaire ven.',
    metaInfo: ['Mission en cours'],
    notes: 'Phase 2 de l’audit interne en cours de livraison.',
    documentName: 'Livrable_Phase1_Kinetix.pdf',
    documentSize: '3.8 Mo',
    createdAt: '2026-02-15',
  },
];

export const MOCK_RELANCES: Relance[] = [
  {
    id: 'rel-1',
    dealId: 'deal-lumina',
    timeSlot: '10h30',
    timeLabel: 'Matin',
    contactName: 'Alexandre Dumas',
    contactRole: 'Co-fondateur & CEO',
    companyName: 'Lumina Studio',
    companyInitials: 'LS',
    companyColor: 'bg-primary text-white',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dealTitle: 'Refonte Identité & Plateforme Web B2B',
    contextLine: 'Proposition v2 transmise il y a 4j — Arbitrage sur le calendrier de livraison',
    amount: 28000,
    statusTag: 'Proposition v2',
    actionType: 'call',
    actionLabel: 'Appeler',
    done: false,
  },
  {
    id: 'rel-2',
    dealId: 'deal-5',
    timeSlot: '14h00',
    timeLabel: 'Après-midi',
    contactName: 'Marc Delorme',
    contactRole: 'Directeur Général',
    companyName: 'Groupe Archipel',
    companyInitials: 'GA',
    companyColor: 'bg-[#ECFDF5] text-[#047857]',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dealTitle: 'Accompagnement Structuration Produit',
    contextLine: 'Décideur final — Validation de l’acompte de démarrage Q2',
    amount: 22000,
    statusTag: 'Cadrage validé',
    actionType: 'call',
    actionLabel: 'Appeler',
    done: false,
  },
  {
    id: 'rel-3',
    dealId: 'deal-9',
    timeSlot: '16h45',
    timeLabel: 'Fin de journée',
    contactName: 'Alexandre Monet',
    contactRole: 'Associé Gérant',
    companyName: 'Nexus Conseil',
    companyInitials: 'NC',
    companyColor: 'bg-[#F0FDFA] text-[#0F766E]',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    dealTitle: 'Refonte Identité & Architecture de Marque',
    contextLine: 'Revue finale des clauses du contrat cadre avant signature',
    amount: 22000,
    statusTag: 'Négociation finale',
    actionType: 'dossier',
    actionLabel: 'Ouvrir',
    done: false,
  },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'comp-lumina',
    primaryDealId: 'deal-lumina',
    name: 'Lumina Studio',
    sector: 'Studio Créatif & Architecture',
    city: 'Nantes',
    initials: 'LS',
    color: 'bg-primary text-white',
    primaryContact: {
      name: 'Alexandre Dumas',
      role: 'Co-fondateur & CEO',
      email: 'alexandre@luminastudio.fr',
      phone: '+33 6 42 18 90 24',
      initials: 'AD',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Refonte Identité & Plateforme Web B2B',
    cumulativeValue: 56000,
    paymentTerms: 'Échéance 30j',
    status: 'Offre en cours',
    statusColor: 'stage-3',
  },
  {
    id: 'comp-veloce',
    primaryDealId: 'deal-11',
    name: 'VeloTech',
    sector: 'SaaS Logistique',
    city: 'Lyon',
    initials: 'VT',
    color: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    primaryContact: {
      name: 'Sophie Renoir',
      role: 'VP Finance',
      email: 's.renoir@velotech.com',
      phone: '+33 6 33 22 11 00',
      initials: 'SR',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Déploiement Portail Client Q3',
    cumulativeValue: 115000,
    paymentTerms: 'Contrat annuel',
    status: 'Client Récurrent',
    statusColor: 'primary',
  },
  {
    id: 'comp-nexus',
    primaryDealId: 'deal-9',
    name: 'Nexus Conseil',
    sector: 'Cabinet Conseil Direction',
    city: 'Bruxelles',
    initials: 'NC',
    color: 'bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]',
    primaryContact: {
      name: 'Alexandre Monet',
      role: 'Associé Gérant',
      email: 'a.monet@nexusgroup.be',
      phone: '+32 2 543 21 00',
      initials: 'AM',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Refonte Identité & Architecture de Marque',
    cumulativeValue: 48000,
    paymentTerms: 'Probabilité 85%',
    status: 'Négociation',
    statusColor: 'stage-4',
  },
  {
    id: 'comp-kinetix',
    primaryDealId: 'deal-10',
    name: 'Kinetix Advisory',
    sector: 'Stratégie & Finance',
    city: 'Genève',
    initials: 'KA',
    color: 'bg-primary text-white',
    primaryContact: {
      name: 'Marc Vasseur',
      role: 'Directeur Général',
      email: 'm.vasseur@kinetix.ch',
      phone: '+41 22 765 43 21',
      initials: 'MV',
    },
    activeDealsCount: 2,
    activeDealsDescription: '2 mandats actifs en production',
    cumulativeValue: 82500,
    paymentTerms: 'Compte cadre',
    status: 'Client Actif',
    statusColor: 'primary',
  },
  {
    id: 'comp-archipel',
    primaryDealId: 'deal-5',
    name: 'Groupe Archipel',
    sector: 'Fonds d’Investissement',
    city: 'Paris',
    initials: 'GA',
    color: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    primaryContact: {
      name: 'Marc Delorme',
      role: 'Directeur Général',
      email: 'm.delorme@archipel.vc',
      phone: '+33 6 67 89 01 23',
      initials: 'MD',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Accompagnement Structuration Produit',
    cumulativeValue: 64000,
    paymentTerms: 'Échéance 30j',
    status: 'Négociation',
    statusColor: 'stage-4',
  },
  {
    id: 'comp-helia',
    primaryDealId: 'deal-4',
    name: 'Helia Cloud',
    sector: 'Infrastructure Cloud',
    city: 'Lyon',
    initials: 'HC',
    color: 'bg-primary text-white',
    primaryContact: {
      name: 'David Ségur',
      role: 'Head of Product',
      email: 'david.s@heliacloud.io',
      phone: '+33 6 56 78 90 12',
      initials: 'DS',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Refonte Design System & Interface',
    cumulativeValue: 38000,
    paymentTerms: 'Acompte 40%',
    status: 'Client Actif',
    statusColor: 'primary',
  },
  {
    id: 'comp-zenith',
    primaryDealId: 'deal-8',
    name: 'Zenith Group',
    sector: 'Holding Industrielle',
    city: 'Nantes',
    initials: 'ZG',
    color: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    primaryContact: {
      name: 'Éléonore Blanc',
      role: 'Directrice Innovation',
      email: 'e.blanc@zenith.com',
      phone: '+33 6 89 01 23 45',
      initials: 'ÉB',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Cadrage Architecture Data & IA',
    cumulativeValue: 17000,
    paymentTerms: 'Potentiel groupe',
    status: 'Offre en cours',
    statusColor: 'stage-3',
  },
  {
    id: 'comp-solis',
    primaryDealId: 'deal-1',
    name: 'Solis Media',
    sector: 'Média & Édition Digitale',
    city: 'Paris',
    initials: 'SM',
    color: 'bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]',
    primaryContact: {
      name: 'Marc Leroux',
      role: 'VP Production',
      email: 'm.leroux@solismedia.fr',
      phone: '+33 6 12 34 56 78',
      initials: 'ML',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Cadrage Stratégique Tech',
    cumulativeValue: 12000,
    paymentTerms: 'Nouveau compte',
    status: 'Découverte',
    statusColor: 'stage-2',
  },
  {
    id: 'comp-altis',
    primaryDealId: 'deal-2',
    name: 'Altis Lab',
    sector: 'Biotech & Santé',
    city: 'Bordeaux',
    initials: 'AL',
    color: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    primaryContact: {
      name: 'Claire Delacroix',
      role: 'Directrice Marque',
      email: 'claire@altislab.com',
      phone: '+33 6 98 76 54 32',
      initials: 'CD',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Atelier Positionnement de Marque',
    cumulativeValue: 19500,
    paymentTerms: 'Échéance 30j',
    status: 'Découverte',
    statusColor: 'stage-2',
  },
  {
    id: 'comp-neofin',
    primaryDealId: 'deal-3',
    name: 'NeoFin',
    sector: 'Fintech B2B',
    city: 'Paris',
    initials: 'NF',
    color: 'bg-primary text-white',
    primaryContact: {
      name: 'Arnaud Berthelot',
      role: 'Chief Marketing Officer',
      email: 'arnaud@neofin.eu',
      phone: '+33 6 45 67 89 01',
      initials: 'AB',
    },
    activeDealsCount: 1,
    activeDealsDescription: 'Audit Acquisition & Visibilité',
    cumulativeValue: 29000,
    paymentTerms: 'Client Récurrent',
    status: 'Client Récurrent',
    statusColor: 'primary',
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    dealId: 'deal-lumina',
    companyName: 'Lumina Studio',
    type: 'relance',
    title: 'Appel de suivi programmé',
    badgeText: 'Relance prioritaire',
    badgeStyle: 'urgent',
    timestamp: 'Aujourd’hui, 10h30',
    content:
      'Point téléphonique sur l’architecture CMS headless et le calendrier de mise en production. Alexandre valide l’arbitrage technique avec son CTO ce matin.',
    assignedTo: 'Konrad B.',
    status: 'À traiter',
    author: 'Konrad B.',
  },
  {
    id: 'act-2',
    dealId: 'deal-lumina',
    companyName: 'Lumina Studio',
    type: 'visio',
    title: 'Réunion d’alignement stratégique et présentation du chiffrage',
    badgeText: 'Visioconférence',
    badgeStyle: 'mint',
    timestamp: '22 mars, 14h15',
    duration: '45 min',
    content:
      'Validation complète du périmètre par Alexandre et Clara. Attente principale : garantie d’une mise en ligne mi-juin avant le roadshow investisseurs. Proposition commerciale v2 (28 000 € HT) transmise à l’issue de la séance.',
    attachment: {
      name: 'Proposition_Commerciale_Verve_v2.pdf',
      size: '4.2 Mo • Transmis à 15h45',
    },
    author: 'Konrad B.',
  },
  {
    id: 'act-3',
    dealId: 'deal-11',
    companyName: 'VeloTech',
    type: 'contrat',
    title: 'Contrat signé et acompte réceptionné',
    badgeText: 'Mandat signé',
    badgeStyle: 'mint',
    timestamp: 'Hier, 16h20',
    content:
      'Signature électronique reçue de Sophie Renoir pour le déploiement du Portail Client Q3 (35 000 € HT). Réunion de lancement planifiée le 1er avril.',
    attachment: {
      name: 'Contrat_Signe_VeloTech_Q3.pdf',
      size: '5.0 Mo • Paraphé',
    },
    author: 'Konrad B.',
  },
  {
    id: 'act-4',
    dealId: 'deal-lumina',
    companyName: 'Lumina Studio',
    type: 'appel',
    title: 'Entretien initial de qualification',
    badgeText: 'Qualification',
    badgeStyle: 'lilac',
    timestamp: '18 mars, 11h00',
    content:
      'Enveloppe budgétaire confirmée autour de 30 000 € HT. Enjeu prioritaire : refondre l’identité et la plateforme d’acquisition B2B avant l’ouverture du tour de table Série A à l’automne.',
    author: 'Konrad B.',
  },
];
