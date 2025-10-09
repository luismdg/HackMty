// DetailSideMenu.js
const DetailSideMenu = ({ prediction }) => {
  // Check if prediction data exists and has the expected structure
  if (!prediction || !prediction.data || !Array.isArray(prediction.data)) {
    return (
      <div className="bg-[#16223C] shadow-lg p-6 h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Weather Grid Points</h2>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-400">No weather data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#16223C] shadow-lg p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Weather Grid Points Data</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-400">
          Showing {prediction.data.length} points • Grid: {prediction.grid_size}x{prediction.grid_size}
        </p>
      </div>

      <div className="space-y-3">
        {prediction.data.map((point, idx) => (
          <div 
            key={idx}
            className="flex items-center p-3 bg-[#1E2A47] rounded-lg border-l-4 border-blue-500"
          >
            <span className="text-2xl mr-3">{point.icon || '❓'}</span>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{point.id}</p>
              <p className="text-xs text-gray-400">
                {point.temperature}°C • {point.status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Lat: {point.latitude}, Lon: {point.longitude}
              </p>
            </div>
          </div>
        ))}
      </div>

      {prediction.data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Updated: {new Date(prediction.data[0]?.last_updated).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DetailSideMenu;