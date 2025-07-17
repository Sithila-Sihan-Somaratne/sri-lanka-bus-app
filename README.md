# Sri Lanka Bus Routes App

A comprehensive web application for Sri Lankan bus routes with real-time ETA, geolocation, mapping, and route planning features.

## Features

### 🚌 Real-Time Bus Arrivals
- **Live Bus Status**: Shows buses arriving, at stop, approaching, scheduled, or departed
- **Multiple Buses**: Displays 2-5 buses per route with individual tracking
- **Capacity Indicators**: 
  - 🟢 Available seats
  - 🟡 Moderate capacity
  - 🔴 Full bus
- **Real-Time Updates**: Updates every 15 seconds
- **Bus Details**: Bus numbers (e.g., #138/A, #138/B), service type (Regular/AC)
- **Delay Information**: Shows if buses are early, on-time, or delayed
- **Next Stops**: Displays upcoming stops for each bus

### 📍 Geolocation & Nearby Stops
- **Location Detection**: Automatically detects user's current location
- **Nearby Bus Stops**: Shows closest bus stops within 5km
- **Walking Distance**: Calculates walking time to each stop
- **Multiple Routes**: Shows all routes serving each stop

### 🗺️ Interactive Mapping
- **Real Route Paths**: Shows actual bus routes (not straight lines)
- **Live Bus Positions**: Real-time bus locations on the map
- **Stop Markers**: All bus stops marked with detailed information
- **Zoom & Pan**: Full interactive map controls

### 🔍 Smart Search
- **Origin/Destination Search**: Type-ahead search with autocomplete
- **City Suggestions**: Dropdown with Sri Lankan cities
- **Current Location**: Use GPS location as starting point
- **Route Reversal**: One-click route direction reversal

### 🚏 Route Information
- **Route IDs**: Unique bus route identification (e.g., #138, #193, #EX1-1)
- **Fare Information**: Ticket prices in Sri Lankan Rupees
- **Duration**: Total journey time
- **Frequency**: How often buses run
- **Stop Details**: Complete list of stops with timing

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Mapping**: Leaflet with OpenStreetMap
- **Geolocation**: HTML5 Geolocation API
- **State Management**: React Hooks

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Quick Start
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Development Server
The app will be available at `http://localhost:5173`

## Project Structure

```
sri-lanka-bus-app/
├── src/
│   ├── components/           # React components
│   │   ├── BusArrivalStatus.jsx    # Real-time bus arrivals
│   │   ├── SearchBox.jsx           # Origin/destination search
│   │   ├── RouteCard.jsx           # Route information display
│   │   ├── MapView.jsx             # Interactive map
│   │   ├── NearbyStops.jsx         # Nearby bus stops
│   │   └── ui/                     # UI components
│   ├── data/
│   │   └── routes.js               # Bus route data
│   ├── hooks/
│   │   └── useGeolocation.js       # Geolocation hook
│   ├── lib/
│   │   └── utils.js                # Utility functions
│   ├── App.jsx                     # Main application
│   ├── App.css                     # Styles
│   └── main.jsx                    # Entry point
├── public/                   # Static assets
├── package.json             # Dependencies
└── README.md               # This file
```

## Sample Routes

The app includes sample data for popular Sri Lankan routes:

- **Route #138**: Kadawatha ↔ Fort (Rs. 25, 1h 0m, Every 15min)
- **Route #193**: Town Hall ↔ Kadawatha (Rs. 30, 45min, Every 12min)  
- **Route #EX1-1**: Makumbara ↔ Matara (Rs. 150, 3h 0m, Every 30min)

## Features Demonstrated

### Real-Time Bus Information
- Bus #138/A arriving in 19 minutes (Scheduled, Moderate capacity)
- Bus #138/B arriving in 31 minutes (5m early, Moderate capacity)
- Last seen locations and next stops
- Capacity and delay status

### Interactive Elements
- **Search**: Type "Fort" → "Kadawatha" to find routes
- **Reverse**: Click reverse button to swap origin/destination
- **Live ETA**: Switch to Live ETA tab for real-time arrivals
- **Nearby**: Enable location to see nearby stops
- **Map**: View routes and live bus positions

## Customization

### Adding New Routes
Edit `src/data/routes.js` to add new bus routes:

```javascript
{
  id: "NEW_ROUTE",
  name: "City A to City B",
  origin: "City A",
  destination: "City B",
  fare: 50,
  duration: 90, // minutes
  frequency: 20, // minutes
  stops: [
    { id: "stop1", name: "Stop Name", lat: 6.9271, lng: 79.8612 }
  ],
  coordinates: [[lat, lng], [lat, lng]] // Route path
}
```

### Styling
- Modify `src/App.css` for custom styles
- Update Tailwind classes in components
- Customize colors in `tailwind.config.js`

## API Integration

The app is designed to work with real bus route APIs. Replace the sample data in `src/data/routes.js` with actual API calls:

```javascript
// Example API integration
const fetchRoutes = async (origin, destination) => {
  const response = await fetch(`/api/routes?from=${origin}&to=${destination}`);
  return response.json();
};
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the browser console for errors
2. Ensure location permissions are granted
3. Verify internet connection for map tiles
4. Check that the development server is running

## Future Enhancements

- Real-time GPS tracking integration
- Push notifications for bus arrivals
- Offline route caching
- Multi-language support (Sinhala, Tamil)
- Payment integration
- Route planning with transfers
- Historical delay data
- Weather integration
- Accessibility improvements

---

**Built for Sri Lankan public transport users** 🇱🇰

This application demonstrates modern web development practices with real-world functionality for public transportation in Sri Lanka.

