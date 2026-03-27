"""Compatibility wrapper for the Flask application package."""

from app import create_app, db, jwt

__all__ = ['create_app', 'db', 'jwt']
