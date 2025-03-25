import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { calculateDeclination } from '../utils/api';
import 'leaflet/dist/leaflet.css';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';

interface DeclinationOverlayProps {
  date: string;
  elevation: number;
}

interface GridPoint {
  lat: number;
  lng: number;
  value: number;
}

export function DeclinationOverlay({ date, elevation }: DeclinationOverlayProps) {
  const map = useMap();
  const [gridPoints, setGridPoints] = useState<GridPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [minMax, setMinMax] = useState<{ min: number; max: number } | null>(null);
  const [circles, setCircles] = useState<L.CircleMarker[]>([]);
  const [tooltips, setTooltips] = useState<L.Tooltip[]>([]);
  const [legend, setLegend] = useState<L.Control | null>(null);
  
  // Get theme information
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === 'dark';

  // Define color functions based on theme
  const getColor = (value: number): string => {
    if (!minMax) return '#ffffff';
    
    const max = Math.max(Math.abs(minMax.min), Math.abs(minMax.max));
    const normalizedValue = (value + max) / (2 * max); // Between 0 and 1
    
    if (isDark) {
      // Dark theme colors (more subdued but still visible)
      if (value < 0) {
        return `hsl(220, 70%, ${40 + normalizedValue * 35}%)`;
      } else {
        return `hsl(0, 70%, ${40 + normalizedValue * 35}%)`;
      }
    } else {
      // Light theme colors (more vibrant)
      if (value < 0) {
        return `hsl(220, 100%, ${50 - normalizedValue * 30}%)`;
      } else {
        return `hsl(0, 100%, ${50 - normalizedValue * 30}%)`;
      }
    }
  };

  useEffect(() => {
    const updateGrid = async () => {
      setLoading(true);
      const bounds = map.getBounds();
      const points: GridPoint[] = [];
      
      // Create a 10x10 grid of points
      const latStep = (bounds.getNorth() - bounds.getSouth()) / 10;
      const lngStep = (bounds.getEast() - bounds.getWest()) / 10;
      
      for (let i = 0; i <= 10; i++) {
        for (let j = 0; j <= 10; j++) {
          const lat = bounds.getSouth() + (latStep * i);
          const lng = bounds.getWest() + (lngStep * j);
          
          try {
            const result = await calculateDeclination({
              latitude: lat,
              longitude: lng,
              elevation,
              date: new Date(date)
            });
            
            points.push({
              lat,
              lng,
              value: result.declination.value
            });
          } catch (error) {
            console.error('Error calculating declination for grid point:', error);
          }
        }
      }
      
      // Find min and max values
      if (points.length > 0) {
        const values = points.map(p => p.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        setMinMax({ min, max });
      }
      
      setGridPoints(points);
      setLoading(false);
    };
    
    updateGrid();
    
    // Add event listener for map movement
    map.on('moveend', updateGrid);
    
    return () => {
      map.off('moveend', updateGrid);
      
      // Clean up circles and tooltips
      circles.forEach(circle => circle.remove());
      tooltips.forEach(tooltip => tooltip.remove());
      if (legend) {
        legend.remove();
      }
    };
  }, [map, date, elevation]);
  
  // Effect for updating colors when theme changes
  useEffect(() => {
    if (circles.length > 0) {
      circles.forEach((circle, i) => {
        if (i < gridPoints.length) {
          circle.setStyle({
            color: getColor(gridPoints[i].value),
            fillColor: getColor(gridPoints[i].value)
          });
        }
      });
    }
    
    // Update legend when theme changes
    if (legend) {
      legend.remove();
      createLegend();
    }
  }, [colorScheme, gridPoints, minMax]);

  // Effect for rendering circles on the map
  useEffect(() => {
    // Clear existing circles and tooltips
    circles.forEach(circle => circle.remove());
    tooltips.forEach(tooltip => tooltip.remove());
    
    if (legend) {
      legend.remove();
    }
    
    const newCircles: L.CircleMarker[] = [];
    const newTooltips: L.Tooltip[] = [];
    
    // Plot new circles
    gridPoints.forEach(point => {
      const circle = L.circleMarker([point.lat, point.lng], {
        radius: 5,
        color: getColor(point.value),
        fillColor: getColor(point.value),
        fillOpacity: 0.8,
        weight: 1,
        opacity: 0.8,
        className: 'declination-point'
      }).addTo(map);
      
      const tooltip = L.tooltip({
        permanent: false,
        direction: 'top',
        className: `declination-tooltip ${isDark ? 'dark-mode' : ''}`,
        opacity: 0.9
      })
      .setContent(`
        <div style="text-align: center;">
          <div><strong>Declination: ${point.value.toFixed(2)}°</strong></div>
          <div>Lat: ${point.lat.toFixed(4)}°, Lng: ${point.lng.toFixed(4)}°</div>
        </div>
      `);
      
      circle.bindTooltip(tooltip);
      newCircles.push(circle);
      newTooltips.push(tooltip);
    });
    
    setCircles(newCircles);
    setTooltips(newTooltips);
    
    // Create legend
    createLegend();
    
    // Add CSS for tooltips
    const style = document.createElement('style');
    style.textContent = `
      .declination-tooltip {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.1);
        box-shadow: 0 1px 5px rgba(0,0,0,0.2);
        background-color: ${isDark ? '#1A1B1E' : '#ffffff'};
        color: ${isDark ? '#C1C2C5' : '#000000'};
        z-index: 1000 !important;
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      .declination-tooltip.dark-mode {
        background-color: #1A1B1E;
        color: #C1C2C5;
        border: 1px solid rgba(255,255,255,0.1);
      }
      
      .leaflet-tooltip-top:before {
        border-top-color: ${isDark ? '#1A1B1E' : '#ffffff'};
      }
      
      .dark-mode.leaflet-tooltip-top:before {
        border-top-color: #1A1B1E;
      }
      
      .declination-point {
        z-index: 500 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [map, gridPoints, minMax, colorScheme]);

  // Function to create the legend
  const createLegend = () => {
    if (!minMax) return;
    
    const legendControl = new L.Control({ position: 'bottomright' });
    
    legendControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [
        minMax.min,
        minMax.min * 0.66,
        minMax.min * 0.33,
        0,
        minMax.max * 0.33,
        minMax.max * 0.66,
        minMax.max
      ];
      
      div.style.backgroundColor = isDark ? '#1A1B1E' : '#ffffff';
      div.style.padding = '6px 8px';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';
      div.style.border = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
      div.style.lineHeight = '1.5';
      div.style.color = isDark ? '#C1C2C5' : '#000000';
      div.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      
      div.innerHTML = '<h4 style="margin:0 0 5px;text-align:center;">Declination (°)</h4>';
      
      // Loop through intervals and generate colored boxes
      for (let i = 0; i < grades.length; i++) {
        const color = getColor(grades[i]);
        const label = grades[i].toFixed(1) + '°';
        
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.margin = '3px 0';
        
        const colorBox = document.createElement('span');
        colorBox.style.width = '18px';
        colorBox.style.height = '18px';
        colorBox.style.backgroundColor = color;
        colorBox.style.display = 'inline-block';
        colorBox.style.marginRight = '8px';
        colorBox.style.border = isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)';
        
        const labelText = document.createElement('span');
        labelText.innerText = label;
        
        item.appendChild(colorBox);
        item.appendChild(labelText);
        div.appendChild(item);
      }
      
      return div;
    };
    
    legendControl.addTo(map);
    setLegend(legendControl);
  };

  // Only render loading state
  return null;
} 