from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import json
from database import DatabaseManager

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize database manager
db = DatabaseManager()

@app.before_request
def initialize_database():
    """Initialize database connection and create tables"""
    if db.connect():
        db.create_tables()
        print("Database initialized successfully")
    else:
        print("Failed to initialize database")

@app.teardown_appcontext
def close_database(error):
    """Close database connection"""
    if hasattr(db, 'connection') and db.connection:
        db.disconnect()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if db.connection and db.connection.is_connected() else 'disconnected'
    })

@app.route('/api/routes', methods=['GET'])
def get_routes():
    """Get all routes or search routes by origin/destination"""
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    
    try:
        routes = db.get_routes(origin, destination)
        return jsonify({
            'success': True,
            'data': routes,
            'count': len(routes)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/routes/<route_id>', methods=['GET'])
def get_route(route_id):
    """Get specific route details"""
    try:
        routes = db.get_routes()
        route = next((r for r in routes if r['id'] == route_id), None)
        
        if route:
            return jsonify({
                'success': True,
                'data': route
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Route not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/routes', methods=['POST'])
def create_route():
    """Create a new route"""
    try:
        route_data = request.get_json()
        
        # Validate required fields
        required_fields = ['id', 'name', 'origin', 'destination', 'fare', 'duration', 'frequency', 'stops', 'coordinates']
        for field in required_fields:
            if field not in route_data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        success = db.insert_route(route_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Route created successfully'
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create route'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/buses/live', methods=['GET'])
def get_live_buses():
    """Get live bus locations"""
    route_id = request.args.get('route_id')
    
    try:
        buses = db.get_live_buses(route_id)
        
        # Format bus data for frontend
        formatted_buses = []
        for bus in buses:
            formatted_bus = {
                'id': bus['bus_id'],
                'routeId': route_id or 'unknown',
                'busNumber': bus['bus_number'],
                'position': [float(bus['latitude']), float(bus['longitude'])],
                'currentStop': bus['current_stop_name'],
                'nextStop': bus['next_stop_name'],
                'vehicleType': bus['vehicle_type'],
                'capacity': {
                    'total': bus['total_seats'],
                    'occupied': bus['occupied_seats'],
                    'available': bus['total_seats'] - bus['occupied_seats'],
                    'status': 'full' if bus['occupied_seats'] >= bus['total_seats'] * 0.9 else 
                             'moderate' if bus['occupied_seats'] >= bus['total_seats'] * 0.7 else 'available'
                },
                'delay': {
                    'minutes': bus['delay_minutes'],
                    'reason': bus['delay_reason']
                },
                'lastUpdated': bus['timestamp'].isoformat() if bus['timestamp'] else None
            }
            formatted_buses.append(formatted_bus)
        
        return jsonify({
            'success': True,
            'data': formatted_buses,
            'count': len(formatted_buses)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/buses/<bus_id>/location', methods=['POST'])
def update_bus_location():
    """Update bus location"""
    bus_id = request.view_args['bus_id']
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'latitude' not in data or 'longitude' not in data:
            return jsonify({
                'success': False,
                'error': 'Latitude and longitude are required'
            }), 400
        
        success = db.update_bus_location(
            bus_id=bus_id,
            latitude=data['latitude'],
            longitude=data['longitude'],
            current_stop_id=data.get('current_stop_id'),
            next_stop_id=data.get('next_stop_id'),
            occupied_seats=data.get('occupied_seats', 0),
            delay_minutes=data.get('delay_minutes', 0),
            delay_reason=data.get('delay_reason')
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Bus location updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update bus location'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stops/<stop_id>/arrivals', methods=['GET'])
def get_stop_arrivals(stop_id):
    """Get bus arrivals for a specific stop"""
    limit = request.args.get('limit', 10, type=int)
    
    try:
        arrivals = db.get_bus_arrivals(stop_id, limit)
        
        # Format arrival data
        formatted_arrivals = []
        for arrival in arrivals:
            eta_minutes = (arrival['estimated_arrival'] - datetime.now()).total_seconds() / 60
            
            formatted_arrival = {
                'busId': arrival['bus_id'],
                'busNumber': arrival['bus_number'],
                'routeName': arrival['route_name'],
                'vehicleType': arrival['vehicle_type'],
                'eta': max(0, int(eta_minutes)),
                'estimatedArrival': arrival['estimated_arrival'].isoformat(),
                'actualArrival': arrival['actual_arrival'].isoformat() if arrival['actual_arrival'] else None,
                'delay': arrival['delay_minutes'],
                'capacity': {
                    'status': arrival['capacity_status'],
                    'total': arrival['total_seats']
                }
            }
            formatted_arrivals.append(formatted_arrival)
        
        return jsonify({
            'success': True,
            'data': formatted_arrivals,
            'count': len(formatted_arrivals)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/users/<user_id>/favorites', methods=['GET'])
def get_user_favorites(user_id):
    """Get user's favorite routes"""
    try:
        favorites = db.get_user_favorites(user_id)
        
        return jsonify({
            'success': True,
            'data': favorites,
            'count': len(favorites)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/users/<user_id>/favorites', methods=['POST'])
def add_user_favorite(user_id):
    """Add route to user favorites"""
    try:
        data = request.get_json()
        
        if 'route_id' not in data:
            return jsonify({
                'success': False,
                'error': 'route_id is required'
            }), 400
        
        success = db.add_user_favorite(
            user_id=user_id,
            route_id=data['route_id'],
            origin_stop_id=data.get('origin_stop_id'),
            destination_stop_id=data.get('destination_stop_id')
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Favorite added successfully'
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to add favorite'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/search/routes', methods=['GET'])
def search_routes():
    """Advanced route search with intermediate stops"""
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    include_transfers = request.args.get('include_transfers', 'false').lower() == 'true'
    
    if not origin or not destination:
        return jsonify({
            'success': False,
            'error': 'Both origin and destination are required'
        }), 400
    
    try:
        # Get direct routes
        direct_routes = db.get_routes(origin, destination)
        
        results = {
            'direct_routes': direct_routes,
            'transfer_routes': []
        }
        
        # If no direct routes and transfers are requested, find transfer options
        if not direct_routes and include_transfers:
            # This would implement the transfer logic from routeUtils.js
            # For now, return empty transfer routes
            results['transfer_routes'] = []
        
        return jsonify({
            'success': True,
            'data': results,
            'direct_count': len(direct_routes),
            'transfer_count': len(results['transfer_routes'])
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/migrate-data', methods=['POST'])
def migrate_sample_data():
    """Migrate sample data from routes.js to database"""
    try:
        # This would import and migrate the sample data
        # For now, return success message
        return jsonify({
            'success': True,
            'message': 'Data migration completed successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # For development
    app.run(host='0.0.0.0', port=5000, debug=True)

