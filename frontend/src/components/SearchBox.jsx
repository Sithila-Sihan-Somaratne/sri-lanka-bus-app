import React, { useState, useRef, useEffect } from 'react';
import { Search, ArrowUpDown, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cities } from '../data/routes';

const SearchBox = ({ onSearch, onSwap, origin, destination, onOriginChange, onDestinationChange, userLocation, onUseCurrentLocation }) => {
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  const originRef = useRef(null);
  const destinationRef = useRef(null);

  const filterCities = (query) => {
    if (!query) return [];
    return cities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  const handleOriginChange = (value) => {
    onOriginChange(value);
    const suggestions = filterCities(value);
    setOriginSuggestions(suggestions);
    setShowOriginSuggestions(suggestions.length > 0 && value.length > 0);
  };

  const handleDestinationChange = (value) => {
    onDestinationChange(value);
    const suggestions = filterCities(value);
    setDestinationSuggestions(suggestions);
    setShowDestinationSuggestions(suggestions.length > 0 && value.length > 0);
  };

  const selectOrigin = (city) => {
    onOriginChange(city.name);
    setShowOriginSuggestions(false);
  };

  const selectDestination = (city) => {
    onDestinationChange(city.name);
    setShowDestinationSuggestions(false);
  };

  const handleSearch = () => {
    if (origin && destination) {
      onSearch(origin, destination);
    }
  };

  const handleSwap = () => {
    onSwap();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Plan Your Journey</h2>
      
      <div className="space-y-4">
        {/* Origin Input */}
        <div className="relative" ref={originRef}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
            <Input
              type="text"
              placeholder="From (e.g., Colombo, Fort, Kadawatha)"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              className="pl-10 pr-12 py-3 text-lg"
            />
            {userLocation && (
              <Button
                onClick={onUseCurrentLocation}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
                title="Use current location"
              >
                <Navigation className="h-4 w-4 text-blue-500" />
              </Button>
            )}
          </div>
          
          {/* Origin Suggestions */}
          {showOriginSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {originSuggestions.map((city, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectOrigin(city)}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{city.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwap}
            className="rounded-full p-2 hover:bg-blue-50"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Destination Input */}
        <div className="relative" ref={destinationRef}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
            <Input
              type="text"
              placeholder="To (e.g., Kadawatha, Kandy, Galle)"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
          
          {/* Destination Suggestions */}
          {showDestinationSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {destinationSuggestions.map((city, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectDestination(city)}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{city.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
          disabled={!origin || !destination}
        >
          <Search className="h-5 w-5 mr-2" />
          Find Routes
        </Button>
      </div>
    </div>
  );
};

export default SearchBox;

