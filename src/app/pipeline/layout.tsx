import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pipeline commercial',
  description: 'Tableau Kanban en 5 étapes et vue registre pour suivre vos mandats B2B et honoraires pondérés.',
  robots: { index: false, follow: false },
};

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
