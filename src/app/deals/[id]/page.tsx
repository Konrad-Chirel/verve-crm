'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  Edit3,
  Plus,
  Check,
  Phone,
  Mail,
  FileText,
  Download,
  Send,
  Paperclip,
  CalendarDays,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  Cloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STAGES } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { useCRM } from '@/context/crm-context';
import { generateContractPDF } from '@/lib/pdf-generator';
import { createClient } from '@/lib/supabase/client';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const {
    user,
    deals,
    activities,
    profile,
    moveDealStage,
    updateDeal,
    deleteDeal,
    addActivity,
    deleteActivity,
    addRelance,
    showToast,
  } = useCRM();
  const supabase = createClient();

  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const deal =
    deals.find((d) => d.id === rawId) ||
    deals.find((d) => d.id === 'deal-lumina') ||
    deals[0];

  const [activeTab, setActiveTab] = useState<'note' | 'appel' | 'tache'>('note');
  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Remembers which stage the mobile stepper was last centred on (avoids re-scrolling on every render).
  const centeredStageRef = useRef<string>('');

  // Edit form state initialized when opening editor
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editProb, setEditProb] = useState('');
  const [editCloseDate, setEditCloseDate] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactRole, setEditContactRole] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editNextAction, setEditNextAction] = useState('');
  const [pendingActId, setPendingActId] = useState<string | null>(null);

  if (!deal) {
    return (
      <div className="p-8 bg-white rounded-xl border border-[#E4E7EC] text-center space-y-4">
        <p className="text-[#4B5563]">Aucun dossier trouvé.</p>
        <Link href="/pipeline">
          <Button variant="primary">Retour au pipeline</Button>
        </Link>
      </div>
    );
  }

  const openEditor = () => {
    setEditTitle(deal.title);
    setEditAmount(String(deal.amount));
    setEditProb(String(deal.probability));
    setEditCloseDate(deal.nextActionDate || '30 mars 2026');
    setEditContactName(deal.contactName);
    setEditContactRole(deal.contactRole);
    setEditContactEmail(deal.contactEmail || '');
    setEditContactPhone(deal.contactPhone || '');
    setEditNextAction(deal.nextAction || '');
    setEditNotes(
      deal.notes ||
        'Le client souhaite sécuriser le planning de déploiement avant la fin du trimestre. La garantie de livraison sous 8 semaines constitue un critère déterminant.'
    );
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(editAmount) || deal.amount;
    const numericProb = Math.min(100, Math.max(0, Number(editProb) || deal.probability));
    updateDeal(deal.id, {
      title: editTitle.trim() || deal.title,
      amount: numericAmount,
      probability: numericProb,
      nextActionDate: editCloseDate.trim() || deal.nextActionDate,
      contactName: editContactName.trim() || deal.contactName,
      contactRole: editContactRole.trim() || deal.contactRole,
      contactEmail: editContactEmail.trim(),
      contactPhone: editContactPhone.trim(),
      nextAction: editNextAction.trim() || undefined,
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const handleDownloadProposal = () => {
    try {
      const filename = generateContractPDF(deal, profile);
      showToast(`PDF contractuel généré (${filename})`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      showToast('Erreur lors de la génération du document PDF');
    }
  };

  const handleDownloadAttachment = async (storagePath?: string, fallbackName?: string) => {
    const isOwnedPath =
      typeof storagePath === 'string' &&
      Boolean(user?.id) &&
      storagePath.startsWith(`${user!.id}/`) &&
      !storagePath.includes('..') &&
      !storagePath.includes('\\');

    if (isOwnedPath && supabase && user) {
      try {
        const { data, error } = await supabase.storage
          .from('verve-documents')
          .createSignedUrl(storagePath, 60, {
            download: fallbackName || deal.documentName || true,
          });
        if (!error && data?.signedUrl && data.signedUrl.startsWith('https://')) {
          window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
          showToast(`Téléchargement sécurisé lancé (${fallbackName || deal.documentName})`);
          return;
        }
      } catch (err) {
        console.error('Erreur téléchargement Supabase Storage:', err);
      }
    }
    handleDownloadProposal();
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      showToast('Fichier trop volumineux (maximum 10 Mo).');
      return;
    }

    const allowedExt = /\.(pdf|docx?|xlsx?|csv|txt|png|jpe?g)$/i;
    if (!allowedExt.test(file.name)) {
      showToast('Format non pris en charge (PDF, Word, Excel, CSV, PNG, JPG).');
      return;
    }

    const sizeMo = `${(file.size / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
    const formattedSize =
      sizeMo === '0,0 Mo' ? `${Math.max(1, Math.round(file.size / 1024))} Ko` : sizeMo;

    let uploadedPath: string | undefined;

    if (supabase && user) {
      setIsUploadingDoc(true);
      try {
        const safeFileName = file.name
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/\.{2,}/g, '_')
          .replace(/^\.+/, '')
          .slice(0, 120) || 'document.pdf';
        const targetPath = `${user.id}/${deal.id}/${Date.now()}_${safeFileName}`;
        const { error } = await supabase.storage
          .from('verve-documents')
          .upload(targetPath, file, { upsert: true });

        if (!error) {
          uploadedPath = targetPath;
        } else {
          console.warn('Supabase Storage upload fallback:', error.message);
        }
      } catch (err) {
        console.warn('Supabase Storage error:', err);
      } finally {
        setIsUploadingDoc(false);
      }
    }

    updateDeal(deal.id, {
      documentName: file.name,
      documentSize: formattedSize,
      documentPath: uploadedPath,
    });
    addActivity({
      dealId: deal.id,
      companyName: deal.companyName,
      type: 'contrat',
      title: `Pièce jointe ajoutée (${file.name})`,
      badgeText: uploadedPath ? 'Cloud PDF' : 'Document',
      badgeStyle: 'mint',
      timestamp: 'À l’instant',
      content: uploadedPath
        ? `Fichier téléversé sur Supabase Storage et rattaché au dossier ${deal.companyName}.`
        : `Nouveau fichier contractuel rattaché au dossier ${deal.companyName}.`,
      author: profile.name,
      attachment: {
        name: file.name,
        size: formattedSize,
        time: 'À l’instant',
        path: uploadedPath,
      },
    });
    if (uploadedPath) {
      showToast(`Document « ${file.name} » sauvegardé sur Supabase Storage`);
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    addActivity({
      dealId: deal.id,
      companyName: deal.companyName,
      type: activeTab === 'appel' ? 'appel' : activeTab === 'tache' ? 'relance' : 'note',
      title:
        activeTab === 'appel'
          ? `Compte-rendu d’entretien (${deal.contactName})`
          : activeTab === 'tache'
          ? `Échéance de suivi (${deal.companyName})`
          : `Note de synthèse (${deal.companyName})`,
      badgeText:
        activeTab === 'appel'
          ? 'Entretien'
          : activeTab === 'tache'
          ? 'Relance'
          : 'Note interne',
      badgeStyle: activeTab === 'tache' ? 'urgent' : activeTab === 'appel' ? 'lilac' : 'mint',
      timestamp: 'À l’instant',
      content: noteContent.trim(),
      author: profile.name,
      assignedTo: activeTab === 'tache' ? profile.name : undefined,
    });

    if (activeTab === 'tache') {
      addRelance({
        dealId: deal.id,
        timeSlot: '15:00',
        timeLabel: 'Après-midi',
        contactName: deal.contactName,
        contactRole: deal.contactRole,
        companyName: deal.companyName,
        companyInitials: deal.companyInitials,
        companyColor: deal.companyColor,
        avatarUrl: deal.contactAvatar || '',
        dealTitle: deal.title,
        contextLine: noteContent.trim(),
        amount: deal.amount,
        statusTag: 'Relance planifiée',
        actionType: 'call',
        actionLabel: 'Appeler',
      });
    }

    setNoteContent('');
  };

  const handleDeleteDeal = () => {
    const targetName = deal.companyName;
    deleteDeal(deal.id);
    router.push('/pipeline');
    showToast(`Dossier ${targetName} supprimé`);
  };

  const currentStageIndex = STAGES.findIndex((s) => s.id === deal.stageId);
  const currentStageObj = STAGES[currentStageIndex] || STAGES[0];

  const dealActivities = activities.filter(
    (a) => !a.dealId || a.dealId === deal.id
  );

  return (
    <div className="space-y-3 -mt-3 sm:-mt-4">
      {/* 1. Breadcrumb & Quick Dossier Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <nav
          aria-label="Fil d’Ariane"
          className="flex flex-wrap items-center gap-1.5 text-[#6B7280] text-xs"
        >
          <Link href="/pipeline" className="hover:text-[#111827] transition-colors">
            Pipeline
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span>{currentStageObj.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span className="text-[#111827] font-semibold">{deal.companyName}</span>
        </nav>

        <div className="flex items-center gap-2">
          <label htmlFor="deal-switcher" className="text-xs text-[#6B7280]">
            Dossier :
          </label>
          <select
            id="deal-switcher"
            value={deal.id}
            onChange={(e) => router.push(`/deals/${e.target.value}`)}
            className="h-7 px-2 rounded-lg bg-white border border-[#E4E7EC] text-xs font-medium text-[#111827] focus:border-[#047857] outline-none cursor-pointer"
          >
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.companyName} ({formatCurrency(d.amount)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Dossier Header Sheet */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-2xs">
        {/* Top Row: Identity + Financials */}
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 border-b border-[#E4E7EC]">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#047857] text-white flex items-center justify-center font-display font-bold text-base sm:text-lg shrink-0">
              {deal.companyInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#6B7280] leading-snug">
                {deal.companyName} — {deal.companySector || 'Conseil & Ingénierie'}, {deal.companyCity || 'Paris'}
              </div>
              <h1 className="font-display text-xl sm:text-3xl font-bold text-[#111827] tracking-tight mt-0.5 leading-tight break-words">
                {deal.title}
              </h1>
            </div>
          </div>

          {/* Financial Ledger Figures */}
          <div className="grid grid-cols-3 divide-x divide-[#E4E7EC] border border-[#E4E7EC] rounded-lg bg-[#F9FAFB] lg:shrink-0">
            <div className="px-2.5 sm:px-4 py-2.5 min-w-0">
              <div className="text-[11px] font-medium text-[#6B7280] whitespace-nowrap">
                Honoraires HT
              </div>
              <div className="font-display text-base sm:text-lg font-bold text-[#111827] tabular-nums mt-0.5 whitespace-nowrap">
                {formatCurrency(deal.amount)}
              </div>
            </div>
            <div className="px-2.5 sm:px-4 py-2.5 min-w-0">
              <div className="text-[11px] font-medium text-[#6B7280] whitespace-nowrap">
                Probabilité
              </div>
              <div className="font-display text-base sm:text-lg font-bold text-[#047857] tabular-nums mt-0.5">
                {deal.probability}%
              </div>
            </div>
            <div className="px-2.5 sm:px-4 py-2.5 min-w-0">
              <div className="text-[11px] font-medium text-[#6B7280] whitespace-nowrap">
                Échéance
              </div>
              <div className="font-display text-[13px] sm:text-sm font-bold text-[#111827] mt-1 leading-tight">
                {deal.nextActionDate || '30 mars 2026'}
              </div>
            </div>
          </div>
        </div>

        {/* Inline Edit Drawer (when active) */}
        {isEditing && (
          <form
            onSubmit={handleSaveEdit}
            className="p-6 bg-[#F9FAFB] border-b border-[#E4E7EC] space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#111827]">
                Modifier les paramètres de l’offre
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-[#6B7280] hover:text-[#111827]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Intitulé de la mission
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Honoraires HT (€)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Probabilité (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editProb}
                  onChange={(e) => setEditProb(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Interlocuteur décisionnaire
                </label>
                <Input
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Fonction de l’interlocuteur
                </label>
                <Input
                  value={editContactRole}
                  onChange={(e) => setEditContactRole(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Prochaine échéance
                </label>
                <Input
                  value={editCloseDate}
                  onChange={(e) => setEditCloseDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  E-mail de l’interlocuteur
                </label>
                <Input
                  type="email"
                  value={editContactEmail}
                  onChange={(e) => setEditContactEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Prochaine action
                </label>
                <Input
                  value={editNextAction}
                  onChange={(e) => setEditNextAction(e.target.value)}
                  placeholder="Ex. Appeler pour valider le calendrier"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">
                Note stratégique &amp; contexte de négociation
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-3 rounded-lg bg-white border border-[#E4E7EC] text-xs text-[#111827] focus:border-[#047857] outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </Button>
            </div>
          </form>
        )}

        {/* Middle Row: Clean Sentence-Case 5-Stage Progression Bar */}
        <div className="flex sm:grid sm:grid-cols-5 overflow-x-auto sm:overflow-visible divide-x divide-[#E4E7EC] border-b border-[#E4E7EC] bg-[#F9FAFB] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STAGES.map((stg, idx) => {
            const isPast = idx < currentStageIndex;
            const isCurrent = stg.id === deal.stageId;

            return (
              <button
                key={stg.id}
                type="button"
                ref={
                  isCurrent
                    ? (el) => {
                        // Mobile: keep the current step centred in the scrollable stepper.
                        const track = el?.parentElement;
                        if (el && track && centeredStageRef.current !== deal.stageId) {
                          centeredStageRef.current = deal.stageId;
                          track.scrollLeft = el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2;
                        }
                      }
                    : undefined
                }
                onClick={() => moveDealStage(deal.id, stg.id)}
                className={`shrink-0 min-w-[140px] sm:min-w-0 px-4 py-3 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-white border-b-2 border-b-[#047857] font-semibold text-[#047857]'
                    : isPast
                    ? 'bg-white/60 text-[#111827] hover:bg-white'
                    : 'text-[#6B7280] hover:bg-white hover:text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-[#9CA3AF] tabular-nums">{idx + 1}.</span>
                  <span className="text-xs truncate">{stg.name}</span>
                </div>
                {isPast && <Check className="w-3.5 h-3.5 text-[#047857] shrink-0" />}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-[#047857] shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Row: Meta & Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3 text-xs text-[#6B7280]">
            <span>
              Responsable :{' '}
              <strong className="text-[#111827] font-semibold">{profile.name}</strong>
            </span>
            <span className="hidden sm:inline text-[#E4E7EC]">|</span>
            <span>
              Prochaine étape :{' '}
              <strong className="text-[#111827] font-semibold">
                {deal.nextAction || 'Validation comité'}
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={openEditor}>
              <Edit3 className="w-3.5 h-3.5 text-[#4B5563]" />
              <span>Modifier l’offre</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveTab('tache');
                const el = document.getElementById('composer-textarea');
                el?.focus();
              }}
            >
              <Plus className="w-3.5 h-3.5 text-[#4B5563]" />
              <span>Planifier un suivi</span>
            </Button>

            {deal.stageId !== 'won' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => moveDealStage(deal.id, 'won')}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Valider la signature</span>
              </Button>
            )}

            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              title="Supprimer ce dossier"
              className="h-8 px-2.5 rounded-lg border border-[#E4E7EC] text-[#6B7280] hover:text-[#BE123C] hover:border-[#FECDD3] hover:bg-[#FFF1F2] transition-colors flex items-center gap-1 text-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Dossier Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stakeholders & Contract Specs */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Signataire principal */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <span className="text-xs font-semibold text-[#111827]">
                Interlocuteur principal
              </span>
              <span className="text-[11px] font-medium text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
                Signataire
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] border border-[#E4E7EC] text-[#111827] flex items-center justify-center font-display font-bold text-sm shrink-0">
                {deal.contactName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm text-[#111827]">
                  {deal.contactName}
                </h2>
                <div className="text-xs text-[#6B7280]">
                  {deal.contactRole}, {deal.companyName}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <a
                href={`mailto:${deal.contactEmail || 'contact@client.fr'}`}
                onClick={() =>
                  showToast(`Ouverture de la messagerie (${deal.contactEmail || 'contact@client.fr'})`)
                }
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#111827] transition-colors"
              >
                <span className="truncate">
                  {deal.contactEmail || 'contact@client.fr'}
                </span>
                <Mail className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
              </a>
              <a
                href={`tel:${deal.contactPhone || '+33140506070'}`}
                onClick={() =>
                  showToast(`Appel sortant vers ${deal.contactName}`)
                }
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#111827] font-medium transition-colors tabular-nums"
              >
                <span>{deal.contactPhone || '+33 1 40 50 60 70'}</span>
                <Phone className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveTab('appel');
                  showToast(`Ligne ouverte avec ${deal.contactName}`);
                }}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.location.href = `mailto:${deal.contactEmail || 'contact@client.fr'}?subject=${encodeURIComponent(
                    `Proposition ${deal.companyName} — ${deal.title}`
                  )}`;
                }}
              >
                <Mail className="w-3.5 h-3.5 text-[#4B5563]" />
                <span>Écrire</span>
              </Button>
            </div>
          </div>

          {/* Paramètres du mandat */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="text-xs font-semibold text-[#111827] border-b border-[#F3F4F6] pb-3">
              Paramètres contractuels
            </div>

            <dl className="divide-y divide-[#F3F4F6] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-[#6B7280]">Honoraires HT</dt>
                <dd className="font-display font-bold text-[#111827] tabular-nums">
                  {formatCurrency(deal.amount)}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-[#6B7280]">Valeur pondérée</dt>
                <dd className="font-display font-bold text-[#047857] tabular-nums">
                  {formatCurrency(Math.round((deal.amount * deal.probability) / 100))}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-[#6B7280]">Modalités de règlement</dt>
                <dd className="text-[#111827] font-medium">40% commande / 60% livrable</dd>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <dt className="text-[#6B7280]">Durée d’exécution</dt>
                <dd className="font-semibold text-[#111827]">8 semaines</dd>
              </div>
            </dl>
          </div>

          {/* Pièces contractuelles */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <span className="text-xs font-semibold text-[#111827]">
                Pièces contractuelles
              </span>
              <button
                type="button"
                disabled={isUploadingDoc}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-[#047857] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                {isUploadingDoc ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Envoi…</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Remplacer</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] space-y-2.5">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-[#111827] break-all">
                    {deal.documentName || `Proposition_${deal.companyName.replace(/\s+/g, '_')}_v2.pdf`}
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-0.5">
                    {deal.documentSize || '3,8 Mo'} — {deal.documentPath ? 'Stocké dans le cloud privé' : 'Transmis au signataire'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E4E7EC] text-xs">
                <span className="inline-flex items-center gap-1 text-[#6B7280]">
                  {deal.documentPath && <Cloud className="w-3.5 h-3.5 text-[#047857]" />}
                  <span>{deal.documentPath ? 'Supabase Storage' : 'Document vérifié'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleDownloadAttachment(deal.documentPath, deal.documentName)}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#047857] hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{deal.documentPath ? 'Télécharger le fichier' : 'Télécharger le PDF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Note stratégique */}
          <div className="p-5 rounded-xl bg-white border border-[#E4E7EC] border-l-4 border-l-[#047857] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#111827]">
                Note de cadrage
              </span>
              <button
                type="button"
                onClick={openEditor}
                className="text-xs font-medium text-[#047857] hover:underline cursor-pointer"
              >
                Modifier
              </button>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              {deal.notes ||
                `Le comité de direction de ${deal.companyName} souhaite sécuriser le déploiement sous 8 semaines. L'accompagnement senior de l'équipe ${profile.agency} constitue le levier décisif face à la concurrence.`}
            </p>
          </div>
        </aside>

        {/* Right Column: Journal & Activity Composer */}
        <div className="lg:col-span-8 space-y-6">
          {/* Composer */}
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3">
              <h2 className="font-display font-bold text-base text-[#111827]">
                Consigner une note ou un suivi
              </h2>

              <div className="inline-flex items-center p-0.5 bg-[#F3F4F6] border border-[#E4E7EC] rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('note')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'note'
                      ? 'bg-white text-[#111827] font-semibold shadow-2xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Note de synthèse
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('appel')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'appel'
                      ? 'bg-white text-[#111827] font-semibold shadow-2xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Compte-rendu d’appel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tache')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'tache'
                      ? 'bg-white text-[#111827] font-semibold shadow-2xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Relance agenda
                </button>
              </div>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3">
              <textarea
                id="composer-textarea"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={
                  activeTab === 'tache'
                    ? `Décrire l'objet de la relance avec ${deal.contactName} (sera également ajoutée à vos suivis du jour)...`
                    : `Saisir le compte-rendu d’échange avec ${deal.contactName}, les points d’arbitrage ou les prochaines étapes...`
                }
                rows={3}
                className="w-full p-3 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#047857] outline-none transition-colors resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNoteContent((prev) =>
                        prev ? `${prev} (Échéance : demain 14h00)` : 'Relance validation comité — demain 14h00'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Échéance demain 14h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Joindre un document</span>
                  </button>
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                  <Send className="w-3.5 h-3.5" />
                  <span>Enregistrer au journal</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Chronological Journal */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-[#111827]">
                Journal des échanges
              </h2>
              <span className="text-xs text-[#6B7280] tabular-nums">
                {dealActivities.length} entrées enregistrées
              </span>
            </div>

            <div className="bg-white border border-[#E4E7EC] rounded-xl divide-y divide-[#E4E7EC] shadow-2xs overflow-hidden">
              {dealActivities.map((act) => {
                const isUrgent = act.badgeStyle === 'urgent';
                return (
                  <article key={act.id} className="p-4 sm:p-5 space-y-2 hover:bg-[#F9FAFB]/60 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            isUrgent
                              ? 'bg-[#FFF1F2] text-[#BE123C]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                          }`}
                        >
                          {act.badgeText}
                        </span>
                        <h3 className="font-semibold text-sm text-[#111827]">
                          {act.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6B7280] tabular-nums">
                        {act.duration && <span>{act.duration}</span>}
                        <span>{act.timestamp}</span>
                        {pendingActId === act.id ? (
                          <span className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                deleteActivity(act.id);
                                setPendingActId(null);
                              }}
                              className="h-7 px-2 rounded-md bg-[#BE123C] text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Supprimer
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingActId(null)}
                              className="h-7 px-2 rounded-md text-[11px] font-medium text-[#4B5563] hover:bg-[#F3F4F6] cursor-pointer"
                            >
                              Annuler
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingActId(act.id)}
                            aria-label="Supprimer cette entrée du journal"
                            title="Supprimer"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-[#4B5563] leading-relaxed">
                      {act.content}
                    </p>

                    {act.attachment && (
                      <div className="mt-2 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
                        <span className="font-medium text-[#111827] flex items-start sm:items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-[#047857] shrink-0 mt-0.5 sm:mt-0" />
                          <span className="break-all sm:truncate">{act.attachment.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadAttachment(act.attachment?.path, act.attachment?.name)
                          }
                          className="text-xs text-[#047857] font-semibold hover:underline flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          <Download className="w-3 h-3" />
                          <span>{act.attachment.size}</span>
                        </button>
                      </div>
                    )}

                    {act.assignedTo && (
                      <div className="pt-1 flex items-center justify-between text-xs text-[#6B7280]">
                        <span>
                          Responsable : <strong className="text-[#111827]">{act.assignedTo}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => showToast('Échéance marquée comme traitée')}
                          className="font-semibold text-[#047857] hover:underline cursor-pointer"
                        >
                          Marquer comme traité
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        hidden
        onChange={handleFileAttach}
      />

      {/* Confirm Delete Deal Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-[2px]">
          <div
            className="fixed inset-0"
            onClick={() => setConfirmDeleteOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-[#E4E7EC] overflow-hidden z-10 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-bold text-[#111827]">
                  Confirmer la suppression du dossier
                </h2>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                  Voulez-vous vraiment supprimer le mandat{' '}
                  <strong className="text-[#111827] font-semibold">« {deal.title} »</strong>{' '}
                  ({deal.companyName}) du pipeline ?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] flex items-center justify-between text-xs">
              <span className="text-[#6B7280]">{deal.contactName} — {currentStageObj.name}</span>
              <span className="font-display font-bold text-[#111827] tabular-nums">
                {formatCurrency(deal.amount)}
              </span>
            </div>

            <div className="pt-3 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 border-t border-[#E4E7EC]">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setConfirmDeleteOpen(false)}
                className="w-full sm:w-auto h-10 sm:h-9 whitespace-nowrap"
              >
                Annuler
              </Button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  handleDeleteDeal();
                }}
                className="h-10 sm:h-9 px-4 rounded-lg bg-[#BE123C] hover:bg-[#9F1239] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
