'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Mail,
  Phone,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, sanitizeCsvCell } from '@/lib/utils';
import { useModal } from '@/context/modal-context';
import { useCRM } from '@/context/crm-context';
import type { Company } from '@/lib/mock-data';

const ITEMS_PER_PAGE = 5;

export default function ClientsPage() {
  const { openNewCompany } = useModal();
  const { companies, updateCompany, deleteCompany, profile, showToast } = useCRM();

  const [activeFilter, setActiveFilter] = useState<'all' | 'clients' | 'prospects' | 'partners'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Company Modal State
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [editName, setEditName] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactRole, setEditContactRole] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editCumulativeValue, setEditCumulativeValue] = useState('0');
  const [editPaymentTerms, setEditPaymentTerms] = useState('Échéance 30j');
  const [editStatus, setEditStatus] = useState<Company['status']>('Offre en cours');

  const openEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setEditName(comp.name);
    setEditSector(comp.sector);
    setEditCity(comp.city);
    setEditContactName(comp.primaryContact.name);
    setEditContactRole(comp.primaryContact.role);
    setEditContactEmail(comp.primaryContact.email || '');
    setEditContactPhone(comp.primaryContact.phone || '');
    setEditCumulativeValue(String(comp.cumulativeValue || 0));
    setEditPaymentTerms(comp.paymentTerms || 'Échéance 30j');
    setEditStatus(comp.status);
  };

  const handleSaveCompanyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editName.trim()) return;

    updateCompany(editingCompany.id, {
      name: editName.trim(),
      sector: editSector.trim() || 'Conseil B2B',
      city: editCity.trim() || 'Paris',
      contactName: editContactName.trim() || 'Direction Générale',
      contactRole: editContactRole.trim() || 'Décideur',
      contactEmail: editContactEmail.trim(),
      contactPhone: editContactPhone.trim(),
      cumulativeValue: Math.max(0, Number(editCumulativeValue) || 0),
      paymentTerms: editPaymentTerms.trim() || 'Échéance 30j',
      status: editStatus,
    });
    setEditingCompany(null);
  };

  const countAll = companies.length;
  const countClients = companies.filter((c) => c.status.includes('Client')).length;
  const countProspects = companies.filter((c) => c.status === 'Offre en cours' || c.status === 'Négociation').length;
  const countPartners = companies.filter((c) => c.status === 'Découverte').length;

  const totalVolume = companies.reduce((sum, c) => sum + c.cumulativeValue, 0);

  const filteredCompanies = companies.filter((comp) => {
    if (activeFilter === 'clients' && !comp.status.includes('Client')) return false;
    if (activeFilter === 'prospects' && comp.status !== 'Offre en cours' && comp.status !== 'Négociation') return false;
    if (activeFilter === 'partners' && comp.status !== 'Découverte') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.sector.toLowerCase().includes(q) ||
        comp.city.toLowerCase().includes(q) ||
        comp.primaryContact.name.toLowerCase().includes(q) ||
        (comp.primaryContact.email || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (f: 'all' | 'clients' | 'prospects' | 'partners') => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const sanitizeMailto = (email: string) =>
    email.replace(/[\s?&<>'"\r\n]/g, '');

  const sanitizeTel = (phone: string) =>
    phone.replace(/[^0-9+\-().\s]/g, '');

  const handleExportCSV = () => {
    const headers = [
      'Societe',
      'Secteur',
      'Ville',
      'Interlocuteur',
      'Fonction',
      'Email',
      'Telephone',
      'Mandat Principal',
      'Volume Cumule EUR HT',
      'Modalites',
      'Statut',
    ];
    const rows = filteredCompanies.map((c) => [
      sanitizeCsvCell(c.name),
      sanitizeCsvCell(c.sector),
      sanitizeCsvCell(c.city),
      sanitizeCsvCell(c.primaryContact.name),
      sanitizeCsvCell(c.primaryContact.role),
      sanitizeCsvCell(c.primaryContact.email || ''),
      sanitizeCsvCell(c.primaryContact.phone || ''),
      sanitizeCsvCell(c.activeDealsDescription),
      Number.isFinite(Number(c.cumulativeValue)) ? Number(c.cumulativeValue) : 0,
      sanitizeCsvCell(c.paymentTerms),
      sanitizeCsvCell(c.status),
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repertoire-clients-verve-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Export CSV téléchargé (${filteredCompanies.length} sociétés)`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Ledger Totals */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#6B7280] mb-1">
            Base de comptes — {profile.agency}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] tracking-tight">
            Répertoire sociétés &amp; interlocuteurs
          </h1>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[#E4E7EC] bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-2xs md:shrink-0">
          <div className="px-4 sm:px-5 py-2.5">
            <div className="text-[11px] font-medium text-[#6B7280]">
              Sociétés suivies
            </div>
            <div className="font-display text-base sm:text-lg font-bold text-[#111827] tabular-nums mt-0.5">
              {countAll} comptes
            </div>
          </div>
          <div className="px-4 sm:px-5 py-2.5">
            <div className="text-[11px] font-medium text-[#6B7280]">
              Volume cumulé
            </div>
            <div className="font-display text-base sm:text-lg font-bold text-[#047857] tabular-nums mt-0.5">
              {formatCurrency(totalVolume)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Segmented Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-white border border-[#E4E7EC] rounded-lg overflow-x-auto self-start max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#047857] text-white font-semibold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Toutes ({countAll})
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('clients')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'clients'
                ? 'bg-[#047857] text-white font-semibold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Clients sous contrat ({countClients})
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('prospects')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'prospects'
                ? 'bg-[#047857] text-white font-semibold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Offre en cours ({countProspects})
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('partners')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'partners'
                ? 'bg-[#047857] text-white font-semibold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Qualification ({countPartners})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2.5">
          <div className="relative col-span-2 sm:col-span-1 sm:flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher société, ville, contact..."
              className="w-full h-9 pl-8 pr-3 bg-white rounded-lg text-xs text-[#111827] placeholder:text-[#9CA3AF] border border-[#E4E7EC] focus:border-[#047857] outline-none transition-colors"
            />
          </div>

          <Button variant="secondary" size="md" onClick={handleExportCSV} className="w-full sm:w-auto">
            <Download className="w-3.5 h-3.5 text-[#4B5563]" />
            <span>Exporter CSV</span>
          </Button>

          <Button variant="primary" size="md" onClick={openNewCompany} className="w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>Nouvelle société</span>
          </Button>
        </div>
      </div>

      {/* 3. Directory Ledger Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-2xs">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB] text-xs font-semibold text-[#4B5563]">
                <th className="px-6 py-3.5">Société &amp; Secteur</th>
                <th className="px-6 py-3.5">Interlocuteur principal</th>
                <th className="px-6 py-3.5">Mandat rattaché</th>
                <th className="px-6 py-3.5 text-right">Volume cumulé</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC] text-xs">
              {paginatedCompanies.map((comp) => (
                <tr key={comp.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#F3F4F6] text-[#111827] border border-[#E4E7EC] flex items-center justify-center text-xs font-bold shrink-0">
                        {comp.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-[#111827]">
                          {comp.name}
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5">
                          {comp.sector}, {comp.city}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-[#111827]">
                      {comp.primaryContact.name}
                    </div>
                    <div className="text-xs text-[#6B7280] mt-0.5">
                      {comp.primaryContact.role}
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 text-[11px] text-[#047857]">
                      {comp.primaryContact.email && (
                        <a
                          href={`mailto:${sanitizeMailto(comp.primaryContact.email)}`}
                          className="inline-flex items-center gap-1 hover:underline"
                          title={comp.primaryContact.email}
                        >
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[140px]">{comp.primaryContact.email}</span>
                        </a>
                      )}
                      {comp.primaryContact.phone && (
                        <a
                          href={`tel:${sanitizeTel(comp.primaryContact.phone)}`}
                          className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#111827]"
                          title={comp.primaryContact.phone}
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-[#111827]">
                      {comp.activeDealsDescription}
                    </div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5">
                      {comp.activeDealsCount} dossier actif
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="font-display font-bold text-sm text-[#111827] tabular-nums">
                      {formatCurrency(comp.cumulativeValue)}
                    </div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5">
                      {comp.paymentTerms}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        comp.status === 'Offre en cours' || comp.status === 'Négociation'
                          ? 'bg-[#FFFBEB] text-[#B45309]'
                          : comp.status === 'Client Récurrent' || comp.status === 'Client Actif'
                          ? 'bg-[#ECFDF5] text-[#047857]'
                          : 'bg-[#F3F4F6] text-[#4B5563]'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/deals/${comp.primaryDealId || 'deal-lumina'}`}>
                        <Button variant="secondary" size="sm">
                          Dossier
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(comp)}
                        title={`Modifier ${comp.name}`}
                        className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCompany(comp)}
                        title={`Retirer ${comp.name}`}
                        className="w-8 h-8 rounded-lg hover:bg-[#FFF1F2] flex items-center justify-center text-[#6B7280] hover:text-[#BE123C] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCompanies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#6B7280]">
                    Aucune société ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-[#E4E7EC]">
          {paginatedCompanies.map((comp) => (
            <div key={comp.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm text-[#111827]">{comp.name}</div>
                  <div className="text-xs text-[#6B7280]">
                    {comp.sector}, {comp.city}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    comp.status === 'Offre en cours' || comp.status === 'Négociation'
                      ? 'bg-[#FFFBEB] text-[#B45309]'
                      : comp.status === 'Client Récurrent' || comp.status === 'Client Actif'
                      ? 'bg-[#ECFDF5] text-[#047857]'
                      : 'bg-[#F3F4F6] text-[#4B5563]'
                  }`}
                >
                  {comp.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#4B5563]">
                  {comp.primaryContact.name} ({comp.primaryContact.role})
                </span>
                <span className="font-display font-bold text-sm text-[#111827] tabular-nums">
                  {formatCurrency(comp.cumulativeValue)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
                <span className="text-xs text-[#6B7280] truncate max-w-[55%]">
                  {comp.activeDealsDescription}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/deals/${comp.primaryDealId || 'deal-lumina'}`}
                    className="text-xs font-semibold text-[#047857] hover:underline"
                  >
                    Ouvrir
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(comp)}
                    className="p-1 text-[#6B7280] hover:text-[#111827]"
                    title="Modifier"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCompany(comp)}
                    className="p-1 text-[#6B7280] hover:text-[#BE123C]"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-3.5 bg-[#F9FAFB] border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div>
            Affichage de{' '}
            <span className="font-semibold text-[#111827]">
              {filteredCompanies.length === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredCompanies.length)}
            </span>{' '}
            sur <span className="font-semibold text-[#111827]">{filteredCompanies.length}</span>{' '}
            sociétés
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2.5 rounded-md bg-white border border-[#E4E7EC] text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  safePage === p
                    ? 'bg-[#047857] text-white'
                    : 'bg-white hover:bg-[#F3F4F6] text-[#111827] border border-[#E4E7EC]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2.5 rounded-md bg-white border border-[#E4E7EC] text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Suivant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111827]/40 backdrop-blur-[2px]">
          <div className="fixed inset-0" onClick={() => setEditingCompany(null)} aria-hidden="true" />

          <div className="relative w-full max-w-lg bg-white sm:rounded-xl rounded-t-2xl shadow-xl border border-[#E4E7EC] overflow-hidden z-10 max-h-[92vh] flex flex-col">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#E4E7EC] bg-[#F9FAFB]">
              <div>
                <h2 className="font-display text-base font-bold text-[#111827]">
                  Modifier la fiche société
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Mise à jour synchronisée avec les dossiers rattachés
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCompany(null)}
                className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompanyEdit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Raison sociale
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Secteur d’activité
                  </label>
                  <Input
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Ville / Siège
                  </label>
                  <Input
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E7EC] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Interlocuteur principal
                  </label>
                  <Input
                    value={editContactName}
                    onChange={(e) => setEditContactName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Fonction
                  </label>
                  <Input
                    value={editContactRole}
                    onChange={(e) => setEditContactRole(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Email professionnel
                  </label>
                  <Input
                    type="email"
                    value={editContactEmail}
                    onChange={(e) => setEditContactEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Téléphone direct
                  </label>
                  <Input
                    value={editContactPhone}
                    onChange={(e) => setEditContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E7EC] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Volume cumulé (€ HT)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={editCumulativeValue}
                    onChange={(e) => setEditCumulativeValue(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Statut relationnel
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Company['status'])}
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
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Conditions
                  </label>
                  <Input
                    value={editPaymentTerms}
                    onChange={(e) => setEditPaymentTerms(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 border-t border-[#E4E7EC]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setEditingCompany(null)}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                  <Check className="w-4 h-4" />
                  <span>Enregistrer</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Confirm Delete Company Modal */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-[2px]">
          <div
            className="fixed inset-0"
            onClick={() => setDeletingCompany(null)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-[#E4E7EC] overflow-hidden z-10 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-bold text-[#111827]">
                  Confirmer la suppression
                </h2>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                  Voulez-vous vraiment retirer la société{' '}
                  <strong className="text-[#111827] font-semibold">
                    « {deletingCompany.name} »
                  </strong>{' '}
                  ({deletingCompany.primaryContact.name}) du répertoire des comptes ?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E4E7EC] flex items-center justify-between text-xs">
              <span className="text-[#6B7280]">{deletingCompany.sector} — {deletingCompany.city}</span>
              <span className="font-display font-bold text-[#111827] tabular-nums">
                {formatCurrency(deletingCompany.cumulativeValue)}
              </span>
            </div>

            <div className="pt-3 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 border-t border-[#E4E7EC]">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setDeletingCompany(null)}
                className="w-full sm:w-auto h-10 sm:h-9 whitespace-nowrap"
              >
                Annuler
              </Button>
              <button
                type="button"
                onClick={() => {
                  deleteCompany(deletingCompany.id);
                  setDeletingCompany(null);
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
