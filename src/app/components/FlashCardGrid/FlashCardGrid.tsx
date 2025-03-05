"use client"

import { useEffect, useState } from 'react';
import { Card, Grid, Button, Modal, TextInput, Textarea, Group, Title, Stack, Text, Container, Pill, ActionIcon, SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FileDrop } from '@/app/components/FileDrop/FileDrop';
import { useDisclosure } from '@mantine/hooks';
import { Deck } from '@/app/context/DeckContext';
import { UploadIcon, PlusIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { FlashCard } from '@/app/components/FlashCard/FlashCard';

interface FlashCard {
  id: string;
  question: string;
  answer: string;
  [key: string]: any;
}

interface FlashCardGridProps {
  deck: Deck;
}

export function FlashCardGrid({ deck }: FlashCardGridProps) {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({ question: '', answer: '' });
  const [flashCardView, setFlashCardView] = useState<'Scroll' | 'Study'>('Scroll');
  
  const [fileDropModalOpen, setFileDropModalOpen] = useState(false);
  const [flashCardModalOpen, setFlashCardModalOpen] = useState(false);

  // State for Study mode
  const [currentIndex, setCurrentIndex] = useState(0);

  const router = useRouter();
  
  // Fetch flashcards for the deck
  const fetchFlashcards = async () => {
    console.log("fetching flashcards for deck", deck.id)
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/decks/${deck.id}/flashcards`);
      if (res.ok) {
        const data = await res.json();
        setFlashcards(data);
      } else {
        notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch flashcards' });
      }
    } catch (error) {
      notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch flashcards' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (deck) fetchFlashcards();
  }, [deck]);

  // Reset currentIndex when flashcards update
  useEffect(() => {
    setCurrentIndex(0);
  }, [flashcards]);

  // Create a new flashcard
  const handleCreateFlashcard = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/decks/${deck.id}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ question: formValues.question, answer: formValues.answer }]),
      });
      if (res.ok) {
        notifications.show({ color: 'teal', title: 'Success', message: 'Flashcard added successfully' });
        setFlashCardModalOpen(false);
        setFormValues({ question: '', answer: '' });
        fetchFlashcards();
      } else {
        notifications.show({ color: 'red', title: 'Error', message: 'Failed to add flashcard' });
      }
    } catch (error) {
      notifications.show({ color: 'red', title: 'Error', message: 'Failed to add flashcard' });
    }
  };

  // Handle file upload (PDF) to generate flashcards using AI
  const handleFileUpload = async (files: File[]) => {
    // For simplicity, assume a single file upload
    const file = files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`http://localhost:8000/api/decks/${deck.id}/flashcards/file`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        notifications.show({
          color: 'teal',
          title: 'Success',
          message: 'Flashcards generated from PDF',
        });
        fetchFlashcards();
      } else {
        notifications.show({
          color: 'red',
          title: 'Error',
          message: 'Failed to generate flashcards from PDF',
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to generate flashcards from PDF',
      });
    }
  }

  return (
    <Container size="xl" pt={100} pb={50}>
      {/* Display deck info */}
      {deck && (
        <Stack 
          style={{ position: 'relative' }}
          mb="xl" 
          gap="xs">
          <ActionIcon
            style={{ position: 'absolute', left: '-5px', top: '-25px' }}
            c="dimmed"
            size="sm"
            variant="transparent"
            onClick={() => router.back()}>
            <ArrowLeftIcon style={{ width: '90%', height: '90%' }} />
          </ActionIcon>
          <Group
            align="center">
            <Title order={2}>{deck.name}</Title>
            <Pill>{deck.category}</Pill>
          </Group>
          <Text>{deck.description}</Text>
        </Stack>
      )}

      <Group 
        justify="space-between"
        py="md"
        mb="md">
        <Group
          gap="md">
          <Title order={3}>Your Flashcards</Title>
          <SegmentedControl 
            size="sm"
            withItemsBorders={false} 
            data={['Scroll', 'Study']} 
            value={flashCardView}
            onChange={(value) => setFlashCardView(value as 'Scroll' | 'Study')}
          />
        </Group>
        <Group
          gap="xs">
          <Button 
            leftSection={<PlusIcon />}
            size="sm"
            variant="default"
            onClick={() => setFlashCardModalOpen(true)}>
            Create New
          </Button>
          <Button 
            leftSection={<UploadIcon />}
            size="sm"
            variant="default"
            onClick={() => setFileDropModalOpen(true)}>
            Upload PDFs
          </Button>
        </Group>
      </Group>

      {/* Render flashcards */}
      {/* if flashCardView is Scroll, render a grid of flashcards with span 4 */}
      {flashCardView === 'Scroll' && (
        <Group 
          gap="md"
          wrap="wrap">
          {flashcards.map((card) => (
            <FlashCard key={card.id} card={card} />
          ))}
        </Group>
      )}

      {/* Render flashcards in Study mode */}
      {flashCardView === 'Study' && (
        <Stack 
          align="center" 
          gap="md"
          mt={50}>
          {flashcards.length > 0 ? (
            <>
              <FlashCard card={flashcards[currentIndex]} study/>
              <Group align="center" mt={50}>
                <ActionIcon
                  size="lg"
                  variant="default"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                >
                  <ChevronLeftIcon />
                </ActionIcon>
                <Text>
                  {currentIndex + 1} / {flashcards.length}
                </Text>
                <ActionIcon
                  size="lg"
                  variant="default"
                  disabled={currentIndex === flashcards.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                  <ChevronRightIcon />
                </ActionIcon>
              </Group>
            </>
          ) : (
            <Text>No flashcards available for study</Text>
          )}
        </Stack>
      )}

      {/* Create Flashcard Modal */}
      <Modal 
        overlayProps={{
          backgroundOpacity: 0.75,
          blur: 4,
        }}
        centered
        opened={flashCardModalOpen} 
        onClose={() => setFlashCardModalOpen(false)} 
        title="Add Flashcard">
        <TextInput
          label="Question"
          placeholder="Enter question"
          value={formValues.question}
          onChange={(e) => setFormValues({ ...formValues, question: e.target.value })}
        />
        <Textarea
          label="Answer"
          placeholder="Enter answer"
          mt="md"
          value={formValues.answer}
          onChange={(e) => setFormValues({ ...formValues, answer: e.target.value })}
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={handleCreateFlashcard}>Add</Button>
        </Group>
      </Modal>

      <Modal
        overlayProps={{
          backgroundOpacity: 0.75,
          blur: 4,
        }}
        centered
        opened={fileDropModalOpen}
        onClose={() => setFileDropModalOpen(false)}
        title="File Upload"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Upload PDFs and watch your flashcards magically appear!
          </Text>
          <FileDrop
            onUploadStart={() => {}}
            onUploadEnd={handleFileUpload}
          />
        </Stack>
      </Modal>

    </Container>
  );
}
