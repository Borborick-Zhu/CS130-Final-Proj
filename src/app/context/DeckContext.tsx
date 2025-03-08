"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Deck {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface DeckContextType {
  selectedDeck: Deck | null;
  setSelectedDeck: (deck: Deck | null) => void;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(() => {
    const stored = localStorage.getItem('selectedDeck');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (selectedDeck) {
      localStorage.setItem('selectedDeck', JSON.stringify(selectedDeck));
    } else {
      localStorage.removeItem('selectedDeck');
    }
  }, [selectedDeck]);

  return (
    <DeckContext.Provider value={{ selectedDeck, setSelectedDeck }}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
};
