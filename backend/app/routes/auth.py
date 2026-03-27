"""
Authentication routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy import func, or_
from app import db
from app.models import User
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['username', 'email', 'password']):
        return jsonify({'message': 'Missing required fields'}), 400

    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']

    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.query.filter(func.lower(User.username) == username.lower()).first():
        return jsonify({'message': 'Username already exists'}), 409
    
    if User.query.filter(func.lower(User.email) == email).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user = User(
        username=username,
        email=email,
        password_hash=password_hash,
        first_name=(data.get('first_name') or '').strip() or None,
        last_name=(data.get('last_name') or '').strip() or None,
        phone=(data.get('phone') or '').strip() or None,
        is_admin=False
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user_id': str(user.id),
        'username': user.username,
        'is_admin': user.is_admin
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['username', 'password']):
        return jsonify({'message': 'Missing username or password'}), 400

    identifier = data['username'].strip()
    password = data['password']

    if not identifier or not password:
        return jsonify({'message': 'Missing username or password'}), 400
    
    user = User.query.filter(
        or_(
            func.lower(User.username) == identifier.lower(),
            func.lower(User.email) == identifier.lower()
        )
    ).first()
    
    if not user:
        return jsonify({'message': 'Account not found. Use your username or registered email.'}), 401

    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
        return jsonify({'message': 'Incorrect password'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'user_id': str(user.id),
        'username': user.username,
        'is_admin': user.is_admin
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """User logout"""
    return jsonify({'message': 'Logged out successfully'}), 200
