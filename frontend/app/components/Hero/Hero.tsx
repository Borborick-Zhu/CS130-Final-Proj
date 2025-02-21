'use client'

import { Container, Title, Text, Button, Group, Stack, Grid, ThemeIcon, Box, Paper, rgba } from "@mantine/core";
import { GitHubLogoIcon, RocketIcon, LightningBoltIcon, StarIcon, DashboardIcon } from "@radix-ui/react-icons";
import classes from "./Hero.module.css";

export const Hero = () => {
  const features = [
    { icon: <LightningBoltIcon />, label: "Lightning Fast" },
    { icon: <StarIcon />, label: "Production Ready" },
    { icon: <DashboardIcon />, label: "Modern Design" },
  ];

  return (
    <Box>
      <Container size="xl" py={200}>
        <Grid gutter={40} align="center">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="xl">
              <Title className={classes?.title} order={1} size="h1">
								Don’t waste any <br />time making study resources
              </Title>

              <Text size="xl" c="dimmed" maw={600}>
							QuickThink leverages intelligent
							AI to summarise your course content into easy-to-digest,
							relevant flash cards.
              </Text>

              <Group mt="xl">
                <Button size="lg" leftSection={<RocketIcon />} component="a" href="/dashboard">
                  Get Started
                </Button>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper
              mih={320}
              radius="md"
              p="xl"
              bg={"rgba(255, 255, 255, 0.1)"}
              bd={" 1px solid rgba(255, 255, 255, 0.1) "}
            ></Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};