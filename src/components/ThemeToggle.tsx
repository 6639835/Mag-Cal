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
    }, 600);
    return () => clearTimeout(timeout);
  }, [colorScheme]);

  useEffect(() => {
    // Add keyframes for sun rays animation
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes sunRays {
        0% { transform: scale(0.8) rotate(0deg); }
        50% { transform: scale(1.2) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <Box className={isAnimating ? 'theme-transition' : ''}>
      <Tooltip 
        label={isDark ? "Switch to light mode" : "Switch to dark mode"} 
        position="bottom"
        withArrow
        transitionProps={{ transition: 'pop', duration: 300 }}
      >
        <ActionIcon
          variant="filled"
          size="lg"
          onClick={handleToggleTheme}
          aria-label="Toggle color scheme"
          color={isDark ? "yellow" : "blue"}
          style={{
            transform: isAnimating 
              ? `rotate(${isDark ? -180 : 180}deg) scale(${isAnimating ? 1.2 : 1})` 
              : 'none',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: isAnimating 
              ? (isDark 
                ? '0 0 20px rgba(252, 220, 0, 0.6)' 
                : '0 0 20px rgba(0, 120, 255, 0.6)')
              : 'none'
          }}
        >
          {isDark ? <IconSun size={20} style={{ animation: isAnimating ? 'sunRays 1s ease' : 'none' }} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Tooltip>
    </Box>
  );
};

export default ThemeToggle; 