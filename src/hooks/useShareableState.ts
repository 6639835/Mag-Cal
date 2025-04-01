import { useEffect } from 'react';
import { generateShareableLink, parseSharedState } from '../utils/urlState';
import { useToast } from '../contexts/ToastContext';

interface ShareableState {
  latitude: number;
  longitude: number;
  tab: string;
}

interface UseShareableStateResult {
  handleShareLink: (
    coordinates: { latitude: number; longitude: number } | null,
    activeTab: string
  ) => Promise<void>;
  parseStateFromUrl: () => {
    coordinates: { latitude: number; longitude: number } | null;
    tab: string | null;
  };
}

export const useShareableState = (): UseShareableStateResult => {
  const { showToast } = useToast();

  const handleShareLink = async (
    coordinates: { latitude: number; longitude: number } | null,
    activeTab: string
  ): Promise<void> => {
    if (!coordinates) {
      showToast('Please select a location first', 'warning');
      return;
    }

    try {
      const shareState: ShareableState = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        tab: activeTab
      };
      
      const link = generateShareableLink(shareState);
      await navigator.clipboard.writeText(link);
      showToast('Share link copied to clipboard', 'success');
    } catch (err) {
      showToast('Failed to generate share link', 'error');
    }
  };

  const parseStateFromUrl = (): { 
    coordinates: { latitude: number; longitude: number } | null;
    tab: string | null;
  } => {
    const sharedState = parseSharedState();
    
    if (sharedState.latitude !== undefined && sharedState.longitude !== undefined) {
      return {
        coordinates: {
          latitude: sharedState.latitude,
          longitude: sharedState.longitude
        },
        tab: sharedState.tab || null
      };
    }
    
    return {
      coordinates: null,
      tab: sharedState.tab || null
    };
  };

  return {
    handleShareLink,
    parseStateFromUrl
  };
}; 