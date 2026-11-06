'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModalContextType {
  isNewDealOpen: boolean;
  openNewDeal: () => void;
  closeNewDeal: () => void;
  isNewCompanyOpen: boolean;
  openNewCompany: () => void;
  closeNewCompany: () => void;
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const openNewDeal = () => setIsNewDealOpen(true);
  const closeNewDeal = () => setIsNewDealOpen(false);
  const openNewCompany = () => setIsNewCompanyOpen(true);
  const closeNewCompany = () => setIsNewCompanyOpen(false);
  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsNewDealOpen(false);
        setIsNewCompanyOpen(false);
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isNewDealOpen,
        openNewDeal,
        closeNewDeal,
        isNewCompanyOpen,
        openNewCompany,
        closeNewCompany,
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
