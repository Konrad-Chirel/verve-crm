'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MOCK_DEALS,
  MOCK_COMPANIES,
  MOCK_RELANCES,
  MOCK_ACTIVITIES,
  STAGES,
  type Deal,
  type Company,
  type Relance,
  type Activity,
  type StageId,
} from '@/lib/mock-data';
import { BRAND } from '@/lib/brand';
import { CheckCircle2 } from 'lucide-react';

export interface UserProfile {
  name: string;
  role: string;
  agency: string;
  email: string;
  monthlyTarget: number;
  quarterlyTarget: number;
}

export interface CRMNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  dealId: string;
  read: boolean;
}

interface CRMContextType {
  deals: Deal[];
  companies: Company[];
  relances: Relance[];
  activities: Activity[];
  profile: UserProfile;
  notifications: CRMNotification[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  addDeal: (input: {
    title: string;
    companyName: string;
    contactName: string;
    contactRole?: string;
    contactEmail?: string;
    contactPhone?: string;
    amount: number;
    stageId: StageId;
    nextAction?: string;
    notes?: string;
  }) => Deal;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  moveDealStage: (id: string, nextStageId: StageId) => void;
  reorderDeals: (
    draggedDealId: string,
    targetDealId: string | null,
    position: 'before' | 'after',
    targetStageId?: StageId
  ) => void;
  moveDealPriority: (dealId: string, direction: 'up' | 'down') => void;
  deleteDeal: (id: string) => void;
  addCompany: (input: {
    name: string;
    sector: string;
    city: string;
    contactName: string;
    contactRole: string;
    contactEmail: string;
    contactPhone: string;
    cumulativeValue: number;
    paymentTerms: string;
    status: Company['status'];
  }) => Company;
  deleteCompany: (id: string) => void;
  toggleRelance: (id: string) => void;
  postponeRelance: (id: string, nextTimeSlot: string) => void;
  addRelance: (rel: Omit<Relance, 'id' | 'done'>) => void;
  addActivity: (act: Omit<Activity, 'id'>) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'verve_crm_state_v2';

const INITIAL_PROFILE: UserProfile = {
  name: BRAND.user.name,
  role: BRAND.user.role,
  agency: BRAND.user.agency,
  email: 'konrad@ateliernova.fr',
  monthlyTarget: 50000,
  quarterlyTarget: 160000,
};

const INITIAL_NOTIFICATIONS: CRMNotification[] = [
  {
    id: 'notif-1',
    title: 'Relance prioritaire — Lumina Studio',
    description: 'Proposition de 28 000 € transmise il y a 4j. Appel prévu à 10h30.',
    time: 'Il y a 15 min',
    dealId: 'deal-lumina',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Contrat signé — VeloTech (35 000 €)',
    description: 'Acompte de 40% réceptionné. Lancement confirmé au 1er avril.',
    time: 'Hier, 16h20',
    dealId: 'deal-11',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Validation juridique — Nexus Conseil',
    description: 'Alexandre Monet attend le retour sur le calendrier Q2 (22 000 €).',
    time: 'Hier, 11h40',
    dealId: 'deal-9',
    read: false,
  },
];

const CRMContext = createContext<CRMContextType | undefined>(undefined);

function getInitials(text: string): string {
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [relances, setRelances] = useState<Relance[]>(MOCK_RELANCES);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [notifications, setNotifications] = useState<CRMNotification[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.deals) && parsed.deals.length > 0) setDeals(parsed.deals);
        if (Array.isArray(parsed.companies) && parsed.companies.length > 0)
          setCompanies(parsed.companies);
        if (Array.isArray(parsed.relances)) setRelances(parsed.relances);
        if (Array.isArray(parsed.activities)) setActivities(parsed.activities);
        if (parsed.profile) setProfile({ ...INITIAL_PROFILE, ...parsed.profile });
        if (Array.isArray(parsed.notifications)) setNotifications(parsed.notifications);
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist to localStorage on state changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          deals,
          companies,
          relances,
          activities,
          profile,
          notifications,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [deals, companies, relances, activities, profile, notifications, hydrated]);

  const addDeal: CRMContextType['addDeal'] = (input) => {
    const stageObj = STAGES.find((s) => s.id === input.stageId) || STAGES[0];
    const newId = `deal-${Date.now()}`;
    const companyInitials = getInitials(input.companyName);

    const newDeal: Deal = {
      id: newId,
      title: input.title,
      companyId: `comp-${Date.now()}`,
      companyName: input.companyName,
      companyCity: 'Paris',
      companySector: 'Conseil & Tech B2B',
      contactName: input.contactName,
      contactRole: input.contactRole || 'Directeur Général',
      contactEmail:
        input.contactEmail ||
        `${input.contactName.toLowerCase().replace(/[^a-z]/g, '.')}@${input.companyName
          .toLowerCase()
          .replace(/[^a-z]/g, '')}.fr`,
      contactPhone: input.contactPhone || '+33 6 45 12 89 30',
      companyInitials,
      companyColor: 'bg-primary text-white',
      amount: input.amount,
      probability: stageObj.defaultProbability,
      stageId: input.stageId,
      statusBadge: 'Nouveau dossier',
      nextAction: input.nextAction || 'Point de cadrage à fixer',
      metaInfo: [input.nextAction || 'Créé aujourd’hui'],
      notes:
        input.notes ||
        `Mandat créé pour ${input.companyName} avec ${input.contactName}.`,
      documentName: `Proposition_${input.companyName.replace(/\s+/g, '_')}.pdf`,
      documentSize: '2.4 Mo',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setDeals((prev) => [newDeal, ...prev]);

    // Ensure company also exists or updates in companies list
    setCompanies((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.name.toLowerCase() === input.companyName.toLowerCase()
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        const comp = updated[existingIdx];
        updated[existingIdx] = {
          ...comp,
          primaryDealId: newDeal.id,
          activeDealsCount: comp.activeDealsCount + 1,
          activeDealsDescription: newDeal.title,
          cumulativeValue: comp.cumulativeValue + newDeal.amount,
        };
        return updated;
      }
      const newComp: Company = {
        id: newDeal.companyId,
        primaryDealId: newDeal.id,
        name: input.companyName,
        sector: 'Services & Tech B2B',
        city: 'Paris',
        initials: companyInitials,
        color: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
        primaryContact: {
          name: input.contactName,
          role: input.contactRole || 'Directeur Général',
          email: newDeal.contactEmail,
          phone: newDeal.contactPhone,
          initials: getInitials(input.contactName),
        },
        activeDealsCount: 1,
        activeDealsDescription: newDeal.title,
        cumulativeValue: newDeal.amount,
        paymentTerms: 'Échéance 30j',
        status: input.stageId === 'won' ? 'Client Actif' : 'Offre en cours',
        statusColor: 'primary',
      };
      return [newComp, ...prev];
    });

    // Log activity
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      dealId: newDeal.id,
      companyName: newDeal.companyName,
      type: 'note',
      title: `Ouverture du dossier : ${newDeal.title}`,
      badgeText: stageObj.name,
      badgeStyle: 'mint',
      timestamp: 'À l’instant',
      content: `Dossier créé pour ${newDeal.companyName} (${newDeal.amount.toLocaleString(
        'fr-FR'
      )} € HT) — Contact : ${newDeal.contactName}.`,
      author: profile.name,
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast(`Mandat « ${newDeal.title} » ajouté au pipeline`);
    return newDeal;
  };

  const updateDeal: CRMContextType['updateDeal'] = (id, patch) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
    showToast('Modifications du dossier enregistrées');
  };

  const moveDealStage: CRMContextType['moveDealStage'] = (id, nextStageId) => {
    const stageObj = STAGES.find((s) => s.id === nextStageId) || STAGES[0];
    let targetDeal: Deal | undefined;

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          targetDeal = d;
          return {
            ...d,
            stageId: nextStageId,
            probability: stageObj.defaultProbability,
            statusBadge:
              nextStageId === 'won'
                ? 'Signé ce mois'
                : `Étape : ${stageObj.shortName}`,
            badgeType: nextStageId === 'won' ? 'normal' : d.badgeType,
          };
        }
        return d;
      })
    );

    if (targetDeal) {
      const act: Activity = {
        id: `act-${Date.now()}`,
        dealId: id,
        companyName: targetDeal.companyName,
        type: nextStageId === 'won' ? 'contrat' : 'note',
        title:
          nextStageId === 'won'
            ? `Mandat signé avec ${targetDeal.companyName}`
            : `Passage à l’étape « ${stageObj.name} »`,
        badgeText: stageObj.name,
        badgeStyle: nextStageId === 'won' ? 'mint' : 'lilac',
        timestamp: 'À l’instant',
        content: `Le dossier « ${targetDeal.title} » (${targetDeal.amount.toLocaleString(
          'fr-FR'
        )} €) est passé à l’étape ${stageObj.name} (probabilité ${
          stageObj.defaultProbability
        }%).`,
        author: profile.name,
      };
      setActivities((prev) => [act, ...prev]);
    }

    showToast(`Étape mise à jour : ${stageObj.name}`);
  };

  const reorderDeals: CRMContextType['reorderDeals'] = (
    draggedDealId,
    targetDealId,
    position,
    targetStageId
  ) => {
    if (draggedDealId === targetDealId) return;

    let targetDealStageName = '';
    let stageChanged = false;
    let targetDealTitle = '';
    let targetCompanyName = '';

    setDeals((prev) => {
      const draggedIndex = prev.findIndex((d) => d.id === draggedDealId);
      if (draggedIndex === -1) return prev;

      const draggedDeal = prev[draggedIndex];
      targetDealTitle = draggedDeal.title;
      targetCompanyName = draggedDeal.companyName;
      const targetDeal = targetDealId ? prev.find((d) => d.id === targetDealId) : undefined;

      const finalStageId = targetStageId || targetDeal?.stageId || draggedDeal.stageId;
      stageChanged = draggedDeal.stageId !== finalStageId;
      const stageObj = STAGES.find((s) => s.id === finalStageId) || STAGES[0];
      targetDealStageName = stageObj.name;

      const updatedDeal: Deal = stageChanged
        ? {
            ...draggedDeal,
            stageId: finalStageId,
            probability: stageObj.defaultProbability,
            statusBadge:
              finalStageId === 'won'
                ? 'Signé ce mois'
                : `Étape : ${stageObj.shortName}`,
            badgeType: finalStageId === 'won' ? 'normal' : draggedDeal.badgeType,
          }
        : draggedDeal;

      // Filter out dragged deal from current array
      const listWithoutDragged = prev.filter((d) => d.id !== draggedDealId);

      // If targetDealId is provided, find its index
      if (targetDealId) {
        const targetIndex = listWithoutDragged.findIndex((d) => d.id === targetDealId);
        if (targetIndex !== -1) {
          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
          const nextList = [...listWithoutDragged];
          nextList.splice(insertIndex, 0, updatedDeal);
          return nextList;
        }
      }

      // If no target card (e.g. dropped on empty column or column bottom), append to end of that stage
      const lastIndexOfStage = listWithoutDragged.reduce<number>(
        (lastIdx, item, idx) => (item.stageId === finalStageId ? idx : lastIdx),
        -1
      );
      if (lastIndexOfStage === -1) {
        return [...listWithoutDragged, updatedDeal];
      }
      const nextList = [...listWithoutDragged];
      nextList.splice(lastIndexOfStage + 1, 0, updatedDeal);
      return nextList;
    });

    if (stageChanged && targetDealStageName) {
      const act: Activity = {
        id: `act-${Date.now()}`,
        dealId: draggedDealId,
        companyName: targetCompanyName,
        type: targetStageId === 'won' ? 'contrat' : 'note',
        title:
          targetStageId === 'won'
            ? `Mandat signé avec ${targetCompanyName}`
            : `Passage à l’étape « ${targetDealStageName} »`,
        badgeText: targetDealStageName,
        badgeStyle: targetStageId === 'won' ? 'mint' : 'lilac',
        timestamp: 'À l’instant',
        content: `Le dossier « ${targetDealTitle} » est passé à l’étape ${targetDealStageName}.`,
        author: profile.name,
      };
      setActivities((prev) => [act, ...prev]);
      showToast(`Dossier « ${targetCompanyName} » transféré vers ${targetDealStageName}`);
    } else {
      showToast(`Priorité mise à jour dans « ${targetDealStageName} »`);
    }
  };

  const moveDealPriority: CRMContextType['moveDealPriority'] = (dealId, direction) => {
    setDeals((prev) => {
      const deal = prev.find((d) => d.id === dealId);
      if (!deal) return prev;

      const stageDeals = prev.filter((d) => d.stageId === deal.stageId);
      const indexInStage = stageDeals.findIndex((d) => d.id === dealId);

      if (direction === 'up' && indexInStage === 0) return prev;
      if (direction === 'down' && indexInStage === stageDeals.length - 1) return prev;

      const neighborIndexInStage = direction === 'up' ? indexInStage - 1 : indexInStage + 1;
      const neighbor = stageDeals[neighborIndexInStage];
      if (!neighbor) return prev;

      const currentIndex = prev.findIndex((d) => d.id === dealId);
      const neighborIndex = prev.findIndex((d) => d.id === neighbor.id);

      const next = [...prev];
      next[currentIndex] = neighbor;
      next[neighborIndex] = deal;
      return next;
    });

    showToast(`Priorité ajustée dans l'étape`);
  };

  const deleteDeal: CRMContextType['deleteDeal'] = (id) => {
    const target = deals.find((d) => d.id === id);
    setDeals((prev) => prev.filter((d) => d.id !== id));
    if (target) {
      showToast(`Dossier « ${target.title} » archivé`);
    }
  };

  const addCompany: CRMContextType['addCompany'] = (input) => {
    const newId = `comp-${Date.now()}`;
    const newDealId = `deal-${Date.now() + 1}`;
    const initials = getInitials(input.name);

    const newCompany: Company = {
      id: newId,
      primaryDealId: newDealId,
      name: input.name,
      sector: input.sector,
      city: input.city,
      initials,
      color: 'bg-primary text-white',
      primaryContact: {
        name: input.contactName,
        role: input.contactRole,
        email: input.contactEmail,
        phone: input.contactPhone,
        initials: getInitials(input.contactName),
      },
      activeDealsCount: 1,
      activeDealsDescription: `Accompagnement ${input.name}`,
      cumulativeValue: input.cumulativeValue,
      paymentTerms: input.paymentTerms || 'Échéance 30j',
      status: input.status,
      statusColor: 'primary',
    };

    const companionDeal: Deal = {
      id: newDealId,
      title: `Accompagnement ${input.name}`,
      companyId: newId,
      companyName: input.name,
      companyCity: input.city,
      companySector: input.sector,
      contactName: input.contactName,
      contactRole: input.contactRole,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      companyInitials: initials,
      companyColor: 'bg-primary text-white',
      amount: input.cumulativeValue,
      probability: input.status === 'Client Actif' || input.status === 'Client Récurrent' ? 100 : 50,
      stageId:
        input.status === 'Client Actif' || input.status === 'Client Récurrent'
          ? 'won'
          : input.status === 'Négociation'
          ? 'negotiation'
          : 'discovery',
      statusBadge: input.status,
      nextAction: 'Premier point de suivi',
      metaInfo: ['Compte ajouté au répertoire'],
      notes: `Compte client créé dans le répertoire pour ${input.name} (${input.sector}, ${input.city}).`,
      documentName: `Fiche_Compte_${input.name.replace(/\s+/g, '_')}.pdf`,
      documentSize: '1.8 Mo',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setCompanies((prev) => [newCompany, ...prev]);
    setDeals((prev) => [companionDeal, ...prev]);
    showToast(`Entreprise « ${input.name} » ajoutée au répertoire`);
    return newCompany;
  };

  const deleteCompany: CRMContextType['deleteCompany'] = (id) => {
    const target = companies.find((c) => c.id === id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      showToast(`Entreprise « ${target.name} » retirée du répertoire`);
    }
  };

  const toggleRelance: CRMContextType['toggleRelance'] = (id) => {
    setRelances((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextDone = !item.done;
          showToast(
            nextDone
              ? `Suivi validé pour ${item.contactName} (${item.companyName})`
              : `Suivi réactivé pour ${item.contactName}`
          );
          return { ...item, done: nextDone };
        }
        return item;
      })
    );
  };

  const postponeRelance: CRMContextType['postponeRelance'] = (id, nextTimeSlot) => {
    setRelances((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          showToast(`Créneau de ${item.contactName} reporté à ${nextTimeSlot}`);
          return { ...item, timeSlot: nextTimeSlot };
        }
        return item;
      })
    );
  };

  const addRelance: CRMContextType['addRelance'] = (rel) => {
    const newRel: Relance = {
      ...rel,
      id: `rel-${Date.now()}`,
      done: false,
    };
    setRelances((prev) => [newRel, ...prev]);
    showToast(`Relance programmée à ${rel.timeSlot} avec ${rel.contactName}`);
  };

  const addActivity: CRMContextType['addActivity'] = (act) => {
    const newAct: Activity = {
      ...act,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast('Interaction enregistrée au journal du dossier');
  };

  const updateProfile: CRMContextType['updateProfile'] = (patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
    showToast('Paramètres du cabinet mis à jour');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications marquées comme lues');
  };

  const resetDemoData = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setDeals(MOCK_DEALS);
    setCompanies(MOCK_COMPANIES);
    setRelances(MOCK_RELANCES);
    setActivities(MOCK_ACTIVITIES);
    setProfile(INITIAL_PROFILE);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Données de démonstration réinitialisées');
  };

  return (
    <CRMContext.Provider
      value={{
        deals,
        companies,
        relances,
        activities,
        profile,
        notifications,
        toastMessage,
        showToast,
        addDeal,
        updateDeal,
        moveDealStage,
        reorderDeals,
        moveDealPriority,
        deleteDeal,
        addCompany,
        deleteCompany,
        toggleRelance,
        postponeRelance,
        addRelance,
        addActivity,
        updateProfile,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
      {/* Global Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[60] px-4 py-3 rounded-full bg-[#005d42] text-white text-xs font-semibold shadow-lg border border-[#10B981]/40 flex items-center gap-2.5 animate-fade-up max-w-[92vw]">
          <CheckCircle2 className="w-4 h-4 text-[#9ffdd3] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
