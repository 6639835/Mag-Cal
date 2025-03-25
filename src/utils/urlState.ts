interface SharedState {
  latitude?: number;
  longitude?: number;
  elevation?: number;
  date?: string;
  tab?: string;
}

export function generateShareableLink(state: SharedState): string {
  const params = new URLSearchParams();
  
  if (state.latitude !== undefined) params.append('lat', state.latitude.toString());
  if (state.longitude !== undefined) params.append('lng', state.longitude.toString());
  if (state.elevation !== undefined) params.append('elev', state.elevation.toString());
  if (state.date !== undefined) params.append('date', state.date);
  if (state.tab !== undefined) params.append('tab', state.tab);
  
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?${params.toString()}`;
}

export function parseSharedState(): SharedState {
  const params = new URLSearchParams(window.location.search);
  const state: SharedState = {};
  
  const lat = params.get('lat');
  const lng = params.get('lng');
  const elev = params.get('elev');
  const date = params.get('date');
  const tab = params.get('tab');
  
  if (lat) state.latitude = parseFloat(lat);
  if (lng) state.longitude = parseFloat(lng);
  if (elev) state.elevation = parseFloat(elev);
  if (date) state.date = date;
  if (tab) state.tab = tab;
  
  return state;
}

export function validateCoordinates(latitude: number, longitude: number): string | null {
  if (isNaN(latitude) || isNaN(longitude)) {
    return 'Coordinates must be valid numbers';
  }
  
  if (latitude < -90 || latitude > 90) {
    return 'Latitude must be between -90° and 90°';
  }
  
  if (longitude < -180 || longitude > 180) {
    return 'Longitude must be between -180° and 180°';
  }
  
  return null;
}

export function validateElevation(elevation: number): string | null {
  if (isNaN(elevation)) {
    return 'Elevation must be a valid number';
  }
  
  if (elevation < -11000 || elevation > 85000) {
    return 'Elevation must be between -11,000m and 85,000m';
  }
  
  return null;
}

export function validateDate(date: Date): string | null {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const year = date.getFullYear();
  if (year < 2024 || year > 2029) {
    return 'Date must be between 2024 and 2029 (WMMHR model validity period)';
  }
  
  return null;
} 