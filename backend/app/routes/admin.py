"""
Admin-only routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Bus, BusRoute, Booking, User
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


def ensure_admin():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    return None


def format_duration(departure_time: datetime, arrival_time: datetime) -> str:
    duration_minutes = int((arrival_time - departure_time).total_seconds() // 60)
    hours, minutes = divmod(max(duration_minutes, 0), 60)
    return f'{hours}h {minutes:02d}m'

@admin_bp.route('/buses', methods=['GET'])
@jwt_required()
def get_all_buses():
    """Get all buses for admin management."""
    access_error = ensure_admin()
    if access_error:
        return access_error

    buses = Bus.query.order_by(Bus.created_at.desc()).all()

    result = []
    for bus in buses:
        result.append({
            'bus_id': str(bus.id),
            'bus_name': bus.bus_name,
            'bus_number': bus.bus_number,
            'bus_type': bus.bus_type,
            'total_seats': bus.total_seats,
            'operator_name': bus.operator_name,
            'amenities': bus.amenities or [],
            'created_at': bus.created_at.isoformat() if bus.created_at else None
        })

    return jsonify(result), 200

@admin_bp.route('/buses', methods=['POST'])
@jwt_required()
def create_bus():
    """Create a new bus (admin only)"""
    access_error = ensure_admin()
    if access_error:
        return access_error

    data = request.get_json()
    
    if not all(key in data for key in ['bus_name', 'bus_number', 'bus_type', 'total_seats', 'operator_name']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    bus = Bus(
        bus_name=data['bus_name'],
        bus_number=data['bus_number'],
        bus_type=data['bus_type'],
        total_seats=data['total_seats'],
        operator_name=data['operator_name'],
        amenities=data.get('amenities', [])
    )
    
    db.session.add(bus)
    db.session.commit()
    
    return jsonify({'bus_id': str(bus.id), 'message': 'Bus created successfully'}), 201

@admin_bp.route('/routes', methods=['GET'])
@jwt_required()
def get_all_routes():
    """Get all routes for admin management."""
    access_error = ensure_admin()
    if access_error:
        return access_error

    routes = BusRoute.query.order_by(BusRoute.departure_time.desc()).all()

    result = []
    for route in routes:
        result.append({
            'route_id': str(route.id),
            'bus_id': str(route.bus_id),
            'bus_name': route.bus.bus_name,
            'bus_number': route.bus.bus_number,
            'departure_city': route.departure_city,
            'arrival_city': route.arrival_city,
            'departure_time': route.departure_time.isoformat(),
            'arrival_time': route.arrival_time.isoformat(),
            'price': route.price,
            'distance': route.distance,
            'duration': route.duration,
            'available_seats': route.available_seats
        })

    return jsonify(result), 200

@admin_bp.route('/routes', methods=['POST'])
@jwt_required()
def create_route():
    """Create a bus route (admin only)"""
    access_error = ensure_admin()
    if access_error:
        return access_error

    data = request.get_json()
    
    required_fields = ['bus_id', 'departure_city', 'arrival_city', 'departure_time', 'arrival_time', 'price']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    departure_time = datetime.fromisoformat(data['departure_time'])
    arrival_time = datetime.fromisoformat(data['arrival_time'])

    if arrival_time <= departure_time:
        return jsonify({'message': 'Arrival time must be later than departure time'}), 400

    route = BusRoute(
        bus_id=data['bus_id'],
        departure_city=data['departure_city'],
        arrival_city=data['arrival_city'],
        departure_time=departure_time,
        arrival_time=arrival_time,
        price=data['price'],
        distance=data.get('distance'),
        duration=data.get('duration') or format_duration(departure_time, arrival_time),
        available_seats=data.get('available_seats', 50)
    )
    
    db.session.add(route)
    db.session.commit()
    
    return jsonify({'route_id': str(route.id), 'message': 'Route created successfully'}), 201

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_all_bookings():
    """Get all bookings (admin only)"""
    access_error = ensure_admin()
    if access_error:
        return access_error

    bookings = Booking.query.all()
    
    result = []
    for booking in bookings:
        result.append({
            'booking_id': str(booking.id),
            'user': booking.user.username,
            'route': f"{booking.route.departure_city} -> {booking.route.arrival_city}",
            'passenger_name': booking.passenger_name,
            'total_price': booking.total_price,
            'status': booking.status,
            'booking_date': booking.booking_date.isoformat()
        })
    
    return jsonify(result), 200

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    access_error = ensure_admin()
    if access_error:
        return access_error

    total_users = User.query.count()
    total_bookings = Booking.query.count()
    total_revenue = db.session.query(db.func.sum(Booking.total_price)).scalar() or 0
    
    return jsonify({
        'total_users': total_users,
        'total_bookings': total_bookings,
        'total_revenue': float(total_revenue),
        'pending_bookings': Booking.query.filter_by(status='pending').count(),
        'confirmed_bookings': Booking.query.filter_by(status='confirmed').count()
    }), 200
