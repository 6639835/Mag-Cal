import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Result } from '../utils/api';
import { useCoordinates } from '../hooks/useCoordinates';
import { useCalculation } from '../hooks/useCalculation';
import { useShareableState } from '../hooks/useShareableState';
import { validateCoordinates } from '../utils/urlState';
import { useToast } from './ToastContext';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface AppStateContextType {
  // Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Form coordinates and results
  formCoordinates: Coordinates | null;
  setFormCoordinates: (lat: number, lng: number, displayName?: string) => void;
  formResult: Result | null;
  setFormResult: (data: Result, isMock?: boolean) => void;
  
  // Map coordinates and results
  mapCoordinates: Coordinates | null;
  setMapCoordinates: (lat: number, lng: number, displayName?: string) => void;
  mapResult: Result | null;
  setMapResult: (data: Result, isMock?: boolean) => void;
  
  // History coordinates
  historyCoordinates: Coordinates | null;
  setHistoryCoordinates: (lat: number, lng: number, displayName?: string) => void;
  transferHistoryToMap: () => void;
  transferMapToHistory: () => void;
  
  // Batch coordinates and results
  batchCoordinates: Coordinates | null;
  setBatchCoordinates: (lat: number, lng: number, displayName?: string) => void;
  batchResult: Result | null;
  setBatchResult: (data: Result, isMock?: boolean) => void;
  
  // Global state
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (message: string) => void;
  isMockData: boolean;
  
  // Shareable state
  handleShare: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('form');
  
  // Form state
  const { 
    coordinates: formCoordinates, 
    setCoordinates: setFormCoordinates 
  } = useCoordinates();
  
  const {
    result: formResult,
    isMockData: formIsMockData,
    setResult: setFormResult,
  } = useCalculation();
  
  // Map state
  const { 
    coordinates: mapCoordinates, 
    setCoordinates: setMapCoordinates 
  } = useCoordinates();
  
  const {
    result: mapResult,
    isMockData: mapIsMockData,
    setResult: setMapResult,
  } = useCalculation();
  
  // History state
  const { 
    coordinates: historyCoordinates, 
    setCoordinates: setHistoryCoordinates 
  } = useCoordinates();
  
  // Batch state
  const { 
    coordinates: batchCoordinates, 
    setCoordinates: setBatchCoordinates 
  } = useCoordinates();
  
  const {
    result: batchResult,
    isMockData: batchIsMockData,
    setResult: setBatchResult,
  } = useCalculation();
  
  // Global state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Combined mock data state
  const isMockData = formIsMockData || mapIsMockData || batchIsMockData;
  
  // URL sharing functionality
  const { handleShareLink, parseStateFromUrl } = useShareableState();
  
  // Handle URL shared state on initial load
  useEffect(() => {
    const { coordinates, tab } = parseStateFromUrl();
    
    if (coordinates) {
      const coordError = validateCoordinates(coordinates.latitude, coordinates.longitude);
      if (coordError) {
        setError(coordError);
        showToast(coordError, 'error');
        return;
      }
      
      if (tab === 'form' || !tab) {
        setFormCoordinates(coordinates.latitude, coordinates.longitude);
      } else if (tab === 'map') {
        setMapCoordinates(coordinates.latitude, coordinates.longitude);
      } else if (tab === 'history') {
        setHistoryCoordinates(coordinates.latitude, coordinates.longitude);
      } else if (tab === 'batch') {
        setBatchCoordinates(coordinates.latitude, coordinates.longitude);
      }
      
      showToast('Location loaded from shared link', 'info');
    }
    
    if (tab) {
      setActiveTab(tab);
    }
  }, []);
  
  // Function to handle tab changes with toast
  const handleTabChange = (value: string): void => {
    setActiveTab(value);
    showToast(`Switched to ${value} tab`, 'info');
  };
  
  // Function to transfer coordinates from map to history
  const transferMapToHistory = (): void => {
    if (mapCoordinates) {
      setHistoryCoordinates(
        mapCoordinates.latitude,
        mapCoordinates.longitude
      );
      showToast('Coordinates transferred from map to history', 'success');
    } else {
      showToast('No coordinates to transfer from map', 'warning');
    }
  };

  // Function to automatically share coordinates when switching tabs
  const smartTabChange = (newTab: string): void => {
    const currentCoords = getCurrentTabCoordinates();
    const targetHasCoords = getTargetTabCoordinates(newTab);
    
    // If switching to a tab that has no coordinates, but current tab has coordinates, transfer them
    if (currentCoords && !targetHasCoords) {
      transferCoordinatesToTab(currentCoords, newTab);
      showToast(`Coordinates automatically transferred to ${newTab} tab`, 'success');
    }
    
    setActiveTab(newTab);
    showToast(`Switched to ${newTab} tab`, 'info');
  };

  // Helper function to get coordinates from current active tab
  const getCurrentTabCoordinates = () => {
    switch (activeTab) {
      case 'form': return formCoordinates;
      case 'map': return mapCoordinates;
      case 'history': return historyCoordinates;
      case 'batch': return batchCoordinates;
      default: return null;
    }
  };

  // Helper function to get coordinates from target tab
  const getTargetTabCoordinates = (tab: string) => {
    switch (tab) {
      case 'form': return formCoordinates;
      case 'map': return mapCoordinates;
      case 'history': return historyCoordinates;
      case 'batch': return batchCoordinates;
      default: return null;
    }
  };

  // Helper function to transfer coordinates to a specific tab
  const transferCoordinatesToTab = (coords: { latitude: number; longitude: number }, tab: string) => {
    switch (tab) {
      case 'form':
        setFormCoordinates(coords.latitude, coords.longitude);
        break;
      case 'map':
        setMapCoordinates(coords.latitude, coords.longitude);
        break;
      case 'history':
        setHistoryCoordinates(coords.latitude, coords.longitude);
        break;
      case 'batch':
        setBatchCoordinates(coords.latitude, coords.longitude);
        break;
    }
  };
  
  // Function to transfer history coordinates to map
  const transferHistoryToMap = (): void => {
    console.log('transferHistoryToMap called');
    console.log('Current tab before transfer:', activeTab);
    
    if (historyCoordinates) {
      console.log('Coordinates to transfer:', historyCoordinates);
      setMapCoordinates(
        historyCoordinates.latitude,
        historyCoordinates.longitude
      );
      console.log('Setting active tab to map');
      setActiveTab('map');
      console.log('Active tab after setActiveTab:', activeTab);
      
      // Add timeout to check if tab changes after state update
      setTimeout(() => {
        console.log('Active tab after timeout:', activeTab);
      }, 100);
      
      showToast('Coordinates transferred to map', 'success');
    } else {
      console.log('No coordinates to transfer');
      showToast('No coordinates to transfer', 'warning');
    }
  };
  
  // Function to handle sharing based on active tab
  const handleShare = async (): Promise<void> => {
    let coordinatesToShare = null;
    
    if (activeTab === 'form') {
      coordinatesToShare = formCoordinates;
    } else if (activeTab === 'map') {
      coordinatesToShare = mapCoordinates;
    } else if (activeTab === 'history') {
      coordinatesToShare = historyCoordinates;
    } else if (activeTab === 'batch') {
      coordinatesToShare = batchCoordinates;
    }
    
    await handleShareLink(coordinatesToShare, activeTab);
  };
  
  const value: AppStateContextType = {
    activeTab,
    setActiveTab: smartTabChange, // Use smart tab change instead of direct setActiveTab
    
    formCoordinates,
    setFormCoordinates,
    formResult,
    setFormResult,
    
    mapCoordinates,
    setMapCoordinates,
    mapResult,
    setMapResult,
    
    historyCoordinates,
    setHistoryCoordinates,
    transferHistoryToMap,
    transferMapToHistory,
    
    batchCoordinates,
    setBatchCoordinates,
    batchResult,
    setBatchResult,
    
    loading,
    setLoading,
    error,
    setError,
    isMockData,
    
    handleShare
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}; 