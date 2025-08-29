import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { busRoutes } from '../data/routes'; // Ensure busRoutes is accessible

const BusArrivalStatus = ({ selectedRoute, selectedStop = null }) => {
  const [busArrivals, setBusArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper to find the index of a stop in a route
  const findStopIndex = useCallback((route, stopId) => {
    return route.stops.findIndex(s => s.id === stopId);
  }, []);

  // Simulate initial bus arrival data based on selected route and optional stop
  const generateInitialBusArrivals = useCallback(() => {
    if (!selectedRoute) return [];

    const arrivals = [];
    const numBuses = Math.floor(Math.random() * 3) + 2; // 2-4 buses per route
    const targetStopIndex = selectedStop ? findStopIndex(selectedRoute, selectedStop.id) : 0;

    for (let i = 0; i < numBuses; i++) {
      // Simulate base arrival time for the target stop
      // Buses arrive at intervals based on frequency, plus some randomness
      const baseArrivalTime = (i * selectedRoute.frequency) + (Math.random() * selectedRoute.frequency * 0.5) - (selectedRoute.frequency * 0.25);
      let arrivalTime = Math.max(1, baseArrivalTime); // Ensure positive ETA initially

      let status = 'scheduled';
      if (arrivalTime < 5) status = 'approaching';
      if (arrivalTime < 1) status = 'arriving';

      // Simulate capacity, delay, and next stops
      const capacity = Math.floor(Math.random() * 3); // 0: full, 1: moderate, 2: available
      const delay = Math.floor(Math.random() * 10) - 5; // -5 to +5 minutes delay

      // Determine last location and next stops based on targetStopIndex
      const currentStopIdx = Math.max(0, targetStopIndex - Math.floor(Math.random() * 3)); // Bus is usually before or at the target stop
      const lastLocation = selectedRoute.stops[currentStopIdx]?.name || selectedRoute.origin;
      const nextStops = selectedRoute.stops.slice(currentStopIdx + 1, currentStopIdx + 4);

      arrivals.push({
        id: `bus-${selectedRoute.id}-${i + 1}-${Date.now()}`,
        busNumber: `${selectedRoute.id}/${String.fromCharCode(65 + i)}`, // 138/A, 138/B, etc.
        arrivalTime: arrivalTime,
        status: status,
        capacity: capacity,
        delay: delay,
        nextStops: nextStops,
        vehicleType: Math.random() > 0.7 ? 'ac' : 'regular',
        lastLocation: lastLocation,
        targetStopId: selectedStop ? selectedStop.id : selectedRoute.stops[0].id, // The stop this ETA is for
      });
    }

    // Sort by arrival time
    return arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }, [selectedRoute, selectedStop, findStopIndex]);

  // Effect for initial load and route/stop change
  useEffect(() => {
    if (selectedRoute) {
      setLoading(true);
      setTimeout(() => {
        setBusArrivals(generateInitialBusArrivals());
        setLastUpdated(new Date());
        setLoading(false);
      }, 1000);
    }
  }, [selectedRoute, selectedStop, generateInitialBusArrivals]);

  // Effect for real-time updates every 15 seconds
  useEffect(() => {
    if (selectedRoute && busArrivals.length > 0) {
      const interval = setInterval(() => {
        setBusArrivals(prevArrivals => {
          const newArrivals = prevArrivals.map(arrival => {
            if (arrival.status === 'departed') return arrival; // Departed buses stay departed

            let newArrivalTime = arrival.arrivalTime - 0.25; // Decrease by 15 seconds (0.25 min)
            let newStatus = arrival.status;

            if (newArrivalTime <= 0.1 && newArrivalTime > -0.5) {
              newStatus = 'arriving';
            } else if (newArrivalTime <= -0.5 && newArrivalTime > -1.5) {
              newStatus = 'at_stop';
            } else if (newArrivalTime <= -1.5) {
              newStatus = 'departed';
            }

            return {
              ...arrival,
              arrivalTime: newArrivalTime,
              status: newStatus,
            };
          }).filter(arrival => arrival.status !== 'departed'); // Remove truly departed buses

          // Add new buses to replace departed ones or maintain frequency
          const currentBusCount = newArrivals.length;
          const targetBusCount = Math.floor(Math.random() * 3) + 2; // Maintain 2-4 buses

          if (currentBusCount < targetBusCount) {
            const newBus = generateInitialBusArrivals()[0]; // Generate one new bus
            if (newBus) {
              newArrivals.push({
                ...newBus,
                id: `bus-${selectedRoute.id}-${Date.now()}`,
                arrivalTime: newArrivals.length > 0 ? newArrivals[newArrivals.length - 1].arrivalTime + selectedRoute.frequency : selectedRoute.frequency, // Schedule after last bus
                status: 'scheduled',
              });
            }
          }

          // Sort again to ensure correct order after updates/additions
          return newArrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
        });
        setLastUpdated(new Date());
      }, 15000); // Update every 15 seconds

      return () => clearInterval(interval);
    }
  }, [selectedRoute, busArrivals.length, generateInitialBusArrivals]); // Added busArrivals.length to dependencies

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
      default: // scheduled
        return {
          text: 'Scheduled',
          color: 'text-gray-600 bg-gray-100',
          icon: <Clock className="h-4 w-4" />,
          time: `${Math.ceil(Math.max(0, arrivalTime))} min`
        };
    }
  };

  const getCapacityInfo = (capacity) => {
    switch (capacity) {
      case 0:
        return { text: 'Full', color: 'text-red-600', icon: '🔴' };
      case 1:
        return { text: 'Moderate', color: 'text-yellow-600', icon: '🟡' };
      default:
        return { text: 'Available', color: 'text-green-600', icon: '🟢' };
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
          <p>Select a route to view live bus arrivals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Live Bus Arrivals</h3>
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
            <p className="text-gray-600">Loading bus arrivals...</p>
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
                const capacityInfo = getCapacityInfo(arrival.capacity);

                return (
                  <div key={arrival.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {arrival.busNumber.split('/')[1] || index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            Bus #{arrival.busNumber}
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

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Capacity:</span>
                          <span className={`flex items-center space-x-1 ${capacityInfo.color}`}>
                            <span>{capacityInfo.icon}</span>
                            <span>{capacityInfo.text}</span>
                          </span>
                        </div>
                        {arrival.delay !== 0 && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-gray-500">Status:</span>
                            <span className={arrival.delay > 0 ? 'text-red-600' : 'text-green-600'}>
                              {arrival.delay > 0 ? `${arrival.delay}m late` : `${Math.abs(arrival.delay)}m early`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-gray-500">Last seen:</div>
                        <div className="text-gray-700">{arrival.lastLocation}</div>
                      </div>
                    </div>

                    {arrival.nextStops && arrival.nextStops.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Next stops:</div>
                        <div className="flex flex-wrap gap-1">
                          {arrival.nextStops.slice(0, 3).map((stop, idx) => (
                            <span key={stop.id} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
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
        <div className="flex items-center justify-between text-xs text-gray-500">
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
        <div className="text-center text-xs text-gray-400 mt-2">
          Real-time data updates every 15 seconds
        </div>
      </div>
    </div>
  );
};

export default BusArrivalStatus;

