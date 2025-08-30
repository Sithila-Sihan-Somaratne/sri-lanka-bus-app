import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapLegend from './MapLegend'; // Import the MapLegend component

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types of markers
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${icon}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const busIcon = createCustomIcon('#3b82f6', '🚌');
const originIcon = createCustomIcon('#10b981', 'A');
const destinationIcon = createCustomIcon('#ef4444', 'B');
const stopIcon = createCustomIcon('#6b7280', '•');

// Component to fit map bounds to route
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds);
      map.fitBounds(leafletBounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  
  return null;
};

const MapView = ({ selectedRoute, buses = [], userLocation, className = "" }) => {
  const mapRef = useRef(null);
  
  // Default center (Colombo, Sri Lanka)
  const defaultCenter = [6.9271, 79.8612];
  const defaultZoom = 10;

  // Calculate bounds for the selected route
  const getRouteBounds = () => {
    if (!selectedRoute || !selectedRoute.coordinates) return null;
    return selectedRoute.coordinates;
  };

  const routeBounds = getRouteBounds();

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fit bounds to route */}
        {routeBounds && <FitBounds bounds={routeBounds} />}
        
        {/* Route polyline */}
        {selectedRoute && selectedRoute.coordinates && (
          <Polyline
            positions={selectedRoute.coordinates}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
          />
        )}
        
        {/* Route stops */}
        {selectedRoute && selectedRoute.stops && selectedRoute.stops.map((stop, index) => {
          let icon = stopIcon;
          if (index === 0) icon = originIcon;
          if (index === selectedRoute.stops.length - 1) icon = destinationIcon;
          
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={icon}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold">{stop.name}</div>
                  <div className="text-sm text-gray-600">
                    Stop {stop.order} of {selectedRoute.stops.length}
                  </div>
                  {index === 0 && (
                    <div className="text-xs text-green-600 font-medium">Origin</div>
                  )}
                  {index === selectedRoute.stops.length - 1 && (
                    <div className="text-xs text-red-600 font-medium">Destination</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Live buses */}
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            position={bus.position}
            icon={busIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold">Bus #{bus.id}</div>
                <div className="text-sm text-gray-600">Route {bus.routeId}</div>
                <div className="text-sm">
                  Next: <span className="font-medium">{bus.nextStop}</span>
                </div>
                <div className="text-sm">
                  ETA: <span className="font-medium text-blue-600">{bus.eta} min</span>
                </div>
                <div className={`text-xs font-medium ${
                                   bus.status === 'on-time' ? 'text-green-600' : 
                  bus.status === 'delayed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {bus.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* User location */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createCustomIcon('#8b5cf6', '📍')}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold">Your Location</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map Legend */}
      <MapLegend userLocation={userLocation} />
    </div>
  );
};

export default MapView;