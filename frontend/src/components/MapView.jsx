import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapLegend from './MapLegend';
import {
    busIcon,
    userLocationIcon,
    originIcon,
    destinationIcon,
    busStopIcon
} from '../utils/mapIcons';

// This is a necessary fix for react-leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A helper function to decode the polyline from the GraphHopper API response
function decodePolyline(encoded) {
    let poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push([lat / 1e5, lng / 1e5]);
    }
    return poly;
}

/**
 * A dedicated component to handle the routing line by directly calling the GraphHopper API.
 * This approach completely bypasses leaflet-routing-machine.
 */
const RoutingMachine = ({ selectedRoute }) => {
    const map = useMap();
    const polylineRef = useRef(null);
    
    // Replace with your actual API key.
    const graphHopperApiKey = typeof __graphhopper_api_key !== 'undefined' ? __graphhopper_api_key : '250701d2-c39e-495a-a35c-1f2f5fb85c8b';

    useEffect(() => {
        // Cleanup any existing polyline layer before proceeding
        if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }

        if (!map || !selectedRoute || !selectedRoute.stops || selectedRoute.stops.length < 2) {
            return;
        }

        // --- MORE ROBUST FIX ---
        // We will explicitly map the coordinates to ensure they are always in the correct order (lat,lng)
        const waypoints = selectedRoute.stops.map(stop => {
            // Check the values and swap them if they appear to be in the wrong order
            // A simple heuristic: if lng is outside typical lat range, it's likely a swap is needed.
            // This is a defensive approach. The safest fix is to ensure data source is correct.
            const lat = Math.abs(stop.lat) <= 90 ? stop.lat : stop.lng;
            const lng = Math.abs(stop.lat) <= 90 ? stop.lng : stop.lat;
            return `${lat},${lng}`;
        });

        const fetchRoute = async () => {
            try {
                // REMOVED `&ch.disable=true` as it requires a paid plan
                const response = await fetch(`https://graphhopper.com/api/1/route?point=${waypoints.join('&point=')}&vehicle=car&key=${graphHopperApiKey}&instructions=false`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('GraphHopper API Error:', errorData);
                    throw new Error('API returned an error');
                }
                
                const data = await response.json();
                
                if (data.paths && data.paths.length > 0) {
                    const encodedPolyline = data.paths[0].points;
                    const coordinates = decodePolyline(encodedPolyline);
                    
                    // Create and add the polyline to the map
                    const newPolyline = L.polyline(coordinates, { color: '#3b82f6', weight: 6, opacity: 0.8 }).addTo(map);
                    polylineRef.current = newPolyline;
                    
                    // Fit the map to the route bounds
                    map.fitBounds(newPolyline.getBounds());
                } else {
                    console.error('No route found.');
                }
            } catch (error) {
                console.error('Error fetching route:', error);
            }
        };

        fetchRoute();
        
        // Cleanup function to remove the polyline when the component unmounts
        return () => {
            if (polylineRef.current) {
                map.removeLayer(polylineRef.current);
                polylineRef.current = null;
            }
        };
    }, [selectedRoute, map, graphHopperApiKey]);

    return null;
};

/**
 * Main component for rendering the map and all its markers and routes.
 */
const MapView = ({ selectedRoute, buses = [], userLocation, className = "" }) => {
    const defaultCenter = [6.9271, 79.8612];
    const defaultZoom = 10;

    return (
        <div className={`relative ${className}`}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* The RoutingMachine component only draws the route line */}
                {selectedRoute !== null && <RoutingMachine selectedRoute={selectedRoute} />}

                {/* Markers for the route stops are now rendered here declaratively */}
                {selectedRoute && selectedRoute.stops.map((stop, index) => {
                    let icon;
                    let className = "text-gray-600";
                    if (index === 0) {
                        icon = originIcon;
                        className = "text-green-600";
                    } else if (index === selectedRoute.stops.length - 1) {
                        icon = destinationIcon;
                        className = "text-red-600";
                    } else {
                        icon = busStopIcon;
                    }

                    const popupContent = `
                        <div class="text-center">
                            <div class="font-semibold">${stop.name}</div>
                            <div class="text-sm text-gray-600">Stop ${stop.order} of ${selectedRoute.stops.length}</div>
                            <div class="text-xs ${className}">
                                ${index === 0 ? "Origin" : index === selectedRoute.stops.length - 1 ? "Destination" : ""}
                            </div>
                        </div>
                    `;

                    return (
                        <Marker key={stop.order} position={[stop.lat, stop.lng]} icon={icon}>
                            <Popup dangerouslySetInnerHTML={{ __html: popupContent }} />
                        </Marker>
                    );
                })}

                {/* Existing bus and user markers go here */}
                {buses.map((bus) => (
                    <Marker key={bus.id} position={bus.position} icon={busIcon}>
                        <Popup>
                            <div className="text-center">
                                <div className="font-semibold">Bus #{bus.id}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                
                {userLocation && (
                    <Marker position={userLocation} icon={userLocationIcon}>
                        <Popup>
                            <div className="text-center">
                                <div className="font-semibold">Your Location</div>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
            
            <MapLegend userLocation={userLocation} />
        </div>
    );
};

export default MapView;