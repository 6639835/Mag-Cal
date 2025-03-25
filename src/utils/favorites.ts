// Interface for a saved location/favorite
export interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

const FAVORITES_KEY = 'magcalc-favorites';

/**
 * Save a location to favorites
 */
export function saveLocation(location: Omit<SavedLocation, 'id' | 'createdAt'>): SavedLocation {
  const favorites = getLocations();
  
  const newLocation: SavedLocation = {
    ...location,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  
  favorites.unshift(newLocation);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  
  return newLocation;
}

/**
 * Get all saved locations/favorites
 */
export function getLocations(): SavedLocation[] {
  try {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    return [];
  }
}

/**
 * Delete a saved location by ID
 */
export function deleteLocation(id: string): void {
  const favorites = getLocations();
  const updatedFavorites = favorites.filter(fav => fav.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
}

/**
 * Update a saved location
 */
export function updateLocation(
  id: string, 
  updatedData: Partial<Omit<SavedLocation, 'id' | 'createdAt'>>
): SavedLocation | null {
  const favorites = getLocations();
  const index = favorites.findIndex(fav => fav.id === id);
  
  if (index === -1) return null;
  
  const updatedLocation = {
    ...favorites[index],
    ...updatedData
  };
  
  favorites[index] = updatedLocation;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  
  return updatedLocation;
}

/**
 * Generate a unique ID for a saved location
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
} 