/**
 * Utility functions for testing API connections
 */

/**
 * Tests direct access to the NOAA API
 */
export const testDirectApi = async (
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<void> => {
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

/**
 * Tests proxy access to the NOAA API
 */
export const testProxyApi = async (
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<void> => {
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