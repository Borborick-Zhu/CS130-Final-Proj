import { Title } from '@mantine/core';

import { Group } from '@mantine/core';
import { IconCards } from '@tabler/icons-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link 
			href="/">
			<Group
				gap={5}>
				<IconCards />
				<Title order={4}>QuickThink</Title>
			</Group>
		</Link>
  );
}