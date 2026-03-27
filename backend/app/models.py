"""SQLAlchemy models for the RedBus clone."""

from datetime import datetime
import uuid

from app import db


ID_LENGTH = 36


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.LargeBinary(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    first_name = db.Column(db.String(80), nullable=True)
    last_name = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

    bookings = db.relationship('Booking', backref='user', lazy=True)


class Bus(db.Model):
    __tablename__ = 'buses'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    bus_name = db.Column(db.String(120), nullable=False)
    bus_number = db.Column(db.String(20), unique=True, nullable=False)
    bus_type = db.Column(db.String(50), nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    amenities = db.Column(db.JSON, nullable=True)
    operator_name = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    routes = db.relationship('BusRoute', backref='bus', lazy=True)
    seats = db.relationship('Seat', backref='bus', lazy=True)


class BusRoute(db.Model):
    __tablename__ = 'bus_routes'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    bus_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('buses.id'), nullable=False)
    departure_city = db.Column(db.String(120), nullable=False)
    arrival_city = db.Column(db.String(120), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)
    price = db.Column(db.Float, nullable=False)
    distance = db.Column(db.Float, nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    available_seats = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    bookings = db.relationship('Booking', backref='route', lazy=True)


class Seat(db.Model):
    __tablename__ = 'seats'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    bus_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('buses.id'), nullable=False)
    seat_number = db.Column(db.String(10), nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    seat_type = db.Column(db.String(20), nullable=False)

    __table_args__ = (db.UniqueConstraint('bus_id', 'seat_number', name='uq_bus_seat'),)


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('users.id'), nullable=False)
    route_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('bus_routes.id'), nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    total_price = db.Column(db.Float, nullable=False)
    passenger_name = db.Column(db.String(120), nullable=False)
    passenger_email = db.Column(db.String(120), nullable=False)
    passenger_phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tickets = db.relationship('Ticket', backref='booking', lazy=True)
    payments = db.relationship('Payment', backref='booking', lazy=True)


class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    booking_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('bookings.id'), nullable=False)
    seat_number = db.Column(db.String(10), nullable=False)
    passenger_name = db.Column(db.String(120), nullable=False)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    booking_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')
    transaction_id = db.Column(db.String(100), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.String(ID_LENGTH), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('users.id'), nullable=False)
    bus_id = db.Column(db.String(ID_LENGTH), db.ForeignKey('buses.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    review_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
