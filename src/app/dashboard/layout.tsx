import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord',
  description: 'Synthèse exécutive, objectifs de chiffre d’affaires et feuille de route des relances du jour.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
