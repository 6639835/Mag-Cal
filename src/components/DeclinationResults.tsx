import React from 'react';
import { 
  Title, 
  Text, 
  Grid, 
  Group, 
  Paper, 
  Badge, 
  ThemeIcon, 
  Box,
  Divider,
  Alert
} from '@mantine/core';
import { 
  IconMapPin, 
  IconCompass, 
  IconCalendar,
  IconMountain,
  IconArrowsDownUp,
  IconInfoCircle
} from '@tabler/icons-react';
import { Result as ApiResult } from '../utils/api';
import { Result as TypesResult } from '../types';

// Allow either type of Result to be passed in
type CombinedResult = ApiResult | TypesResult;

interface DeclinationResultsProps {
  result: CombinedResult;
  isMockData?: boolean;
  selectedCoordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  onShare?: () => Promise<void>;
}

function DeclinationResults({ result, isMockData, selectedCoordinates, onShare }: DeclinationResultsProps) {
  console.log("Rendering DeclinationResults with:", result);

  // Helper function to check if we're dealing with the types.ts Result
  const isTypesResult = (res: CombinedResult): res is TypesResult => {
    return typeof res.declination === 'number';
  };

  // Format declination for display
  const formatAngle = (angle: number) => {
    if (angle === undefined || angle === null) return 'N/A';
    const absAngle = Math.abs(angle);
    const degrees = Math.floor(absAngle);
    const minutes = Math.floor((absAngle - degrees) * 60);
    return `${degrees}° ${minutes.toFixed(0)}'`;
  };

  // For east/west display - IMPORTANT: Negative declination is WEST, positive is EAST
  // Handle both types of Result
  const declinationValue = isTypesResult(result) 
    ? result.declination 
    : result.declination?.value;
  const isEast = declinationValue !== undefined ? declinationValue >= 0 : false;
  const decimalDeclination = declinationValue !== undefined 
    ? Math.abs(declinationValue).toFixed(5) 
    : 'N/A';

  // Annual change
  const annualChangeValue = isTypesResult(result)
    ? result.declination_sv
    : result.declination_sv?.value;
  const isIncreasing = annualChangeValue !== undefined ? annualChangeValue >= 0 : false;
  const annualChange = annualChangeValue !== undefined
    ? Math.abs(annualChangeValue).toFixed(5)
    : 'N/A';

  // Format date
  const formatDate = (date: string | Date | number) => {
    if (!date) return 'N/A';
    try {
      // If it's a number like 2025.2246, format accordingly
      if (typeof date === 'number') {
        const year = Math.floor(date);
        const fraction = date - year;
        const daysInYear = new Date(year, 11, 31).getDate() > 365 ? 366 : 365;
        const dayOfYear = Math.round(fraction * daysInYear);
        const dateObj = new Date(year, 0, 1);
        dateObj.setDate(dateObj.getDate() + dayOfYear - 1);
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date) || 'N/A';
    }
  };

  // Safe formatting for numeric values
  const formatNumber = (value: number | { value: number, unit: string } | undefined, decimals = 0) => {
    if (!value) return 'N/A';
    try {
      if (typeof value === 'object') {
        return `${value.value.toFixed(decimals)} ${value.unit || ''}`;
      }
      return `${value.toFixed(decimals)}`;
    } catch (error) {
      console.error('Error formatting number:', error, value);
      return 'N/A';
    }
  };

  return (
    <Box className="results-card">
      <Title order={2} mb="md">Declination Results</Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper p="md" withBorder radius="md">
            <Group mb="xs">
              <ThemeIcon size={36} radius="md" color="blue">
                <IconCompass size={24} />
              </ThemeIcon>
              <div>
                <Text fw={500} size="lg">Magnetic Declination</Text>
                <Text size="xs" c="dimmed">The angle between true north and magnetic north</Text>
              </div>
            </Group>
            
            <Group align="center" mt="md">
              <Title order={1}>
                {decimalDeclination}°
              </Title>
              <Badge size="lg" color={isEast ? "blue" : "red"}>
                {isEast ? "East" : "West"}
              </Badge>
            </Group>
            
            <Text mt="xs" size="sm">
              {isEast 
                ? "Add to true bearing to get magnetic bearing" 
                : "Subtract from true bearing to get magnetic bearing"}
            </Text>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper p="md" withBorder radius="md">
            <Group mb="xs">
              <ThemeIcon size={36} radius="md" color="cyan">
                <IconArrowsDownUp size={24} />
              </ThemeIcon>
              <div>
                <Text fw={500} size="lg">Annual Change</Text>
                <Text size="xs" c="dimmed">How declination changes each year</Text>
              </div>
            </Group>
            
            <Group align="center" mt="md">
              <Title order={2}>
                {annualChange}°/year
              </Title>
              <Badge size="md" color={isIncreasing ? "teal" : "orange"}>
                {isIncreasing ? "Increasing" : "Decreasing"}
              </Badge>
            </Group>
            
            <Text mt="xs" size="sm">
              {isIncreasing 
                ? `Declination is moving eastward by ${annualChange}° per year` 
                : `Declination is moving westward by ${annualChange}° per year`}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
      
      {!isTypesResult(result) && !result.inclination && (
        <Alert icon={<IconInfoCircle size={16} />} color="blue" mt="md">
          The NOAA WMMHR API provides declination data only. For additional magnetic field components,
          consider using the IGRF model or the full WMM calculator.
        </Alert>
      )}
      
      <Divider my="md" />
      
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group>
            <ThemeIcon size="md" color="gray" variant="light">
              <IconMapPin size={16} />
            </ThemeIcon>
            <Text fw={500}>Location</Text>
          </Group>
          <Text size="sm" ml={26}>{result.latitude !== undefined ? result.latitude.toFixed(6) : 'N/A'}° N, {result.longitude !== undefined ? result.longitude.toFixed(6) : 'N/A'}° E</Text>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group>
            <ThemeIcon size="md" color="gray" variant="light">
              <IconMountain size={16} />
            </ThemeIcon>
            <Text fw={500}>Elevation</Text>
          </Group>
          <Text size="sm" ml={26}>{result.elevation !== undefined ? result.elevation : 'N/A'} km</Text>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group>
            <ThemeIcon size="md" color="gray" variant="light">
              <IconCalendar size={16} />
            </ThemeIcon>
            <Text fw={500}>Calculation Date</Text>
          </Group>
          <Text size="sm" ml={26}>{formatDate(result.date)}</Text>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 12 }}>
          <Group>
            <ThemeIcon size="md" color="gray" variant="light">
              <IconCompass size={16} />
            </ThemeIcon>
            <Text fw={500}>Model</Text>
          </Group>
          <Text size="sm" ml={26}>{result.model || 'N/A'}</Text>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export default DeclinationResults; 