import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Bus, AlertCircle } from 'lucide-react';

const ETADisplay = ({ selectedRoute, userLocation, selectedStop = null }) => {
  const [etas, setEtas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulate ETA calculation
  useEffect(() => {
    if (selectedRoute) {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const simulatedEtas = selectedRoute.stops.map((stop, index) => {
          // Base time calculation
          const baseTime = index * (selectedRoute.duration / selectedRoute.stops.length);
          
          // Add some randomness for realism
          const variation = Math.random() * 10 - 5; // -5 to +5 minutes
          const eta = Math.max(1, Math.round(baseTime + variation));
          
          // Simulate different bus statuses
          const statuses = ['on-time', 'delayed', 'early'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          return {
            stopId: stop.id,
            stopName: stop.name,
            eta: eta,
            status: status,
            nextBusIn: Math.floor(Math.random() * selectedRoute.frequency) + 1,
            confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
          };
        });
        
        setEtas(simulatedEtas);
        setLoading(false);
      }, 1500);
    }
  }, [selectedRoute]);

  // Update ETAs every 30 seconds
  useEffect(() => {
    if (selectedRoute && etas.length > 0) {
      const interval = setInterval(() => {
        setEtas(prevEtas => 
          prevEtas.map(eta => ({
            ...eta,
            eta: Math.max(0, eta.eta - 0.5), // Decrease by 30 seconds
            nextBusIn: Math.max(1, eta.nextBusIn - 0.5),
          }))
        );
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedRoute, etas]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time':
        return 'text-green-600 bg-green-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      case 'early':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!selectedRoute) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Select a route to view real-time ETAs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Live ETAs</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live updates</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Route #{selectedRoute.id} - {selectedRoute.name}
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Calculating ETAs...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {etas.map((eta, index) => (
              <div key={eta.stopId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{eta.stopName}</div>
                      <div className="text-sm text-gray-500">Stop {index + 1}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
                      {eta.eta < 1 ? 'Now' : `${Math.ceil(eta.eta)} min`}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(eta.status)}`}>
                      {eta.status.replace('-', ' ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Bus className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Next: {Math.ceil(eta.nextBusIn)} min
                      </span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getConfidenceColor(eta.confidence)}`}>
                      <AlertCircle className="h-4 w-4" />
                      <span>{eta.confidence}% confident</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          ETAs are estimates based on current traffic and historical data.
          <br />
          Updates every 30 seconds.
        </div>
      </div>
    </div>
  );
};

export default ETADisplay;

