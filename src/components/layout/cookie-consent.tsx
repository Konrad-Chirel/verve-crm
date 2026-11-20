'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'verve_cookie_consent';
type ConsentState = 'all' | 'essential' | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_KEY);
      if (saved === 'all' || saved === 'essential') {
        setConsent(saved);
        setBannerOpen(false);
      } else {
        setBannerOpen(true);
      }
    } catch {
      setBannerOpen(true);
    }

    const handleReopen = () => setBannerOpen(true);
    window.addEventListener('verve:open-cookie-settings', handleReopen);
    return () => window.removeEventListener('verve:open-cookie-settings', handleReopen);
  }, []);

  const choose = (choice: 'all' | 'essential') => {
    setConsent(choice);
    setBannerOpen(false);
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <>
      {consent === 'all' && <Analytics />}

      {bannerOpen && (
        <aside
          role="dialog"
          aria-modal="false"
          aria-label="Gestion des cookies"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-[70] rounded-2xl bg-white border border-[#E4E7EC] shadow-[0_20px_50px_-15px_rgba(17,24,39,0.28)] p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#111827]">
              <Cookie className="w-4 h-4 text-[#047857] shrink-0" />
              <span>Respect de votre vie privée</span>
            </div>
            <button
              type="button"
              onClick={() => choose(consent || 'essential')}
              aria-label="Fermer et conserver uniquement les cookies essentiels"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2 text-xs text-[#4B5563] leading-relaxed">
            Verve CRM utilise des cookies strictement nécessaires à votre session et, avec votre accord, une mesure
            d’audience anonyme (Vercel Analytics) sans publicité.{' '}
            <Link href="/confidentialite" className="font-semibold text-[#047857] hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => choose('essential')}
              className="h-9 px-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E4E7EC] text-xs font-semibold text-[#111827] transition-colors cursor-pointer"
            >
              Essentiels uniquement
            </button>
            <button
              type="button"
              onClick={() => choose('all')}
              className="h-9 px-3 rounded-lg btn-primary text-xs font-semibold cursor-pointer"
            >
              Tout accepter
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
