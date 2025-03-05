'use client';
import { signUp } from '@/pages/api/auth/remote'

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

interface SignUpFormValues {
  email: string;
  password: string;
}

export function SignUp() {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });
  const handleSubmit = async (values: SignUpFormValues) => {
    try {
      const response = await signUp(values.email, values.password);
      
      if (response.success) {
        router.push('/decks')
        console.log('Signup successful');
      } else {
        console.error('Signup failed:', response.error);
      }
    } catch (error) {
      console.error('Error during Signup:', error);
    }
  };
  
  return (
    <Container pt={100} size="sm">
      <Paper p="xl" mt="xl" withBorder>
        <Stack align="center" gap="xs" mb="xl">
          <Title order={4}>
            Sign up
          </Title>

          <Anchor component="a" href="/login" type="button" c="dimmed" size="xs">
            Already have an account? Log in
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
              Sign up
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
