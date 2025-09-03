// API service for communicating with the backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://10.41.168.210:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Routes
  async getRoutes(origin = null, destination = null) {
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    
    const queryString = params.toString();
    return this.request(`/routes${queryString ? `?${queryString}` : ''}`);
  }

  async getRoute(routeId) {
    return this.request(`/routes/${routeId}`);
  }

  async createRoute(routeData) {
    return this.request('/routes', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  }

  // Live buses
  async getLiveBuses(routeId = null) {
    const params = new URLSearchParams();
    if (routeId) params.append('route_id', routeId);
    
    const queryString = params.toString();
    return this.request(`/buses/live${queryString ? `?${queryString}` : ''}`);
  }

  async updateBusLocation(busId, locationData) {
    return this.request(`/buses/${busId}/location`, {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // Stop arrivals
  async getStopArrivals(stopId, limit = 10) {
    return this.request(`/stops/${stopId}/arrivals?limit=${limit}`);
  }

  // User favorites
  async getUserFavorites(userId) {
    return this.request(`/users/${userId}/favorites`);
  }

  async addUserFavorite(userId, favoriteData) {
    return this.request(`/users/${userId}/favorites`, {
      method: 'POST',
      body: JSON.stringify(favoriteData),
    });
  }

  // Advanced search
  async searchRoutes(origin, destination, includeTransfers = false) {
    const params = new URLSearchParams({
      origin,
      destination,
      include_transfers: includeTransfers.toString(),
    });
    
    return this.request(`/search/routes?${params.toString()}`);
  }

  // Data migration
  async migrateData() {
    return this.request('/migrate-data', {
      method: 'POST',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  healthCheck,
  getRoutes,
  getRoute,
  createRoute,
  getLiveBuses,
  updateBusLocation,
  getStopArrivals,
  getUserFavorites,
  addUserFavorite,
  searchRoutes,
  migrateData,
} = apiService;

