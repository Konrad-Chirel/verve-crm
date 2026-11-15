import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { BRAND } from '@/lib/brand';
import { CRMProvider } from '@/context/crm-context';
import { ModalProvider } from '@/context/modal-context';
import { AppShell } from '@/components/layout/app-shell';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://verve-crm.vercel.app'),
  title: {
    default: `${BRAND.name} — ${BRAND.subtitle}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    'CRM B2B',
    'Pipeline commercial',
    'Cabinet de conseil',
    'Gestion de mandats',
    'Agence digitale',
    'Verve CRM',
    'Pilotage trésorerie',
  ],
  authors: [{ name: BRAND.user.name }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.subtitle}`,
    description: BRAND.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.subtitle}`,
    description: BRAND.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${outfit.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-sans bg-canvas text-text-primary min-h-screen antialiased overflow-x-hidden selection:bg-[#A7F3D0] selection:text-[#005d42]"
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('verve_theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
        <CRMProvider>
          <ModalProvider>
            <AppShell>{children}</AppShell>
          </ModalProvider>
        </CRMProvider>
      </body>
    </html>
  );
}
