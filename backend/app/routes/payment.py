"""
Payment processing routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Payment, Booking
import uuid

payment_bp = Blueprint('payments', __name__)


@payment_bp.route('', methods=['POST'], strict_slashes=False)
@payment_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def process_payment():
    """Process payment for a booking"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    if not all(key in data for key in ['booking_id', 'amount', 'payment_method']):
        return jsonify({'message': 'Missing required fields'}), 400

    booking = Booking.query.filter_by(id=data['booking_id'], user_id=user_id).first()
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    payment = Payment(
        booking_id=booking.id,
        amount=data['amount'],
        payment_method=data['payment_method'],
        transaction_id=f"TXN{uuid.uuid4().hex[:12].upper()}",
        status='completed'
    )

    booking.status = 'confirmed'

    db.session.add(payment)
    db.session.commit()

    return jsonify({
        'transaction_id': payment.transaction_id,
        'status': 'completed',
        'amount': payment.amount,
        'message': 'Payment processed successfully'
    }), 200


@payment_bp.route('/<booking_id>', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_payment_status(booking_id):
    """Get payment status for a booking"""
    user_id = get_jwt_identity()
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()

    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    payments = Payment.query.filter_by(booking_id=booking_id).all()

    result = []
    for payment in payments:
        result.append({
            'transaction_id': payment.transaction_id,
            'amount': payment.amount,
            'payment_method': payment.payment_method,
            'status': payment.status,
            'created_at': payment.created_at.isoformat()
        })

    return jsonify(result), 200
