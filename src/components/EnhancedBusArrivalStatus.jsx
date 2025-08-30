import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight, Users, AlertTriangle, Info } from 'lucide-react';
import { busRoutes } from '../data/routes';

const EnhancedBusArrivalStatus = ({ selectedRoute, selectedStop = null }) => {
  const [busArrivals, setBusArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper to find the index of a stop in a route
  const findStopIndex = useCallback((route, stopId) => {
    return route.stops.findIndex(s => s.id === stopId);
  }, []);

  // Enhanced bus arrival data generation with seat capacity and delay reasons
  const generateEnhancedBusArrivals = useCallback(() => {
    if (!selectedRoute) return [];

    const arrivals = [];
    const numBuses = Math.floor(Math.random() * 3) + 2; // 2-4 buses per route
    const targetStopIndex = selectedStop ? findStopIndex(selectedRoute, selectedStop.id) : 0;

    // Delay reasons
    const delayReasons = [
      'Traffic congestion',
      'Road construction',
      'Weather conditions',
      'Technical issue',
      'Passenger boarding delay',
      'Route deviation',
      'Fuel stop',
      'Driver change'
    ];

    for (let i = 0; i < numBuses; i++) {
      const baseArrivalTime = (i * selectedRoute.frequency) + (Math.random() * selectedRoute.frequency * 0.5) - (selectedRoute.frequency * 0.25);
      let arrivalTime = Math.max(1, baseArrivalTime);

      let status = 'scheduled';
      if (arrivalTime < 5) status = 'approaching';
      if (arrivalTime < 1) status = 'arriving';

      // Enhanced capacity with specific seat counts
      const totalSeats = Math.floor(Math.random() * 20) + 40; // 40-60 seats
      const occupiedSeats = Math.floor(Math.random() * totalSeats);
      const availableSeats = totalSeats - occupiedSeats;
      const occupancyPercentage = Math.round((occupiedSeats / totalSeats) * 100);

      let capacityStatus = 'available';
      if (occupancyPercentage >= 90) capacityStatus = 'full';
      else if (occupancyPercentage >= 70) capacityStatus = 'moderate';

      // Delay information
      const hasDelay = Math.random() > 0.6; // 40% chance of delay
      const delayMinutes = hasDelay ? Math.floor(Math.random() * 15) + 1 : 0;
      const delayReason = hasDelay ? delayReasons[Math.floor(Math.random() * delayReasons.length)] : null;

      // Adjust arrival time based on delay
      if (hasDelay) {
        arrivalTime += delayMinutes;
      }

      // Current location and next stops
      const currentStopIdx = Math.max(0, targetStopIndex - Math.floor(Math.random() * 3));
      const lastLocation = selectedRoute.stops[currentStopIdx]?.name || selectedRoute.origin;
      const nextStops = selectedRoute.stops.slice(currentStopIdx + 1, currentStopIdx + 4);

      // Estimated arrival at terminus
      const remainingStops = selectedRoute.stops.length - currentStopIdx;
      const estimatedTerminusArrival = arrivalTime + (remainingStops * 3); // 3 minutes per stop average

      arrivals.push({
        id: `bus-${selectedRoute.id}-${i + 1}-${Date.now()}`,
        busNumber: `${selectedRoute.id}/${String.fromCharCode(65 + i)}`,
        arrivalTime: arrivalTime,
        status: status,
        capacity: {
          status: capacityStatus,
          totalSeats: totalSeats,
          occupiedSeats: occupiedSeats,
          availableSeats: availableSeats,
          occupancyPercentage: occupancyPercentage
        },
        delay: {
          hasDelay: hasDelay,
          minutes: delayMinutes,
          reason: delayReason
        },
        nextStops: nextStops,
        vehicleType: Math.random() > 0.7 ? 'ac' : 'regular',
        lastLocation: lastLocation,
        targetStopId: selectedStop ? selectedStop.id : selectedRoute.stops[0].id,
        estimatedTerminusArrival: estimatedTerminusArrival,
        liveTracking: Math.random() > 0.3 // 70% have live GPS tracking
      });
    }

    return arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }, [selectedRoute, selectedStop, findStopIndex]);

  // Effect for initial load and route/stop change
  useEffect(() => {
    if (selectedRoute) {
      setLoading(true);
      setTimeout(() => {
        setBusArrivals(generateEnhancedBusArrivals());
        setLastUpdated(new Date());
        setLoading(false);
      }, 1000);
    }
  }, [selectedRoute, selectedStop, generateEnhancedBusArrivals]);

  // Real-time updates every 15 seconds
  useEffect(() => {
    if (selectedRoute && busArrivals.length > 0) {
      const interval = setInterval(() => {
        setBusArrivals(prevArrivals => {
          const newArrivals = prevArrivals.map(arrival => {
            if (arrival.status === 'departed') return arrival;

            let newArrivalTime = arrival.arrivalTime - 0.25; // Decrease by 15 seconds
            let newStatus = arrival.status;

            if (newArrivalTime <= 0.1 && newArrivalTime > -0.5) {
              newStatus = 'arriving';
            } else if (newArrivalTime <= -0.5 && newArrivalTime > -1.5) {
              newStatus = 'at_stop';
            } else if (newArrivalTime <= -1.5) {
              newStatus = 'departed';
            }

            // Update capacity slightly (simulate passengers boarding/alighting)
            const capacityChange = Math.floor(Math.random() * 6) - 3; // -3 to +3 passengers
            const newOccupiedSeats = Math.max(0, Math.min(arrival.capacity.totalSeats, 
              arrival.capacity.occupiedSeats + capacityChange));
            const newAvailableSeats = arrival.capacity.totalSeats - newOccupiedSeats;
            const newOccupancyPercentage = Math.round((newOccupiedSeats / arrival.capacity.totalSeats) * 100);

            let newCapacityStatus = 'available';
            if (newOccupancyPercentage >= 90) newCapacityStatus = 'full';
            else if (newOccupancyPercentage >= 70) newCapacityStatus = 'moderate';

            return {
              ...arrival,
              arrivalTime: newArrivalTime,
              status: newStatus,
              capacity: {
                ...arrival.capacity,
                occupiedSeats: newOccupiedSeats,
                availableSeats: newAvailableSeats,
                occupancyPercentage: newOccupancyPercentage,
                status: newCapacityStatus
              },
              estimatedTerminusArrival: arrival.estimatedTerminusArrival - 0.25
            };
          }).filter(arrival => arrival.status !== 'departed');

          // Add new buses to maintain frequency
          const currentBusCount = newArrivals.length;
          const targetBusCount = Math.floor(Math.random() * 3) + 2;

          if (currentBusCount < targetBusCount) {
            const newBus = generateEnhancedBusArrivals()[0];
            if (newBus) {
              newArrivals.push({
                ...newBus,
                id: `bus-${selectedRoute.id}-${Date.now()}`,
                arrivalTime: newArrivals.length > 0 ? 
                  newArrivals[newArrivals.length - 1].arrivalTime + selectedRoute.frequency : 
                  selectedRoute.frequency,
                status: 'scheduled',
              });
            }
          }

          return newArrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
        });
        setLastUpdated(new Date());
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [selectedRoute, busArrivals.length, generateEnhancedBusArrivals]);

  const getStatusInfo = (status, arrivalTime) => {
    switch (status) {
      case 'arriving':
        return {
          text: 'Arriving Now',
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircle className="h-4 w-4" />,
          time: 'Now'
        };
      case 'at_stop':
        return {
          text: 'At Stop',
          color: 'text-blue-600 bg-blue-100',
          icon: <Bus className="h-4 w-4" />,
          time: 'Boarding'
        };
      case 'departed':
        return {
          text: 'Departed',
          color: 'text-gray-600 bg-gray-100',
          icon: <ArrowRight className="h-4 w-4" />,
          time: 'Gone'
        };
      case 'approaching':
        return {
          text: 'Approaching',
          color: 'text-orange-600 bg-orange-100',
          icon: <Clock className="h-4 w-4" />,
          time: `${Math.ceil(Math.max(0, arrivalTime))} min`
        };
      default:
        return {
          text: 'Scheduled',
          color: 'text-gray-600 bg-gray-100',
          icon: <Clock className="h-4 w-4" />,
          time: `${Math.ceil(Math.max(0, arrivalTime))} min`
        };
    }
  };

  const getCapacityColor = (status) => {
    switch (status) {
      case 'full': return 'text-red-600 bg-red-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  if (!selectedRoute) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Bus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Select a route to view enhanced bus arrivals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Enhanced Live Bus Arrivals</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              {lastUpdated ? `Updated ${formatLastUpdated(lastUpdated)}` : 'Live'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Route #{selectedRoute.id} - {selectedRoute.name}
        </p>
        {selectedStop && (
          <p className="text-xs text-gray-500 mt-1">
            Stop: {selectedStop.name}
          </p>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading enhanced bus arrivals...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {busArrivals.length === 0 && !loading ? (
              <div className="p-6 text-center text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No bus arrivals found for this route/stop.</p>
                <p className="text-sm">Please check back later or select another route.</p>
              </div>
            ) : (
              busArrivals.map((arrival, index) => {
                const statusInfo = getStatusInfo(arrival.status, arrival.arrivalTime);
                const capacityColor = getCapacityColor(arrival.capacity.status);

                return (
                  <div key={arrival.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm relative">
                            {arrival.busNumber.split('/')[1] || index + 1}
                            {arrival.liveTracking && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 flex items-center space-x-2">
                            <span>Bus #{arrival.busNumber}</span>
                            {arrival.liveTracking && (
                              <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">LIVE</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {arrival.vehicleType === 'ac' ? 'Air Conditioned' : 'Regular Service'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          {statusInfo.time}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span>{statusInfo.text}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Capacity Information */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">Seat Capacity</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${capacityColor}`}>
                          {arrival.capacity.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {arrival.capacity.availableSeats} of {arrival.capacity.totalSeats} seats available
                        </span>
                        <span className="font-medium">
                          {arrival.capacity.occupancyPercentage}% full
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            arrival.capacity.occupancyPercentage >= 90 ? 'bg-red-500' :
                            arrival.capacity.occupancyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${arrival.capacity.occupancyPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Delay Information */}
                    {arrival.delay.hasDelay && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            Delayed by {arrival.delay.minutes} minutes
                          </span>
                        </div>
                        <div className="text-xs text-red-700">
                          Reason: {arrival.delay.reason}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Last seen:</div>
                        <div className="text-gray-700 font-medium">{arrival.lastLocation}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Terminus ETA:</div>
                        <div className="text-gray-700 font-medium">
                          {Math.ceil(Math.max(0, arrival.estimatedTerminusArrival))} min
                        </div>
                      </div>
                    </div>

                    {arrival.nextStops && arrival.nextStops.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Next stops:</div>
                        <div className="flex flex-wrap gap-1">
                          {arrival.nextStops.slice(0, 3).map((stop, idx) => (
                            <span key={stop.id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {stop.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div>
            Next bus every ~{selectedRoute.frequency} minutes
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span>🟢 Available</span>
              <span>🟡 Moderate</span>
              <span>🔴 Full</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Info className="h-3 w-3" />
            <span>Real-time updates every 15 seconds</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live GPS tracking available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBusArrivalStatus;

