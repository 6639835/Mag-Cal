import React from 'react';
import { Paper, Title, Accordion, Text, List, Group, Badge, Divider, Button, Anchor, Stack, Box } from '@mantine/core';
import { IconHelp, IconForms, IconMap, IconStar, IconCalculator, IconChartLine, IconShare, IconInfoCircle } from '@tabler/icons-react';

const HelpDocumentation: React.FC = () => {
  return (
    <Paper p="lg" radius="md" withBorder shadow="sm" style={{ maxHeight: '80vh', overflow: 'auto' }}>
      <Stack gap="md">
        <Group justify="center" mb="md">
          <Title order={2} display="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <IconHelp size={24} />
            Magnetic Declination Calculator - Features
          </Title>
        </Group>
        
        <Text size="sm" mb="md" c="dimmed">
          This application provides tools to calculate magnetic declination at any location around the world. 
          Below is a comprehensive guide to all available features.
        </Text>
        
        <Divider label="Main Features" labelPosition="center" />
        
        <Accordion variant="contained">
          <Accordion.Item value="form-tab">
            <Accordion.Control icon={<IconForms size={18} />}>
              Form Input
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                The Form tab allows you to manually input coordinates and date to calculate magnetic declination:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Enter latitude and longitude in decimal degrees</List.Item>
                <List.Item>Select date using the date picker (current date is default)</List.Item>
                <List.Item>View elevation data based on your coordinates</List.Item>
                <List.Item>Click "Calculate" to get declination results</List.Item>
                <List.Item>Save location to favorites for future reference</List.Item>
              </List>
              
              <Text size="sm" mt="md" fw={500}>
                Results display:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Magnetic declination value (positive for east, negative for west)</List.Item>
                <List.Item>Annual rate of change</List.Item>
                <List.Item>Detailed geographic information about the location</List.Item>
                <List.Item>3D compass visualization showing true north vs magnetic north</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="map-tab">
            <Accordion.Control icon={<IconMap size={18} />}>
              Interactive Map
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                The Map tab provides an interactive way to select locations:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Click anywhere on the map to select a location</List.Item>
                <List.Item>Search for locations using the search bar</List.Item>
                <List.Item>Drag and drop marker to fine-tune your selection</List.Item>
                <List.Item>Zoom in/out for precise location selection</List.Item>
                <List.Item>View current coordinates in real-time as you move the map</List.Item>
                <List.Item>Toggle between different map views (street, satellite, etc.)</List.Item>
              </List>
              
              <Text size="sm" mt="md" fw={500}>
                Location information:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Display of selected coordinates</List.Item>
                <List.Item>Reverse geocoding to show address/location name</List.Item>
                <List.Item>Elevation data where available</List.Item>
                <List.Item>Option to calculate magnetic declination with one click</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="favorites-tab">
            <Accordion.Control icon={<IconStar size={18} />}>
              Favorites Management
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                The Favorites tab helps you manage saved locations:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Save frequently used locations for quick access</List.Item>
                <List.Item>Name and categorize your favorite locations</List.Item>
                <List.Item>View list of all saved locations with coordinates</List.Item>
                <List.Item>One-click transfer to Form, Map, or History tabs</List.Item>
                <List.Item>Delete unwanted locations from favorites</List.Item>
                <List.Item>Sort and filter favorites by name, date added, or category</List.Item>
                <List.Item>Import/export favorites data</List.Item>
              </List>
              
              <Text size="sm" mt="md" c="dimmed" style={{ fontStyle: 'italic' }}>
                Note: Favorites are stored locally in your browser and will persist between sessions.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="batch-tab">
            <Accordion.Control icon={<IconCalculator size={18} />}>
              Batch Calculator
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                The Batch Calculator allows processing multiple dates or locations at once:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Calculate declination for a single location across multiple dates</List.Item>
                <List.Item>Process multiple locations for the same date</List.Item>
                <List.Item>Import coordinates from CSV or spreadsheet</List.Item>
                <List.Item>Generate date ranges with custom intervals</List.Item>
                <List.Item>Export results to CSV format</List.Item>
                <List.Item>View results in tabular format</List.Item>
                <List.Item>Visualize batch results on a chart</List.Item>
              </List>
              
              <Text size="sm" mt="md" fw={500}>
                Batch processing limits:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Up to 100 locations/dates can be processed in a single batch</List.Item>
                <List.Item>Date range limited to 100 years</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="history-tab">
            <Accordion.Control icon={<IconChartLine size={18} />}>
              Historical Data
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                The History tab provides historical declination data and trends:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>View magnetic declination changes over time for a specific location</List.Item>
                <List.Item>Interactive chart showing declination values from 1900 to present</List.Item>
                <List.Item>Project future declination based on current rate of change</List.Item>
                <List.Item>Compare historical values with current calculations</List.Item>
                <List.Item>Export historical data as CSV or image</List.Item>
                <List.Item>Analyze rate of change over different time periods</List.Item>
              </List>
              
              <Text size="sm" mt="md" fw={500}>
                Chart features:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Zoom in/out on specific time periods</List.Item>
                <List.Item>Hover over data points for precise values</List.Item>
                <List.Item>Toggle between line and scatter plot views</List.Item>
                <List.Item>Highlight significant changes or anomalies</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        
        <Divider label="Additional Features" labelPosition="center" mt="md" />
        
        <Accordion variant="contained">
          <Accordion.Item value="sharing">
            <Accordion.Control icon={<IconShare size={18} />}>
              Sharing & Export Options
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                Share your results with others:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Generate shareable links with your calculation results</List.Item>
                <List.Item>Export results as PDF reports</List.Item>
                <List.Item>Download data in CSV format</List.Item>
                <List.Item>Copy declination values and coordinates to clipboard</List.Item>
                <List.Item>Share directly to social media platforms</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="mobile">
            <Accordion.Control>
              Mobile Support
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                The application is fully mobile-responsive:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Optimized layout for smartphones and tablets</List.Item>
                <List.Item>Touch-friendly controls and interface</List.Item>
                <List.Item>Simplified views for small screens</List.Item>
                <List.Item>Location detection using device GPS (with permission)</List.Item>
                <List.Item>Offline functionality for basic calculations</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="data-accuracy">
            <Accordion.Control icon={<IconInfoCircle size={18} />}>
              Data Accuracy Information
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                Understanding the accuracy of our calculations:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Based on the World Magnetic Model (WMM)</List.Item>
                <List.Item>Typical accuracy: ±0.5 degrees for declination</List.Item>
                <List.Item>Higher accuracy near the equator, lower near the poles</List.Item>
                <List.Item>Calculations cover 1900 to 5 years in the future</List.Item>
                <List.Item>Uncertainty increases for future predictions</List.Item>
              </List>
              
              <Text size="sm" mt="md" c="dimmed">
                For critical navigation or scientific applications, always verify results with official sources.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
          
          <Accordion.Item value="theme">
            <Accordion.Control>
              Theme & Accessibility
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" mb="xs" fw={500}>
                Customize your experience:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Toggle between light and dark mode</List.Item>
                <List.Item>Keyboard shortcuts for common actions</List.Item>
                <List.Item>Screen reader compatible interface</List.Item>
                <List.Item>High contrast mode available</List.Item>
                <List.Item>Adjustable text size</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        
        <Divider my="md" />
        
        <Box>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Version 0.1.0</Text>
            <Anchor size="sm" href="#" target="_blank">Terms of Use</Anchor>
          </Group>
        </Box>
      </Stack>
    </Paper>
  );
};

export default HelpDocumentation; 