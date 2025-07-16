import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Group, 
  Card, 
  Button, 
  ThemeIcon, 
  useMantineTheme,
  useMantineColorScheme,
  Select,
  TextInput,
  Tooltip,
  ActionIcon,
  Paper,
  Grid,
  Stack,
  Alert,
  NumberInput,
  Loader
} from '@mantine/core';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { 
  IconChartLine, 
  IconMapPin, 
  IconCalendarStats, 
  IconInfoCircle,
  IconRefresh,
  IconArrowRight,
  IconSearch,
  IconTransferIn,
  IconMap
} from '@tabler/icons-react';
import { calculateDeclination } from '../utils/api';
import MapSelector from './MapSelector';
import { useAppState } from '../contexts/AppStateContext';

export interface HistoricalDataProps {
  selectedCoordinates: { latitude: number; longitude: number } | null;
  onLocationSelected: (lat: number, lng: number) => void;
  onTransferToMap?: () => void;
  onTransferFromMap?: () => void;
}

interface DataPoint {
  year: number;
  declination: number;
}

export function HistoricalData({ selectedCoordinates, onLocationSelected, onTransferToMap, onTransferFromMap }: HistoricalDataProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { setActiveTab } = useAppState();
  const isDark = colorScheme === 'dark';
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2029);
  const [interval, setInterval] = useState(1);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number] | null>(null);

  const fetchHistoricalData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dataPoints: DataPoint[] = [];
      for (let year = startYear; year <= endYear; year += interval) {
        const date = new Date(year, 0, 1).toISOString().split('T')[0];
        try {
          const result = await calculateDeclination({
            latitude: selectedCoordinates?.latitude || 0,
            longitude: selectedCoordinates?.longitude || 0,
            elevation: 0,
            date: new Date(date)
          });
          dataPoints.push({
            year,
            declination: result.declination.value
          });
        } catch (err) {
          console.error(`Error fetching data for year ${year}:`, err);
          // Continue with other years even if one fails
          continue;
        }
      }
      
      if (dataPoints.length === 0) {
        setError('Failed to fetch data for any year in the selected range');
        return;
      }
      
      setData(dataPoints);
      
      // Calculate statistics
      if (dataPoints.length > 0) {
        const values = dataPoints.map(d => d.declination);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const change = dataPoints[dataPoints.length - 1].declination - dataPoints[0].declination;
        const yearSpan = dataPoints[dataPoints.length - 1].year - dataPoints[0].year;
        const changePerYear = yearSpan > 0 ? change / yearSpan : 0;
        
        setSelectedYearRange([startYear, endYear]);
      }
    } catch (err) {
      setError('Failed to fetch historical data');
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCoordinates?.latitude && selectedCoordinates.longitude) {
      fetchHistoricalData();
    }
  }, [selectedCoordinates]);

  const handleMapLocationSelected = (lat: number, lng: number, displayName?: string) => {
    onLocationSelected(lat, lng);
  };

  const getDeclinationColor = (value: number) => {
    if (value < -2) return theme.colors.red[6];
    if (value < 0) return theme.colors.orange[6];
    if (value > 2) return theme.colors.blue[6];
    if (value > 0) return theme.colors.cyan[6];
    return theme.colors.gray[6];
  };

  const formatDeclination = (value: number) => {
    const absValue = Math.abs(value);
    return `${absValue.toFixed(2)}° ${value < 0 ? 'West' : 'East'}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <Card shadow="sm" padding="xs" withBorder>
          <Text fw={500}>{label}</Text>
          <Text size="sm">
            Declination: {formatDeclination(value)}
          </Text>
        </Card>
      );
    }
    return null;
  };

  // Add validation for year range
  const handleStartYearChange = (value: string | number) => {
    const numValue = Number(value);
    if (numValue < 2024) {
      setStartYear(2024);
    } else if (numValue > 2029) {
      setStartYear(2029);
    } else {
      setStartYear(numValue);
    }
  };

  const handleEndYearChange = (value: string | number) => {
    const numValue = Number(value);
    if (numValue < 2024) {
      setEndYear(2024);
    } else if (numValue > 2029) {
      setEndYear(2029);
    } else {
      setEndYear(numValue);
    }
  };

  // Enhanced function to handle map navigation
  const handleGoToMap = () => {
    console.log("Go to map button clicked");
    if (onTransferToMap) {
      console.log("Calling onTransferToMap");
      onTransferToMap();
    }
    
    // Force tab change directly
    console.log("Force setting tab to map");
    setActiveTab('map');
  };

  return (
    <Box>
      <Paper p="xl" radius="md" withBorder>
        <Group gap="md" mb="md">
          <ThemeIcon size="xl" radius="md" color="blue">
            <IconChartLine size={24} />
          </ThemeIcon>
          <Box>
            <Title order={2}>Historical Declination Data</Title>
            <Text c="dimmed" size="sm">
              View magnetic declination changes over time for a location
            </Text>
          </Box>
        </Group>
        
        <Stack gap="md">
          {/* Location information card */}
          <Card withBorder p="md">
            <Group justify="space-between" mb="xs">
              <Group>
                <ThemeIcon size="md" radius="xl" color="blue" variant="light">
                  <IconMapPin size={16} />
                </ThemeIcon>
                <Text fw={500}>Location Information</Text>
              </Group>
            </Group>
            
            {selectedCoordinates ? (
              <Grid>
                <Grid.Col span={8}>
                  <Text fw={500}>Current coordinates:</Text>
                  <Text>
                    Latitude: {selectedCoordinates.latitude.toFixed(6)}°, 
                    Longitude: {selectedCoordinates.longitude.toFixed(6)}°
                  </Text>
                </Grid.Col>
                <Grid.Col span={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="light" 
                    leftSection={<IconMap size={16} />}
                    onClick={handleGoToMap}
                  >
                    View on Map
                  </Button>
                </Grid.Col>
              </Grid>
            ) : (
              <Alert color="yellow" icon={<IconInfoCircle size={16} />}>
                <Text>No location selected. Please select a location from the Map tab first.</Text>
                <Group mt="sm" gap="xs">
                  <Button 
                    variant="light" 
                    leftSection={<IconMap size={16} />}
                    onClick={handleGoToMap}
                  >
                    Go to Map
                  </Button>
                  {onTransferFromMap && (
                    <Button 
                      variant="light" 
                      color="blue"
                      leftSection={<IconTransferIn size={16} />}
                      onClick={onTransferFromMap}
                    >
                      Transfer from Map
                    </Button>
                  )}
                </Group>
              </Alert>
            )}
          </Card>

          <Stack gap="lg">
            <Group justify="space-between" mb="md">
              <Box>
                <Title order={3}>
                  <Group gap="xs">
                    <ThemeIcon size="md" radius="xl" color="blue" variant="light">
                      <IconChartLine size={16} />
                    </ThemeIcon>
                    Historical Declination Data
                  </Group>
                </Title>
                <Text size="sm" c="dimmed" mt={5}>
                  Track magnetic declination changes over time for your selected coordinates
                </Text>
              </Box>
            </Group>

            <Alert color="blue" icon={<IconInfoCircle size={16} />}>
              <Text fw={500}>About This Data</Text>
              <Text size="sm">
                The World Magnetic Model for High Resolution (WMMHR) is only valid from 2024 to 2029. 
                Data outside this range is not available. The chart shows the predicted magnetic declination 
                for the selected coordinates during this specific time period.
              </Text>
            </Alert>

            <Card withBorder p="md">
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" color="green" variant="light">
                  <IconCalendarStats size={20} />
                </ThemeIcon>
                <Text fw={500}>Time Range Selection</Text>
              </Group>
              <Group grow gap="md" align="flex-end">
                <NumberInput
                  label="Start Year"
                  value={startYear}
                  onChange={handleStartYearChange}
                  min={2024}
                  max={2029}
                  disabled={loading}
                  description="Valid range: 2024-2029"
                />
                <NumberInput
                  label="End Year"
                  value={endYear}
                  onChange={handleEndYearChange}
                  min={2024}
                  max={2029}
                  disabled={loading}
                  description="Valid range: 2024-2029"
                />
                <Button 
                  onClick={fetchHistoricalData} 
                  loading={loading}
                  leftSection={<IconRefresh size={16} />}
                  disabled={loading}
                >
                  Update Chart
                </Button>
              </Group>
            </Card>

            {error && (
              <Alert color="red" title="Error" icon={<IconInfoCircle size={16} />}>
                {error}
              </Alert>
            )}

            {selectedYearRange && !loading && (
              <Grid>
                <Grid.Col span={4}>
                  <Card withBorder p="sm" radius="md">
                    <Text size="sm" fw={500} c="dimmed">Average Declination</Text>
                    <Text fw={700} size="xl" style={{ color: getDeclinationColor(data[Math.floor(data.length / 2)].declination) }}>
                      {formatDeclination(data[Math.floor(data.length / 2)].declination)}
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Card withBorder p="sm" radius="md">
                    <Text size="sm" fw={500} c="dimmed">Total Change</Text>
                    <Text fw={700} size="xl" style={{ color: getDeclinationColor(data[data.length - 1].declination - data[0].declination) }}>
                      {Math.abs(data[data.length - 1].declination - data[0].declination).toFixed(2)}°
                      <Text span size="sm" ml={5}>
                        {data[data.length - 1].declination - data[0].declination > 0 ? 'Eastward' : 'Westward'}
                      </Text>
                    </Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Card withBorder p="sm" radius="md">
                    <Text size="sm" fw={500} c="dimmed">Annual Rate of Change</Text>
                    <Text fw={700} size="xl" style={{ color: getDeclinationColor(data[data.length - 1].declination - data[0].declination) }}>
                      {Math.abs(data[data.length - 1].declination - data[0].declination).toFixed(2)}° per year
                    </Text>
                  </Card>
                </Grid.Col>
              </Grid>
            )}

            {loading ? (
              <Group justify="center" py="xl">
                <Stack align="center" gap="xs">
                  <Loader size="xl" />
                  <Text c="dimmed">Fetching historical data...</Text>
                </Stack>
              </Group>
            ) : data.length > 0 ? (
              <Card withBorder p="sm" pt="lg" radius="md">
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'bottom', offset: 0 }}
                        tick={{ fontSize: 12 }}
                        padding={{ left: 20, right: 20 }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Declination (°)', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -5
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} />
                      <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                      <Line
                        type="monotone"
                        dataKey="declination"
                        stroke={theme.colors.blue[6]}
                        strokeWidth={3}
                        name="Declination (°)"
                        activeDot={{ r: 6 }}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ) : (
              <Card withBorder p="xl" radius="md">
                <Stack align="center" gap="md">
                  <ThemeIcon size="xl" radius="xl" color="gray">
                    <IconChartLine size={24} />
                  </ThemeIcon>
                  <Text fw={500} size="lg" ta="center">No Data Available</Text>
                  <Text c="dimmed" ta="center">
                    Select a year range and click "Update Chart" to view historical declination data.
                  </Text>
                </Stack>
              </Card>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
} 