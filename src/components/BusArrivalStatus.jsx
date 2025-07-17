import React, { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const BusArrivalStatus = ({ selectedRoute, selectedStop = null }) => {
  const [busArrivals, setBusArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Simulate real-time bus arrival data
  useEffect(() => {
    if (selectedRoute) {
      setLoading(true);
      
      const generateBusArrivals = () => {
        const arrivals = [];
        const numBuses = Math.floor(Math.random() * 4) + 2; // 2-5 buses
        
        for (let i = 0; i < numBuses; i++) {
          const baseTime = i * selectedRoute.frequency + Math.random() * 10 - 5;
          const arrivalTime = Math.max(0, baseTime);
          
          let status = 'approaching';
          if (arrivalTime < 1) {
            status = 'arriving';
          } else if (arrivalTime < 0.5) {
            status = 'at_stop';
          } else if (arrivalTime > selectedRoute.frequency * 2) {
            status = 'scheduled';
          }
          
          // Simulate some buses that have departed
          if (Math.random() < 0.2 && i > 0) {
            status = 'departed';
          }
          
          arrivals.push({
            id: `bus-${selectedRoute.id}-${i + 1}`,
            busNumber: `${selectedRoute.id}/${String.fromCharCode(65 + i)}`, // 138/A, 138/B, etc.
            arrivalTime: arrivalTime,
            status: status,
            capacity: Math.floor(Math.random() * 3), // 0: full, 1: moderate, 2: available
            delay: Math.floor(Math.random() * 10) - 5, // -5 to +5 minutes delay
            nextStops: selectedRoute.stops.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 3),
            vehicleType: Math.random() > 0.7 ? 'ac' : 'regular',
            lastLocation: selectedRoute.stops[Math.floor(Math.random() * selectedRoute.stops.length)].name
          });
        }
        
        return arrivals.sort((a, b) => {
          // Sort by status priority, then by arrival time
          const statusPriority = { 'arriving': 0, 'at_stop': 1, 'approaching': 2, 'scheduled': 3, 'departed': 4 };
          if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
          }
          return a.arrivalTime - b.arrivalTime;
        });
      };
      
      setTimeout(() => {
        setBusArrivals(generateBusArrivals());
        setLastUpdated(new Date());
        setLoading(false);
      }, 1000);
    }
  }, [selectedRoute]);

  // Update arrivals every 15 seconds
  useEffect(() => {
    if (selectedRoute && busArrivals.length > 0) {
      const interval = setInterval(() => {
        setBusArrivals(prevArrivals => {
          return prevArrivals.map(arrival => {
            let newArrivalTime = arrival.arrivalTime - 0.25; // Decrease by 15 seconds
            let newStatus = arrival.status;
            
            // Update status based on arrival time
            if (newArrivalTime <= 0 && arrival.status === 'approaching') {
              newStatus = 'arriving';
              newArrivalTime = 0;
            } else if (newArrivalTime <= -0.5 && arrival.status === 'arriving') {
              newStatus = 'at_stop';
            } else if (newArrivalTime <= -1 && arrival.status === 'at_stop') {
              newStatus = 'departed';
              // Replace with next bus
              newArrivalTime = selectedRoute.frequency + Math.random() * 5;
              newStatus = 'scheduled';
            }
            
            return {
              ...arrival,
              arrivalTime: Math.max(-2, newArrivalTime),
              status: newStatus
            };
          });
        });
        setLastUpdated(new Date());
      }, 15000); // Update every 15 seconds
      
      return () => clearInterval(interval);
    }
  }, [selectedRoute, busArrivals]);

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
          time: `${Math.ceil(arrivalTime)} min`
        };
      default:
        return {
          text: 'Scheduled',
          color: 'text-gray-600 bg-gray-100',
          icon: <Clock className="h-4 w-4" />,
          time: `${Math.ceil(arrivalTime)} min`
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
            {busArrivals.map((arrival, index) => {
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
            })}
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

