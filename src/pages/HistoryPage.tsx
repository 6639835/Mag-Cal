import { useState, useEffect } from 'react';
import { 
  Title, 
  Text, 
  Container, 
  Paper, 
  Button, 
  Group, 
  Table, 
  ActionIcon, 
  Badge,
  Modal,
  Stack,
  Menu,
  Box,
  Alert,
  Card,
  SimpleGrid
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconTrash, 
  IconEye, 
  IconDownload, 
  IconDots, 
  IconInfoCircle,
  IconCalendar
} from '@tabler/icons-react';
import DeclinationResults from '../components/DeclinationResults';
import { Result } from '../types';

// Key for localStorage
const HISTORY_STORAGE_KEY = 'magcalc-history';

function HistoryPage() {
  const [history, setHistory] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        // Parse and ensure dates are Date objects
        const parsedHistory = JSON.parse(savedHistory, (key, value) => {
          if (key === 'date') return new Date(value);
          return value;
        });
        setHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // View a single result
  const handleViewResult = (result: Result) => {
    setSelectedResult(result);
    open();
  };

  // Delete a single result
  const handleDeleteResult = (index: number) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  // Export history as CSV
  const handleExportCSV = () => {
    // CSV header
    const csvHeader = "Date,Latitude,Longitude,Elevation,Declination,Annual Change,Model\n";
    
    // Convert each history entry to CSV row
    const csvRows = history.map(item => {
      const date = new Date(item.date).toISOString().split('T')[0];
      return `${date},${item.latitude},${item.longitude},${item.elevation},${item.declination},${item.declination_sv},${item.model}`;
    });
    
    // Combine header and rows
    const csvContent = csvHeader + csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `magnetic-declination-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container size="lg">
      <Title order={2} mb="xs">Calculation History</Title>
      <Text c="dimmed" mb="lg">
        Track and view your past declination calculations
      </Text>
      
      {history.length > 0 ? (
        <>
          <Group position="apart" mb="md">
            <Text size="sm">{history.length} calculation{history.length !== 1 ? 's' : ''}</Text>
            <Group>
              <Button 
                variant="light" 
                size="sm"
                leftSection={<IconDownload size={16} />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button 
                color="red" 
                variant="light" 
                size="sm" 
                leftSection={<IconTrash size={16} />}
                onClick={handleClearHistory}
              >
                Clear All
              </Button>
            </Group>
          </Group>
          
          <Paper withBorder radius="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Declination</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {history.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{formatDate(item.date)}</Table.Td>
                    <Table.Td>
                      {item.latitude.toFixed(6)}°, {item.longitude.toFixed(6)}°
                    </Table.Td>
                    <Table.Td>
                      <Badge color={item.declination > 0 ? "blue" : "red"}>
                        {Math.abs(item.declination).toFixed(2)}° {item.declination > 0 ? "E" : "W"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={0}>
                        <ActionIcon onClick={() => handleViewResult(item)}>
                          <IconEye size={16} />
                        </ActionIcon>
                        <Menu position="bottom-end" withArrow shadow="md">
                          <Menu.Target>
                            <ActionIcon>
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item 
                              leftSection={<IconEye size={14} />}
                              onClick={() => handleViewResult(item)}
                            >
                              View Details
                            </Menu.Item>
                            <Menu.Item 
                              color="red" 
                              leftSection={<IconTrash size={14} />}
                              onClick={() => handleDeleteResult(index)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </>
      ) : (
        <Card withBorder p="xl">
          <Stack align="center" spacing="md">
            <IconCalendar size={48} opacity={0.5} />
            <Title order={3}>No history yet</Title>
            <Text align="center" c="dimmed">
              When you calculate magnetic declination, your results will be saved here for future reference.
            </Text>
          </Stack>
        </Card>
      )}
      
      {/* Result viewer modal */}
      <Modal opened={opened} onClose={close} title="Declination Details" size="lg">
        {selectedResult && <DeclinationResults result={selectedResult} />}
      </Modal>
    </Container>
  );
}

export default HistoryPage; 