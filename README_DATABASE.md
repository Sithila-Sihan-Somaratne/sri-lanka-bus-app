# Database Integration Guide

This guide explains how to set up and use the Aiven MySQL database integration for the Sri Lanka Bus App.

## Prerequisites

1. **Aiven Account**: Sign up for a free Aiven account at [aiven.io](https://aiven.io)
2. **MySQL Service**: Create a MySQL service in your Aiven console
3. **Python Dependencies**: Install required packages (see requirements.txt)

## Aiven MySQL Setup

### 1. Create MySQL Service

1. Log in to your Aiven console
2. Click "Create Service"
3. Select "MySQL"
4. Choose your cloud provider and region
5. Select a plan (Startup-1 is sufficient for development)
6. Name your service (e.g., "sri-lanka-bus-db")
7. Click "Create Service"

### 2. Get Connection Details

Once your service is running:

1. Go to your MySQL service overview
2. Note down the connection details:
   - Host
   - Port
   - Username
   - Password
   - Database name
3. Download the CA certificate if SSL is enabled

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env` in the backend directory
2. Fill in your Aiven MySQL connection details:

```env
AIVEN_MYSQL_HOST=your-service-host.aivencloud.com
AIVEN_MYSQL_PORT=3306
AIVEN_MYSQL_USER=avnadmin
AIVEN_MYSQL_PASSWORD=your-password
AIVEN_MYSQL_DATABASE=defaultdb
AIVEN_MYSQL_SSL_CA=/path/to/ca.pem
```

## Database Schema

The application uses the following tables:

### Core Tables

- **routes**: Bus route information
- **stops**: Bus stop locations and details
- **route_stops**: Junction table linking routes to stops
- **route_coordinates**: GPS coordinates for route paths

### Live Tracking Tables

- **buses**: Bus fleet information
- **bus_locations**: Real-time bus positions and status
- **bus_arrivals**: Predicted and actual arrival times

### User Features

- **user_favorites**: User's saved routes and preferences

## Installation and Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
python database.py
```

This will:
- Test the database connection
- Create all necessary tables
- Set up indexes for optimal performance

### 3. Migrate Sample Data

```bash
python -c "from database import migrate_sample_data; migrate_sample_data()"
```

This will migrate the sample route data from `routes.js` to your MySQL database.

### 4. Start the API Server

```bash
python api.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes?origin=X&destination=Y` - Search routes
- `GET /api/routes/{id}` - Get specific route
- `POST /api/routes` - Create new route

### Live Tracking
- `GET /api/buses/live` - Get all live buses
- `GET /api/buses/live?route_id=X` - Get buses for specific route
- `POST /api/buses/{id}/location` - Update bus location

### Stop Information
- `GET /api/stops/{id}/arrivals` - Get upcoming arrivals at stop

### User Features
- `GET /api/users/{id}/favorites` - Get user favorites
- `POST /api/users/{id}/favorites` - Add favorite route

### Search
- `GET /api/search/routes` - Advanced route search with transfers

## Frontend Integration

### 1. Configure API Base URL

Add to your `.env` file in the React app:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 2. Use API Service

```javascript
import apiService from './services/api';

// Get routes
const routes = await apiService.getRoutes('Colombo', 'Kandy');

// Get live buses
const buses = await apiService.getLiveBuses('138');

// Get stop arrivals
const arrivals = await apiService.getStopArrivals('stop_id');
```

## Production Deployment

### 1. Environment Variables

Set production environment variables:

```env
FLASK_ENV=production
FLASK_DEBUG=False
AIVEN_MYSQL_HOST=your-production-host.aivencloud.com
# ... other production settings
```

### 2. Use Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

### 3. SSL Configuration

Ensure SSL certificates are properly configured for Aiven MySQL connection in production.

## Database Maintenance

### Backup

Aiven provides automatic backups, but you can also create manual backups:

1. Go to your service overview in Aiven console
2. Click "Backups" tab
3. Create manual backup as needed

### Monitoring

Monitor your database performance:

1. Check connection pool usage
2. Monitor query performance
3. Set up alerts for high CPU/memory usage

### Scaling

To scale your database:

1. Go to service overview
2. Click "Modify service"
3. Select a larger plan
4. Apply changes (may cause brief downtime)

## Troubleshooting

### Connection Issues

1. **SSL Certificate**: Ensure CA certificate path is correct
2. **Firewall**: Check if your IP is whitelisted in Aiven
3. **Credentials**: Verify username/password are correct

### Performance Issues

1. **Indexes**: Ensure proper indexes are created (done automatically)
2. **Connection Pool**: Adjust connection pool settings if needed
3. **Query Optimization**: Use EXPLAIN to analyze slow queries

### Data Issues

1. **Migration**: Re-run migration if data is missing
2. **Validation**: Check data integrity with sample queries
3. **Cleanup**: Remove old/stale data periodically

## Sample Queries

### Get routes between cities
```sql
SELECT DISTINCT r.* FROM routes r
JOIN route_stops rs1 ON r.id = rs1.route_id
JOIN stops s1 ON rs1.stop_id = s1.id
JOIN route_stops rs2 ON r.id = rs2.route_id
JOIN stops s2 ON rs2.stop_id = s2.id
WHERE s1.name LIKE '%Colombo%'
AND s2.name LIKE '%Kandy%'
AND rs1.stop_order < rs2.stop_order;
```

### Get live bus locations
```sql
SELECT bl.*, b.bus_number, b.vehicle_type
FROM bus_locations bl
JOIN buses b ON bl.bus_id = b.id
WHERE bl.timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
ORDER BY bl.timestamp DESC;
```

### Get upcoming arrivals
```sql
SELECT ba.*, b.bus_number, r.name as route_name
FROM bus_arrivals ba
JOIN buses b ON ba.bus_id = b.id
JOIN routes r ON b.route_id = r.id
WHERE ba.stop_id = 'your_stop_id'
AND ba.estimated_arrival >= NOW()
ORDER BY ba.estimated_arrival;
```

## Support

For issues with:
- **Aiven MySQL**: Check Aiven documentation or contact Aiven support
- **Application**: Check logs and error messages
- **Performance**: Monitor database metrics in Aiven console

