"""Flask application factory and configuration."""

from datetime import timedelta
from pathlib import Path
import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

db = SQLAlchemy()
jwt = JWTManager()


DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
]


def get_database_url() -> str:
    """Resolve the configured database URL with Vercel-safe defaults."""
    database_url = os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'redbus.db'}")

    # Hosted Postgres providers sometimes expose postgres:// URLs.
    if database_url.startswith('postgres://'):
        return database_url.replace('postgres://', 'postgresql://', 1)

    return database_url


def get_allowed_origins() -> list[str]:
    """Return the allowed CORS origins for local and deployed environments."""
    configured_origins = os.getenv('CORS_ORIGINS', '')
    origins = [origin.strip() for origin in configured_origins.split(',') if origin.strip()]

    if os.getenv('VERCEL_URL'):
        vercel_origin = f"https://{os.environ['VERCEL_URL']}"
        if vercel_origin not in origins:
            origins.append(vercel_origin)

    if os.getenv('VERCEL_PROJECT_PRODUCTION_URL'):
        production_origin = f"https://{os.environ['VERCEL_PROJECT_PRODUCTION_URL']}"
        if production_origin not in origins:
            origins.append(production_origin)

    return origins or DEFAULT_ALLOWED_ORIGINS


def sync_schema() -> None:
    """Apply lightweight schema updates for local SQLite development."""
    inspector = db.inspect(db.engine)

    if 'users' not in inspector.get_table_names():
        return

    user_columns = {column['name'] for column in inspector.get_columns('users')}

    if 'is_admin' not in user_columns:
        db.session.execute(db.text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
        db.session.commit()


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)

    access_token_hours = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_HOURS', '12'))

    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_url()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv(
        'JWT_SECRET_KEY',
        'your-secret-key-change-in-production'
    )
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=access_token_hours)

    db.init_app(app)
    jwt.init_app(app)
    CORS(
        app,
        resources={
            r"/api/*": {
                'origins': get_allowed_origins(),
                'methods': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                'allow_headers': ['Authorization', 'Content-Type'],
                'expose_headers': ['Authorization', 'Content-Type']
            }
        }
    )

    @app.get('/')
    def index():
        return {
            'message': 'RedBus backend is running',
            'health': '/api/health',
            'api_docs': '/api/auth/register, /api/auth/login, /api/buses/'
        }, 200

    @app.get('/api/health')
    def health():
        return {
            'status': 'ok',
            'service': 'redbus-backend'
        }, 200

    from app.routes import admin_bp, auth_bp, booking_bp, bus_bp, payment_bp
    from app import models  # noqa: F401

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(bus_bp, url_prefix='/api/buses')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    with app.app_context():
        db.create_all()
        sync_schema()

    return app
