import React from 'react';
import { Accordion, Text, List, Paper, Title, Stack } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';

const Documentation: React.FC = () => {
  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3} display="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <IconHelp size={20} />
          Help & Documentation
        </Title>

        <Accordion variant="contained">
          <Accordion.Item value="getting-started">
            <Accordion.Control>Getting Started</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs">
                To calculate magnetic declination:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Enter your location coordinates or use the map to select a location</List.Item>
                <List.Item>Fill in the date for which you want to calculate declination</List.Item>
                <List.Item>Click "Calculate" to see the results</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="location-input">
            <Accordion.Control>Location Input Methods</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs">
                You can input your location in several ways:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Use the interactive map to click and select a location</List.Item>
                <List.Item>Enter coordinates manually in decimal degrees</List.Item>
                <List.Item>Search for a location using the search bar</List.Item>
                <List.Item>Select from your favorite locations</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="results">
            <Accordion.Control>Understanding Results</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs">
                The results show:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Magnetic declination angle (positive for east, negative for west)</List.Item>
                <List.Item>Annual rate of change</List.Item>
                <List.Item>Historical data and trends</List.Item>
                <List.Item>Batch calculation results (if applicable)</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="sharing">
            <Accordion.Control>Sharing & Saving</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs">
                You can:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Save locations to your favorites</List.Item>
                <List.Item>Generate a shareable link for your current calculation</List.Item>
                <List.Item>View historical data for your location</List.Item>
                <List.Item>Perform batch calculations for multiple dates</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="mobile">
            <Accordion.Control>Mobile Usage</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs">
                The app is optimized for mobile devices:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Responsive layout that adapts to screen size</List.Item>
                <List.Item>Touch-friendly controls and map interaction</List.Item>
                <List.Item>Easy-to-read results on small screens</List.Item>
                <List.Item>Quick access to all features through tabs</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Paper>
  );
};

export default Documentation; 