// MexicoScreen.js
import { useEffect, useState } from 'react';
import DetailSideMenu from '../screen/detailSideMenu/detailSideMenu';
import Maps from './maps/maps';

const MexicoScreen = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8000/rainmap?grid_size=10');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setPrediction(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#16223C]">
        <p className="text-white text-lg">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#16223C]">
        <p className="text-red-400 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <Maps prediction={prediction} />
      </div>
      <div className="w-80">
        <DetailSideMenu prediction={prediction} />
      </div>
    </div>
  );
};

export default MexicoScreen;