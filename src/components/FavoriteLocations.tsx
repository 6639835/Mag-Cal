import React, { useState, useEffect } from 'react';
import { 
  Paper, Title, Text, Group, Button, Stack, TextInput, 
  ActionIcon, Modal, Badge, ScrollArea, Box, Tooltip
} from '@mantine/core';
import { 
  IconStar, IconStarFilled, IconTrash, IconEdit, 
  IconMapPin, IconArrowRight
} from '@tabler/icons-react';
import { SavedLocation, getLocations, saveLocation, deleteLocation, updateLocation } from '../utils/favorites';

interface FavoriteLocationsProps {
  onLocationSelected: (lat: number, lng: number, displayName: string) => void;
  currentLat?: number;
  currentLng?: number;
}

const FavoriteLocations: React.FC<FavoriteLocationsProps> = ({ 
  onLocationSelected, 
  currentLat, 
  currentLng 
}) => {
  const [favorites, setFavorites] = useState<SavedLocation[]>([]);
  const [editingFavorite, setEditingFavorite] = useState<SavedLocation | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newFavoriteName, setNewFavoriteName] = useState('');
  const [saveModalMode, setSaveModalMode] = useState<'add' | 'edit'>('add');

  // Load favorites from localStorage
  const loadFavorites = () => {
    const savedLocations = getLocations();
    setFavorites(savedLocations);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  // Open modal to save current location
  const handleSaveCurrentLocation = () => {
    if (!currentLat || !currentLng) return;
    
    setNewFavoriteName(`Location at ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`);
    setSaveModalMode('add');
    setShowSaveModal(true);
  };

  // Open modal to edit a favorite
  const handleEditFavorite = (favorite: SavedLocation) => {
    setEditingFavorite(favorite);
    setNewFavoriteName(favorite.name);
    setSaveModalMode('edit');
    setShowSaveModal(true);
  };

  // Save or update a favorite
  const handleSaveFavorite = () => {
    if (saveModalMode === 'add' && currentLat && currentLng) {
      saveLocation({
        name: newFavoriteName,
        latitude: currentLat,
        longitude: currentLng
      });
    } else if (saveModalMode === 'edit' && editingFavorite) {
      updateLocation(editingFavorite.id, { name: newFavoriteName });
    }
    
    // Reset state and reload favorites
    setShowSaveModal(false);
    setNewFavoriteName('');
    setEditingFavorite(null);
    loadFavorites();
  };

  // Delete a favorite
  const handleDeleteFavorite = (id: string) => {
    deleteLocation(id);
    loadFavorites();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Saved Locations</Title>
          {currentLat && currentLng && (
            <Button 
              leftSection={<IconStar size={18} />}
              size="sm"
              onClick={handleSaveCurrentLocation}
            >
              Save Current Location
            </Button>
          )}
        </Group>

        {favorites.length === 0 ? (
          <Text c="dimmed" ta="center" py="md">
            No saved locations yet. Use the "Save Current Location" button to add one.
          </Text>
        ) : (
          <ScrollArea h={300}>
            <Stack gap="xs">
              {favorites.map(favorite => (
                <Paper key={favorite.id} p="sm" withBorder shadow="xs">
                  <Group justify="space-between">
                    <Box>
                      <Group gap="xs">
                        <IconStarFilled size={16} color="#FFD700" />
                        <Text fw={500}>{favorite.name}</Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {favorite.latitude.toFixed(6)}, {favorite.longitude.toFixed(6)}
                      </Text>
                      <Badge size="xs" mt={5}>
                        Saved {formatDate(favorite.createdAt)}
                      </Badge>
                    </Box>
                    <Group gap="xs">
                      <Tooltip label="Edit">
                        <ActionIcon 
                          size="sm" 
                          variant="subtle" 
                          onClick={() => handleEditFavorite(favorite)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Use location">
                        <ActionIcon 
                          size="sm" 
                          color="blue" 
                          onClick={() => onLocationSelected(favorite.latitude, favorite.longitude, favorite.name)}
                        >
                          <IconArrowRight size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon 
                          size="sm" 
                          color="red" 
                          variant="subtle"
                          onClick={() => handleDeleteFavorite(favorite.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Paper>

      {/* Modal for adding/editing favorites */}
      <Modal
        opened={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={saveModalMode === 'add' ? "Save Location" : "Edit Saved Location"}
      >
        <Stack>
          <TextInput
            label="Location Name"
            value={newFavoriteName}
            onChange={(e) => setNewFavoriteName(e.currentTarget.value)}
            placeholder="Enter a name for this location"
            required
          />
          {saveModalMode === 'add' && currentLat && currentLng && (
            <Text size="sm">
              Coordinates: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
            </Text>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFavorite}>
              {saveModalMode === 'add' ? 'Save' : 'Update'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default FavoriteLocations;