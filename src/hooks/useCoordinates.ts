import { useState } from 'react';
import { validateCoordinates } from '../utils/urlState';
import { useToast } from '../contexts/ToastContext';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseCoordinatesResult {
  coordinates: Coordinates | null;
  setCoordinates: (lat: number, lng: number, displayName?: string) => void;
  clearCoordinates: () => void;
}

export const useCoordinates = (
  initialLatitude?: number,
  initialLongitude?: number
): UseCoordinatesResult => {
  const { showToast } = useToast();
  const [coordinates, setCoordinatesState] = useState<Coordinates | null>(
    initialLatitude !== undefined && initialLongitude !== undefined
      ? { latitude: initialLatitude, longitude: initialLongitude }
      : null
  );

  const setCoordinates = (lat: number, lng: number, displayName?: string): void => {
    const coordError = validateCoordinates(lat, lng);
    if (coordError) {
      showToast(coordError, 'error');
      return;
    }
    
    setCoordinatesState({ latitude: lat, longitude: lng });
    showToast(
      displayName 
        ? `Selected location: ${displayName}` 
        : 'Location selected', 
      'success'
    );
  };

  const clearCoordinates = (): void => {
    setCoordinatesState(null);
  };

  return {
    coordinates,
    setCoordinates,
    clearCoordinates
  };
}; 