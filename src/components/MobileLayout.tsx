import React from 'react';
import { Container, Stack, Box, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Container size="xs" px="xs">
      <Stack gap="md">
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
            borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[3]}`,
            padding: theme.spacing.sm,
          }}
        >
          {children}
        </Box>
        <Box mt={60} mb={20}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
};

export default MobileLayout; 