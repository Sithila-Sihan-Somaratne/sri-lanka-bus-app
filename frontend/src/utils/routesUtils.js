// Utility functions for route calculations and intermediate stop routing

/**
 * Find routes between two specific stops (including intermediate stops)
 * @param {string} originStop - Origin stop name
 * @param {string} destinationStop - Destination stop name
 * @param {Array} routes - Array of all bus routes
 * @returns {Array} Array of matching routes with stop details
 */
export const findRoutesBetweenStops = (originStop, destinationStop, routes) => {
  const matchingRoutes = [];

  routes.forEach(route => {
    const originStopIndex = route.stops.findIndex(stop => 
      stop.name.toLowerCase().includes(originStop.toLowerCase())
    );
    const destinationStopIndex = route.stops.findIndex(stop => 
      stop.name.toLowerCase().includes(destinationStop.toLowerCase())
    );

    if (originStopIndex !== -1 && destinationStopIndex !== -1 && originStopIndex < destinationStopIndex) {
      // Calculate intermediate route details
      const intermediateStops = route.stops.slice(originStopIndex, destinationStopIndex + 1);
      const intermediateCoordinates = route.coordinates.slice(originStopIndex, destinationStopIndex + 1);
      
      // Calculate fare based on distance (proportional to full route fare)
      const totalStops = route.stops.length;
      const intermediateStopsCount = intermediateStops.length;
      const proportionalFare = Math.ceil((route.fare * intermediateStopsCount) / totalStops);
      
      // Calculate duration based on distance (proportional to full route duration)
      const proportionalDuration = Math.ceil((route.duration * intermediateStopsCount) / totalStops);

      matchingRoutes.push({
        ...route,
        id: `${route.id}-intermediate-${originStopIndex}-${destinationStopIndex}`,
        name: `${intermediateStops[0].name} - ${intermediateStops[intermediateStops.length - 1].name}`,
        origin: intermediateStops[0].name,
        destination: intermediateStops[intermediateStops.length - 1].name,
        stops: intermediateStops.map((stop, index) => ({
          ...stop,
          order: index + 1
        })),
        coordinates: intermediateCoordinates,
        fare: proportionalFare,
        duration: proportionalDuration,
        originalRoute: route.id,
        isIntermediateRoute: true,
        originStopIndex,
        destinationStopIndex
      });
    }
  });

  return matchingRoutes;
};

/**
 * Find all routes that pass through a specific stop
 * @param {string} stopName - Name of the stop
 * @param {Array} routes - Array of all bus routes
 * @returns {Array} Array of routes that pass through the stop
 */
export const findRoutesPassingThroughStop = (stopName, routes) => {
  return routes.filter(route => 
    route.stops.some(stop => 
      stop.name.toLowerCase().includes(stopName.toLowerCase())
    )
  ).map(route => {
    const stopIndex = route.stops.findIndex(stop => 
      stop.name.toLowerCase().includes(stopName.toLowerCase())
    );
    return {
      ...route,
      stopIndex,
      stopDetails: route.stops[stopIndex]
    };
  });
};

/**
 * Calculate multi-route journey suggestions with transfers
 * @param {string} origin - Origin location
 * @param {string} destination - Destination location
 * @param {Array} routes - Array of all bus routes
 * @returns {Array} Array of journey suggestions including transfers
 */
export const calculateMultiRouteJourney = (origin, destination, routes) => {
  const directRoutes = findRoutesBetweenStops(origin, destination, routes);
  
  if (directRoutes.length > 0) {
    return directRoutes.map(route => ({
      type: 'direct',
      routes: [route],
      totalFare: route.fare,
      totalDuration: route.duration,
      transfers: 0
    }));
  }

  // Find routes with one transfer
  const transferRoutes = [];
  
  routes.forEach(firstRoute => {
    const originInFirst = firstRoute.stops.findIndex(stop => 
      stop.name.toLowerCase().includes(origin.toLowerCase())
    );
    
    if (originInFirst !== -1) {
      // Check each stop in the first route as potential transfer point
      firstRoute.stops.forEach((transferStop, transferIndex) => {
        if (transferIndex > originInFirst) {
          // Find second routes that start from this transfer stop and go to destination
          routes.forEach(secondRoute => {
            if (secondRoute.id !== firstRoute.id) {
              const transferInSecond = secondRoute.stops.findIndex(stop => 
                stop.name.toLowerCase().includes(transferStop.name.toLowerCase())
              );
              const destinationInSecond = secondRoute.stops.findIndex(stop => 
                stop.name.toLowerCase().includes(destination.toLowerCase())
              );
              
              if (transferInSecond !== -1 && destinationInSecond !== -1 && transferInSecond < destinationInSecond) {
                // Create first leg
                const firstLegStops = firstRoute.stops.slice(originInFirst, transferIndex + 1);
                const firstLegCoordinates = firstRoute.coordinates.slice(originInFirst, transferIndex + 1);
                const firstLegFare = Math.ceil((firstRoute.fare * firstLegStops.length) / firstRoute.stops.length);
                const firstLegDuration = Math.ceil((firstRoute.duration * firstLegStops.length) / firstRoute.stops.length);
                
                // Create second leg
                const secondLegStops = secondRoute.stops.slice(transferInSecond, destinationInSecond + 1);
                const secondLegCoordinates = secondRoute.coordinates.slice(transferInSecond, destinationInSecond + 1);
                const secondLegFare = Math.ceil((secondRoute.fare * secondLegStops.length) / secondRoute.stops.length);
                const secondLegDuration = Math.ceil((secondRoute.duration * secondLegStops.length) / secondRoute.stops.length);
                
                transferRoutes.push({
                  type: 'transfer',
                  routes: [
                    {
                      ...firstRoute,
                      id: `${firstRoute.id}-leg1`,
                      name: `${firstLegStops[0].name} - ${firstLegStops[firstLegStops.length - 1].name}`,
                      origin: firstLegStops[0].name,
                      destination: firstLegStops[firstLegStops.length - 1].name,
                      stops: firstLegStops.map((stop, index) => ({ ...stop, order: index + 1 })),
                      coordinates: firstLegCoordinates,
                      fare: firstLegFare,
                      duration: firstLegDuration,
                      isTransferLeg: true,
                      legNumber: 1
                    },
                    {
                      ...secondRoute,
                      id: `${secondRoute.id}-leg2`,
                      name: `${secondLegStops[0].name} - ${secondLegStops[secondLegStops.length - 1].name}`,
                      origin: secondLegStops[0].name,
                      destination: secondLegStops[secondLegStops.length - 1].name,
                      stops: secondLegStops.map((stop, index) => ({ ...stop, order: index + 1 })),
                      coordinates: secondLegCoordinates,
                      fare: secondLegFare,
                      duration: secondLegDuration,
                      isTransferLeg: true,
                      legNumber: 2
                    }
                  ],
                  transferPoint: transferStop.name,
                  totalFare: firstLegFare + secondLegFare,
                  totalDuration: firstLegDuration + secondLegDuration + 10, // Add 10 minutes for transfer time
                  transfers: 1
                });
              }
            }
          });
        }
      });
    }
  });

  // Remove duplicates and sort by total duration
  const uniqueTransferRoutes = transferRoutes.filter((route, index, self) => 
    index === self.findIndex(r => 
      r.routes[0].id === route.routes[0].id && 
      r.routes[1].id === route.routes[1].id
    )
  ).sort((a, b) => a.totalDuration - b.totalDuration);

  return uniqueTransferRoutes.slice(0, 3); // Return top 3 transfer options
};

/**
 * Get next bus arrival information for a specific stop
 * @param {string} stopName - Name of the stop
 * @param {Array} routes - Array of all bus routes
 * @returns {Array} Array of next bus arrivals
 */
export const getNextBusArrivals = (stopName, routes) => {
  const routesAtStop = findRoutesPassingThroughStop(stopName, routes);
  
  return routesAtStop.map(route => {
    // Simulate real-time data (in a real app, this would come from an API)
    const baseETA = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
    const status = Math.random() > 0.7 ? 'delayed' : Math.random() > 0.3 ? 'on-time' : 'early';
    const capacity = Math.random() > 0.6 ? 'full' : Math.random() > 0.3 ? 'moderate' : 'available';
    
    let actualETA = baseETA;
    if (status === 'delayed') actualETA += Math.floor(Math.random() * 10) + 5;
    if (status === 'early') actualETA -= Math.floor(Math.random() * 5) + 1;
    
    return {
      routeId: route.id,
      routeName: route.name,
      busNumber: `${route.id}/${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`, // A, B, or C
      eta: Math.max(1, actualETA),
      status,
      capacity,
      nextStop: route.stops[Math.min(route.stopIndex + 1, route.stops.length - 1)]?.name || 'Terminus',
      serviceType: route.type === 'express' ? 'Express' : 'Regular',
      fare: route.fare,
      delayReason: status === 'delayed' ? ['Traffic congestion', 'Road construction', 'Weather conditions', 'Technical issue'][Math.floor(Math.random() * 4)] : null
    };
  });
};

/**
 * Calculate walking distance and time between two coordinates
 * @param {Array} coord1 - [lat, lng] of first location
 * @param {Array} coord2 - [lat, lng] of second location
 * @returns {Object} Distance in km and walking time in minutes
 */
export const calculateWalkingDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Average walking speed: 5 km/h
  const walkingTime = Math.ceil((distance / 5) * 60);
  
  return {
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
    walkingTime
  };
};

