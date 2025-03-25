import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import { 
  Box, 
  Text, 
  Paper, 
  Title, 
  Button, 
  Group, 
  Alert, 
  Card, 
  Grid, 
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Badge,
  Loader,
  useMantineTheme,
  Divider,
  NumberInput,
  Stack,
  useMantineColorScheme,
  LoadingOverlay
} from '@mantine/core';
import { 
  IconCalculator, 
  IconMapPin, 
  IconCurrentLocation, 
  IconInfoCircle, 
  IconZoomIn,
  IconZoomOut,
  IconTarget,
  IconWorld,
  IconMapSearch,
  IconCompass
} from '@tabler/icons-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDeclination, Result } from '../utils/api';
import { DeclinationOverlay } from './DeclinationOverlay';
import DeclinationResults from './DeclinationResults';
import LocationSearch from './LocationSearch';

// Fix for Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';

// Create a custom default icon
const DefaultIcon = new L.Icon({
  iconUrl: icon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create a high-visibility custom icon for better visibility
const HighVisibilityIcon = new L.Icon({
  iconUrl: icon,
  iconRetinaUrl: markerIcon2x, 
  shadowUrl: iconShadow,
  iconSize: [32, 52],  // Make icon slightly larger
  iconAnchor: [16, 52],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'high-visibility-marker' // Add custom class for CSS targeting
});

// Explicitly override the default icon globally
L.Marker.prototype.options.icon = DefaultIcon;

// Add style to make markers more visible
const markerStyle = document.createElement('style');
markerStyle.innerHTML = `
  .high-visibility-marker {
    z-index: 10000 !important;
  }
  .leaflet-marker-icon {
    z-index: 1000 !important;
  }
  .leaflet-marker-shadow {
    z-index: 999 !important;
  }
`;
document.head.appendChild(markerStyle);

interface MapSelectorProps {
  onLocationSelected: (lat: number, lng: number, displayName?: string) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  onCalculate?: (result: Result, isMock?: boolean) => void;
  onError?: (message: string) => void;
  isLoading?: boolean;
  setLoading?: (loading: boolean) => void;
}

// This component handles centering the map when coordinates change
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

// This component handles map click events
function LocationMarker({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number, displayName?: string) => void }) {
  const map = useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelected,
  initialLatitude,
  initialLongitude,
  onCalculate,
  onError,
  isLoading = false,
  setLoading = () => {}
}) => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapResult, setMapResult] = useState<Result | null>(null);
  const [mapIsMockData, setMapIsMockData] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [manualLat, setManualLat] = useState<number | ''>(initialLatitude || '');
  const [manualLng, setManualLng] = useState<number | ''>(initialLongitude || '');
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  
  // Add additional state for theme transition detection
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const prevColorScheme = useRef(colorScheme);

  // Detect theme changes
  useEffect(() => {
    if (prevColorScheme.current !== colorScheme) {
      setIsThemeTransitioning(true);
      const timeout = setTimeout(() => {
        setIsThemeTransitioning(false);
      }, 300);
      prevColorScheme.current = colorScheme;
      return () => clearTimeout(timeout);
    }
  }, [colorScheme]);

  useEffect(() => {
    // Wait for the DOM to be ready
    const initMap = () => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      const defaultLat = initialLatitude || 40.7128;
      const defaultLng = initialLongitude || -74.006;

      // If map already exists, just update its view without changing zoom
      if (mapRef.current) {
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.setView([defaultLat, defaultLng], currentZoom);
      } else {
        // Only create a new map if one doesn't exist
        const map = L.map('map', {
          center: [defaultLat, defaultLng],
          zoom: 5,
          zoomControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
      }

      // Clear any existing markers first
      if (markerRef.current && mapRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }

      if (initialLatitude && initialLongitude && mapRef.current) {
        // Always create a new marker to ensure it's visible
        markerRef.current = L.marker([initialLatitude, initialLongitude], {
          draggable: true,
          icon: HighVisibilityIcon, // Use high visibility icon
          zIndexOffset: 1000 // Ensure marker is above other elements
        }).addTo(mapRef.current);
        
        markerRef.current.on('dragend', function () {
          const marker = markerRef.current;
          if (marker) {
            const position = marker.getLatLng();
            setSelectedCoordinates({
              latitude: position.lat,
              longitude: position.lng,
            });
            onLocationSelected(position.lat, position.lng);
          }
        });
        
        setSelectedCoordinates({
          latitude: initialLatitude,
          longitude: initialLongitude,
        });

        // Debug marker visibility
        console.log('Initial marker added:', markerRef.current);
      }

      // Ensure we register the click handler on the current map instance
      if (mapRef.current) {
        // Remove any existing click handlers to prevent duplicates
        mapRef.current.off('click');
        
        mapRef.current.on('click', function(e: L.LeafletMouseEvent) {
          const { lat, lng } = e.latlng;

          // Clean up any existing marker
          if (markerRef.current && mapRef.current) {
            mapRef.current.removeLayer(markerRef.current);
          }

          // Create a new marker on each click
          if (mapRef.current) {
            markerRef.current = L.marker([lat, lng], {
              draggable: true,
              icon: HighVisibilityIcon, // Use high visibility icon
              zIndexOffset: 1000 // Ensure marker is above other elements
            }).addTo(mapRef.current);
          }
          
          // Debug marker visibility
          console.log('Click marker added:', markerRef.current);
          
          if (markerRef.current) {
            markerRef.current.on('dragend', function () {
              const marker = markerRef.current;
              if (marker) {
                const position = marker.getLatLng();
                setSelectedCoordinates({
                  latitude: position.lat,
                  longitude: position.lng,
                });
                onLocationSelected(position.lat, position.lng);
              }
            });
          }

          setSelectedCoordinates({
            latitude: lat,
            longitude: lng,
          });
          
          // Always notify the parent component about the location change
          onLocationSelected(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });
      }
    };

    // Initialize map after a short delay to ensure DOM is ready
    const timer = setTimeout(initMap, 200); // Increased timeout for better DOM readiness

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialLatitude, initialLongitude, onLocationSelected]);

  const handleCalculate = async () => {
    if (!selectedCoordinates || !onCalculate || !setLoading) return;
    
    setLoading(true);
    try {
      const result = await calculateDeclination({
        latitude: selectedCoordinates.latitude,
        longitude: selectedCoordinates.longitude,
        elevation: 0,
        date: new Date()
      });
      onCalculate(result);
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to calculate declination');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedCoordinates({
            latitude: lat,
            longitude: lng,
          });
          
          // Reverse geocode to get the location name
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(response => response.json())
            .then(data => {
              const displayName = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              onLocationSelected(lat, lng, displayName);
            })
            .catch(() => {
              // If reverse geocoding fails, just use coordinates
              onLocationSelected(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            });
          
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 10);
            
            // Clean up existing marker first
            if (markerRef.current) {
              mapRef.current.removeLayer(markerRef.current);
            }
            
            // Create a fresh marker
            markerRef.current = L.marker([lat, lng], {
              draggable: true,
              icon: HighVisibilityIcon, // Use high visibility icon
              zIndexOffset: 1000 // Ensure marker is above other elements
            }).addTo(mapRef.current);
            
            // Debug marker visibility
            console.log('Geolocation marker added:', markerRef.current);
            
            markerRef.current.on('dragend', function () {
              const marker = markerRef.current;
              if (marker) {
                const position = marker.getLatLng();
                setSelectedCoordinates({
                  latitude: position.lat,
                  longitude: position.lng,
                });
                onLocationSelected(position.lat, position.lng);
              }
            });
          }
          setMapResult(null);
        },
        (error) => {
          onError?.(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      onError?.('Geolocation is not supported by your browser');
    }
  };

  // Handle manual coordinate input
  const handleManualCoordinates = () => {
    if (typeof manualLat === 'number' && typeof manualLng === 'number') {
      // Validate coordinates
      if (manualLat < -90 || manualLat > 90) {
        onError?.('Latitude must be between -90 and 90 degrees');
        return;
      }
      if (manualLng < -180 || manualLng > 180) {
        onError?.('Longitude must be between -180 and 180 degrees');
        return;
      }
      
      setSelectedCoordinates({
        latitude: manualLat,
        longitude: manualLng,
      });
      onLocationSelected(manualLat, manualLng);
      if (mapRef.current) {
        mapRef.current.setView([manualLat, manualLng], 10);
        
        // Clean up existing marker first
        if (markerRef.current) {
          mapRef.current.removeLayer(markerRef.current);
        }
        
        // Create a fresh marker
        markerRef.current = L.marker([manualLat, manualLng], {
          draggable: true,
          icon: HighVisibilityIcon, // Use high visibility icon
          zIndexOffset: 1000 // Ensure marker is above other elements
        }).addTo(mapRef.current);
        
        // Debug marker visibility
        console.log('Manual coordinates marker added:', markerRef.current);
        
        markerRef.current.on('dragend', function () {
          const marker = markerRef.current;
          if (marker) {
            const position = marker.getLatLng();
            setSelectedCoordinates({
              latitude: position.lat,
              longitude: position.lng,
            });
            onLocationSelected(position.lat, position.lng);
          }
        });
      }
      setMapResult(null);
    }
  };

  // Reset map view to world view
  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.setView([0, 0], 2);
    }
  };

  // Zoom in/out
  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  // Fix for NumberInput onChange handler types
  const handleLatChange = (value: number | string) => {
    setManualLat(value === '' ? '' : Number(value));
  };

  const handleLngChange = (value: number | string) => {
    setManualLng(value === '' ? '' : Number(value));
  };

  return (
    <>
      <Paper p="xl" radius="md" withBorder className={isThemeTransitioning ? 'theme-transition' : ''}>
        <Group gap="md" mb="md">
          <ThemeIcon size="xl" radius="md" color="blue">
            <IconMapPin size={24} />
          </ThemeIcon>
          <Box>
            <Title order={2} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Interactive Map Selection
            </Title>
            <Text c="dimmed" size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Select a location on the map to calculate magnetic declination
            </Text>
          </Box>
        </Group>

        <Grid mb="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card p="0" radius="md" withBorder style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '500px' }}>
                {/* Add an overlay during theme transition */}
                {isThemeTransitioning && (
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                      zIndex: 1000,
                      pointerEvents: 'none',
                      animation: 'theme-fade 0.3s ease'
                    }}
                  />
                )}
                <LoadingOverlay visible={isLoading} zIndex={1000} />
                <div 
                  id="map" 
                  style={{ 
                    height: '100%', 
                    width: '100%',
                    position: 'relative',
                    zIndex: 1
                  }} 
                />
              </div>

              {/* Custom map controls with theme-aware styling */}
              <Box style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                zIndex: 9999
              }}>
                <Card 
                  shadow="md" 
                  p="xs" 
                  radius="md" 
                  withBorder
                  style={{
                    backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  <Stack gap="xs">
                    <Tooltip label="Zoom in" position="top" withArrow withinPortal opened={false}>
                      <ActionIcon 
                        color={isDark ? "blue.4" : "blue"} 
                        size="lg" 
                        onClick={zoomIn}
                        variant={isDark ? "light" : "filled"}
                      >
                        <IconZoomIn size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Zoom out" position="top" withArrow withinPortal opened={false}>
                      <ActionIcon 
                        color={isDark ? "blue.4" : "blue"} 
                        size="lg" 
                        onClick={zoomOut}
                        variant={isDark ? "light" : "filled"}
                      >
                        <IconZoomOut size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Use my location" position="top" withArrow withinPortal opened={false}>
                      <ActionIcon 
                        color={isDark ? "green.4" : "green"} 
                        size="lg" 
                        onClick={getCurrentLocation}
                        variant={isDark ? "light" : "filled"}
                      >
                        <IconCurrentLocation size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Reset view" position="top" withArrow withinPortal opened={false}>
                      <ActionIcon 
                        color={isDark ? "gray.5" : "gray"} 
                        size="lg" 
                        onClick={resetMapView}
                        variant={isDark ? "light" : "filled"}
                      >
                        <IconWorld size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={showOverlay ? "Hide declination overlay" : "Show declination overlay"} position="top" withArrow withinPortal opened={false}>
                      <ActionIcon 
                        color={showOverlay ? (isDark ? "blue.4" : "blue") : (isDark ? "gray.5" : "gray")} 
                        size="lg" 
                        onClick={() => setShowOverlay(!showOverlay)}
                        variant={isDark ? "light" : "filled"}
                      >
                        <IconCompass size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Stack>
                </Card>
              </Box>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder h="100%">
              <Stack justify="space-between" h="100%">
                <Box>
                  <Group gap="xs" mb="sm">
                    <ThemeIcon size="md" radius="xl" color="blue" variant="light">
                      <IconTarget size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="lg">Location Coordinates</Text>
                  </Group>
                  
                  <Box mb="md">
                    <LocationSearch onLocationSelected={(lat, lng, displayName) => {
                      if (mapRef.current) {
                        mapRef.current.setView([lat, lng], 10);
                        
                        // Clean up existing marker first
                        if (markerRef.current) {
                          mapRef.current.removeLayer(markerRef.current);
                        }
                        
                        // Create a fresh marker
                        markerRef.current = L.marker([lat, lng], {
                          draggable: true,
                          icon: HighVisibilityIcon,
                          zIndexOffset: 1000
                        }).addTo(mapRef.current);
                        
                        // Set up marker drag handler
                        if (markerRef.current) {
                          markerRef.current.on('dragend', function () {
                            const marker = markerRef.current;
                            if (marker) {
                              const position = marker.getLatLng();
                              setSelectedCoordinates({
                                latitude: position.lat,
                                longitude: position.lng,
                              });
                              onLocationSelected(position.lat, position.lng);
                            }
                          });
                        }
                        
                        setSelectedCoordinates({
                          latitude: lat,
                          longitude: lng,
                        });
                        
                        onLocationSelected(lat, lng, displayName);
                      }
                    }} />
                  </Box>
                  
                  <Alert 
                    color="blue" 
                    variant="light" 
                    icon={<IconInfoCircle size={16} />}
                    mb="md"
                  >
                    Click on the map or enter coordinates directly to select a location
                  </Alert>
                  
                  <Grid mb="md">
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Latitude"
                        description="(-90° to 90°)"
                        value={manualLat}
                        onChange={handleLatChange}
                        decimalScale={6}
                        min={-90}
                        max={90}
                        step={0.0001}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Longitude"
                        description="(-180° to 180°)"
                        value={manualLng}
                        onChange={handleLngChange}
                        decimalScale={6}
                        min={-180}
                        max={180}
                        step={0.0001}
                      />
                    </Grid.Col>
                  </Grid>
                  
                  <Group>
                    <Button 
                      leftSection={<IconMapSearch size={16} />}
                      onClick={handleManualCoordinates}
                      disabled={typeof manualLat !== 'number' || typeof manualLng !== 'number'}
                      color="blue"
                      variant="light"
                      style={{ flex: 1 }}
                      title="Go to Location"
                    >
                      Set Location
                    </Button>
                    <Button 
                      leftSection={<IconCurrentLocation size={16} />}
                      onClick={getCurrentLocation}
                      variant="light"
                      style={{ flex: 1 }}
                    >
                      My Location
                    </Button>
                  </Group>
                </Box>
                
                {selectedCoordinates && (
                  <Box>
                    <Divider my="md" />
                    <Group gap="xs" mb="sm">
                      <ThemeIcon size="md" radius="xl" color="green" variant="light">
                        <IconMapPin size={16} />
                      </ThemeIcon>
                      <Text fw={500}>Selected Location</Text>
                    </Group>
                    
                    <Card bg={theme.colors.gray[0]} p="sm" radius="md" mb="md">
                      <Text ta="center" fw={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedCoordinates.latitude.toFixed(6)}°, {selectedCoordinates.longitude.toFixed(6)}°
                      </Text>
                    </Card>
                    
                    <Button 
                      leftSection={<IconCalculator size={16} />}
                      onClick={handleCalculate}
                      loading={isLoading}
                      disabled={!selectedCoordinates}
                      fullWidth
                      size="md"
                      color="green"
                    >
                      Calculate Declination
                    </Button>
                  </Box>
                )}
                
                {!selectedCoordinates && (
                  <Box>
                    <Card p="md" bg={theme.colors.gray[0]} radius="md" withBorder>
                      <Group justify="center">
                        <IconTarget size={32} color={theme.colors.gray[6]} />
                      </Group>
                      <Text ta="center" c="dimmed" size="sm" mt="xs">
                        No location selected yet. Click on the map to select a point.
                      </Text>
                    </Card>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
        
        <Text size="xs" ta="right" c="dimmed">
          Map data © OpenStreetMap contributors
        </Text>
      </Paper>
      
      {isLoading && (
        <Card withBorder mt="md" p="xl" radius="md">
          <Group justify="center">
            <Loader size="md" />
            <Text>Calculating magnetic declination...</Text>
          </Group>
        </Card>
      )}
      
      {mapResult && !isLoading && (
        <Paper shadow="md" radius="md" p="xl" mt="md" withBorder>
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" radius="md" color="blue">
              <IconCompass size={24} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Title order={2} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Declination Results
              </Title>
            </Box>
            <Badge size="lg" color="blue">
              {new Date().toLocaleDateString()}
            </Badge>
          </Group>
          
          {mapIsMockData && (
            <Alert color="yellow" mb="md" icon={<IconInfoCircle size={16} />}>
              Using simulated data. Could not connect to NOAA API. The values shown are approximations.
            </Alert>
          )}
          <DeclinationResults result={mapResult} />
        </Paper>
      )}
    </>
  );
};

export default MapSelector; 