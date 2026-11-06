'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useModal } from '@/context/modal-context';
import { useCRM } from '@/context/crm-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Company } from '@/lib/mock-data';

export function NewCompanyModal() {
  const { isNewCompanyOpen, closeNewCompany } = useModal();
  const { addCompany } = useCRM();

  const [name, setName] = useState('');
  const [sector, setSector] = useState('Tech & Services B2B');
  const [city, setCity] = useState('Paris');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Directeur Général');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('+33 6 ');
  const [cumulativeValue, setCumulativeValue] = useState('20000');
  const [paymentTerms, setPaymentTerms] = useState('Échéance 30j');
  const [status, setStatus] = useState<Company['status']>('Découverte');

  if (!isNewCompanyOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCompany({
      name: name.trim(),
      sector: sector.trim() || 'Conseil B2B',
      city: city.trim() || 'Paris',
      contactName: contactName.trim() || 'Direction Générale',
      contactRole: contactRole.trim() || 'Décideur',
      contactEmail:
        contactEmail.trim() ||
        `contact@${name.toLowerCase().replace(/[^a-z]/g, '')}.fr`,
      contactPhone: contactPhone.trim() || '+33 1 40 50 60 70',
      cumulativeValue: parseInt(cumulativeValue, 10) || 20000,
      paymentTerms,
      status,
    });

    setName('');
    setContactName('');
    setContactEmail('');
    closeNewCompany();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111827]/40 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={closeNewCompany} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white sm:rounded-xl rounded-t-2xl shadow-xl border border-[#E4E7EC] overflow-hidden z-10 max-h-[92vh] flex flex-col">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#E4E7EC] bg-[#F9FAFB]">
          <div>
            <h2 className="font-display text-base font-bold text-[#111827]">
              Nouvelle entreprise
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Ajouter une société au répertoire des comptes
            </p>
          </div>

          <button
            type="button"
            onClick={closeNewCompany}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-primary mb-1">
                Raison sociale de l’entreprise
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Horizon Media Group"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Secteur d’activité
              </label>
              <Input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ex. FinTech, Industrie..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Ville / Siège
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex. Paris, Lyon, Genève"
                required
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Contact principal
              </label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex. Julien Vance"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Fonction du contact
              </label>
              <Input
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="Ex. Directeur Général"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Email professionnel
              </label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="j.vance@entreprise.fr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Téléphone direct
              </label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Potentiel (€ HT)
              </label>
              <Input
                type="number"
                value={cumulativeValue}
                onChange={(e) => setCumulativeValue(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">
                Statut relationnel
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Company['status'])}
                className="w-full h-9 bg-white text-[#111827] text-xs font-medium rounded-lg border border-[#E4E7EC] px-2.5 focus:border-[#047857] outline-none"
              >
                <option value="Découverte">Découverte</option>
                <option value="Offre en cours">Offre en cours</option>
                <option value="Négociation">Négociation</option>
                <option value="Client Actif">Client Actif</option>
                <option value="Client Récurrent">Client Récurrent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">
                Conditions
              </label>
              <Input
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Échéance 30j"
              />
            </div>
          </div>

          <div className="pt-3 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 border-t border-[#E4E7EC]">
            <Button type="button" variant="secondary" size="md" onClick={closeNewCompany} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
              Ajouter l’entreprise
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
