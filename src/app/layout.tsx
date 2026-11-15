import type { Metadata } from 'next';
import './globals.css';
import { BRAND } from '@/lib/brand';
import { CRMProvider } from '@/context/crm-context';
import { ModalProvider } from '@/context/modal-context';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.subtitle}`,
  description: BRAND.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-canvas text-text-primary min-h-screen antialiased overflow-x-hidden selection:bg-[#A7F3D0] selection:text-[#005d42]">
        <CRMProvider>
          <ModalProvider>
            <AppShell>{children}</AppShell>
          </ModalProvider>
        </CRMProvider>
      </body>
    </html>
  );
}
