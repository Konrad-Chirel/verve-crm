'use client';

import React, { useState, useEffect } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCRM } from '@/context/crm-context';

export default function ParametresPage() {
  const { profile, updateProfile, resetDemoData } = useCRM();

  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(profile.name);
  const [agency, setAgency] = useState(profile.agency);
  const [role, setRole] = useState(profile.role);
  const [monthlyTarget, setMonthlyTarget] = useState(String(profile.monthlyTarget));
  const [quarterlyTarget, setQuarterlyTarget] = useState(String(profile.quarterlyTarget));

  useEffect(() => {
    setName(profile.name);
    setAgency(profile.agency);
    setRole(profile.role);
    setMonthlyTarget(String(profile.monthlyTarget));
    setQuarterlyTarget(String(profile.quarterlyTarget));
  }, [profile]);

  const computedInitials =
    name
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'KB';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Konrad B.',
      role: role.trim() || 'Associé gérant',
      agency: agency.trim() || 'Atelier Nova',
      monthlyTarget: Number(monthlyTarget) || 50000,
      quarterlyTarget: Number(quarterlyTarget) || 160000,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="text-xs font-medium text-[#6B7280] mb-1">
          Configuration — {profile.agency}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
          Paramètres &amp; Objectifs
        </h1>
        <p className="text-sm text-[#4B5563] mt-1">
          Personnalisez votre profil d’associé, vos objectifs financiers et les données de votre espace
        </p>
      </div>

      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-2xs p-4 sm:p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-3.5 pb-5 border-b border-[#E4E7EC]">
            <div className="w-12 h-12 rounded-lg bg-[#047857] text-white flex items-center justify-center font-display font-bold text-base">
              {computedInitials}
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#111827]">{name}</h2>
              <p className="text-xs text-[#6B7280]">
                {role}, {agency}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Nom de l’associé
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Fonction
              </label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Raison sociale du cabinet
              </label>
              <Input value={agency} onChange={(e) => setAgency(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Devise de facturation
              </label>
              <Input
                value="EUR (€) — Hors taxes"
                readOnly
                className="bg-[#F9FAFB] text-[#6B7280]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Objectif mensuel d’honoraires (€ HT)
              </label>
              <Input
                type="number"
                min={5000}
                step={1000}
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Objectif trimestriel (€ HT)
              </label>
              <Input
                type="number"
                min={15000}
                step={5000}
                value={quarterlyTarget}
                onChange={(e) => setQuarterlyTarget(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E7EC]">
            <span className="text-xs text-[#6B7280]">
              {saved && (
                <span className="text-[#047857] font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Paramètres enregistrés
                </span>
              )}
            </span>
            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>

      {/* Demo Data Reset Section */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-2xs p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-sm text-[#111827]">
            Données de démonstration
          </h3>
          <p className="text-xs text-[#6B7280] max-w-lg">
            Vos modifications sont sauvegardées automatiquement dans votre navigateur. Vous pouvez restaurer l’état initial des dossiers à tout moment.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={resetDemoData}
          className="w-full sm:w-auto shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#4B5563]" />
          <span>Réinitialiser les données</span>
        </Button>
      </div>
    </div>
  );
}
