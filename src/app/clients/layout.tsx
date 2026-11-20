import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Répertoire clients',
  description: 'Annuaire de vos sociétés clientes, décideurs principaux, volumes cumulés et export CSV.',
  robots: { index: false, follow: false },
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
