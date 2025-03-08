import { Card, Title, Text, Center } from '@mantine/core';
import { useState } from 'react';
import styles from './FlashCard.module.css';

interface FlashCard {
	question: string;
	answer: string;
}

interface FlashCardProps {
	card: FlashCard;
	study?: boolean;
}

export function FlashCard({ card, study = false }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      className={`${styles.flashCardContainer} ${study ? styles.studyFlashCard : ''}`}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div className={`${styles.flipOuter} ${flipped ? styles.flipped : ''}`}>
        {/* Front Face: Question */}
        <div className={styles.flashCardFace}>
          <Card 
						w="100%"
						h="100%"
						bg="zinc.8"
						shadow="sm"
						padding="lg"
					>
						<Center
							w="100%"
							h="100%"
						>
							<Title order={4} ta="center">{card.question}</Title>
						</Center>
          </Card>
        </div>
        {/* Back Face: Answer */}
        <div className={`${styles.flashCardFace} ${styles.flashCardBack}`}>
          <Card 
						w="100%"
						h="100%"
						bg="zinc.8"
						shadow="sm"
						padding="lg"
					>
						<Center
							w="100%"
							h="100%"
						>
							<Text size="sm">{card.answer}</Text>
						</Center>
          </Card>
        </div>
      </div>
    </div>
  );
}
