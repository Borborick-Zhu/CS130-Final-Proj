import Link from 'next/link';
import { Button, Container, Group, Title } from '@mantine/core';
import classes from './Header.module.css';
import { MaskOnIcon } from '@radix-ui/react-icons';
import { Logo } from '../Logo/Logo';

// props to show buttons or not
export function Header({ showButtons = true }: { showButtons?: boolean }) {
  return (
    <header className={classes.header}>
      <Container size="xl" className={classes.inner}>
        <Logo />
        <Group>
          {showButtons && (
            <>
              <Button component="a" href="/login" variant="default">
                Log in
              </Button>
              <Button component="a" href="/signup">
                Sign up
              </Button>
            </>
          )}
        </Group>
      </Container>
    </header>
  );
}
