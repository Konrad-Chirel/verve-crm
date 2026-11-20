import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créer un espace cabinet',
  description:
    'Créez gratuitement votre compte Verve CRM pour piloter votre pipeline commercial, vos clients et vos lettres de mission PDF.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
