import { Button, Group, ActionIcon, Stack, Pill, Title, Text, Card } from '@mantine/core';
import { Pencil1Icon, TrashIcon, CardStackIcon } from '@radix-ui/react-icons';
import { Deck } from '@/app/context/DeckContext';
interface DeckProps {
	deck: Deck;
}

interface DeckCardProps extends DeckProps {
	onEdit: () => void;
	onDelete: () => void;
	onOpen: () => void;
}

export function DeckCard({ deck, onEdit, onDelete, onOpen }: DeckCardProps) {
	return (
		<Card 
			w={385}
			h={230}
			bg="zinc.8"
			shadow="sm" 
			padding="lg">
			<Stack
				h="100%"
				justify="space-between">
				<Stack
					gap={0}>
					<Group justify="space-between">
						<Title 
							order={3}>{deck.name}
						</Title>
						<Pill>
							{deck.category}
						</Pill>
					</Group>
					<Text 
						my="md"
						size="sm">{deck.description}
					</Text>
				</Stack>
				<Group 
					justify="space-between"
					align="flex-end"
					mt="sm" 
					gap="xs">
					<Button 
						leftSection={<CardStackIcon />}
						size="sm" 
						variant="light"
						onClick={onOpen}>
						Flashcards
					</Button>
					<Group 
						gap="xs">
						<ActionIcon 
							size="md" 
							variant="light" 
							onClick={onEdit}>
							<Pencil1Icon style={{ width: '60%', height: '60%' }}/>
						</ActionIcon>
						<ActionIcon 
							color="red"
							size="md" 
							variant="light" 
							onClick={onDelete}>
							<TrashIcon style={{ width: '60%', height: '60%' }}/>
						</ActionIcon>
					</Group>
				</Group>
			</Stack>
		</Card>
	)
}