'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { NewDealModal } from '@/components/modals/new-deal-modal';
import { NewCompanyModal } from '@/components/modals/new-company-modal';
import { CommandPalette } from '@/components/layout/command-palette';

const PUBLIC_SHELL_FREE_ROUTES = ['/login', '/register', '/confidentialite', '/cgu'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/' || PUBLIC_SHELL_FREE_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <Topbar />
      <main className="md:pl-[68px] xl:pl-60 pt-16 pb-24 md:pb-12 min-h-screen">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
      <MobileNav />
      <NewDealModal />
      <NewCompanyModal />
      <CommandPalette />
    </>
  );
}
