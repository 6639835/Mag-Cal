import React, { useEffect } from 'react';
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
  Alert,
  Tooltip,
  ActionIcon,
  Stack
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

  // Calculate compass rotation for animation
  const compassRotation = isEast ? declinationValue : -Math.abs(declinationValue || 0);

  // Add keyframes for fadeIn and pulse animations
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pulse-animation {
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 120, 255, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(0, 120, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 120, 255, 0); }
      }
      @keyframes slideGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes bounceArrow {
        0%, 100% { transform: translateY(-5px); }
        50% { transform: translateY(5px); }
      }
      @keyframes innerGlow {
        0% { box-shadow: 0 0 10px rgba(255,255,255,0.3); }
        100% { box-shadow: 0 0 20px rgba(255,255,255,0.5); }
      }
      @keyframes fadeInScale {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes compassGlow {
        0% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
        100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
      }
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes magneticNeedle {
        0% { transform: translateY(0); }
        100% { transform: translateY(-5px); }
      }
      @keyframes valueGlow {
        0% { text-shadow: 0 0 0 rgba(0,0,0,0.1); }
        100% { text-shadow: 0 0 10px rgba(0,0,0,0.2); }
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <Box className="results-card">
      <Title order={2} mb="md">Declination Results</Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper p="md" withBorder radius="md" shadow="sm" style={{ height: '100%' }}>
            <Group mb="xs" justify="space-between">
              <Group>
                <ThemeIcon size={36} radius="md" color="blue" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} className="pulse-animation">
                  <IconCompass size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={500} size="lg">Magnetic Declination</Text>
                  <Text size="xs" c="dimmed">Angle between true and magnetic north</Text>
                </div>
              </Group>
              <Tooltip 
                label="Magnetic declination is the angular difference between magnetic north (direction a compass points) and true north (actual geographic north)"
                multiline
                w={300}
                withArrow
                position="left"
              >
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconInfoCircle size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            
            {/* Enhanced compass visualization */}
            <Box style={{ 
              position: 'relative', 
              textAlign: 'center', 
              margin: '20px 0',
              padding: '16px',
              backgroundColor: 'rgba(248, 249, 250, 0.5)',
              borderRadius: '12px'
            }}>
              {/* Compass container with enhanced styling */}
              <div style={{ 
                position: 'relative', 
                width: '140px', 
                height: '140px', 
                margin: '0 auto',
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, transparent 70%),
                  linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 50%, rgba(219, 234, 254, 0.1) 100%)
                `, 
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.1),
                  inset 0 2px 8px rgba(255,255,255,0.2),
                  inset 0 -2px 8px rgba(0,0,0,0.05)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid rgba(59, 130, 246, 0.2)',
                animation: 'compassGlow 3s ease-in-out infinite alternate'
              }}>
                {/* Outer ring with degree markings */}
                <div style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.1) 2deg, transparent 4deg)',
                  animation: 'rotate 20s linear infinite'
                }} />
                
                {/* Rotating compass content */}
                <div style={{ 
                  width: '90%', 
                  height: '90%', 
                  position: 'relative',
                  transform: `rotate(${compassRotation}deg)`,
                  transition: 'transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  {/* Enhanced directional indicators */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    color: '#ef4444', 
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>N</div>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '8px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    color: '#374151', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>S</div>
                  <div style={{ 
                    position: 'absolute', 
                    left: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#374151', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>W</div>
                  <div style={{ 
                    position: 'absolute', 
                    right: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#374151', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>E</div>
                  
                  {/* Enhanced compass lines with gradient effects */}
                  <div style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: '10%', 
                    bottom: '10%', 
                    width: '3px', 
                    background: 'linear-gradient(to bottom, #ef4444 0%, #dc2626 50%, #b91c1c 100%)', 
                    transform: 'translateX(-50%)',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                  }}></div>
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '10%', 
                    right: '10%', 
                    height: '2px', 
                    background: 'linear-gradient(to right, #6b7280 0%, #4b5563 50%, #374151 100%)', 
                    transform: 'translateY(-50%)',
                    borderRadius: '1px'
                  }}></div>
                  
                  {/* Magnetic needle indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    width: '4px',
                    height: '30%',
                    background: 'linear-gradient(to bottom, #10b981 0%, #059669 100%)',
                    transform: 'translateX(-50%)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                    animation: 'magneticNeedle 2s ease-in-out infinite alternate'
                  }} />
                </div>
                
                {/* Center point with enhanced styling */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1f2937',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
                }} />
              </div>
              
              {/* Enhanced value display */}
              <Group justify="center" mt="lg" gap="md">
                <Box ta="center">
                  <Title order={1} style={{ 
                    fontWeight: 'bold', 
                    fontSize: '2.5rem',
                    background: isEast 
                      ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)' 
                      : 'linear-gradient(45deg, #ef4444, #dc2626)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    animation: 'valueGlow 2s ease-in-out infinite alternate'
                  }}>
                    {decimalDeclination}°
                  </Title>
                </Box>
                <Badge 
                  size="xl" 
                  variant="gradient"
                  gradient={isEast 
                    ? { from: 'blue', to: 'cyan', deg: 45 }
                    : { from: 'red', to: 'orange', deg: 45 }
                  }
                  style={{ 
                    transform: 'translateY(8px)',
                    animation: 'fadeInScale 0.8s ease-out',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {isEast ? "East" : "West"}
                </Badge>
              </Group>
            </Box>
            
            {/* Enhanced instructional content */}
            <Stack gap="sm" mt="md">
              <Text size="sm" ta="center" fw={500} style={{ lineHeight: 1.4 }}>
                {isEast 
                  ? "Add to true bearing to get magnetic bearing" 
                  : "Subtract from true bearing to get magnetic bearing"}
              </Text>
              
              {/* Practical usage guide */}
              <Box p="sm" style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <Group gap="xs" mb="xs">
                  <IconInfoCircle size={14} style={{ color: 'var(--mantine-color-blue-6)' }} />
                  <Text size="xs" fw={500} c="blue">Navigation Guide</Text>
                </Group>
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
                  {isEast ? (
                    <>
                      <strong>Example:</strong> True bearing 90° + {decimalDeclination}° = {(90 + parseFloat(decimalDeclination)).toFixed(1)}° magnetic bearing
                    </>
                  ) : (
                    <>
                      <strong>Example:</strong> True bearing 90° - {decimalDeclination}° = {(90 - parseFloat(decimalDeclination)).toFixed(1)}° magnetic bearing
                    </>
                  )}
                </Text>
              </Box>
              
              {/* Accuracy indicator */}
              <Group justify="center" gap="xs" mt="xs">
                <Text size="xs" c="dimmed">Accuracy: ±0.5°</Text>
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }} />
                <Text size="xs" c="dimmed">Updated: {new Date().toLocaleDateString()}</Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Paper p="md" withBorder radius="md" shadow="sm" style={{ height: '100%' }}>
            <Group mb="xs" justify="space-between">
              <Group>
                <ThemeIcon size={36} radius="md" color="cyan" variant="gradient" gradient={{ from: 'cyan', to: 'blue' }}>
                  <IconArrowsDownUp size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={500} size="lg">Annual Change</Text>
                  <Text size="xs" c="dimmed">Rate of magnetic field change</Text>
                </div>
              </Group>
              <Tooltip 
                label="The annual change represents how much the magnetic declination shifts each year due to changes in Earth's magnetic field"
                multiline
                w={280}
                withArrow
                position="left"
              >
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconInfoCircle size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            
            {/* Enhanced visualization */}
            <Box style={{ 
              position: 'relative', 
              height: '120px', 
              margin: '16px 0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(248, 249, 250, 0.5)',
              borderRadius: '8px',
              padding: '20px'
            }}>
              {/* Progress-style indicator */}
              <div style={{ 
                position: 'relative', 
                width: '90%', 
                height: '8px', 
                backgroundColor: 'rgba(0,0,0,0.08)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                {/* Animated background gradient */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, 
                    ${isIncreasing ? '#ff6b35' : '#12B886'} 0%, 
                    rgba(255,255,255,0.3) 50%, 
                    ${isIncreasing ? '#12B886' : '#ff6b35'} 100%)`,
                  animation: 'slideGradient 3s ease-in-out infinite'
                }} />
                
                {/* Center reference line */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '-4px',
                  bottom: '-4px',
                  width: '2px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  transform: 'translateX(-50%)'
                }} />
                
                {/* Dynamic indicator */}
                <div style={{ 
                  position: 'absolute', 
                  left: isIncreasing ? '65%' : '35%',
                  top: '50%', 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: isIncreasing ? '#12B886' : '#FF6B35', 
                  borderRadius: '50%', 
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 16px ${isIncreasing ? 'rgba(18, 184, 134, 0.4)' : 'rgba(255, 107, 53, 0.4)'}`,
                  border: '3px solid white',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  {/* Inner glow effect */}
                  <div style={{
                    position: 'absolute',
                    inset: '2px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    animation: 'innerGlow 2s ease-in-out infinite alternate'
                  }} />
                </div>
                
                {/* Direction arrow with enhanced animation */}
                <div style={{ 
                  position: 'absolute', 
                  left: isIncreasing ? '75%' : '25%',
                  top: '-45px', 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  color: isIncreasing ? '#12B886' : '#FF6B35',
                  animation: 'bounceArrow 1.5s ease-in-out infinite',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {isIncreasing ? '↗' : '↘'}
                </div>
              </div>
              
              {/* Trend labels */}
              <div style={{
                position: 'absolute',
                left: '5%',
                bottom: '10px',
                fontSize: '12px',
                color: '#FF6B35',
                fontWeight: '500'
              }}>
                Westward
              </div>
              <div style={{
                position: 'absolute',
                right: '5%',
                bottom: '10px',
                fontSize: '12px',
                color: '#12B886',
                fontWeight: '500'
              }}>
                Eastward
              </div>
            </Box>
            
            {/* Enhanced value display */}
            <Group justify="center" mt="lg" gap="md">
              <Box ta="center">
                <Title order={2} style={{ 
                  fontWeight: 'bold',
                  background: isIncreasing 
                    ? 'linear-gradient(45deg, #12B886, #20C997)' 
                    : 'linear-gradient(45deg, #FF6B35, #FF922B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {annualChange}°
                </Title>
                <Text size="xs" c="dimmed" fw={500}>per year</Text>
              </Box>
              <Badge 
                size="lg" 
                variant="gradient"
                gradient={isIncreasing 
                  ? { from: 'teal', to: 'green', deg: 45 }
                  : { from: 'orange', to: 'red', deg: 45 }
                }
                style={{ 
                  animation: 'fadeInScale 0.8s ease-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {isIncreasing ? "Increasing" : "Decreasing"}
              </Badge>
            </Group>
            
            {/* Enhanced descriptive text with practical context */}
            <Stack gap="xs" mt="md">
              <Text size="sm" ta="center" fw={500} style={{ lineHeight: 1.4 }}>
                {isIncreasing 
                  ? `Declination shifts eastward by ${annualChange}° annually` 
                  : `Declination shifts westward by ${annualChange}° annually`}
              </Text>
              
              {/* Practical impact information */}
              <Group justify="center" gap="xs">
                <IconInfoCircle size={14} style={{ color: 'var(--mantine-color-blue-6)' }} />
                <Text size="xs" c="dimmed" ta="center" style={{ maxWidth: '280px', lineHeight: 1.3 }}>
                  This affects compass readings over time. 
                  {parseFloat(annualChange) > 0.1 
                    ? ' Significant change - update navigation annually'
                    : ' Minimal change - compass remains accurate for several years'
                  }
                </Text>
              </Group>
              
              {/* Future projection */}
              {parseFloat(annualChange) > 0 && (
                <Box mt="xs" p="xs" style={{ 
                  backgroundColor: 'rgba(0,0,0,0.02)', 
                  borderRadius: '6px',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Text size="xs" c="dimmed" ta="center" fs="italic">
                    In 10 years: {isIncreasing ? '+' : '-'}{(parseFloat(annualChange) * 10).toFixed(2)}° total change
                  </Text>
                </Box>
              )}
            </Stack>
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
      
      <Paper p="md" withBorder radius="md" shadow="sm" mt="md">
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
      </Paper>
    </Box>
  );
}

export default DeclinationResults; 