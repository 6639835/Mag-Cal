import React, { useState, useEffect } from 'react';
import { ActionIcon, useMantineColorScheme, Tooltip, Box } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

const ThemeToggle: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [isAnimating, setIsAnimating] = useState(false);

  // Add animation when theme changes
  const handleToggleTheme = () => {
    setIsAnimating(true);
    toggleColorScheme();
  };

  // Reset animation state
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [colorScheme]);

  return (
    <Box className={isAnimating ? 'theme-transition' : ''}>
      <Tooltip 
        label={isDark ? "Switch to light mode" : "Switch to dark mode"} 
        position="bottom"
        withArrow
      >
        <ActionIcon
          variant="filled"
          size="lg"
          onClick={handleToggleTheme}
          aria-label="Toggle color scheme"
          color={isDark ? "yellow" : "blue"}
          style={{
            transform: isAnimating ? 'rotate(30deg)' : 'none',
            transition: 'transform 0.3s ease, background-color 0.3s ease, color 0.3s ease'
          }}
        >
          {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Tooltip>
    </Box>
  );
};

export default ThemeToggle; 