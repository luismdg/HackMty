// MainMap.js
import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MainMap = ({ prediction }) => {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: "mexico-map",
      style: "https://api.maptiler.com/maps/01993703-c461-7fcb-9563-ed497090c6bc/style.json?key=mUwxoW7vdNmBrfqeJhw1",
      center: [-102.5528, 24.0],
      zoom: 4.5,
      interactive: true,
    });

    const mexicoBounds = [
      [-118, 14.5], // SW
      [-86.5, 32.75], // NE
    ];
    map.setMaxBounds(mexicoBounds);
    
    // Add zoom controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Only add data if prediction exists and has data
      if (prediction && prediction.data && prediction.data.length > 0) {
        
        // Convert API data to GeoJSON format
        const geoJsonData = {
          type: 'FeatureCollection',
          features: prediction.data.map(point => ({
            type: 'Feature',
            properties: { 
              intensity: calculateIntensity(point.rain),
              temperature: point.temperature,
              rain: point.rain,
              status: point.status,
              id: point.id
            },
            geometry: {
              type: 'Point',
              coordinates: [point.longitude, point.latitude]
            }
          }))
        };

        // Add or update the data source
        if (map.getSource('intensity-data')) {
          map.getSource('intensity-data').setData(geoJsonData);
        } else {
          map.addSource('intensity-data', {
            type: 'geojson',
            data: geoJsonData
          });

          // Add heat map layer with LARGER dots and NO white circles
          map.addLayer({
            id: 'intensity-blur',
            type: 'circle',
            source: 'intensity-data',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'intensity'],
                0, 25,    // Tamaño para intensidad baja
                0.3, 40,
                0.7, 60,
                1, 80     // Tamaño máximo
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'intensity'],
                0, 'rgba(0, 200, 0, 0.9)',     // Verde → sin lluvia
                0.3, 'rgba(255, 215, 0, 0.9)', // Amarillo → lluvia ligera
                0.7, 'rgba(255, 140, 0, 0.95)',// Naranja → lluvia moderada
                1, 'rgba(200, 0, 0, 1)'        // Rojo fuerte → lluvia intensa
              ],
              'circle-blur': 0.3,     // Blur más suave para no perder nitidez
              'circle-opacity': 0.9,  // Más opaco para que resalten
              'circle-stroke-width': 0
            }
          });

          // Add interactive points layer (invisible but clickable)
          map.addLayer({
            id: 'intensity-points',
            type: 'circle',
            source: 'intensity-data',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'intensity'],
                0, 30,    // Larger interactive area
                0.3, 45,
                0.7, 65,
                1, 85
              ],
              'circle-color': 'rgba(0,0,0,0)', // Completely transparent
              'circle-stroke-width': 0, // No border
              'circle-opacity': 0 // Completely invisible but interactive
            }
          });

          // Add popup on click
          map.on('click', 'intensity-points', (e) => {
            const feature = e.features[0];
            const properties = feature.properties;
            
            new maplibregl.Popup()
              .setLngLat(feature.geometry.coordinates)
              .setHTML(`
                <div class="p-3 bg-white rounded-lg shadow-xl border-2 border-blue-200 min-w-[220px]">
                  <h3 class="font-bold text-lg text-blue-800 mb-2">${properties.id}</h3>
                  <div class="space-y-1 text-sm">
                    <p class="flex justify-between"><span class="font-medium text-gray-700">Temperature:</span> <span class="font-bold">${properties.temperature}°C</span></p>
                    <p class="flex justify-between"><span class="font-medium text-gray-700">Rain:</span> <span class="font-bold text-blue-600">${properties.rain}mm</span></p>
                    <p class="flex justify-between"><span class="font-medium text-gray-700">Status:</span> <span class="font-bold">${properties.status}</span></p>
                    <p class="flex justify-between"><span class="font-medium text-gray-700">Intensity:</span> <span class="font-bold text-red-600">${Math.round(properties.intensity * 100)}%</span></p>
                  </div>
                </div>
              `)
              .addTo(map);
          });

          // Change cursor on hover
          map.on('mouseenter', 'intensity-points', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'intensity-points', () => {
            map.getCanvas().style.cursor = '';
          });
        }
      }
    });

    return () => map.remove();
  }, [prediction]); // Re-run when prediction data changes

  // Helper function to calculate intensity based on rain data
  const calculateIntensity = (rain) => {
    // Normalize rain value to 0-1 scale
    // Adjust these thresholds based on your data range
    if (rain === 0) return 0;
    if (rain <= 1) return 0.3;    // Light rain
    if (rain <= 5) return 0.7;    // Moderate rain
    return 1;                     // Heavy rain
  };

  return <div id="mexico-map" className="w-full h-full"></div>;
};

export default MainMap;