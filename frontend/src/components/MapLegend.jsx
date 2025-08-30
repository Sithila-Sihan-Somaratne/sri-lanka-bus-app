import React from 'react';

const LegendItem = ({ color, label, icon }) => (
  <div className="flex items-center space-x-2">
    <div 
      style={{ backgroundColor: color }} 
      className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold"
    >
      {icon}
    </div>
    <span className="text-gray-700 font-medium">{label}</span>
  </div>
);

const MapLegend = ({ userLocation }) => {
  return (
    <div 
      className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-sm z-[1000]"
      style={{ zIndex: 1000 }}
    >
      <div className="font-bold text-gray-800 mb-3 flex items-center">
        <span className="mr-2">🗺️</span>
        Map Legend
      </div>
      <div className="space-y-2">
        <LegendItem color="#10b981" label="Origin (Start)" icon="A" />
        <LegendItem color="#ef4444" label="Destination (End)" icon="B" />
        <LegendItem color="#6b7280" label="Bus Stop" icon="•" />
        <LegendItem color="#3b82f6" label="Live Bus" icon="🚌" />
        {userLocation && (
          <LegendItem color="#8b5cf6" label="Your Location" icon="📍" />
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live tracking active</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;