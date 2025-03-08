"use client"

import { useEffect, useState } from 'react';
import { Pill, Card, Grid, Button, Modal, TextInput, Textarea, Group, Title, Container, Text, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDeck, Deck } from '@/app/context/DeckContext';
import { Pencil1Icon, TrashIcon, PlusIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { DeckCard } from '@/app/components/DeckCard/DeckCard';

export function DeckGrid() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDeckForEdit, setSelectedDeckForEdit] = useState<Deck | null>(null);
  const [formValues, setFormValues] = useState({ name: '', category: '', description: '' });
  const { setSelectedDeck } = useDeck();
  const router = useRouter();

  // Fetch decks from the API
  const fetchDecks = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/decks');
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
      } else {
        notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch decks' });
      }
    } catch (error) {
      notifications.show({ color: 'red', title: 'Error', message: 'Failed to fetch decks' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  // Create a new deck
  const handleCreateDeck = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      if (res.ok) {
        notifications.show({ color: 'teal', title: 'Success', message: 'Deck created successfully' });
        setCreateModalOpen(false);
        setFormValues({ name: '', category: '', description: '' });
        fetchDecks();
      } else {
        notifications.show({ color: 'red', title: 'Error', message: 'Failed to create deck' });
      }
    } catch (error) {
      notifications.show({ color: 'red', title: 'Error', message: 'Failed to create deck' });
    }
  };

  // Delete a deck
  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/decks/${deckId}`, { method: 'DELETE' });
      if (res.ok) {
        notifications.show({ color: 'teal', title: 'Success', message: 'Deck deleted successfully' });
        fetchDecks();
      } else {
        notifications.show({ color: 'red', title: 'Error', message: 'Failed to delete deck' });
      }
    } catch (error) {
      notifications.show({ color: 'red', title: 'Error', message: 'Failed to delete deck' });
    }
  };

  // Open edit modal and populate form fields
  const openEditModal = (deck: Deck) => {
    setSelectedDeckForEdit(deck);
    setFormValues({ name: deck.name, category: deck.category, description: deck.description });
    setEditModalOpen(true);
  };

  // Update a deck
  const handleUpdateDeck = async () => {
    if (!selectedDeckForEdit) return;
    try {
      const res = await fetch(`http://localhost:8000/api/decks/${selectedDeckForEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      if (res.ok) {
        notifications.show({ color: 'teal', title: 'Success', message: 'Deck updated successfully' });
        setEditModalOpen(false);
        setSelectedDeckForEdit(null);
        setFormValues({ name: '', category: '', description: '' });
        fetchDecks();
      } else {
        notifications.show({ color: 'red', title: 'Error', message: 'Failed to update deck' });
      }
    } catch (error) {
      notifications.show({ color: 'red', title: 'Error', message: 'Failed to update deck' });
    }
  };

  // Instead of routing to /decks/{deck.id}, set the selected deck in context
  const handleViewFlashcards = (deck: Deck) => {
    setSelectedDeck(deck);
    router.push('/flashcards')
  };

  return (
    <Container size="xl" pt={100}>
      <Group 
        justify="space-between"
        mb="md">
        <Title order={2}>Your Decks</Title>
        <Button 
          leftSection={<PlusIcon />}
          size="sm"
          variant="default"
          onClick={() => setCreateModalOpen(true)}>
            Create New
        </Button>
      </Group>

      <Group 
        gap="md"
        wrap="wrap">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id} 
            deck={deck} 
            onEdit={() => openEditModal(deck)}
            onDelete={() => handleDeleteDeck(deck.id)}
            onOpen={() => handleViewFlashcards(deck)}
          />
        ))}
      </Group>

      {/* Create Deck Modal */}
      <Modal 
        overlayProps={{
          backgroundOpacity: 0.75,
          blur: 4,
        }}
        centered
        opened={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        title="Create New Deck">
        <TextInput
          label="Name"
          placeholder="Deck name"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
        />
        <TextInput
          label="Category"
          placeholder="Category"
          mt="md"
          value={formValues.category}
          onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
        />
        <Textarea
          label="Description"
          placeholder="Description"
          mt="md"
          value={formValues.description}
          onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={handleCreateDeck}>Create</Button>
        </Group>
      </Modal>

      {/* Edit Deck Modal */}
      <Modal 
        overlayProps={{
          backgroundOpacity: 0.75,
          blur: 4,
        }}
        centered
        opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Deck">
        <TextInput
          label="Name"
          placeholder="Deck name"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
        />
        <TextInput
          label="Category"
          placeholder="Category"
          mt="md"
          value={formValues.category}
          onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
        />
        <Textarea
          label="Description"
          placeholder="Description"
          mt="md"
          value={formValues.description}
          onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
        />
        <Group position="right" mt="md">
          <Button onClick={handleUpdateDeck}>Update</Button>
        </Group>
      </Modal>
    </Container>
  );
}
