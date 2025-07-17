import React from 'react';
import { Clock, DollarSign, MapPin, ArrowRight, Bus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RouteCard = ({ route, onSelectRoute, onShowOnMap }) => {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getRouteTypeIcon = (type) => {
    switch (type) {
      case 'express':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRouteTypeColor = (type) => {
    switch (type) {
      case 'express':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getRouteTypeIcon(route.type)}
            <span className="text-xl font-bold text-gray-800">#{route.id}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRouteTypeColor(route.type)}`}>
            {route.type === 'express' ? 'Express' : 'Regular'}
          </span>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">Rs. {route.fare}</div>
          <div className="text-xs text-gray-500">per person</div>
        </div>
      </div>

      {/* Route Path */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center space-x-2 flex-1">
          <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="font-medium text-gray-800 truncate">{route.origin}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="flex items-center space-x-2 flex-1">
          <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="font-medium text-gray-800 truncate">{route.destination}</span>
        </div>
      </div>

      {/* Route Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium text-gray-800">
              {formatDuration(route.duration)}
            </div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Bus className="h-4 w-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium text-gray-800">
              Every {route.frequency}m
            </div>
            <div className="text-xs text-gray-500">Frequency</div>
          </div>
        </div>
      </div>

      {/* Stops Preview */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Route ({route.stops.length} stops)
        </div>
        <div className="flex flex-wrap gap-1">
          {route.stops.slice(0, 4).map((stop, index) => (
            <span
              key={stop.id}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {stop.name}
            </span>
          ))}
          {route.stops.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{route.stops.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={() => onSelectRoute(route)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Select Route
        </Button>
        <Button
          onClick={() => onShowOnMap(route)}
          variant="outline"
          className="flex-1"
        >
          Show on Map
        </Button>
      </div>
    </div>
  );
};

export default RouteCard;

