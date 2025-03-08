"use client"

import { Header } from '../components/Header/Header';
import { FlashCardGrid } from '../components/FlashCardGrid/FlashCardGrid';
import { useDeck } from '../context/DeckContext';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@mantine/core';

export default function FlashCardsPage() {
  const { selectedDeck } = useDeck();
  const router = useRouter();
  if (!selectedDeck) {
    router.push('/decks');
  }

  return (
    <>
      <Header showButtons={false} />
      <ScrollArea
        h={window.innerHeight}>
        {selectedDeck && <FlashCardGrid deck={selectedDeck} />}
      </ScrollArea>
    </>
  );
}