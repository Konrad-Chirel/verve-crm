import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trésorerie & rapports',
  description: 'Projections de trésorerie sur 6 mois, simulateur de closing et rapport financier PDF.',
  robots: { index: false, follow: false },
};

export default function RapportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
