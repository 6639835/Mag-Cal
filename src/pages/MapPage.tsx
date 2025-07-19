import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Title, 
  Text, 
  Paper, 
  Container, 
  Group, 
  Button,
  Box,
  Stack,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { IconArrowBack, IconMapPin, IconInfoCircle } from '@tabler/icons-react';
import DeclinationForm from '../components/DeclinationForm';
import DeclinationResults from '../components/DeclinationResults';
import { calculateDeclination } from '../utils/api';
import { Result } from '../types';

function MapPage() {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleCalculateSuccess = (data: Result) => {
    setResult(data);
    setLoading(false);
  };

  // Component to handle map click events
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);
      },
    });
    return null;
  }

  return (
    <Container size="lg">
      <Group mb="md">
        <ActionIcon 
          variant="light" 
          size="lg" 
          color="gray" 
          onClick={() => navigate('/')}
        >
          <IconArrowBack size={20} />
        </ActionIcon>
        <div>
          <Title order={2}>Interactive Map</Title>
          <Text c="dimmed">Click anywhere on the map to calculate magnetic declination</Text>
        </div>
      </Group>

      <Paper withBorder shadow="md" p="md" radius="md" mb={30}>
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: '500px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          
          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>
                <Text fw={500}>Selected Location</Text>
                <Text size="sm">Latitude: {selectedPosition[0].toFixed(6)}°</Text>
                <Text size="sm">Longitude: {selectedPosition[1].toFixed(6)}°</Text>
                <Button 
                  size="xs" 
                  mt="xs" 
                  fullWidth
                  onClick={() => {
                    setLoading(true);
                    calculateDeclination({
                      latitude: selectedPosition[0],
                      longitude: selectedPosition[1],
                      elevation: 0,
                      date: new Date(),
                    })
                    .then(data => {
                      handleCalculateSuccess(data);
                    })
                    .catch(error => {
                      console.error('Error calculating:', error);
                      setLoading(false);
                    });
                  }}
                  loading={loading}
                >
                  Calculate Here
                </Button>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        <Group mt="md" align="center">
          <IconInfoCircle size={18} />
          <Text size="sm">Click on the map to select a location, then click "Calculate Here" in the popup.</Text>
        </Group>
      </Paper>

      {selectedPosition && (
        <Paper withBorder shadow="md" p={30} radius="md" mb={30}>
          <Title order={3} mb="lg">Manual Calculation</Title>
          <DeclinationForm 
            onCalculate={handleCalculateSuccess} 
            onError={(message) => console.error(message)}
            isLoading={loading} 
            setLoading={setLoading}
            initialLatitude={selectedPosition[0]}
            initialLongitude={selectedPosition[1]}
          />
        </Paper>
      )}

      {result && (
        <Paper withBorder shadow="md" p={30} radius="md">
          <DeclinationResults result={result} />
        </Paper>
      )}
    </Container>
  );
}

export default MapPage; 