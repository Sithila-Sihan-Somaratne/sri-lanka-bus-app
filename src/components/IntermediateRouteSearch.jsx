import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, DollarSign, ArrowRight, Bus, AlertCircle } from 'lucide-react';
import { findRoutesBetweenStops, calculateMultiRouteJourney } from '../utils/routesUtils';
import { busRoutes } from '../data/routes';

const IntermediateRouteSearch = ({ onRouteSelect }) => {
  const [originStop, setOriginStop] = useState('');
  const [destinationStop, setDestinationStop] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('direct'); // 'direct' or 'transfer'

  // Get all unique stop names for autocomplete
  const allStops = [...new Set(busRoutes.flatMap(route => route.stops.map(stop => stop.name)))].sort();

  const handleSearch = async () => {
    if (!originStop.trim() || !destinationStop.trim()) return;
    
    setIsSearching(true);
    
    try {
      let results = [];
      
      if (searchType === 'direct') {
        // Search for direct routes between stops
        results = findRoutesBetweenStops(originStop, destinationStop, busRoutes);
      } else {
        // Search for routes with transfers
        results = calculateMultiRouteJourney(originStop, destinationStop, busRoutes);
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (originStop && destinationStop) {
      const timeoutId = setTimeout(handleSearch, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [originStop, destinationStop, searchType]);

  const renderDirectRoute = (route) => (
    <div
      key={route.id}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onRouteSelect(route)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Bus className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-lg">Route #{route.originalRoute || route.id}</span>
          {route.isIntermediateRoute && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Intermediate
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">{route.type}</span>
      </div>
      
      <div className="flex items-center space-x-4 mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm">{route.origin}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-red-600" />
          <span className="text-sm">{route.destination}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span>Rs. {route.fare}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>{route.duration} min</span>
        </div>
        <div className="text-gray-600">
          {route.stops.length} stops
        </div>
      </div>
      
      {route.isIntermediateRoute && (
        <div className="mt-2 text-xs text-gray-500">
          Stops {route.originStopIndex + 1} to {route.destinationStopIndex + 1} of original route
        </div>
      )}
    </div>
  );

  const renderTransferRoute = (journey) => (
    <div
      key={`${journey.routes[0].id}-${journey.routes[1].id}`}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onRouteSelect(journey.routes[0])} // Select first route for now
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Bus className="h-5 w-5 text-orange-600" />
          <span className="font-semibold text-lg">Transfer Journey</span>
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {journey.transfers} Transfer
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {journey.routes.map((route, index) => (
          <div key={route.id} className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Route #{route.id.split('-')[0]}
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
        
        {journey.transferPoint && (
          <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>Transfer at: {journey.transferPoint}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span>Rs. {journey.totalFare}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>{journey.totalDuration} min</span>
        </div>
        <div className="text-gray-600">
          {journey.transfers} transfer(s)
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Search Between Any Stops</h3>
        </div>
        
        {/* Search Type Toggle */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setSearchType('direct')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'direct'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Direct Routes
          </button>
          <button
            onClick={() => setSearchType('transfer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'transfer'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            With Transfers
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Stop
            </label>
            <input
              type="text"
              value={originStop}
              onChange={(e) => setOriginStop(e.target.value)}
              placeholder="Enter origin stop name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              list="origin-stops"
            />
            <datalist id="origin-stops">
              {allStops.map(stop => (
                <option key={stop} value={stop} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Stop
            </label>
            <input
              type="text"
              value={destinationStop}
              onChange={(e) => setDestinationStop(e.target.value)}
              placeholder="Enter destination stop name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              list="destination-stops"
            />
            <datalist id="destination-stops">
              {allStops.map(stop => (
                <option key={stop} value={stop} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Searching routes...</p>
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">
            {searchType === 'direct' ? 'Direct Routes' : 'Journey Options'} 
            ({searchResults.length})
          </h4>
          {searchResults.map(result => 
            searchType === 'direct' 
              ? renderDirectRoute(result)
              : renderTransferRoute(result)
          )}
        </div>
      )}

      {!isSearching && originStop && destinationStop && searchResults.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            No {searchType} routes found between these stops.
            {searchType === 'direct' && (
              <span className="block mt-1">
                Try searching with transfers for more options.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default IntermediateRouteSearch;

