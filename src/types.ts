/**
 * Parameters for magnetic declination calculation
 */
export interface DeclinationParams {
  /** Latitude in decimal degrees (-90 to 90) */
  latitude: number;
  
  /** Longitude in decimal degrees (-180 to 180) */
  longitude: number;
  
  /** Elevation above sea level in meters (optional) */
  elevation?: number;
  
  /** Date for calculation (optional, defaults to current date) */
  date?: Date;
}

/**
 * Result of magnetic declination calculation
 */
export interface Result {
  /** Latitude in decimal degrees */
  latitude: number;
  
  /** Longitude in decimal degrees */
  longitude: number;
  
  /** Elevation above sea level in meters */
  elevation: number;
  
  /** Date of calculation */
  date: Date;
  
  /** Magnetic declination in degrees (positive for east, negative for west) */
  declination: number;
  
  /** Annual change in declination (secular variation) in degrees/year */
  declination_sv: number;
  
  /** Name of the geomagnetic model used */
  model: string;
  
  /** Year of the geomagnetic model */
  model_year: number;
} 