import React, { useEffect, useState } from 'react';
import {
  NumberInput,
  Grid,
  Button,
  Group,
  Text,
  Tooltip,
  Box,
  Code,
  Collapse,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { IconQuestionMark, IconCalculator, IconCurrentLocation, IconLink } from '@tabler/icons-react';
import { calculateDeclination, Result, DeclinationParams } from '../utils/api';

interface DeclinationFormProps {
  onCalculate: (result: Result, isMock?: boolean) => void;
  onError: (message: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelected?: (lat: number, lng: number) => void;
}

function DeclinationForm({ 
  onCalculate, 
  onError, 
  isLoading, 
  setLoading,
  initialLatitude,
  initialLongitude,
  onLocationSelected
}: DeclinationFormProps) {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [showApiUrl, setShowApiUrl] = useState(false);

  const form = useForm({
    initialValues: {
      latitude: initialLatitude || 0,
      longitude: initialLongitude || 0,
      elevation: 0,
      date: new Date(),
    },
    validate: {
      latitude: (value) => 
        value < -90 || value > 90 
          ? 'Latitude must be between -90° and 90°' 
          : null,
      longitude: (value) => 
        value < -180 || value > 180 
          ? 'Longitude must be between -180° and 180°' 
          : null,
      elevation: (value) => 
        value < -11000 || value > 85000 
          ? 'Elevation must be between -11,000m and 85,000m' 
          : null,
      date: (value) => {
        if (!value) return 'Date is required';
        const year = value.getFullYear();
        if (year < 2024 || year > 2029) {
          return 'Date must be between 2024 and 2029 (WMMHR model validity period)';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (initialLatitude !== undefined && initialLongitude !== undefined) {
      form.setValues({
        latitude: initialLatitude,
        longitude: initialLongitude,
      });
    }
  }, [initialLatitude, initialLongitude]);

  // Generate and display API URL for testing
  const generateApiUrl = (values: typeof form.values) => {
    const date = values.date || new Date();
    // Ensure we're using UTC to avoid timezone issues
    const utcDate = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));

    const queryParams = new URLSearchParams({
      lat1: values.latitude.toString(),
      lon1: values.longitude.toString(),
      key: 'zNEw7',
      model: 'WMMHR',
      startYear: utcDate.getUTCFullYear().toString(),
      startMonth: (utcDate.getUTCMonth() + 1).toString(),
      startDay: utcDate.getUTCDate().toString(),
      resultFormat: 'json'
    });
    
    if (values.elevation !== undefined) {
      queryParams.append('elev', values.elevation.toString());
    }

    const url = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?${queryParams.toString()}`;
    setApiUrl(url);
    setShowApiUrl(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    console.log("Form submitted with values:", values);
    
    // Generate and show API URL
    generateApiUrl(values);
    
    try {
      // Call the real API function
      console.log("Calling calculateDeclination with params:", values);
      const result = await calculateDeclination({
        latitude: values.latitude,
        longitude: values.longitude,
        elevation: values.elevation,
        date: values.date,
      });
      
      console.log("API call successful, result:", result);
      onCalculate(result, false); // Explicitly set isMock to false
    } catch (error) {
      console.error('Error calculating declination:', error);
      onError(`Error connecting to NOAA API: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // No fallback to mock data anymore
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValues({
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
          });
          if (onLocationSelected) {
            onLocationSelected(parseFloat(position.coords.latitude.toFixed(6)), parseFloat(position.coords.longitude.toFixed(6)));
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  };

  return (
    <Box>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group align="flex-end" mb="xs">
              <Text fw={500} size="sm">Coordinates</Text>
              <Button 
                variant="subtle" 
                size="xs"
                onClick={getUserLocation}
                leftSection={<IconCurrentLocation size={14} />}
              >
                Use my location
              </Button>
            </Group>
            
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Latitude"
                  description="Decimal degrees (e.g., 40.7128)"
                  placeholder="Enter latitude"
                  decimalScale={6}
                  step={0.1}
                  min={-90}
                  max={90}
                  required
                  {...form.getInputProps('latitude')}
                  rightSection={
                    <Tooltip label="Positive value for North, negative for South">
                      <IconQuestionMark size={14} style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Longitude"
                  description="Decimal degrees (e.g., -74.0060)"
                  placeholder="Enter longitude"
                  decimalScale={6}
                  step={0.1}
                  min={-180}
                  max={180}
                  required
                  {...form.getInputProps('longitude')}
                  rightSection={
                    <Tooltip label="Positive value for East, negative for West">
                      <IconQuestionMark size={14} style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  }
                />
              </Grid.Col>
            </Grid>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Elevation"
                  description="Meters above sea level"
                  placeholder="Enter elevation"
                  step={10}
                  min={-11000}
                  max={85000}
                  defaultValue={0}
                  {...form.getInputProps('elevation')}
                  rightSection={
                    <Tooltip label="Optional: Default is 0 (sea level)">
                      <IconQuestionMark size={14} style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DatePickerInput
                  label="Date"
                  description="Declination varies over time"
                  placeholder="Pick date"
                  required
                  defaultValue={new Date()}
                  {...form.getInputProps('date')}
                  rightSection={
                    <Tooltip label="Select a date to calculate the declination for">
                      <IconQuestionMark size={14} style={{ cursor: 'pointer' }} />
                    </Tooltip>
                  }
                />
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          <Button 
            type="submit" 
            loading={isLoading}
            leftSection={<IconCalculator size={16} />}
          >
            Calculate Declination
          </Button>
        </Group>
      </form>
      
      <Collapse in={showApiUrl}>
        <Box mt="md" p="md" style={{ background: '#f5f5f5', borderRadius: '4px' }}>
          <Group mb="xs">
            <IconLink size={16} />
            <Text fw={500}>API URL for testing:</Text>
          </Group>
          <Code block style={{ overflowX: 'auto', wordBreak: 'break-all' }}>
            {apiUrl}
          </Code>
          <Text size="xs" mt="xs" c="dimmed">
            You can open this URL in a new tab to see the raw API response.
          </Text>
        </Box>
      </Collapse>
    </Box>
  );
}

export default DeclinationForm; 