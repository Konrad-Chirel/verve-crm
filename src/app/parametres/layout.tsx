import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paramètres & objectifs',
  description: 'Configurez votre profil cabinet, vos objectifs trimestriels, le thème d’affichage et vos sauvegardes JSON.',
  robots: { index: false, follow: false },
};

export default function ParametresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
