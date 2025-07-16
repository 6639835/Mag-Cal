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
  onShare?: (result: Result) => void;
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
  
  // Add animation states for map controls
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Create animation styles with useEffect
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .map-theme-transition {
        animation: mapThemeTransition 0.6s ease;
      }
      
      @keyframes mapThemeTransition {
        0% { filter: blur(5px); transform: scale(0.98); }
        100% { filter: blur(0); transform: scale(1); }
      }
      
      .map-location-change {
        animation: mapLocationChange 0.5s ease;
      }
      
      @keyframes mapLocationChange {
        0% { transform: scale(0.95); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      
      .button-shine-effect {
        animation: shine 3s infinite linear;
      }
      
      @keyframes shine {
        0% { transform: translateX(-100%); }
        20% { transform: translateX(100%); }
        100% { transform: translateX(100%); }
      }
      
      .calculate-button:hover .button-shine-effect {
        animation: shine 1.5s infinite linear;
      }
      
      .set-coords-button {
        position: relative;
        overflow: hidden;
      }
      
      .set-coords-button::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 5px;
        height: 5px;
        background: rgba(255, 255, 255, 0.5);
        opacity: 0;
        border-radius: 100%;
        transform: scale(1, 1) translate(-50%);
        transform-origin: 50% 50%;
      }
      
      .set-coords-button:hover::after {
        animation: ripple 1s ease-out;
      }
      
      @keyframes ripple {
        0% {
          transform: scale(0, 0);
          opacity: 0.5;
        }
        20% {
          transform: scale(25, 25);
          opacity: 0.3;
        }
        100% {
          opacity: 0;
          transform: scale(40, 40);
        }
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

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

      // If map already exists, only update view if we have initial coordinates and they're different
      if (mapRef.current) {
        if (initialLatitude && initialLongitude) {
          const currentCenter = mapRef.current.getCenter();
          // Only update view if the initial coordinates are significantly different from current center
          const distanceThreshold = 0.01; // about 1km
          if (Math.abs(currentCenter.lat - initialLatitude) > distanceThreshold ||
              Math.abs(currentCenter.lng - initialLongitude) > distanceThreshold) {
            const currentZoom = mapRef.current.getZoom();
            mapRef.current.setView([initialLatitude, initialLongitude], Math.max(currentZoom, 8));
          }
        }
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
        
        // Set up click handler only once when map is created
        map.on('click', function(e: L.LeafletMouseEvent) {
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

      // Handle marker updates when initial coordinates are provided
      if (initialLatitude && initialLongitude && mapRef.current) {
        // Clear any existing markers first
        if (markerRef.current) {
          mapRef.current.removeLayer(markerRef.current);
          markerRef.current = null;
        }

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
    };

    // Initialize map after a short delay to ensure DOM is ready
    const timer = setTimeout(initMap, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [initialLatitude, initialLongitude]);

  // Separate effect to handle map cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

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

  // Replace or enhance the map control buttons
  const mapControlsStyle = {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  };

  // Add back the theme change detection
  useEffect(() => {
    if (prevColorScheme.current !== colorScheme) {
      setIsThemeTransitioning(true);
      // Add class to map container for transition animation
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.classList.add('map-theme-transition');
        setTimeout(() => {
          mapContainer.classList.remove('map-theme-transition');
        }, 600);
      }
      const timeout = setTimeout(() => {
        setIsThemeTransitioning(false);
      }, 300);
      prevColorScheme.current = colorScheme;
      return () => clearTimeout(timeout);
    }
  }, [colorScheme]);

  return (
    <Box style={{ position: 'relative' }}>
      <Paper
        shadow="md"
        radius="md"
        p="md"
        style={{ 
          height: '500px', 
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <div id="map" style={{ height: '100%', borderRadius: '8px', transition: 'filter 0.5s ease' }} />
        
        <div style={mapControlsStyle}>
          <ActionIcon
            variant="filled"
            color="blue"
            size="lg"
            onClick={zoomIn}
            onMouseEnter={() => setHoveredButton('zoomIn')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              transform: hoveredButton === 'zoomIn' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <IconZoomIn size={20} />
          </ActionIcon>
          
          <ActionIcon
            variant="filled"
            color="blue"
            size="lg"
            onClick={zoomOut}
            onMouseEnter={() => setHoveredButton('zoomOut')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              transform: hoveredButton === 'zoomOut' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <IconZoomOut size={20} />
          </ActionIcon>
          
          <ActionIcon
            variant="filled"
            color="teal"
            size="lg"
            onClick={resetMapView}
            onMouseEnter={() => setHoveredButton('reset')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              transform: hoveredButton === 'reset' ? 'scale(1.1) rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <IconWorld size={20} />
          </ActionIcon>
          
          <ActionIcon
            variant="filled"
            color="orange"
            size="lg"
            onClick={getCurrentLocation}
            onMouseEnter={() => setHoveredButton('location')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              transform: hoveredButton === 'location' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <IconCurrentLocation size={20} />
          </ActionIcon>
        </div>
        
        {isLoading && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(255, 255, 255, 0.7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: '8px',
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <Loader size="lg" variant="dots" color="blue" />
          </div>
        )}
      </Paper>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <LocationSearch 
            onLocationSelected={(lat, lng, displayName) => {
              onLocationSelected(lat, lng, displayName);
              
              // Add animation class to the map container when location changes
              const mapContainer = document.getElementById('map');
              if (mapContainer) {
                mapContainer.classList.add('map-location-change');
                setTimeout(() => {
                  mapContainer.classList.remove('map-location-change');
                }, 500);
              }
            }}
          />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Button 
            leftSection={<IconCalculator size={16} />}
            onClick={handleCalculate}
            loading={isLoading}
            fullWidth
            variant="gradient" 
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            className="calculate-button"
            style={{
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span 
              style={{ 
                position: 'relative', 
                zIndex: 2
              }}
            >
              Calculate Declination
            </span>
            <span 
              className="button-shine-effect" 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateX(-100%)',
                zIndex: 1
              }}
            ></span>
          </Button>
        </Grid.Col>
      </Grid>

      <Paper p="md" withBorder mt="md" radius="md" shadow="sm">
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group gap="xs">
              <ThemeIcon color="blue" size="md" variant="light">
                <IconMapPin size={16} />
              </ThemeIcon>
              <Text fw={500}>Manual Coordinates</Text>
            </Group>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <NumberInput
              label="Latitude"
              placeholder="Enter latitude"
              decimalScale={6}
              min={-90}
              max={90}
              step={0.000001}
              value={manualLat}
              onChange={handleLatChange}
              rightSection={<Text size="xs">°N</Text>}
              styles={{
                wrapper: { 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:focus-within': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }
              }}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <NumberInput
              label="Longitude"
              placeholder="Enter longitude"
              decimalScale={6}
              min={-180}
              max={180}
              step={0.000001}
              value={manualLng}
              onChange={handleLngChange}
              rightSection={<Text size="xs">°E</Text>}
              styles={{
                wrapper: { 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:focus-within': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }
              }}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Button
              onClick={handleManualCoordinates}
              variant="light"
              color="blue"
              fullWidth
              leftSection={<IconTarget size={16} />}
              className="set-coords-button"
            >
              Set
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>

      {mapResult && (
        <Box mt="xl">
          <DeclinationResults
            result={mapResult}
            isMockData={mapIsMockData}
            selectedCoordinates={selectedCoordinates}
          />
        </Box>
      )}
    </Box>
  );
};

export default MapSelector; 