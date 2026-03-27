# Python Backend - Flask Application

## Project Structure

```text
backend/
|-- app/
|   |-- __init__.py      # Flask app factory and extension setup
|   |-- models.py        # SQLAlchemy models
|   `-- routes/
|       |-- __init__.py  # Blueprint exports
|       |-- auth.py      # Authentication endpoints
|       |-- bus.py       # Bus search endpoints
|       |-- booking.py   # Booking management
|       |-- payment.py   # Payment processing
|       `-- admin.py     # Admin endpoints
|-- app.py               # Compatibility wrapper
|-- models.py            # Compatibility wrapper
|-- run.py               # Application entry point
|-- requirements.txt     # Core local-development dependencies
|-- .env.example         # Environment variables template
`-- API_DOCS.md          # API documentation
```

## Dependencies

Main packages:
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- Flask-JWT-Extended
- bcrypt
- python-dotenv

Optional for PostgreSQL:
- Install a PostgreSQL driver such as `psycopg2-binary` only when you switch `DATABASE_URL` from SQLite to PostgreSQL.

## Getting Started

1. Create a virtual environment.
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env`.
4. Start the API: `python run.py`

## Local Development Defaults

- The backend now defaults to SQLite via `sqlite:///redbus.db`, so it can boot locally without a PostgreSQL server.
- If you already have PostgreSQL configured, replace `DATABASE_URL` in `.env` with your Postgres connection string and install a PostgreSQL driver.
- The API allows frontend requests from `http://localhost:4200`.

## Database Models

- `User`: authentication and profile data
- `Bus`: bus information and operator details
- `BusRoute`: schedule and pricing for routes
- `Seat`: per-bus seat inventory
- `Booking`: passenger reservations
- `Ticket`: ticket records for booked seats
- `Payment`: payment transaction records
- `Review`: ratings and reviews

## API Features

- User authentication with JWT tokens
- Bus search and filtering
- Booking management
- Payment processing
- Admin dashboard and statistics
