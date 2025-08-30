import os
import sys
from dotenv import load_dotenv

load_dotenv()

import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta
import json

class DatabaseManager:
    def __init__(self):
        # Aiven MySQL connection configuration
        # In production, these should be environment variables
        self.config = {
            'host': os.getenv('AIVEN_MYSQL_HOST', 'localhost'),
            'port': int(os.getenv('AIVEN_MYSQL_PORT', 3306)),
            'user': os.getenv('AIVEN_MYSQL_USER', 'root'),
            'password': os.getenv('AIVEN_MYSQL_PASSWORD', ''),
            'database': os.getenv('AIVEN_MYSQL_DATABASE', 'sri_lanka_bus_db'),
            'ssl_disabled': False,
            'ssl_ca': os.path.join(os.path.dirname(__file__), os.getenv('AIVEN_MYSQL_SSL_CA_FILENAME', 'ca.pem')),
            'autocommit': True
        }
        self.connection = None

    def connect(self):
        """Establish connection to Aiven MySQL database"""
        try:
            self.connection = mysql.connector.connect(**self.config)
            if self.connection.is_connected():
                print("Successfully connected to Aiven MySQL database")
                return True
        except Error as e:
            print(f"Error connecting to MySQL database: {e}")
            return False

    def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection closed")

    def create_tables(self):
        """Create necessary tables for the bus app"""
        if not self.connection:
            return False

        cursor = self.connection.cursor()
        
        try:
            # Routes table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS routes (
                    id VARCHAR(20) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    origin VARCHAR(100) NOT NULL,
                    destination VARCHAR(100) NOT NULL,
                    fare DECIMAL(10,2) NOT NULL,
                    duration INT NOT NULL,
                    frequency INT NOT NULL,
                    type ENUM('regular', 'express', 'ac') DEFAULT 'regular',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)

            # Stops table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS stops (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    latitude DECIMAL(10, 8) NOT NULL,
                    longitude DECIMAL(11, 8) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Route stops junction table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS route_stops (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    route_id VARCHAR(20) NOT NULL,
                    stop_id VARCHAR(50) NOT NULL,
                    stop_order INT NOT NULL,
                    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
                    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_route_stop (route_id, stop_id),
                    INDEX idx_route_order (route_id, stop_order)
                )
            """)

            # Route coordinates table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS route_coordinates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    route_id VARCHAR(20) NOT NULL,
                    latitude DECIMAL(10, 8) NOT NULL,
                    longitude DECIMAL(11, 8) NOT NULL,
                    sequence_order INT NOT NULL,
                    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
                    INDEX idx_route_sequence (route_id, sequence_order)
                )
            """)

            # Buses table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS buses (
                    id VARCHAR(50) PRIMARY KEY,
                    route_id VARCHAR(20) NOT NULL,
                    bus_number VARCHAR(20) NOT NULL,
                    vehicle_type ENUM('regular', 'ac') DEFAULT 'regular',
                    total_seats INT DEFAULT 50,
                    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
                )
            """)

            # Bus locations table (for live tracking)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bus_locations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    bus_id VARCHAR(50) NOT NULL,
                    latitude DECIMAL(10, 8) NOT NULL,
                    longitude DECIMAL(11, 8) NOT NULL,
                    current_stop_id VARCHAR(50),
                    next_stop_id VARCHAR(50),
                    occupied_seats INT DEFAULT 0,
                    delay_minutes INT DEFAULT 0,
                    delay_reason VARCHAR(255),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
                    FOREIGN KEY (current_stop_id) REFERENCES stops(id),
                    FOREIGN KEY (next_stop_id) REFERENCES stops(id),
                    INDEX idx_bus_timestamp (bus_id, timestamp)
                )
            """)

            # User favorites table (for future login functionality)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_favorites (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(100) NOT NULL,
                    route_id VARCHAR(20) NOT NULL,
                    origin_stop_id VARCHAR(50),
                    destination_stop_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
                    FOREIGN KEY (origin_stop_id) REFERENCES stops(id),
                    FOREIGN KEY (destination_stop_id) REFERENCES stops(id),
                    UNIQUE KEY unique_user_favorite (user_id, route_id, origin_stop_id, destination_stop_id)
                )
            """)

            # Bus arrival predictions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bus_arrivals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    bus_id VARCHAR(50) NOT NULL,
                    stop_id VARCHAR(50) NOT NULL,
                    estimated_arrival TIMESTAMP NOT NULL,
                    actual_arrival TIMESTAMP NULL,
                    delay_minutes INT DEFAULT 0,
                    capacity_status ENUM('available', 'moderate', 'full') DEFAULT 'available',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
                    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
                    INDEX idx_stop_arrival (stop_id, estimated_arrival)
                )
            """)

            self.connection.commit()
            print("All tables created successfully")
            return True

        except Error as e:
            print(f"Error creating tables: {e}")
            return False
        finally:
            cursor.close()

    def insert_route(self, route_data):
        """Insert a new route into the database"""
        if not self.connection:
            return False

        cursor = self.connection.cursor()
        
        try:
            # Insert route
            route_query = """
                INSERT INTO routes (id, name, origin, destination, fare, duration, frequency, type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name), origin = VALUES(origin), destination = VALUES(destination),
                fare = VALUES(fare), duration = VALUES(duration), frequency = VALUES(frequency),
                type = VALUES(type), updated_at = CURRENT_TIMESTAMP
            """
            cursor.execute(route_query, (
                route_data['id'], route_data['name'], route_data['origin'],
                route_data['destination'], route_data['fare'], route_data['duration'],
                route_data['frequency'], route_data.get('type', 'regular')
            ))

            # Insert stops
            for stop in route_data['stops']:
                stop_query = """
                    INSERT INTO stops (id, name, latitude, longitude)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    name = VALUES(name), latitude = VALUES(latitude), longitude = VALUES(longitude)
                """
                cursor.execute(stop_query, (stop['id'], stop['name'], stop['lat'], stop['lng']))

                # Insert route-stop relationship
                route_stop_query = """
                    INSERT INTO route_stops (route_id, stop_id, stop_order)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE stop_order = VALUES(stop_order)
                """
                cursor.execute(route_stop_query, (route_data['id'], stop['id'], stop['order']))

            # Insert route coordinates
            for i, coord in enumerate(route_data['coordinates']):
                coord_query = """
                    INSERT INTO route_coordinates (route_id, latitude, longitude, sequence_order)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(coord_query, (route_data['id'], coord[0], coord[1], i + 1))

            self.connection.commit()
            return True

        except Error as e:
            print(f"Error inserting route: {e}")
            self.connection.rollback()
            return False
        finally:
            cursor.close()

    def get_routes(self, origin=None, destination=None):
        """Get routes from database with optional filtering"""
        if not self.connection:
            return []

        cursor = self.connection.cursor(dictionary=True)
        
        try:
            if origin and destination:
                # Find routes that have both origin and destination stops
                query = """
                    SELECT DISTINCT r.* FROM routes r
                    JOIN route_stops rs1 ON r.id = rs1.route_id
                    JOIN stops s1 ON rs1.stop_id = s1.id
                    JOIN route_stops rs2 ON r.id = rs2.route_id
                    JOIN stops s2 ON rs2.stop_id = s2.id
                    WHERE (s1.name LIKE %s OR r.origin LIKE %s)
                    AND (s2.name LIKE %s OR r.destination LIKE %s)
                    AND rs1.stop_order < rs2.stop_order
                """
                cursor.execute(query, (f'%{origin}%', f'%{origin}%', f'%{destination}%', f'%{destination}%'))
            else:
                query = "SELECT * FROM routes ORDER BY id"
                cursor.execute(query)

            routes = cursor.fetchall()
            
            # Get stops and coordinates for each route
            for route in routes:
                # Get stops
                stops_query = """
                    SELECT s.*, rs.stop_order as `order`
                    FROM stops s
                    JOIN route_stops rs ON s.id = rs.stop_id
                    WHERE rs.route_id = %s
                    ORDER BY rs.stop_order
                """
                cursor.execute(stops_query, (route['id'],))
                route['stops'] = cursor.fetchall()

                # Get coordinates
                coords_query = """
                    SELECT latitude, longitude
                    FROM route_coordinates
                    WHERE route_id = %s
                    ORDER BY sequence_order
                """
                cursor.execute(coords_query, (route['id'],))
                coords = cursor.fetchall()
                route['coordinates'] = [[float(c['latitude']), float(c['longitude'])] for c in coords]

            return routes

        except Error as e:
            print(f"Error getting routes: {e}")
            return []
        finally:
            cursor.close()

    def update_bus_location(self, bus_id, latitude, longitude, current_stop_id=None, 
                           next_stop_id=None, occupied_seats=0, delay_minutes=0, delay_reason=None):
        """Update bus location and status"""
        if not self.connection:
            return False

        cursor = self.connection.cursor()
        
        try:
            query = """
                INSERT INTO bus_locations 
                (bus_id, latitude, longitude, current_stop_id, next_stop_id, 
                 occupied_seats, delay_minutes, delay_reason)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                bus_id, latitude, longitude, current_stop_id, next_stop_id,
                occupied_seats, delay_minutes, delay_reason
            ))
            
            self.connection.commit()
            return True

        except Error as e:
            print(f"Error updating bus location: {e}")
            return False
        finally:
            cursor.close()

    def get_live_buses(self, route_id=None):
        """Get live bus locations"""
        if not self.connection:
            return []

        cursor = self.connection.cursor(dictionary=True)
        
        try:
            query = """
                SELECT bl.*, b.bus_number, b.vehicle_type, b.total_seats,
                       s1.name as current_stop_name, s2.name as next_stop_name
                FROM bus_locations bl
                JOIN buses b ON bl.bus_id = b.id
                LEFT JOIN stops s1 ON bl.current_stop_id = s1.id
                LEFT JOIN stops s2 ON bl.next_stop_id = s2.id
                WHERE bl.timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            """
            
            params = []
            if route_id:
                query += " AND b.route_id = %s"
                params.append(route_id)
                
            query += " ORDER BY bl.timestamp DESC"
            
            cursor.execute(query, params)
            return cursor.fetchall()

        except Error as e:
            print(f"Error getting live buses: {e}")
            return []
        finally:
            cursor.close()

    def get_bus_arrivals(self, stop_id, limit=10):
        """Get upcoming bus arrivals for a stop"""
        if not self.connection:
            return []

        cursor = self.connection.cursor(dictionary=True)
        
        try:
            query = """
                SELECT ba.*, b.bus_number, b.vehicle_type, b.total_seats, r.name as route_name
                FROM bus_arrivals ba
                JOIN buses b ON ba.bus_id = b.id
                JOIN routes r ON b.route_id = r.id
                WHERE ba.stop_id = %s 
                AND ba.estimated_arrival >= NOW()
                ORDER BY ba.estimated_arrival
                LIMIT %s
            """
            
            cursor.execute(query, (stop_id, limit))
            return cursor.fetchall()

        except Error as e:
            print(f"Error getting bus arrivals: {e}")
            return []
        finally:
            cursor.close()

    def add_user_favorite(self, user_id, route_id, origin_stop_id=None, destination_stop_id=None):
        """Add a route to user favorites"""
        if not self.connection:
            return False

        cursor = self.connection.cursor()
        
        try:
            query = """
                INSERT INTO user_favorites (user_id, route_id, origin_stop_id, destination_stop_id)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
            """
            cursor.execute(query, (user_id, route_id, origin_stop_id, destination_stop_id))
            
            self.connection.commit()
            return True

        except Error as e:
            print(f"Error adding user favorite: {e}")
            return False
        finally:
            cursor.close()

    def get_user_favorites(self, user_id):
        """Get user's favorite routes"""
        if not self.connection:
            return []

        cursor = self.connection.cursor(dictionary=True)
        
        try:
            query = """
                SELECT uf.*, r.name as route_name, r.origin, r.destination,
                       s1.name as origin_stop_name, s2.name as destination_stop_name
                FROM user_favorites uf
                JOIN routes r ON uf.route_id = r.id
                LEFT JOIN stops s1 ON uf.origin_stop_id = s1.id
                LEFT JOIN stops s2 ON uf.destination_stop_id = s2.id
                WHERE uf.user_id = %s
                ORDER BY uf.created_at DESC
            """
            
            cursor.execute(query, (user_id,))
            return cursor.fetchall()

        except Error as e:
            print(f"Error getting user favorites: {e}")
            return []
        finally:
            cursor.close()

# Example usage and data migration
def migrate_sample_data():
    """Migrate sample data from routes.js to database"""
    project_root = os.path.join(os.path.dirname(__file__), '..')
    sys.path.append(project_root)

    try:
        from data.routes import busRoutes
    except ImportError as e:
        print(f"Error importing sample data: {e}")
        return    
    db = DatabaseManager()
    if db.connect():
        db.create_tables()
        
        for route in busRoutes:
            success = db.insert_route(route)
            if success:
                print(f"Successfully migrated route {route['id']}")
            else:
                print(f"Failed to migrate route {route['id']}")
        
        db.disconnect()

if __name__ == "__main__":
    # Test database connection and create tables
    db = DatabaseManager()
    if db.connect():
        print("Database connection successful!")
        db.create_tables()
        db.disconnect()
    else:
        print("Failed to connect to database")

