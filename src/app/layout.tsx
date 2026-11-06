import type { Metadata } from 'next';
import './globals.css';
import { BRAND } from '@/lib/brand';
import { CRMProvider } from '@/context/crm-context';
import { ModalProvider } from '@/context/modal-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { NewDealModal } from '@/components/modals/new-deal-modal';
import { NewCompanyModal } from '@/components/modals/new-company-modal';
import { CommandPalette } from '@/components/layout/command-palette';

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
            {/* Desktop & Tablet Sidebar */}
            <Sidebar />

            {/* Top Bar Header */}
            <Topbar />

            {/* Main Workspace Canvas */}
            <main className="md:pl-[68px] xl:pl-60 pt-16 pb-24 md:pb-12 min-h-screen">
              <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
              </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <MobileNav />

            {/* Global Modals & Command Palette */}
            <NewDealModal />
            <NewCompanyModal />
            <CommandPalette />
          </ModalProvider>
        </CRMProvider>
      </body>
    </html>
  );
}
