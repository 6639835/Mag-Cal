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

interface MagneticComponent {
  value: number;
  unit: string;
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
  date: string;
  
  /** Magnetic declination (positive for east, negative for west) */
  declination: MagneticComponent;
  
  /** Annual change in declination (secular variation) */
  declination_sv: MagneticComponent;
  
  /** Name of the geomagnetic model used */
  model: string;
  
  // Optional magnetic components
  inclination?: MagneticComponent;
  totalIntensity?: MagneticComponent;
  horizontalIntensity?: MagneticComponent;
  northComponent?: MagneticComponent;
  eastComponent?: MagneticComponent;
  verticalComponent?: MagneticComponent;
} 