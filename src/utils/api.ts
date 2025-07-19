import { DeclinationParams, Result } from '../types';

// Re-export types for backward compatibility
export type { DeclinationParams, Result };

/**
 * Calculate magnetic declination using NOAA's Geomagnetic Calculator API
 * Specifically requesting the latest WMMHR (2024-2029) model
 */
export async function calculateDeclination(params: DeclinationParams): Promise<Result> {
  try {
    // Validate date range
    const date = params.date || new Date();
    const year = date.getFullYear();
    if (year < 2024 || year > 2029) {
      throw new Error('Date must be between 2024 and 2029 (WMMHR model validity period)');
    }

    // Create query parameters exactly as specified in the documentation
    const queryParams = new URLSearchParams({
      lat1: params.latitude.toString(),
      lon1: params.longitude.toString(),
      key: 'zNEw7',
      model: 'WMMHR',
      startYear: date.getUTCFullYear().toString(),
      startMonth: (date.getUTCMonth() + 1).toString(),
      startDay: date.getUTCDate().toString(),
      resultFormat: 'json'
    });
    
    // Add elevation only if provided
    if (params.elevation !== undefined) {
      queryParams.append('elev', params.elevation.toString());
    }

    // Try direct API call first
    try {
      const url = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return transformApiResponse(data);
      }
    } catch (directError) {
      console.warn('Direct API call failed, trying proxy:', directError);
    }

    // If direct call fails, try proxy
    const proxyUrl = `/api/geomag-web/calculators/calculateDeclination?${queryParams.toString()}`;
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
      throw new Error(`API responded with status: ${proxyResponse.status} ${proxyResponse.statusText}`);
    }
    
    const data = await proxyResponse.json();
    return transformApiResponse(data);
  } catch (error) {
    console.error('Error in calculateDeclination:', error);
    throw error;
  }
}

function transformApiResponse(data: any): Result {
  if (!data?.result || !data.result[0]) {
    throw new Error('Invalid response format from API');
  }
  
  const result = data.result[0];
  
  // Transform the API response to our Result type
  const transformedResult: Result = {
    declination: { 
      value: Number(result.declination), 
      unit: data.units?.declination || 'degrees' 
    },
    declination_sv: { 
      value: Number(result.declination_sv), 
      unit: data.units?.declination_sv || 'degrees/year' 
    },
    latitude: Number(result.latitude),
    longitude: Number(result.longitude),
    elevation: Number(result.elevation),
    date: typeof result.date === 'string' ? result.date : new Date().toISOString().split('T')[0],
    model: data.model || 'WMMHR',
  };

  // Add optional fields if they exist
  if (result.inclination) {
    transformedResult.inclination = {
      value: Number(result.inclination),
      unit: data.units?.inclination || 'degrees'
    };
  }
  if (result.totalIntensity) {
    transformedResult.totalIntensity = {
      value: Number(result.totalIntensity),
      unit: data.units?.totalIntensity || 'nT'
    };
  }
  if (result.horizontalIntensity) {
    transformedResult.horizontalIntensity = {
      value: Number(result.horizontalIntensity),
      unit: data.units?.horizontalIntensity || 'nT'
    };
  }
  if (result.northComponent) {
    transformedResult.northComponent = {
      value: Number(result.northComponent),
      unit: data.units?.northComponent || 'nT'
    };
  }
  if (result.eastComponent) {
    transformedResult.eastComponent = {
      value: Number(result.eastComponent),
      unit: data.units?.eastComponent || 'nT'
    };
  }
  if (result.verticalComponent) {
    transformedResult.verticalComponent = {
      value: Number(result.verticalComponent),
      unit: data.units?.verticalComponent || 'nT'
    };
  }

  return transformedResult;
}

/**
 * Save calculation result to history in localStorage
 * @param result The declination calculation result
 */
export function saveToHistory(result: Result): void {
  try {
    // Get existing history or initialize new array
    const historyKey = 'magcalc-history';
    const existingHistory = localStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Add new result at the beginning
    history.unshift(result);
    
    // Limit history to 50 items
    const limitedHistory = history.slice(0, 50);
    
    // Save back to localStorage
    localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
} 