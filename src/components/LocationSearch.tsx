import React, { useState } from 'react';
import { TextInput, Button, Group, Box, Paper, Text, List, Loader } from '@mantine/core';
import { IconSearch, IconMapPin } from '@tabler/icons-react';

interface LocationSearchProps {
  onLocationSelected: (lat: number, lng: number, displayName: string) => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelected }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Using Nominatim OpenStreetMap API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MagneticDeclinationCalculator/1.0' // Nominatim requires a User-Agent
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data as SearchResult[]);
      
      if (data.length === 0) {
        setError('No locations found. Please try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`Search failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    onLocationSelected(
      parseFloat(result.lat), 
      parseFloat(result.lon), 
      result.display_name
    );
    setResults([]);
  };

  return (
    <Box>
      <Group>
        <TextInput
          placeholder="Enter location name, address, city..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
          leftSection={<IconSearch size={16} />}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          onClick={handleSearch} 
          loading={loading}
        >
          Search
        </Button>
      </Group>
      
      {loading && (
        <Box py="md" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader size="sm" />
        </Box>
      )}

      {error && <Text color="red" size="sm" mt="xs">{error}</Text>}
      
      {results.length > 0 && (
        <Paper withBorder p="sm" mt="xs">
          <List spacing="xs">
            {results.map((result, index) => (
              <List.Item 
                key={index}
                icon={<IconMapPin size={16} />}
                onClick={() => handleSelectLocation(result)}
                style={{ cursor: 'pointer' }}
              >
                <Text size="sm">{result.display_name}</Text>
                <Text size="xs" c="dimmed">
                  Coordinates: {parseFloat(result.lat).toFixed(6)}, {parseFloat(result.lon).toFixed(6)}
                </Text>
              </List.Item>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default LocationSearch; 