import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, DollarSign, MapPin, AlertCircle, Bus, RefreshCw, Users } from 'lucide-react';
import { calculateMultiRouteJourney, getNextBusArrivals } from '../utils/routesUtils';
import { busRoutes } from '../data/routes';

const MultiRouteJourney = ({ origin, destination, onRouteSelect }) => {
  const [journeyOptions, setJourneyOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [busArrivals, setBusArrivals] = useState({});

  useEffect(() => {
    if (origin && destination) {
      searchJourneyOptions();
    }
  }, [origin, destination]);

  const searchJourneyOptions = async () => {
    setIsLoading(true);
    try {
      const options = calculateMultiRouteJourney(origin, destination, busRoutes);
      setJourneyOptions(options);
      
      // Get bus arrivals for transfer points
      const arrivals = {};
      for (const option of options) {
        if (option.type === 'transfer' && option.transferPoint) {
          arrivals[option.transferPoint] = getNextBusArrivals(option.transferPoint, busRoutes);
        }
      }
      setBusArrivals(arrivals);
    } catch (error) {
      console.error('Error searching journey options:', error);
      setJourneyOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJourney = (journey) => {
    setSelectedJourney(journey);
    if (onRouteSelect && journey.routes[0]) {
      onRouteSelect(journey.routes[0]);
    }
  };

  const getCapacityColor = (capacity) => {
    switch (capacity) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'full': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time': return 'text-green-600';
      case 'early': return 'text-blue-600';
      case 'delayed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderDirectJourney = (journey) => (
    <div
      key={journey.routes[0].id}
      className={`bg-white rounded-lg shadow-md p-4 border-2 cursor-pointer transition-all ${
        selectedJourney?.routes[0].id === journey.routes[0].id
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => handleSelectJourney(journey)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Bus className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-lg">Direct Route</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            No transfers
          </span>
        </div>
        <div className="text-sm text-gray-500">Route #{journey.routes[0].id}</div>
      </div>

      <div className="flex items-center space-x-4 mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">{journey.routes[0].origin}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium">{journey.routes[0].destination}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span>Rs. {journey.totalFare}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>{journey.totalDuration} min</span>
        </div>
        <div className="flex items-center space-x-1">
          <Bus className="h-4 w-4 text-gray-600" />
          <span>{journey.routes[0].stops.length} stops</span>
        </div>
      </div>
    </div>
  );

  const renderTransferJourney = (journey) => (
    <div
      key={`${journey.routes[0].id}-${journey.routes[1].id}`}
      className={`bg-white rounded-lg shadow-md p-4 border-2 cursor-pointer transition-all ${
        selectedJourney?.routes[0].id === journey.routes[0].id && 
        selectedJourney?.routes[1].id === journey.routes[1].id
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => handleSelectJourney(journey)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 text-orange-600" />
          <span className="font-semibold text-lg">Transfer Journey</span>
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {journey.transfers} transfer
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Routes #{journey.routes[0].id.split('-')[0]} → #{journey.routes[1].id.split('-')[0]}
        </div>
      </div>

      {/* Journey Legs */}
      <div className="space-y-3 mb-4">
        {journey.routes.map((route, index) => (
          <div key={route.id} className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                Leg {index + 1}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <MapPin className="h-3 w-3 text-green-600" />
              <span className="text-sm">{route.origin}</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <MapPin className="h-3 w-3 text-red-600" />
              <span className="text-sm">{route.destination}</span>
            </div>
            <div className="text-xs text-gray-500">
              Rs. {route.fare} • {route.duration} min
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Point Information */}
      {journey.transferPoint && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-orange-800">Transfer at: {journey.transferPoint}</span>
          </div>
          
          {/* Show next bus arrivals at transfer point */}
          {busArrivals[journey.transferPoint] && busArrivals[journey.transferPoint].length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-orange-700 font-medium">Next buses at transfer point:</div>
              {busArrivals[journey.transferPoint].slice(0, 2).map((bus, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">#{bus.busNumber}</span>
                    <span className={`px-1 py-0.5 rounded text-xs ${getCapacityColor(bus.capacity)}`}>
                      {bus.capacity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={getStatusColor(bus.status)}>{bus.eta} min</span>
                    {bus.delayReason && (
                      <span className="text-red-600" title={bus.delayReason}>⚠️</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Journey Summary */}
      <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span>Rs. {journey.totalFare}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>{journey.totalDuration} min</span>
        </div>
        <div className="flex items-center space-x-1">
          <RefreshCw className="h-4 w-4 text-orange-600" />
          <span>{journey.transfers} transfer(s)</span>
        </div>
      </div>
    </div>
  );

  const renderJourneyDetails = (journey) => {
    if (!journey) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <h4 className="font-semibold text-lg mb-3 flex items-center space-x-2">
          <Bus className="h-5 w-5 text-blue-600" />
          <span>Journey Details</span>
        </h4>

        <div className="space-y-4">
          {journey.routes.map((route, index) => (
            <div key={route.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">
                  Leg {index + 1}: Route #{route.id.split('-')[0]}
                </h5>
                <span className="text-sm text-gray-500">{route.serviceType || 'Regular'}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>From: <strong>{route.origin}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>To: <strong>{route.destination}</strong></span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span>Rs. {route.fare}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span>{route.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bus className="h-3 w-3 text-gray-600" />
                    <span>{route.stops.length} stops</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {journey.type === 'transfer' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Transfer Instructions</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Get off at <strong>{journey.transferPoint}</strong> and board the next bus. 
                Allow 10 minutes for transfer time.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Finding journey options...</p>
      </div>
    );
  }

  if (!origin || !destination) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bus className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>Enter origin and destination to see journey options</p>
      </div>
    );
  }

  if (journeyOptions.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Journey Options Found</h3>
        <p className="text-gray-600">
          Sorry, we couldn't find any routes between {origin} and {destination}.
          Try searching for nearby locations or check if the locations are spelled correctly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Journey Options ({journeyOptions.length})
        </h3>
        <button
          onClick={searchJourneyOptions}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {journeyOptions.map(journey => 
          journey.type === 'direct' 
            ? renderDirectJourney(journey)
            : renderTransferJourney(journey)
        )}
      </div>

      {selectedJourney && (
        <div className="mt-6">
          {renderJourneyDetails(selectedJourney)}
        </div>
      )}
    </div>
  );
};

export default MultiRouteJourney;

