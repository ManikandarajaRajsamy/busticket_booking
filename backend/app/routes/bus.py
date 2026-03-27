"""
Bus and route management routes
"""

from datetime import datetime
from difflib import SequenceMatcher

from flask import Blueprint, request, jsonify
from sqlalchemy import func

from app.models import BusRoute

bus_bp = Blueprint('buses', __name__)


def format_duration(departure_time: datetime, arrival_time: datetime) -> str:
    duration_minutes = int((arrival_time - departure_time).total_seconds() // 60)
    hours, minutes = divmod(max(duration_minutes, 0), 60)
    return f'{hours}h {minutes:02d}m'


def normalize_city(value: str) -> str:
    return ' '.join((value or '').strip().lower().split())


def city_matches(route_city: str, requested_city: str) -> bool:
    normalized_route = normalize_city(route_city)
    normalized_requested = normalize_city(requested_city)

    if not normalized_requested:
        return True

    if normalized_route == normalized_requested:
        return True

    if normalized_requested in normalized_route or normalized_route in normalized_requested:
        return True

    return SequenceMatcher(None, normalized_route, normalized_requested).ratio() >= 0.72


@bus_bp.route('', methods=['GET'], strict_slashes=False)
@bus_bp.route('/', methods=['GET'], strict_slashes=False)
def get_buses():
    """Get all buses with filtering"""
    departure_city = (request.args.get('departure_city') or '').strip()
    arrival_city = (request.args.get('arrival_city') or '').strip()
    departure_date = (request.args.get('departure_date') or '').strip()

    query = BusRoute.query.order_by(BusRoute.departure_time.asc())

    if departure_date:
        try:
            datetime.strptime(departure_date, '%Y-%m-%d')
            query = query.filter(
                (func.date(BusRoute.departure_time) == departure_date) |
                (func.date(BusRoute.arrival_time) == departure_date)
            )
        except ValueError:
            return jsonify({'message': 'Invalid departure date format. Use YYYY-MM-DD.'}), 400

    routes = query.all()

    if departure_city:
        routes = [route for route in routes if city_matches(route.departure_city, departure_city)]
    if arrival_city:
        routes = [route for route in routes if city_matches(route.arrival_city, arrival_city)]

    result = []
    for route in routes:
        result.append({
            'id': str(route.id),
            'route_id': str(route.id),
            'bus_name': route.bus.bus_name,
            'bus_type': route.bus.bus_type,
            'departure_city': route.departure_city,
            'arrival_city': route.arrival_city,
            'departure_time': route.departure_time.isoformat(),
            'arrival_time': route.arrival_time.isoformat(),
            'price': route.price,
            'distance': route.distance,
            'duration': route.duration or format_duration(route.departure_time, route.arrival_time),
            'available_seats': route.available_seats,
            'amenities': route.bus.amenities
        })

    return jsonify(result), 200


@bus_bp.route('/<route_id>', methods=['GET'], strict_slashes=False)
def get_bus_detail(route_id):
    """Get specific bus route details"""
    route = BusRoute.query.filter_by(id=route_id).first()

    if not route:
        return jsonify({'message': 'Route not found'}), 404

    return jsonify({
        'id': str(route.id),
        'route_id': str(route.id),
        'bus_id': str(route.bus_id),
        'bus_name': route.bus.bus_name,
        'bus_number': route.bus.bus_number,
        'bus_type': route.bus.bus_type,
        'total_seats': route.bus.total_seats,
        'departure_city': route.departure_city,
        'arrival_city': route.arrival_city,
        'departure_time': route.departure_time.isoformat(),
        'arrival_time': route.arrival_time.isoformat(),
        'price': route.price,
        'available_seats': route.available_seats,
        'amenities': route.bus.amenities,
        'operator_name': route.bus.operator_name
    }), 200
