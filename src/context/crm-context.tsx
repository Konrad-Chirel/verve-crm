'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
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
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2 } from 'lucide-react';

export interface UserProfile {
  name: string;
  role: string;
  agency: string;
  email: string;
  avatarUrl?: string;
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
  user: User | null;
  isDemoMode: boolean;
  isCloudSynced: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  deals: Deal[];
  companies: Company[];
  relances: Relance[];
  activities: Activity[];
  profile: UserProfile;
  notifications: CRMNotification[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  enableDemoMode: () => void;
  signOut: () => Promise<void>;
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
  updateCompany: (
    id: string,
    patch: {
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
    }
  ) => void;
  deleteCompany: (id: string) => void;
  toggleRelance: (id: string) => void;
  postponeRelance: (id: string, nextTimeSlot: string) => void;
  addRelance: (rel: Omit<Relance, 'id' | 'done'>) => void;
  deleteRelance: (id: string) => void;
  addActivity: (act: Omit<Activity, 'id'>) => void;
  deleteActivity: (id: string) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  exportBackup: () => void;
  importBackup: (rawJson: string) => boolean;
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

function mapDealToRow(d: Deal, userId: string, position = 0) {
  return {
    id: d.id,
    user_id: userId,
    title: d.title,
    company_id: d.companyId,
    company_name: d.companyName,
    company_city: d.companyCity || 'Paris',
    company_sector: d.companySector || 'Conseil & Tech B2B',
    contact_name: d.contactName,
    contact_role: d.contactRole,
    contact_email: d.contactEmail,
    contact_phone: d.contactPhone,
    company_initials: d.companyInitials,
    company_color: d.companyColor,
    amount: d.amount,
    probability: d.probability,
    stage_id: d.stageId,
    status_badge: d.statusBadge,
    badge_type: d.badgeType || 'normal',
    next_action: d.nextAction || '',
    next_action_date: d.nextActionDate || '',
    meta_info: d.metaInfo || [],
    notes: d.notes || '',
    document_name: d.documentName || '',
    document_size: d.documentSize || '',
    document_path: d.documentPath || '',
    position,
    created_at: d.createdAt,
  };
}

function mapRowToDeal(r: any): Deal {
  return {
    id: r.id,
    title: r.title,
    companyId: r.company_id || '',
    companyName: r.company_name,
    companyCity: r.company_city || 'Paris',
    companySector: r.company_sector || 'Conseil & Tech B2B',
    contactName: r.contact_name || '',
    contactRole: r.contact_role || 'Directeur Général',
    contactEmail: r.contact_email || '',
    contactPhone: r.contact_phone || '',
    companyInitials: r.company_initials || getInitials(r.company_name || 'VC'),
    companyColor: r.company_color || 'bg-primary text-white',
    amount: Number(r.amount) || 0,
    probability: Number(r.probability) ?? 25,
    stageId: (r.stage_id as StageId) || 'lead',
    statusBadge: r.status_badge || 'Dossier actif',
    badgeType: r.badge_type || 'normal',
    nextAction: r.next_action || undefined,
    nextActionDate: r.next_action_date || undefined,
    metaInfo: Array.isArray(r.meta_info) ? r.meta_info : [],
    notes: r.notes || undefined,
    documentName: r.document_name || undefined,
    documentSize: r.document_size || undefined,
    documentPath: r.document_path || undefined,
    createdAt: r.created_at || new Date().toISOString().slice(0, 10),
  };
}

function mapCompanyToRow(c: Company, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    primary_deal_id: c.primaryDealId,
    name: c.name,
    sector: c.sector,
    city: c.city,
    initials: c.initials,
    color: c.color,
    primary_contact: c.primaryContact,
    active_deals_count: c.activeDealsCount,
    active_deals_description: c.activeDealsDescription,
    cumulative_value: c.cumulativeValue,
    payment_terms: c.paymentTerms,
    status: c.status,
    status_color: c.statusColor,
  };
}

function mapRowToCompany(r: any): Company {
  return {
    id: r.id,
    primaryDealId: r.primary_deal_id || '',
    name: r.name,
    sector: r.sector || 'Services & Tech B2B',
    city: r.city || 'Paris',
    initials: r.initials || getInitials(r.name || 'VC'),
    color: r.color || 'bg-primary text-white',
    primaryContact: r.primary_contact || {
      name: 'Contact principal',
      role: 'Directeur Général',
      email: '',
      phone: '',
      initials: 'CP',
    },
    activeDealsCount: Number(r.active_deals_count) || 1,
    activeDealsDescription: r.active_deals_description || '',
    cumulativeValue: Number(r.cumulative_value) || 0,
    paymentTerms: r.payment_terms || 'Échéance 30j',
    status: r.status || 'Offre en cours',
    statusColor: r.status_color || 'primary',
  };
}

function mapRelanceToRow(r: Relance, userId: string) {
  return {
    id: r.id,
    user_id: userId,
    deal_id: r.dealId,
    time_slot: r.timeSlot,
    time_label: r.timeLabel,
    contact_name: r.contactName,
    contact_role: r.contactRole,
    company_name: r.companyName,
    company_initials: r.companyInitials,
    company_color: r.companyColor,
    avatar_url: r.avatarUrl,
    deal_title: r.dealTitle,
    context_line: r.contextLine,
    amount: r.amount,
    status_tag: r.statusTag,
    action_type: r.actionType,
    action_label: r.actionLabel,
    done: r.done,
  };
}

function mapRowToRelance(r: any): Relance {
  return {
    id: r.id,
    dealId: r.deal_id || '',
    timeSlot: r.time_slot || '10:00',
    timeLabel: r.time_label || 'Matinée',
    contactName: r.contact_name || '',
    contactRole: r.contact_role || '',
    companyName: r.company_name || '',
    companyInitials: r.company_initials || 'VC',
    companyColor: r.company_color || 'bg-primary text-white',
    avatarUrl: r.avatar_url || '',
    dealTitle: r.deal_title || '',
    contextLine: r.context_line || '',
    amount: Number(r.amount) || 0,
    statusTag: r.status_tag || 'Relance',
    actionType: r.action_type || 'call',
    actionLabel: r.action_label || 'Appeler',
    done: Boolean(r.done),
  };
}

function mapActivityToRow(a: Activity, userId: string) {
  return {
    id: a.id,
    user_id: userId,
    deal_id: a.dealId || '',
    company_name: a.companyName || '',
    type: a.type,
    title: a.title,
    badge_text: a.badgeText,
    badge_style: a.badgeStyle,
    timestamp: a.timestamp,
    duration: a.duration ?? null,
    content: a.content,
    assigned_to: a.assignedTo ?? null,
    attachment: a.attachment ?? null,
    status: a.status ?? null,
    author: a.author,
  };
}

function mapRowToActivity(r: any): Activity {
  return {
    id: r.id,
    dealId: r.deal_id || undefined,
    companyName: r.company_name || undefined,
    type: r.type || 'note',
    title: r.title,
    badgeText: r.badge_text || 'Note interne',
    badgeStyle: r.badge_style || 'mint',
    timestamp: r.timestamp || 'À l’instant',
    duration: r.duration || undefined,
    content: r.content || '',
    assignedTo: r.assigned_to || undefined,
    attachment: r.attachment || undefined,
    status: r.status || undefined,
    author: r.author || '',
  };
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

  const storageKeyForUser = useCallback(
    (uid?: string | null) => (uid ? `${STORAGE_KEY}_${uid}` : STORAGE_KEY),
    []
  );

  // Hydrate from localStorage + Supabase Auth / PostgreSQL on mount
  useEffect(() => {
    let mounted = true;

    const loadLocal = (uid?: string | null) => {
      try {
        const raw =
          window.localStorage.getItem(storageKeyForUser(uid)) ||
          window.localStorage.getItem(STORAGE_KEY);
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
      }
    };

    const loadFromSupabase = async (authUser: User) => {
      if (!supabase) return;
      const metaName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        INITIAL_PROFILE.name;
      const metaAgency = authUser.user_metadata?.agency_name || INITIAL_PROFILE.agency;
      const metaRole = authUser.user_metadata?.role || INITIAL_PROFILE.role;
      const metaEmail = authUser.email || INITIAL_PROFILE.email;
      const metaAvatar: string | undefined =
        authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || undefined;

      setProfile((prev) => ({
        ...prev,
        name: metaName,
        agency: metaAgency,
        role: metaRole,
        email: metaEmail,
        avatarUrl: metaAvatar,
      }));

      try {
        const [profRes, dealsRes, compRes, relRes, actRes] = await Promise.all([
          supabase.from('verve_profiles').select('*').eq('id', authUser.id).maybeSingle(),
          supabase
            .from('verve_deals')
            .select('*')
            .eq('user_id', authUser.id)
            .order('position', { ascending: true }),
          supabase.from('verve_companies').select('*').eq('user_id', authUser.id),
          supabase
            .from('verve_relances')
            .select('*')
            .eq('user_id', authUser.id)
            .order('time_slot', { ascending: true }),
          supabase
            .from('verve_activities')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false }),
        ]);

        if (!mounted) return;

        // If the `verve_*` tables exist in Supabase, sync with them
        if (!dealsRes.error) {
          setIsCloudSynced(true);

          if (profRes.data) {
            setProfile({
              name: profRes.data.name || metaName,
              role: profRes.data.role || metaRole,
              agency: profRes.data.agency || metaAgency,
              email: profRes.data.email || metaEmail,
              avatarUrl: metaAvatar,
              monthlyTarget: Number(profRes.data.monthly_target) || 50000,
              quarterlyTarget: Number(profRes.data.quarterly_target) || 160000,
            });
          } else {
            await supabase.from('verve_profiles').upsert({
              id: authUser.id,
              email: metaEmail,
              name: metaName,
              role: metaRole,
              agency: metaAgency,
              monthly_target: 50000,
              quarterly_target: 160000,
            });
          }

          if (Array.isArray(dealsRes.data) && dealsRes.data.length > 0) {
            setDeals(dealsRes.data.map(mapRowToDeal));
          } else {
            // Seed initial portfolio deals for a newly created account
            await supabase
              .from('verve_deals')
              .upsert(MOCK_DEALS.map((d, idx) => mapDealToRow(d, authUser.id, idx)));
          }

          if (Array.isArray(compRes.data) && compRes.data.length > 0) {
            setCompanies(compRes.data.map(mapRowToCompany));
          } else {
            await supabase
              .from('verve_companies')
              .upsert(MOCK_COMPANIES.map((c) => mapCompanyToRow(c, authUser.id)));
          }

          if (!relRes.error) {
            if (Array.isArray(relRes.data) && relRes.data.length > 0) {
              setRelances(relRes.data.map(mapRowToRelance));
            } else {
              await supabase
                .from('verve_relances')
                .upsert(MOCK_RELANCES.map((r) => mapRelanceToRow(r, authUser.id)));
            }
          }

          if (!actRes.error) {
            if (Array.isArray(actRes.data) && actRes.data.length > 0) {
              setActivities(actRes.data.map(mapRowToActivity));
            } else {
              await supabase
                .from('verve_activities')
                .upsert(MOCK_ACTIVITIES.map((a) => mapActivityToRow(a, authUser.id)));
            }
          }
        }
      } catch {
        // Fallback to localStorage seamlessly if tables are not created yet
      }
    };

    const init = async () => {
      try {
        const savedTheme = window.localStorage.getItem('verve_theme');
        if (savedTheme === 'dark') {
          setTheme('dark');
          document.documentElement.classList.add('dark');
        } else {
          setTheme('light');
          document.documentElement.classList.remove('dark');
        }
      } catch {
        // Ignore storage errors
      }
      const hasDemo = document.cookie.includes('verve_demo_mode=1');
      setIsDemoMode(hasDemo);
      loadLocal(null);

      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        if (mounted) {
          setUser(sessionUser);
          if (sessionUser) {
            setIsDemoMode(false);
            loadLocal(sessionUser.id);
            await loadFromSupabase(sessionUser);
          }
        }
      }
      if (mounted) setHydrated(true);
    };

    init();

    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        setIsDemoMode(false);
        loadLocal(nextUser.id);
        loadFromSupabase(nextUser);
      } else {
        setIsCloudSynced(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, storageKeyForUser]);

  // Persist to localStorage on state changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        storageKeyForUser(user?.id),
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
  }, [deals, companies, relances, activities, profile, notifications, hydrated, user?.id, storageKeyForUser]);

  const enableDemoMode = useCallback(() => {
    if (typeof document !== 'undefined') {
      const secureFlag =
        typeof window !== 'undefined' && window.location.protocol === 'https:'
          ? '; Secure'
          : '';
      document.cookie = `verve_demo_mode=1; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
    }
    setIsDemoMode(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('verve_theme', next);
        } catch {
          // Ignore storage errors
        }
      }
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    if (typeof document !== 'undefined') {
      const secureFlag =
        typeof window !== 'undefined' && window.location.protocol === 'https:'
          ? '; Secure'
          : '';
      document.cookie = `verve_demo_mode=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        if (user?.id) {
          localStorage.removeItem(storageKeyForUser(user.id));
        }
        // Purge any residual user-scoped CRM caches on shared terminals
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(STORAGE_KEY)) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // Ignore storage errors
      }
    }
    setIsDemoMode(false);
    setIsCloudSynced(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [supabase, user?.id, storageKeyForUser]);

  const pushActivity = (act: Activity) => {
    setActivities((prev) => [act, ...prev]);
    if (supabase && user) {
      supabase.from('verve_activities').upsert(mapActivityToRow(act, user.id)).then(() => {});
    }
  };

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

    if (supabase && user) {
      supabase
        .from('verve_deals')
        .upsert(mapDealToRow(newDeal, user.id, 0))
        .then(() => {});
    }

    setCompanies((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.name.toLowerCase() === input.companyName.toLowerCase()
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        const comp = updated[existingIdx];
        const nextComp = {
          ...comp,
          primaryDealId: newDeal.id,
          activeDealsCount: comp.activeDealsCount + 1,
          activeDealsDescription: newDeal.title,
          cumulativeValue: comp.cumulativeValue + newDeal.amount,
        };
        updated[existingIdx] = nextComp;
        if (supabase && user) {
          supabase.from('verve_companies').upsert(mapCompanyToRow(nextComp, user.id)).then(() => {});
        }
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
      if (supabase && user) {
        supabase.from('verve_companies').upsert(mapCompanyToRow(newComp, user.id)).then(() => {});
      }
      return [newComp, ...prev];
    });

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
    pushActivity(newAct);

    showToast(`Mandat « ${newDeal.title} » ajouté au pipeline`);
    return newDeal;
  };

  const updateDeal: CRMContextType['updateDeal'] = (id, patch) => {
    setDeals((prev) =>
      prev.map((d, idx) => {
        if (d.id === id) {
          const next = { ...d, ...patch };
          if (supabase && user) {
            supabase.from('verve_deals').upsert(mapDealToRow(next, user.id, idx)).then(() => {});
          }
          return next;
        }
        return d;
      })
    );
    showToast('Modifications du dossier enregistrées');
  };

  const moveDealStage: CRMContextType['moveDealStage'] = (id, nextStageId) => {
    const stageObj = STAGES.find((s) => s.id === nextStageId) || STAGES[0];
    let targetDeal: Deal | undefined;

    setDeals((prev) =>
      prev.map((d, idx) => {
        if (d.id === id) {
          targetDeal = d;
          const next: Deal = {
            ...d,
            stageId: nextStageId,
            probability: stageObj.defaultProbability,
            statusBadge:
              nextStageId === 'won'
                ? 'Signé ce mois'
                : `Étape : ${stageObj.shortName}`,
            badgeType: nextStageId === 'won' ? 'normal' : d.badgeType,
          };
          if (supabase && user) {
            supabase.from('verve_deals').upsert(mapDealToRow(next, user.id, idx)).then(() => {});
          }
          return next;
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
      pushActivity(act);
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

      const listWithoutDragged = prev.filter((d) => d.id !== draggedDealId);

      let finalList: Deal[];
      if (targetDealId) {
        const targetIndex = listWithoutDragged.findIndex((d) => d.id === targetDealId);
        if (targetIndex !== -1) {
          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
          const nextList = [...listWithoutDragged];
          nextList.splice(insertIndex, 0, updatedDeal);
          finalList = nextList;
        } else {
          finalList = [...listWithoutDragged, updatedDeal];
        }
      } else {
        const lastIndexOfStage = listWithoutDragged.reduce<number>(
          (lastIdx, item, idx) => (item.stageId === finalStageId ? idx : lastIdx),
          -1
        );
        if (lastIndexOfStage === -1) {
          finalList = [...listWithoutDragged, updatedDeal];
        } else {
          const nextList = [...listWithoutDragged];
          nextList.splice(lastIndexOfStage + 1, 0, updatedDeal);
          finalList = nextList;
        }
      }

      if (supabase && user) {
        supabase
          .from('verve_deals')
          .upsert(finalList.map((d, idx) => mapDealToRow(d, user.id, idx)))
          .then(() => {});
      }

      return finalList;
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
      pushActivity(act);
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
      if (supabase && user) {
        supabase
          .from('verve_deals')
          .upsert(next.map((d, idx) => mapDealToRow(d, user.id, idx)))
          .then(() => {});
      }
      return next;
    });

    showToast(`Priorité ajustée dans l'étape`);
  };

  const deleteDeal: CRMContextType['deleteDeal'] = (id) => {
    const target = deals.find((d) => d.id === id);
    setDeals((prev) => prev.filter((d) => d.id !== id));
    if (supabase && user) {
      supabase.from('verve_deals').delete().eq('user_id', user.id).eq('id', id).then(() => {});
    }
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
    if (supabase && user) {
      supabase.from('verve_companies').upsert(mapCompanyToRow(newCompany, user.id)).then(() => {});
      supabase.from('verve_deals').upsert(mapDealToRow(companionDeal, user.id, 0)).then(() => {});
    }
    showToast(`Entreprise « ${input.name} » ajoutée au répertoire`);
    return newCompany;
  };

  const updateCompany: CRMContextType['updateCompany'] = (id, patch) => {
    const existing = companies.find((c) => c.id === id);
    const oldName = existing?.name;
    const nextInitials = getInitials(patch.name);

    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextComp: Company = {
          ...c,
          name: patch.name,
          sector: patch.sector,
          city: patch.city,
          initials: nextInitials,
          primaryContact: {
            ...c.primaryContact,
            name: patch.contactName,
            role: patch.contactRole,
            email: patch.contactEmail,
            phone: patch.contactPhone,
            initials: getInitials(patch.contactName),
          },
          cumulativeValue: patch.cumulativeValue,
          paymentTerms: patch.paymentTerms,
          status: patch.status,
        };
        if (supabase && user) {
          supabase.from('verve_companies').upsert(mapCompanyToRow(nextComp, user.id)).then(() => {});
        }
        return nextComp;
      })
    );

    // Keep linked deals synchronized with updated company & contact info
    setDeals((prev) =>
      prev.map((d, idx) => {
        const isLinked =
          d.companyId === id ||
          d.id === existing?.primaryDealId ||
          (oldName && d.companyName.toLowerCase() === oldName.toLowerCase());
        if (!isLinked) return d;
        const nextDeal: Deal = {
          ...d,
          companyName: patch.name,
          companySector: patch.sector,
          companyCity: patch.city,
          companyInitials: nextInitials,
          contactName: patch.contactName,
          contactRole: patch.contactRole,
          contactEmail: patch.contactEmail,
          contactPhone: patch.contactPhone,
        };
        if (supabase && user) {
          supabase.from('verve_deals').upsert(mapDealToRow(nextDeal, user.id, idx)).then(() => {});
        }
        return nextDeal;
      })
    );

    showToast(`Fiche société « ${patch.name} » mise à jour`);
  };

  const deleteCompany: CRMContextType['deleteCompany'] = (id) => {
    const target = companies.find((c) => c.id === id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    if (supabase && user) {
      supabase.from('verve_companies').delete().eq('user_id', user.id).eq('id', id).then(() => {});
    }
    if (target) {
      showToast(`Entreprise « ${target.name} » retirée du répertoire`);
    }
  };

  const persistRelance = (r: Relance) => {
    if (supabase && user) {
      supabase.from('verve_relances').upsert(mapRelanceToRow(r, user.id)).then(() => {});
    }
  };

  const toggleRelance: CRMContextType['toggleRelance'] = (id) => {
    const target = relances.find((r) => r.id === id);
    if (!target) return;
    const next = { ...target, done: !target.done };
    setRelances((prev) => prev.map((item) => (item.id === id ? next : item)));
    persistRelance(next);
    showToast(
      next.done
        ? `Suivi validé pour ${target.contactName} (${target.companyName})`
        : `Suivi réactivé pour ${target.contactName}`
    );
  };

  const postponeRelance: CRMContextType['postponeRelance'] = (id, nextTimeSlot) => {
    const target = relances.find((r) => r.id === id);
    if (!target) return;
    const next = { ...target, timeSlot: nextTimeSlot };
    setRelances((prev) => prev.map((item) => (item.id === id ? next : item)));
    persistRelance(next);
    showToast(`Créneau de ${target.contactName} reporté à ${nextTimeSlot}`);
  };

  const addRelance: CRMContextType['addRelance'] = (rel) => {
    const newRel: Relance = {
      ...rel,
      id: `rel-${Date.now()}`,
      done: false,
    };
    setRelances((prev) => [newRel, ...prev]);
    persistRelance(newRel);
    showToast(`Relance programmée à ${rel.timeSlot} avec ${rel.contactName}`);
  };

  const deleteRelance: CRMContextType['deleteRelance'] = (id) => {
    const target = relances.find((r) => r.id === id);
    setRelances((prev) => prev.filter((r) => r.id !== id));
    if (supabase && user) {
      supabase.from('verve_relances').delete().eq('user_id', user.id).eq('id', id).then(() => {});
    }
    if (target) showToast(`Relance avec ${target.contactName} supprimée`);
  };

  const addActivity: CRMContextType['addActivity'] = (act) => {
    const newAct: Activity = {
      ...act,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [newAct, ...prev]);
    if (supabase && user) {
      supabase.from('verve_activities').upsert(mapActivityToRow(newAct, user.id)).then(() => {});
    }
    showToast('Interaction enregistrée au journal du dossier');
  };

  const deleteActivity: CRMContextType['deleteActivity'] = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (supabase && user) {
      supabase.from('verve_activities').delete().eq('user_id', user.id).eq('id', id).then(() => {});
    }
    showToast('Entrée supprimée du journal');
  };

  const updateProfile: CRMContextType['updateProfile'] = (patch) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (supabase && user) {
        supabase
          .from('verve_profiles')
          .upsert({
            id: user.id,
            email: next.email,
            name: next.name,
            role: next.role,
            agency: next.agency,
            monthly_target: next.monthlyTarget,
            quarterly_target: next.quarterlyTarget,
          })
          .then(() => {});
      }
      return next;
    });
    showToast('Paramètres du cabinet mis à jour');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications marquées comme lues');
  };

  const resetDemoData = () => {
    window.localStorage.removeItem(storageKeyForUser(user?.id));
    window.localStorage.removeItem(STORAGE_KEY);
    setDeals(MOCK_DEALS);
    setCompanies(MOCK_COMPANIES);
    setRelances(MOCK_RELANCES);
    setActivities(MOCK_ACTIVITIES);
    setProfile(INITIAL_PROFILE);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Données de démonstration réinitialisées');
  };

  const exportBackup = () => {
    try {
      const payload = {
        app: 'Verve CRM',
        version: 2,
        exportedAt: new Date().toISOString(),
        profile,
        deals,
        companies,
        relances,
        activities,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `verve-crm-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Sauvegarde exportée (verve-crm-backup-${dateStr}.json)`);
    } catch {
      showToast('Erreur lors de l’export de la sauvegarde JSON');
    }
  };

  const importBackup: CRMContextType['importBackup'] = (rawJson) => {
    try {
      const parsed = JSON.parse(rawJson);
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        (!Array.isArray(parsed.deals) && !Array.isArray(parsed.companies))
      ) {
        showToast('Fichier JSON invalide : structure Verve CRM non reconnue.');
        return false;
      }

      const nextDeals: Deal[] = Array.isArray(parsed.deals) ? parsed.deals : deals;
      const nextCompanies: Company[] = Array.isArray(parsed.companies) ? parsed.companies : companies;
      const nextRelances: Relance[] = Array.isArray(parsed.relances) ? parsed.relances : relances;
      const nextActivities: Activity[] = Array.isArray(parsed.activities) ? parsed.activities : activities;
      const nextProfile: UserProfile =
        parsed.profile && typeof parsed.profile === 'object'
          ? { ...INITIAL_PROFILE, ...parsed.profile }
          : profile;

      setDeals(nextDeals);
      setCompanies(nextCompanies);
      setRelances(nextRelances);
      setActivities(nextActivities);
      setProfile(nextProfile);

      if (supabase && user) {
        supabase
          .from('verve_profiles')
          .upsert({
            id: user.id,
            email: nextProfile.email,
            name: nextProfile.name,
            role: nextProfile.role,
            agency: nextProfile.agency,
            monthly_target: nextProfile.monthlyTarget,
            quarterly_target: nextProfile.quarterlyTarget,
          })
          .then(() => {});
        if (nextDeals.length > 0) {
          supabase
            .from('verve_deals')
            .upsert(nextDeals.map((d, idx) => mapDealToRow(d, user.id, idx)))
            .then(() => {});
        }
        if (nextCompanies.length > 0) {
          supabase
            .from('verve_companies')
            .upsert(nextCompanies.map((c) => mapCompanyToRow(c, user.id)))
            .then(() => {});
        }
        if (nextRelances.length > 0) {
          supabase
            .from('verve_relances')
            .upsert(nextRelances.map((r) => mapRelanceToRow(r, user.id)))
            .then(() => {});
        }
        if (nextActivities.length > 0) {
          supabase
            .from('verve_activities')
            .upsert(nextActivities.map((a) => mapActivityToRow(a, user.id)))
            .then(() => {});
        }
      }

      showToast(
        `Sauvegarde restaurée (${nextDeals.length} mandats, ${nextCompanies.length} sociétés)`
      );
      return true;
    } catch {
      showToast('Impossible de lire le fichier JSON (syntaxe invalide).');
      return false;
    }
  };

  return (
    <CRMContext.Provider
      value={{
        user,
        isDemoMode,
        isCloudSynced,
        theme,
        toggleTheme,
        deals,
        companies,
        relances,
        activities,
        profile,
        notifications,
        toastMessage,
        showToast,
        enableDemoMode,
        signOut,
        addDeal,
        updateDeal,
        moveDealStage,
        reorderDeals,
        moveDealPriority,
        deleteDeal,
        addCompany,
        updateCompany,
        deleteCompany,
        toggleRelance,
        postponeRelance,
        addRelance,
        deleteRelance,
        addActivity,
        deleteActivity,
        updateProfile,
        markAllNotificationsRead,
        resetDemoData,
        exportBackup,
        importBackup,
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
