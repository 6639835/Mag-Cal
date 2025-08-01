import { Container, Title, Stack, Group, Tabs, Box } from '@mantine/core';
import { IconForms, IconMap, IconStar, IconCalculator, IconChartLine } from '@tabler/icons-react';
import DeclinationForm from './components/DeclinationForm';
import DeclinationResults from './components/DeclinationResults';
import MapSelector from './components/MapSelector';
import ThemeToggle from './components/ThemeToggle';
import FavoriteLocations from './components/FavoriteLocations';
import BatchCalculator from './components/BatchCalculator';
import { HistoricalData } from './components/HistoricalData';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import MobileLayout from './components/MobileLayout';
import HelpButton from './components/HelpButton';
import { AppStateProvider, useAppState } from './contexts/AppStateContext';
import { useToast } from './contexts/ToastContext';

function AppContent() {
  const { showToast } = useToast();
  const {
    activeTab,
    setActiveTab,
    
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
    setBatchResult,
    
    loading,
    setLoading,
    setError,
    isMockData,
    
    handleShare
  } = useAppState();

  // Function to handle tab changes with toast
  const handleTabChange = (value: string | null): void => {
    if (value) {
      setActiveTab(value);
      showToast(`Switched to ${value} tab`, 'info');
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Magnetic Declination Calculator</Title>
          <Group>
            <HelpButton />
            <ThemeToggle />
          </Group>
        </Group>

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
              onCalculate={setFormResult}
              onError={setError}
              isLoading={loading}
              setLoading={setLoading}
              initialLatitude={formCoordinates?.latitude}
              initialLongitude={formCoordinates?.longitude}
              onLocationSelected={(lat, lng) => setFormCoordinates(lat, lng)}
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
              onLocationSelected={(lat, lng, displayName) => 
                setMapCoordinates(lat, lng, displayName)}
              initialLatitude={mapCoordinates?.latitude}
              initialLongitude={mapCoordinates?.longitude}
              onCalculate={setMapResult}
              onError={setError}
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
              onLocationSelected={(lat, lng, displayName) => {
                if (activeTab === 'form') {
                  setFormCoordinates(lat, lng, displayName);
                } else if (activeTab === 'map') {
                  setMapCoordinates(lat, lng, displayName);
                } else if (activeTab === 'history') {
                  setHistoryCoordinates(lat, lng, displayName);
                } else if (activeTab === 'batch') {
                  setBatchCoordinates(lat, lng, displayName);
                }
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="batch" pt="md">
            <BatchCalculator
              selectedCoordinates={batchCoordinates}
              onCalculate={setBatchResult}
              onError={setError}
            />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <HistoricalData
              selectedCoordinates={historyCoordinates}
              onLocationSelected={(lat, lng) => setHistoryCoordinates(lat, lng)}
              onTransferToMap={transferHistoryToMap}
              onTransferFromMap={transferMapToHistory}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppStateProvider>
          <MobileLayout>
            <AppContent />
          </MobileLayout>
        </AppStateProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;