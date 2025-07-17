import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { busRoutes } from '../data/routes';

const NearbyStops = ({ userLocation, onSelectStop }) => {
  const [nearbyStops, setNearbyStops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Find nearby stops
  useEffect(() => {
    if (userLocation) {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const allStops = [];
        
        // Collect all stops from all routes
        busRoutes.forEach(route => {
          route.stops.forEach(stop => {
            const distance = calculateDistance(
              userLocation[0], userLocation[1],
              stop.lat, stop.lng
            );
            
            allStops.push({
              ...stop,
              routeId: route.id,
              routeName: route.name,
              distance: distance,
              fare: route.fare,
              frequency: route.frequency
            });
          });
        });
        
        // Sort by distance and remove duplicates
        const uniqueStops = allStops.reduce((acc, current) => {
          const existing = acc.find(stop => 
            Math.abs(stop.lat - current.lat) < 0.001 && 
            Math.abs(stop.lng - current.lng) < 0.001
          );
          
          if (!existing) {
            acc.push(current);
          } else {
            // If stop exists, add route info
            if (!existing.routes) {
              existing.routes = [{ id: existing.routeId, name: existing.routeName }];
            }
            existing.routes.push({ id: current.routeId, name: current.routeName });
          }
          
          return acc;
        }, []);
        
        // Sort by distance and take closest 10
        const sortedStops = uniqueStops
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10)
          .map(stop => ({
            ...stop,
            walkTime: Math.ceil(stop.distance * 12), // Assume 12 minutes per km walking
            nextBus: Math.floor(Math.random() * 15) + 1, // Random next bus time
          }));
        
        setNearbyStops(sortedStops);
        setLoading(false);
      }, 1000);
    }
  }, [userLocation]);

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  if (!userLocation) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Navigation className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="mb-2">Location access required</p>
          <p className="text-sm">Enable location services to find nearby bus stops</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Nearby Stops</h3>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Navigation className="h-4 w-4" />
            <span>Within 5km</span>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Finding nearby stops...</p>
          </div>
        ) : nearbyStops.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No bus stops found nearby</p>
            <p className="text-sm">Try moving to a different location</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {nearbyStops.map((stop, index) => (
              <div key={`${stop.id}-${index}`} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{stop.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Route #{stop.routeId} - {stop.routeName}
                    </div>
                    {stop.routes && stop.routes.length > 1 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{stop.routes.length - 1} more route{stop.routes.length > 2 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-blue-600">
                      {formatDistance(stop.distance)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stop.walkTime} min walk
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Bus className="h-4 w-4" />
                      <span>Next: {stop.nextBus} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Every {stop.frequency} min</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectStop(stop)}
                    className="text-xs"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {nearbyStops.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            Distances and walking times are estimates.
            <br />
            Actual times may vary based on terrain and walking speed.
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyStops;

