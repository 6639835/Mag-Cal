import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppShell, 
  Group, 
  Container, 
  Burger, 
  Drawer, 
  Stack,
  Title,
  Text,
  ThemeIcon,
  Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCompass, IconMap2, IconHistory, IconInfoCircle } from '@tabler/icons-react';

const navItems = [
  { label: 'Home', path: '/', icon: IconCompass },
  { label: 'Map', path: '/map', icon: IconMap2 },
  { label: 'History', path: '/history', icon: IconHistory },
  { label: 'About', path: '/about', icon: IconInfoCircle },
];

function Header() {
  const [opened, { open, close }] = useDisclosure(false);
  const { pathname } = useLocation();

  return (
    <AppShell.Header p="md">
      <Container size="lg">
        <Group justify="space-between">
          <Group>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconCompass size={20} />
            </ThemeIcon>
            <Title order={3} style={{ lineHeight: 1 }}>
              MagCalc
            </Title>
          </Group>

          <Group gap={30} visibleFrom="sm">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                style={{ 
                  textDecoration: 'none', 
                  color: pathname === item.path ? 'var(--mantine-color-blue-filled)' : 'inherit',
                  fontWeight: pathname === item.path ? 700 : 400,
                }}
              >
                <Group gap={5}>
                  <item.icon size={18} />
                  <Text>{item.label}</Text>
                </Group>
              </Link>
            ))}
          </Group>

          <Burger opened={opened} onClick={open} hiddenFrom="sm" />
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        title={
          <Group>
            <IconCompass size={20} />
            <Text fw={700}>MagCalc</Text>
          </Group>
        }
        padding="xl"
        size="sm"
      >
        <Stack>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={close}
              style={{ 
                textDecoration: 'none', 
                color: pathname === item.path ? 'var(--mantine-color-blue-filled)' : 'inherit',
              }}
            >
              <Group>
                <item.icon size={20} />
                <Text fw={pathname === item.path ? 700 : 400}>{item.label}</Text>
              </Group>
            </Link>
          ))}
        </Stack>
      </Drawer>
    </AppShell.Header>
  );
}

export default Header; 