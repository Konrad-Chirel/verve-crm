'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Calendar } from 'lucide-react';
import { useModal } from '@/context/modal-context';
import { useCRM } from '@/context/crm-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STAGES, type StageId } from '@/lib/mock-data';

export function NewDealModal() {
  const { isNewDealOpen, closeNewDeal, openNewCompany } = useModal();
  const { companies, addDeal } = useCRM();
  const router = useRouter();
  const pathname = usePathname();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('Lumina Studio');
  const [contactName, setContactName] = useState('Alexandre Dumas');
  const [contactRole, setContactRole] = useState('Co-fondateur & CEO');
  const [amount, setAmount] = useState('25000');
  const [stageId, setStageId] = useState<StageId>('proposal');
  const [nextDate, setNextDate] = useState('Vendredi 28 mars à 11h00');
  const [notes, setNotes] = useState('');
  const [activeShortcut, setActiveShortcut] = useState<string>('+4 jours');

  if (!isNewDealOpen) return null;

  const handleSelectCompany = (name: string) => {
    setCompanyName(name);
    const found = companies.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (found) {
      setContactName(found.primaryContact.name);
      setContactRole(found.primaryContact.role);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(amount.replace(/\s+/g, ''), 10) || 15000;

    const created = addDeal({
      title: title.trim() || `Mandat Conseil — ${companyName}`,
      companyName: companyName.trim() || 'Nouvelle Société',
      contactName: contactName.trim() || 'Direction Générale',
      contactRole: contactRole.trim() || 'Décideur',
      amount: numericAmount,
      stageId,
      nextAction: nextDate,
      notes,
    });

    setTitle('');
    setNotes('');
    closeNewDeal();

    if (pathname !== '/pipeline') {
      router.push(`/deals/${created.id}`);
    }
  };

  const setShortcut = (label: string, dateStr: string) => {
    setActiveShortcut(label);
    setNextDate(dateStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111827]/40 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={closeNewDeal} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white sm:rounded-xl rounded-t-2xl shadow-xl border border-[#E4E7EC] overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#E4E7EC] bg-[#F9FAFB]">
          <div>
            <h2 className="font-display text-base font-bold text-[#111827]">
              Nouveau dossier commercial
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Enregistrer une opportunité ou un mandat dans le pipeline
            </p>
          </div>

          <button
            type="button"
            onClick={closeNewDeal}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <label
              htmlFor="deal-title"
              className="block text-xs font-bold text-text-primary mb-1.5"
            >
              Intitulé de la mission
            </label>
            <Input
              id="deal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Refonte architecture produit & design system"
              required
            />
          </div>

          {/* Company & Contact */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="deal-company"
                className="text-xs font-bold text-text-primary"
              >
                Société cliente
              </label>
              <button
                type="button"
                onClick={() => {
                  closeNewDeal();
                  openNewCompany();
                }}
                className="text-xs font-bold text-[#047857] hover:underline"
              >
                + Créer une fiche société
              </button>
            </div>

            <Input
              id="deal-company"
              value={companyName}
              onChange={(e) => handleSelectCompany(e.target.value)}
              placeholder="Nom de l’entreprise"
              required
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-text-muted font-medium">Sélection rapide :</span>
              {companies.slice(0, 4).map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleSelectCompany(comp.name)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors border ${
                    companyName === comp.name
                      ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-text-secondary border-border-base'
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Interlocuteur clé
                </label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Prénom & Nom"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Fonction
                </label>
                <Input
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  placeholder="Ex. Directeur Général"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="deal-amount"
                className="block text-xs font-bold text-text-primary mb-1.5"
              >
                Honoraires estimés (€ HT)
              </label>
              <div className="relative">
                <input
                  id="deal-amount"
                  type="number"
                  min={500}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-9 bg-white text-[#111827] font-display font-bold text-sm rounded-lg border border-[#E4E7EC] px-3 pr-8 focus:border-[#047857] outline-none tabular-nums"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#6B7280]">
                  €
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="deal-stage"
                className="block text-xs font-medium text-[#4B5563] mb-1"
              >
                Étape du pipeline
              </label>
              <select
                id="deal-stage"
                value={stageId}
                onChange={(e) => setStageId(e.target.value as StageId)}
                className="w-full h-9 bg-white text-[#111827] text-xs font-medium rounded-lg border border-[#E4E7EC] px-2.5 focus:border-[#047857] outline-none cursor-pointer"
              >
                {STAGES.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name} ({stg.defaultProbability}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="deal-followup"
              className="block text-xs font-medium text-[#4B5563] mb-1"
            >
              Prochaine action programmée
            </label>
            <div className="relative">
              <input
                id="deal-followup"
                type="text"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full h-9 bg-white text-[#111827] text-xs font-medium rounded-lg border border-[#E4E7EC] pl-8 pr-3 focus:border-[#047857] outline-none"
              />
              <Calendar className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[
                { label: 'Demain 10h', date: 'Demain à 10h00' },
                { label: '+4 jours', date: 'Vendredi 28 mars à 11h00' },
                { label: 'Lundi prochain', date: 'Lundi 31 mars à 14h30' },
              ].map((sc) => (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => setShortcut(sc.label, sc.date)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    activeShortcut === sc.label
                      ? 'bg-[#047857] text-white'
                      : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563]'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4B5563] mb-1">
              Contexte &amp; notes stratégiques
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Enjeux du client, budget évoqué, décideurs..."
              className="w-full p-2.5 rounded-lg bg-white border border-[#E4E7EC] text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#047857] outline-none resize-none"
            />
          </div>

          <div className="pt-3 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 border-t border-[#E4E7EC]">
            <Button type="button" variant="secondary" size="md" onClick={closeNewDeal} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
              Créer le dossier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
