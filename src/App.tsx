import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Paper, Stack, Alert, Group, Button, Tabs, Box, useMantineColorScheme, ActionIcon, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconMap, IconForms, IconStar, IconCalculator, IconChartLine, IconShare, IconHelp } from '@tabler/icons-react';
import DeclinationForm from './components/DeclinationForm';
import DeclinationResults from './components/DeclinationResults';
import MapSelector from './components/MapSelector';
import ThemeToggle from './components/ThemeToggle';
import LocationSearch from './components/LocationSearch';
import FavoriteLocations from './components/FavoriteLocations';
import BatchCalculator from './components/BatchCalculator';
import { HistoricalData } from './components/HistoricalData';
import { Result } from './utils/api';
import { generateShareableLink, parseSharedState, validateCoordinates } from './utils/urlState';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './contexts/ToastContext';
import MobileLayout from './components/MobileLayout';
import Documentation from './components/Documentation';

function AppContent() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [formResult, setFormResult] = useState<Result | null>(null);
  const [batchResult, setBatchResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [formCoordinates, setFormCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapCoordinates, setMapCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [historyCoordinates, setHistoryCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [batchCoordinates, setBatchCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('form');
  const [showHelp, setShowHelp] = useState(false);
  const { showToast } = useToast();
  // Track map calculation results separately
  const [mapResult, setMapResult] = useState<Result | null>(null);

  // Handle shared state from URL
  useEffect(() => {
    const sharedState = parseSharedState();
    
    if (sharedState.latitude !== undefined && sharedState.longitude !== undefined) {
      const coordError = validateCoordinates(sharedState.latitude, sharedState.longitude);
      if (coordError) {
        setError(coordError);
        showToast(coordError, 'error');
        return;
      }
      
      // Set coordinates only for the active tab
      if (sharedState.tab === 'form' || !sharedState.tab) {
        setFormCoordinates({
          latitude: sharedState.latitude,
          longitude: sharedState.longitude
        });
      } else if (sharedState.tab === 'map') {
        setMapCoordinates({
          latitude: sharedState.latitude,
          longitude: sharedState.longitude
        });
      } else if (sharedState.tab === 'history') {
        setHistoryCoordinates({
          latitude: sharedState.latitude,
          longitude: sharedState.longitude
        });
      } else if (sharedState.tab === 'batch') {
        setBatchCoordinates({
          latitude: sharedState.latitude,
          longitude: sharedState.longitude
        });
      }
      
      showToast('Location loaded from shared link', 'info');
    }
    
    if (sharedState.tab) {
      setActiveTab(sharedState.tab);
    }
  }, [showToast]);

  const handleFormCalculateSuccess = (data: Result, isMock: boolean = false) => {
    setFormResult(data);
    setIsMockData(isMock);
    showToast('Calculation completed successfully', 'success');
  };

  const handleBatchCalculateSuccess = (data: Result, isMock: boolean = false) => {
    setBatchResult(data);
    setIsMockData(isMock);
    showToast('Batch calculation completed successfully', 'success');
  };

  const handleCalculateError = (message: string) => {
    setError(message);
    showToast(message, 'error');
  };

  const handleFormLocationSelected = (lat: number, lng: number) => {
    const coordError = validateCoordinates(lat, lng);
    if (coordError) {
      setError(coordError);
      showToast(coordError, 'error');
      return;
    }
    setFormCoordinates({ latitude: lat, longitude: lng });
    showToast('Location selected for form', 'success');
  };

  const handleMapLocationSelected = (lat: number, lng: number, displayName?: string) => {
    const coordError = validateCoordinates(lat, lng);
    if (coordError) {
      setError(coordError);
      showToast(coordError, 'error');
      return;
    }
    
    // Update map coordinates
    setMapCoordinates({ 
      latitude: lat, 
      longitude: lng 
    });
    
    // Also update history coordinates so they stay in sync with map
    setHistoryCoordinates({
      latitude: lat,
      longitude: lng
    });
    
    showToast('Location selected on map', 'success');
  };

  const handleHistoryLocationSelected = (lat: number, lng: number) => {
    const coordError = validateCoordinates(lat, lng);
    if (coordError) {
      setError(coordError);
      showToast(coordError, 'error');
      return;
    }
    setHistoryCoordinates({ latitude: lat, longitude: lng });
    showToast('Historical location selected', 'success');
  };

  const handleBatchLocationSelected = (lat: number, lng: number) => {
    const coordError = validateCoordinates(lat, lng);
    if (coordError) {
      setError(coordError);
      showToast(coordError, 'error');
      return;
    }
    setBatchCoordinates({ latitude: lat, longitude: lng });
    showToast('Location selected for batch calculator', 'success');
  };

  const handleFormSearchResultSelected = (lat: number, lng: number, displayName: string) => {
    handleFormLocationSelected(lat, lng);
    showToast(`Selected location for form: ${displayName}`, 'info');
  };

  const handleFavoritesLocationSelected = (lat: number, lng: number, displayName: string) => {
    // We need to determine which tab is active to update the appropriate state
    if (activeTab === 'form') {
      handleFormLocationSelected(lat, lng);
    } else if (activeTab === 'map') {
      handleMapLocationSelected(lat, lng);
    } else if (activeTab === 'history') {
      handleHistoryLocationSelected(lat, lng);
    } else if (activeTab === 'batch') {
      handleBatchLocationSelected(lat, lng);
    }
    showToast(`Selected location from favorites: ${displayName}`, 'info');
  };

  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
      showToast(`Switched to ${value} tab`, 'info');
    }
  };

  const handleShare = async () => {
    // Determine which coordinates to use based on active tab
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
    
    if (!coordinatesToShare) {
      showToast('Please select a location first', 'warning');
      return;
    }
    
    try {
      const shareState = {
        latitude: coordinatesToShare.latitude,
        longitude: coordinatesToShare.longitude,
        tab: activeTab
      };
      const link = generateShareableLink(shareState);
      await navigator.clipboard.writeText(link);
      showToast('Share link copied to clipboard', 'success');
    } catch (err) {
      showToast('Failed to generate share link', 'error');
    }
  };

  // Test direct API access
  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using parameters exactly as specified in the documentation
      const directUrl = 'https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=40&lon1=-105.25&key=zNEw7&model=WMMHR&resultFormat=json';
      console.log("Testing direct API access to:", directUrl);
      
      const response = await fetch(directUrl);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Direct API response:", data);
      
      if (data?.result && data.result[0]) {
        console.log("Direct API result fields:", Object.keys(data.result[0]));
        setError("Direct API test successful! Response in console.");
      } else {
        setError("Direct API test response has unexpected format. Check console.");
      }
    } catch (err) {
      console.error("Direct API test failed:", err);
      setError(`Direct API test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Test proxy API access
  const testProxyApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using same parameters as direct test
      const proxyUrl = '/api/geomag-web/calculators/calculateDeclination?lat1=40&lon1=-105.25&key=zNEw7&model=WMMHR&resultFormat=json';
      console.log("Testing proxy API access to:", proxyUrl);
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Proxy API response:", data);
      
      if (data?.result && data.result[0]) {
        console.log("Proxy API result fields:", Object.keys(data.result[0]));
        setError("Proxy API test successful! Response in console.");
      } else {
        setError("Proxy API test response has unexpected format. Check console.");
      }
    } catch (err) {
      console.error("Proxy API test failed:", err);
      setError(`Proxy API test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMapCalculateSuccess = (data: Result, isMock: boolean = false) => {
    setMapResult(data);
    setIsMockData(isMock);
    showToast('Map calculation completed successfully', 'success');
  };

  const transferHistoryToMap = () => {
    if (historyCoordinates) {
      setMapCoordinates({
        latitude: historyCoordinates.latitude,
        longitude: historyCoordinates.longitude
      });
      setActiveTab('map');
      showToast('Coordinates transferred to map', 'success');
    } else {
      showToast('No coordinates to transfer', 'warning');
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Magnetic Declination Calculator</Title>
          <Group>
            <Tooltip label="Help & Documentation">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => setShowHelp(!showHelp)}
                size="lg"
              >
                <IconHelp size={20} />
              </ActionIcon>
            </Tooltip>
            <ThemeToggle />
          </Group>
        </Group>

        {showHelp ? (
          <Documentation />
        ) : (
          <>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tabs.List>
                <Tabs.Tab value="form" leftSection={<IconForms size={14} />}>Form</Tabs.Tab>
                <Tabs.Tab value="map" leftSection={<IconMap size={14} />}>Map</Tabs.Tab>
                <Tabs.Tab value="favorites" leftSection={<IconStar size={14} />}>Favorites</Tabs.Tab>
                <Tabs.Tab value="batch" leftSection={<IconCalculator size={14} />}>Batch</Tabs.Tab>
                <Tabs.Tab value="history" leftSection={<IconChartLine size={14} />}>History</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="form" pt="md">
                <DeclinationForm
                  onCalculate={handleFormCalculateSuccess}
                  onError={handleCalculateError}
                  isLoading={loading}
                  setLoading={setLoading}
                  initialLatitude={formCoordinates?.latitude}
                  initialLongitude={formCoordinates?.longitude}
                  onLocationSelected={handleFormLocationSelected}
                />
                {formResult && (
                  <Box mt="xl">
                    <DeclinationResults
                      result={formResult}
                      isMockData={isMockData}
                      selectedCoordinates={formCoordinates}
                      onShare={handleShare}
                    />
                  </Box>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="map" pt="md">
                <MapSelector
                  onLocationSelected={handleMapLocationSelected}
                  initialLatitude={mapCoordinates?.latitude}
                  initialLongitude={mapCoordinates?.longitude}
                  onCalculate={handleMapCalculateSuccess}
                  onError={handleCalculateError}
                  isLoading={loading}
                  setLoading={setLoading}
                />
                {mapResult && (
                  <Box mt="xl">
                    <DeclinationResults
                      result={mapResult}
                      isMockData={isMockData}
                      selectedCoordinates={mapCoordinates}
                      onShare={handleShare}
                    />
                  </Box>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="favorites" pt="md">
                <FavoriteLocations
                  onLocationSelected={handleFavoritesLocationSelected}
                />
              </Tabs.Panel>

              <Tabs.Panel value="batch" pt="md">
                <BatchCalculator
                  selectedCoordinates={batchCoordinates}
                  onCalculate={handleBatchCalculateSuccess}
                  onError={handleCalculateError}
                />
              </Tabs.Panel>

              <Tabs.Panel value="history" pt="md">
                <HistoricalData
                  selectedCoordinates={historyCoordinates}
                  onLocationSelected={handleHistoryLocationSelected}
                  onTransferToMap={transferHistoryToMap}
                />
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </Stack>
    </Container>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <MobileLayout>
          <AppContent />
        </MobileLayout>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;