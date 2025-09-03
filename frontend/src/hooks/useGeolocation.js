import { useState, useEffect } from "react";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to request location and set it
  const getPosition = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const successHandler = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLoading(false);
    };

    const errorHandler = (err) => {
      setError(err.message);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  };

  useEffect(() => {
    getPosition();
  }, []);

  // Expose a function to allow the user to refresh the location manually
  const refreshLocation = () => {
    getPosition();
  };

  return { location, error, loading, refreshLocation };
}
