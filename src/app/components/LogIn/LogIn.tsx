'use client';
import { signIn } from '@/pages/api/auth/remote'

import {
  Anchor,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';

interface LogInFormValues {
  email: string;
  password: string;
}

export function LogIn() {
  const router = useRouter();

  const form = useForm<LogInFormValues>({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });
  const handleSubmit = async (values: LogInFormValues) => {
    try {
      const response = await signIn(values.email, values.password);
      
      if (response.success) {
        router.push('/decks')
				console.log('Login successful');
      } else {
        console.error('Login failed:', response.error);
      }
    } catch (error) {
      console.error('Error during Login:', error);
    }
  };
  
  return (
    <Container pt={100} size="sm">
      <Paper p="xl" mt="xl" withBorder>
        <Stack align="center" gap="xs" mb="xl">
          <Title order={4}>
            Log in
          </Title>

          <Anchor component="a" href="/signup" type="button" c="dimmed" size="xs">
            Don't have an account? Sign up
          </Anchor>
        </Stack>

        <Divider label="or" labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="hello@mantine.dev"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && 'Invalid email'}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password && 'Password should include at least 6 characters'}
            />
          </Stack>

          <Group grow mt="xl">
            <Button type="submit">
              Log in
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
