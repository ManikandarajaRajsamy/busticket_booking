"""Compatibility wrapper for application models."""

from app.models import Booking, Bus, BusRoute, Payment, Review, Seat, Ticket, User

__all__ = ['User', 'Bus', 'BusRoute', 'Seat', 'Booking', 'Ticket', 'Payment', 'Review']
