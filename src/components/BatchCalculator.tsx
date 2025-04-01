import React, { useState, useEffect } from 'react';
import { 
  Paper, Title, Text, Button, Stack, Textarea, Group, 
  Loader, Table, Card, ScrollArea, Switch, NumberInput, 
  Alert, Divider, Progress, Badge, ActionIcon, Tooltip,
  ThemeIcon, Box, Tabs, Grid, useMantineTheme,
  Collapse, Code, CopyButton
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconAlertCircle, 
  IconDownload, 
  IconCopy, 
  IconCheck, 
  IconDatabase,
  IconTable,
  IconFileSpreadsheet,
  IconCalendar,
  IconChartBar,
  IconInfoCircle,
  IconArrowsShuffle,
  IconPlaylistAdd,
  IconMountain
} from '@tabler/icons-react';
import { Result, calculateDeclination, DeclinationParams } from '../utils/api';

interface ParsedCoordinate {
  id: string;
  latitude: number;
  longitude: number;
  valid: boolean;
  error?: string;
  name?: string;
}

// Define interface for message state to include type
interface StatusMessage {
  text: string;
  type: 'error' | 'success';
}

interface BatchCalculatorProps {
  selectedCoordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  onCalculate?: (result: Result, isMock?: boolean) => void;
  onError?: (message: string) => void;
}

const BatchCalculator: React.FC<BatchCalculatorProps> = ({ selectedCoordinates, onCalculate, onError }) => {
  const theme = useMantineTheme();
  const [inputText, setInputText] = useState<string>('');
  const [parsedCoordinates, setParsedCoordinates] = useState<ParsedCoordinate[]>([]);
  const [results, setResults] = useState<(Result & { name?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elevation, setElevation] = useState<number | ''>('');
  const [calculationDate, setCalculationDate] = useState<Date>(new Date());
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [showNames, setShowNames] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('input');
  const [showSampleData, setShowSampleData] = useState(false);

  // Use selectedCoordinates if provided
  useEffect(() => {
    if (selectedCoordinates && selectedCoordinates.latitude && selectedCoordinates.longitude) {
      // Add the coordinates to input text if it's empty
      if (!inputText.trim()) {
        setInputText(`Selected Location, ${selectedCoordinates.latitude}, ${selectedCoordinates.longitude}`);
      }
    }
  }, [selectedCoordinates]);

  // Sample data for easy input
  const sampleData = `New York City, 40.7128, -74.0060
London, 51.5074, -0.1278
Sydney Opera House, -33.8568, 151.2153
Tokyo Tower, 35.6586, 139.7454
Cairo, 30.0444, 31.2357
Rio de Janeiro, -22.9068, -43.1729
Mount Everest, 27.9881, 86.9250`;

  // Parse coordinate input text
  const parseCoordinates = () => {
    if (!inputText.trim()) {
      setStatusMessage({ text: 'Please enter coordinates first', type: 'error' });
      return;
    }

    setStatusMessage(null);
    const lines = inputText.trim().split('\n');
    
    const parsed: ParsedCoordinate[] = lines.map((line, index) => {
      const id = `coord-${index}`;
      const parts = line.trim().split(',');
      
      // Check if we have a name format - "Name, lat, lng"
      let name: string | undefined;
      let latIndex = 0;
      let lngIndex = 1;
      
      if (parts.length === 3) {
        name = parts[0].trim();
        latIndex = 1;
        lngIndex = 2;
      }
      
      const lat = parseFloat(parts[latIndex]);
      const lng = parseFloat(parts[lngIndex]);
      
      if (isNaN(lat) || isNaN(lng)) {
        return {
          id,
          latitude: 0,
          longitude: 0,
          valid: false,
          error: 'Invalid format',
          name
        };
      }
      
      if (lat < -90 || lat > 90) {
        return {
          id,
          latitude: lat,
          longitude: lng,
          valid: false,
          error: 'Latitude must be between -90 and 90',
          name
        };
      }
      
      if (lng < -180 || lng > 180) {
        return {
          id,
          latitude: lat,
          longitude: lng,
          valid: false,
          error: 'Longitude must be between -180 and 180',
          name
        };
      }
      
      return {
        id,
        latitude: lat,
        longitude: lng,
        valid: true,
        name
      };
    });
    
    setParsedCoordinates(parsed);
    
    const invalidCount = parsed.filter(p => !p.valid).length;
    if (invalidCount > 0) {
      setStatusMessage({ 
        text: `Found ${invalidCount} invalid coordinates. Please fix them before calculating.`, 
        type: 'error' 
      });
    } else {
      // Auto switch to coordinates tab if all coordinates are valid
      setActiveTab('coordinates');
      setStatusMessage({ 
        text: `Successfully parsed ${parsed.length} coordinates.`, 
        type: 'success' 
      });
    }
  };

  const useExampleData = () => {
    setInputText(sampleData);
    setShowSampleData(false);
  };

  // Handle elevation input
  const handleElevationChange = (value: string | number) => {
    if (value === '' || typeof value === 'number') {
      setElevation(value);
    }
  };

  // Calculate declination for all valid coordinates
  const calculateBatch = async () => {
    const validCoordinates = parsedCoordinates.filter(p => p.valid);
    
    if (validCoordinates.length === 0) {
      const errorMsg = 'No valid coordinates to calculate';
      setStatusMessage({ text: errorMsg, type: 'error' });
      onError?.(errorMsg);
      return;
    }
    
    setIsLoading(true);
    setProgress(0);
    setResults([]);
    setStatusMessage(null);
    
    const batchResults: (Result & { name?: string })[] = [];
    let completedCount = 0;
    
    try {
      for (const coord of validCoordinates) {
        try {
          const params: DeclinationParams = {
            latitude: coord.latitude,
            longitude: coord.longitude,
            date: calculationDate
          };
          
          if (typeof elevation === 'number') {
            params.elevation = elevation;
          }
          
          const result = await calculateDeclination(params);
          
          // Add the name if available
          batchResults.push({
            ...result,
            name: coord.name
          });

          // Call the parent's onCalculate with the first result
          if (batchResults.length === 1 && onCalculate) {
            onCalculate(result);
          }
        } catch (err) {
          console.error(`Error calculating for ${coord.latitude}, ${coord.longitude}:`, err);
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          // Notify parent component of error
          onError?.(errorMsg);
          
          // Add a placeholder for failed calculation
          batchResults.push({
            latitude: coord.latitude,
            longitude: coord.longitude,
            elevation: typeof elevation === 'number' ? elevation : 0,
            date: calculationDate.toISOString().split('T')[0],
            declination: { value: 0, unit: 'degrees' },
            declination_sv: { value: 0, unit: 'degrees/year' },
            model: 'WMMHR',
            name: coord.name,
            error: errorMsg
          } as any);
        }
        
        completedCount++;
        setProgress(Math.floor((completedCount / validCoordinates.length) * 100));
      }
      
      setResults(batchResults);
      // Switch to results tab after calculation
      setActiveTab('results');
    } catch (err) {
      const errorMsg = `Batch calculation failed: ${err instanceof Error ? err.message : String(err)}`;
      setStatusMessage({ 
        text: errorMsg,
        type: 'error'
      });
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Export results as CSV
  const exportCSV = () => {
    if (results.length === 0) return;
    
    // Create CSV header
    let csvContent = 'Latitude,Longitude,Elevation,Date,Declination,Annual Change,Model';
    if (showNames) {
      csvContent = 'Name,' + csvContent;
    }
    csvContent += '\n';
    
    // Add data rows
    results.forEach(result => {
      let row = `${result.latitude},${result.longitude},${result.elevation},${result.date},${result.declination.value},${result.declination_sv.value},${result.model}`;
      if (showNames) {
        row = `"${result.name || ''}",` + row;
      }
      csvContent += row + '\n';
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `declination_batch_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStatusMessage({ 
      text: 'CSV file downloaded successfully', 
      type: 'success' 
    });
    setTimeout(() => setStatusMessage(null), 2000);
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results.length === 0) return;
    
    // Format as tab-separated text for pasting into spreadsheets
    let content = 'Latitude\tLongitude\tElevation\tDate\tDeclination\tAnnual Change\tModel';
    if (showNames) {
      content = 'Name\t' + content;
    }
    content += '\n';
    
    results.forEach(result => {
      let row = `${result.latitude}\t${result.longitude}\t${result.elevation}\t${result.date}\t${result.declination.value}\t${result.declination_sv.value}\t${result.model}`;
      if (showNames) {
        row = `${result.name || ''}\t` + row;
      }
      content += row + '\n';
    });
    
    navigator.clipboard.writeText(content)
      .then(() => {
        // Show success message in green
        setStatusMessage({ text: 'Results copied to clipboard', type: 'success' });
        setTimeout(() => setStatusMessage(null), 2000);
      })
      .catch(err => {
        setStatusMessage({ text: `Failed to copy: ${err.message}`, type: 'error' });
      });
  };

  // Count stats
  const validCount = parsedCoordinates.filter(p => p.valid).length;
  const invalidCount = parsedCoordinates.filter(p => !p.valid).length;
  const totalCount = parsedCoordinates.length;

  return (
    <Box>
      <Paper p="xl" radius="md" withBorder mb="lg">
        <Group gap="md" mb="lg">
          <ThemeIcon size="xl" radius="md" color="blue">
            <IconDatabase size={24} />
          </ThemeIcon>
          <Box>
            <Title order={2}>Batch Declination Calculator</Title>
            <Text c="dimmed" size="sm">
              Calculate magnetic declination for multiple locations in a single operation
            </Text>
          </Box>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="input" leftSection={<IconPlaylistAdd size={16} />}>
              Input Data
            </Tabs.Tab>
            <Tabs.Tab 
              value="coordinates" 
              leftSection={<IconTable size={16} />}
              disabled={parsedCoordinates.length === 0}
            >
              Parsed Coordinates {totalCount > 0 && `(${totalCount})`}
            </Tabs.Tab>
            <Tabs.Tab 
              value="results" 
              leftSection={<IconChartBar size={16} />}
              disabled={results.length === 0}
            >
              Results {results.length > 0 && `(${results.length})`}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="input">
            <Card withBorder p="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between" mb="xs">
                  <Box>
                    <Group gap="xs">
                      <ThemeIcon size="md" radius="xl" color="blue" variant="light">
                        <IconArrowsShuffle size={16} />
                      </ThemeIcon>
                      <Text fw={500} size="lg">Enter Coordinate Data</Text>
                    </Group>
                    <Text size="sm" c="dimmed" ml={30}>
                      Each line should contain a set of coordinates
                    </Text>
                  </Box>
                  <Button 
                    variant="light" 
                    size="xs" 
                    onClick={() => setShowSampleData(!showSampleData)}
                    rightSection={showSampleData ? <IconCheck size={14} /> : null}
                  >
                    See Format Example
                  </Button>
                </Group>

                <Collapse in={showSampleData}>
                  <Card bg={theme.colors.gray[0]} p="sm" radius="md" mb="sm">
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>Example Formats:</Text>
                      <Text size="sm" component="pre" style={{ margin: 0 }}>
                        <Code block>
                          40.7128, -74.0060            // Latitude, Longitude
                          New York, 40.7128, -74.0060  // Name, Latitude, Longitude
                        </Code>
                      </Text>
                      <Group>
                        <Button 
                          size="xs" 
                          variant="subtle"
                          leftSection={<IconCopy size={14} />} 
                          onClick={useExampleData}
                        >
                          Use Example Data
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                </Collapse>

                <Textarea
                  placeholder="Enter coordinates (one per line)"
                  minRows={8}
                  autosize
                  value={inputText}
                  onChange={(e) => setInputText(e.currentTarget.value)}
                />
                
                <Group justify="space-between">
                  <Group>
                    <Switch
                      label="Show location names"
                      checked={showNames}
                      onChange={(e) => setShowNames(e.currentTarget.checked)}
                    />
                  </Group>
                  <Button 
                    onClick={parseCoordinates}
                    disabled={!inputText.trim()}
                    leftSection={<IconTable size={16} />}
                    color="blue"
                  >
                    Parse Coordinates
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>
          
          <Tabs.Panel value="coordinates">
            <Card withBorder p="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between" mb="xs">
                  <Box>
                    <Group gap="xs">
                      <ThemeIcon size="md" radius="xl" color="blue" variant="light">
                        <IconTable size={16} />
                      </ThemeIcon>
                      <Text fw={500} size="lg">Parsed Coordinates</Text>
                    </Group>
                    <Text size="sm" c="dimmed" ml={30}>
                      {validCount} valid coordinates ready for calculation
                    </Text>
                  </Box>
                  
                  <Group>
                    <Badge color="green">{validCount} Valid</Badge>
                    {invalidCount > 0 && <Badge color="red">{invalidCount} Invalid</Badge>}
                  </Group>
                </Group>

                <ScrollArea h={300}>
                  <Table highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        {showNames && <Table.Th>Name</Table.Th>}
                        <Table.Th>Latitude</Table.Th>
                        <Table.Th>Longitude</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {parsedCoordinates.map(coord => (
                        <Table.Tr key={coord.id}>
                          {showNames && <Table.Td>{coord.name || '-'}</Table.Td>}
                          <Table.Td>{coord.latitude}</Table.Td>
                          <Table.Td>{coord.longitude}</Table.Td>
                          <Table.Td>
                            {coord.valid ? (
                              <Badge color="green">Valid</Badge>
                            ) : (
                              <Badge color="red">
                                {coord.error}
                              </Badge>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
                
                <Divider />
                
                <Card withBorder radius="md" p="md" bg={theme.colors.gray[0]}>
                  <Group mb="md" gap="xs">
                    <ThemeIcon size="md" radius="xl" color="green" variant="light">
                      <IconCalendar size={16} />
                    </ThemeIcon>
                    <Text fw={500}>Calculation Settings</Text>
                  </Group>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <DatePickerInput
                        label="Calculation Date"
                        description="Date for declination calculation"
                        leftSection={<IconCalendar size={16} />}
                        value={calculationDate}
                        onChange={(value) => setCalculationDate(value || new Date())}
                        clearable={false}
                        minDate={new Date(2024, 0, 1)}
                        maxDate={new Date(2029, 11, 31)}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label="Elevation"
                        description="Meters above sea level (optional)"
                        leftSection={<IconMountain size={16} />}
                        value={elevation}
                        onChange={handleElevationChange}
                        placeholder="Sea level (0)"
                        min={-11000}
                        max={85000}
                      />
                    </Grid.Col>
                  </Grid>
                  
                  <Button
                    mt="md"
                    fullWidth
                    size="md"
                    onClick={calculateBatch}
                    disabled={
                      isLoading || 
                      parsedCoordinates.length === 0 || 
                      validCount === 0
                    }
                    loading={isLoading}
                    leftSection={<IconChartBar size={16} />}
                    color="green"
                  >
                    Calculate Declination for All Coordinates
                  </Button>
                </Card>
              </Stack>
            </Card>

            {isLoading && (
              <Card withBorder mt="md" p="lg" radius="md">
                <Stack gap="md">
                  <Text fw={500} ta="center">Calculating declination values...</Text>
                  <Progress 
                    value={progress} 
                    size="xl" 
                    radius="xl"
                    striped 
                    animated
                  />
                  <Group justify="center">
                    <Badge size="lg">{progress}% Complete</Badge>
                    <Text size="sm">Processing {totalCount} locations</Text>
                  </Group>
                </Stack>
              </Card>
            )}
          </Tabs.Panel>
          
          <Tabs.Panel value="results">
            <Card withBorder p="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between" mb="xs">
                  <Box>
                    <Group gap="xs">
                      <ThemeIcon size="md" radius="xl" color="blue" variant="light">
                        <IconChartBar size={16} />
                      </ThemeIcon>
                      <Text fw={500} size="lg">Declination Results</Text>
                    </Group>
                    <Text size="sm" c="dimmed" ml={30}>
                      {results.length} locations calculated
                    </Text>
                  </Box>
                  
                  <Group>
                    <Tooltip label="Export as CSV">
                      <Button 
                        variant="light" 
                        leftSection={<IconFileSpreadsheet size={16} />}
                        onClick={exportCSV}
                      >
                        Export CSV
                      </Button>
                    </Tooltip>
                    <CopyButton value={JSON.stringify(results)} timeout={2000}>
                      {({ copied, copy }) => (
                        <Button
                          color={copied ? 'teal' : 'blue'}
                          leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          variant="light"
                          onClick={copy}
                        >
                          {copied ? 'Copied' : 'Copy Data'}
                        </Button>
                      )}
                    </CopyButton>
                  </Group>
                </Group>
                
                <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                  <Text fw={500}>Calculated using the WMMHR model</Text>
                  <Text size="sm">
                    Results are based on the World Magnetic Model High Resolution (WMMHR), 
                    valid for 2024-2029. The model calculates magnetic declination 
                    at the specified date and location.
                  </Text>
                </Alert>

                <ScrollArea h={400}>
                  <Table highlightOnHover striped>
                    <Table.Thead>
                      <Table.Tr>
                        {showNames && <Table.Th>Name</Table.Th>}
                        <Table.Th>Latitude</Table.Th>
                        <Table.Th>Longitude</Table.Th>
                        <Table.Th>Declination</Table.Th>
                        <Table.Th>Annual Change</Table.Th>
                        <Table.Th>Date</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {results.map((result, index) => (
                        <Table.Tr key={index}>
                          {showNames && <Table.Td>{result.name || '-'}</Table.Td>}
                          <Table.Td>{result.latitude.toFixed(6)}</Table.Td>
                          <Table.Td>{result.longitude.toFixed(6)}</Table.Td>
                          <Table.Td>
                            {'error' in result ? (
                              <Text c="red">Error</Text>
                            ) : (
                              <Badge 
                                color={result.declination.value >= 0 ? 'blue' : 'red'}
                                size="lg"
                              >
                                {Math.abs(result.declination.value).toFixed(2)}° 
                                {result.declination.value >= 0 ? 'E' : 'W'}
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            {'error' in result ? (
                              <Text c="red">Error</Text>
                            ) : (
                              <Text>
                                {result.declination_sv.value > 0 ? '+' : ''}
                                {result.declination_sv.value.toFixed(2)}°/year
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>{result.date}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Paper>
      
      {statusMessage && (
        <Alert 
          radius="md"
          color={statusMessage.type === 'success' ? 'green' : 'red'} 
          icon={statusMessage.type === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
          withCloseButton
          onClose={() => setStatusMessage(null)}
        >
          {statusMessage.text}
        </Alert>
      )}
    </Box>
  );
};

export default BatchCalculator;