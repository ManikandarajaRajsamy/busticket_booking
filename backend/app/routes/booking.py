"""
Booking management routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Booking, Ticket, BusRoute
import uuid

booking_bp = Blueprint('bookings', __name__)


@booking_bp.route('', methods=['POST'], strict_slashes=False)
@booking_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_booking():
    """Create a new booking"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    if not all(key in data for key in ['route_id', 'seats', 'passenger_name', 'passenger_email', 'passenger_phone']):
        return jsonify({'message': 'Missing required fields'}), 400

    route = BusRoute.query.filter_by(id=data['route_id']).first()
    if not route:
        return jsonify({'message': 'Route not found'}), 404

    total_price = route.price * len(data['seats'])

    booking = Booking(
        user_id=user_id,
        route_id=data['route_id'],
        total_price=total_price,
        passenger_name=data['passenger_name'],
        passenger_email=data['passenger_email'],
        passenger_phone=data['passenger_phone'],
        status='pending'
    )

    db.session.add(booking)
    db.session.flush()

    for seat in data['seats']:
        ticket = Ticket(
            booking_id=booking.id,
            seat_number=seat,
            passenger_name=data['passenger_name'],
            ticket_number=f"TKT{uuid.uuid4().hex[:10].upper()}"
        )
        db.session.add(ticket)

    db.session.commit()

    return jsonify({
        'booking_id': str(booking.id),
        'total_price': total_price,
        'status': 'pending',
        'message': 'Booking created successfully'
    }), 201


@booking_bp.route('', methods=['GET'], strict_slashes=False)
@booking_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_user_bookings():
    """Get user's bookings"""
    user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=user_id).all()

    result = []
    for booking in bookings:
        result.append({
            'booking_id': str(booking.id),
            'booking_date': booking.booking_date.isoformat(),
            'status': booking.status,
            'total_price': booking.total_price,
            'passenger_name': booking.passenger_name,
            'route': {
                'departure_city': booking.route.departure_city,
                'arrival_city': booking.route.arrival_city,
                'departure_time': booking.route.departure_time.isoformat()
            },
            'tickets': [{'seat_number': t.seat_number, 'ticket_number': t.ticket_number} for t in booking.tickets]
        })

    return jsonify(result), 200


@booking_bp.route('/<booking_id>/cancel', methods=['POST'], strict_slashes=False)
@jwt_required()
def cancel_booking(booking_id):
    """Cancel a booking"""
    user_id = get_jwt_identity()
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()

    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    if booking.status == 'cancelled':
        return jsonify({'message': 'Booking already cancelled'}), 400

    booking.status = 'cancelled'
    db.session.commit()

    return jsonify({'message': 'Booking cancelled successfully'}), 200
