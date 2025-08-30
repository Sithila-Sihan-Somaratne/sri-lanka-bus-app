import React, { useState, useEffect } from "react";
import {
  Bus,
  MapPin,
  Clock,
  Navigation,
  Zap,
  Route,
  Users,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBox from "./components/SearchBox";
import RouteCard from "./components/RouteCard";
import MapView from "./components/MapView";
import EnhancedBusArrivalStatus from "./components/EnhancedBusArrivalStatus";
import NearbyStops from "./components/NearbyStops";
import IntermediateRouteSearch from "./components/IntermediateRouteSearch";
import MultiRouteJourney from "./components/MultiRouteJourney.jsx";
import LoginModal from "./components/LoginModal";
import UserProfile from "./components/UserProfile";
import { busRoutes, findRoutes, getReverseRoute } from "./data/routes";
import { useGeolocation } from "./hooks/useGeolocation";
import "./App.css";

function App() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [liveBuses, setLiveBuses] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("routes"); // 'routes', 'eta', 'nearby', 'intermediate', 'transfers'
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const {
    location,
    error: locationError,
    loading: locationLoading,
    refreshLocation,
  } = useGeolocation();
  const userLocation = location
    ? [location.latitude, location.longitude]
    : null;

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("busAppUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("busAppUser");
      }
    }
  }, []);

  // Simulate live bus data
  useEffect(() => {
    if (selectedRoute) {
      const simulateBuses = () => {
        const buses = [];
        const numBuses = Math.floor(Math.random() * 3) + 1; // 1-3 buses

        for (let i = 0; i < numBuses; i++) {
          const routeCoords = selectedRoute.coordinates;
          const randomIndex = Math.floor(Math.random() * routeCoords.length);
          const position = routeCoords[randomIndex];

          // Find nearest stop
          const nearestStop = selectedRoute.stops.reduce((nearest, stop) => {
            const currentDistance =
              Math.abs(stop.lat - position[0]) +
              Math.abs(stop.lng - position[1]);
            const nearestDistance =
              Math.abs(nearest.lat - position[0]) +
              Math.abs(nearest.lng - position[1]);
            return currentDistance < nearestDistance ? stop : nearest;
          });

          buses.push({
            id: `${selectedRoute.id}-${i + 1}`,
            routeId: selectedRoute.id,
            position: position,
            nextStop: nearestStop.name,
            eta: Math.floor(Math.random() * 15) + 1, // 1-15 minutes
            status: ["on-time", "delayed", "early"][
              Math.floor(Math.random() * 3)
            ],
          });
        }

        setLiveBuses(buses);
      };

      simulateBuses();
      const interval = setInterval(simulateBuses, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedRoute]);

  const handleSearch = (searchOrigin, searchDestination) => {
    setIsSearching(true);
    setActiveTab("routes");

    // Simulate search delay
    setTimeout(() => {
      const routes = findRoutes(searchOrigin, searchDestination);
      setSearchResults(routes);
      setIsSearching(false);

      // Auto-select first route if available
      if (routes.length > 0) {
        setSelectedRoute(routes[0]);
      }
    }, 1000);
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setShowFavorites(false);
  };

  const handleShowFavorites = () => {
    setShowFavorites(true);
    setActiveTab("routes");
  };

  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    setActiveTab("eta");
  };

  const handleShowOnMap = (route) => {
    setSelectedRoute(route);
  };

  const handleReverseRoute = () => {
    if (selectedRoute) {
      const reverseRoute = getReverseRoute(selectedRoute.id);
      setSelectedRoute(reverseRoute);
    }
  };

  const handleSelectStop = (stop) => {
    // Find route that contains this stop
    const route = busRoutes.find((r) => r.id === stop.routeId);
    if (route) {
      setSelectedRoute(route);
      setActiveTab("eta");
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      // Find nearest city to current location
      const cities = [
        { name: "Colombo", lat: 6.9271, lng: 79.8612 },
        { name: "Kadawatha", lat: 7.0167, lng: 79.95 },
        { name: "Kandy", lat: 7.2906, lng: 80.6337 },
        { name: "Galle", lat: 6.0535, lng: 80.221 },
      ];

      const nearest = cities.reduce((nearest, city) => {
        const currentDistance =
          Math.abs(city.lat - userLocation[0]) +
          Math.abs(city.lng - userLocation[1]);
        const nearestDistance =
          Math.abs(nearest.lat - userLocation[0]) +
          Math.abs(nearest.lng - userLocation[1]);
        return currentDistance < nearestDistance ? city : nearest;
      });

      setOrigin(nearest.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/New bus logo.png" alt="Bus Logo" className="logo" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sri Lanka Bus Routes
                </h1>
                <p className="text-sm text-gray-500">
                  Find your journey across Sri Lanka
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {userLocation && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Navigation className="h-4 w-4 text-green-500" />
                  <span>Location detected</span>
                </div>
              )}
              {locationError && (
                <Button
                  onClick={refreshLocation}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Enable Location
                </Button>
              )}

              {user ? (
                <UserProfile
                  user={user}
                  onLogout={handleLogout}
                  onShowFavorites={handleShowFavorites}
                />
              ) : (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Search and Results */}
          <div className="lg:col-span-1 space-y-6">
            <SearchBox
              onSearch={handleSearch}
              onSwap={handleSwap}
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              userLocation={userLocation}
              onUseCurrentLocation={handleUseCurrentLocation}
            />

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("routes")}
                  className={`flex-1 px-2 py-3 text-xs font-medium ${
                    activeTab === "routes"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Bus className="h-4 w-4 inline mr-1" />
                  Routes
                </button>
                <button
                  onClick={() => setActiveTab("intermediate")}
                  className={`flex-1 px-2 py-3 text-xs font-medium ${
                    activeTab === "intermediate"
                      ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Route className="h-4 w-4 inline mr-1" />
                  Any Stop
                </button>
                <button
                  onClick={() => setActiveTab("transfers")}
                  className={`flex-1 px-2 py-3 text-xs font-medium ${
                    activeTab === "transfers"
                      ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-1" />
                  Transfers
                </button>
                <button
                  onClick={() => setActiveTab("eta")}
                  className={`flex-1 px-2 py-3 text-xs font-medium ${
                    activeTab === "eta"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  disabled={!selectedRoute}
                >
                  <Clock className="h-4 w-4 inline mr-1" />
                  Live ETA
                </button>
                <button
                  onClick={() => setActiveTab("nearby")}
                  className={`flex-1 px-2 py-3 text-xs font-medium ${
                    activeTab === "nearby"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  disabled={!userLocation}
                >
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Nearby
                </button>
              </div>

              <div className="min-h-[400px]">
                {/* Routes Tab */}
                {activeTab === "routes" && (
                  <div className="p-4">
                    {isSearching && (
                      <div className="flex items-center justify-center space-x-2 py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">
                          Searching routes...
                        </span>
                      </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Available Routes ({searchResults.length})
                          </h3>
                          {selectedRoute && (
                            <Button
                              onClick={handleReverseRoute}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Reverse
                            </Button>
                          )}
                        </div>
                        {searchResults.map((route) => (
                          <RouteCard
                            key={route.id}
                            route={route}
                            onSelectRoute={handleSelectRoute}
                            onShowOnMap={handleShowOnMap}
                          />
                        ))}
                      </div>
                    )}

                    {!isSearching &&
                      searchResults.length === 0 &&
                      origin &&
                      destination && (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Routes Found
                          </h3>
                          <p className="text-gray-600">
                            Sorry, we couldn't find any direct routes between{" "}
                            {origin} and {destination}. Try searching for nearby
                            cities or check alternative routes.
                          </p>
                        </div>
                      )}

                    {/* Sample Routes */}
                    {!origin && !destination && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Popular Routes
                        </h3>
                        <div className="space-y-3">
                          {busRoutes.slice(0, 3).map((route) => (
                            <div
                              key={route.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setOrigin(route.origin);
                                setDestination(route.destination);
                                handleSearch(route.origin, route.destination);
                              }}
                            >
                              <div>
                                <div className="font-medium text-gray-800">
                                  #{route.id}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {route.origin} → {route.destination}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  Rs. {route.fare}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {Math.floor(route.duration / 60)}h{" "}
                                  {route.duration % 60}m
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Intermediate Route Search Tab */}
                {activeTab === "intermediate" && (
                  <div className="p-4">
                    <IntermediateRouteSearch
                      onRouteSelect={handleSelectRoute}
                    />
                  </div>
                )}

                {/* Transfers Tab */}
                {activeTab === "transfers" && (
                  <div className="p-4">
                    <MultiRouteJourney
                      origin={origin}
                      destination={destination}
                      onRouteSelect={handleSelectRoute}
                    />
                  </div>
                )}

                {/* ETA Tab */}
                {activeTab === "eta" && (
                  <EnhancedBusArrivalStatus
                    selectedRoute={selectedRoute}
                    userLocation={userLocation}
                  />
                )}

                {/* Nearby Tab */}
                {activeTab === "nearby" && (
                  <NearbyStops
                    userLocation={userLocation}
                    onSelectStop={handleSelectStop}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedRoute
                      ? `Route #${selectedRoute.id} - ${selectedRoute.name}`
                      : "Route Map"}
                  </h3>
                  {selectedRoute && liveBuses.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>
                        {liveBuses.length} bus
                        {liveBuses.length !== 1 ? "es" : ""} live
                      </span>
                    </div>
                  )}
                </div>
                {selectedRoute && (
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {Math.floor(selectedRoute.duration / 60)}h{" "}
                        {selectedRoute.duration % 60}m
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedRoute.stops.length} stops</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-96 lg:h-[600px]">
                <MapView
                  selectedRoute={selectedRoute}
                  buses={liveBuses}
                  userLocation={userLocation}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default App;
