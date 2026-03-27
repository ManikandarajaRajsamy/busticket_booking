# RedBus India Clone

A full-stack web application for online bus ticket booking, mimicking RedBus India's core features.

## Tech Stack
- Frontend: Angular 16+ with TypeScript
- Backend: Python with Flask
- Database: SQLite for local development
- Authentication: JWT tokens

## Project Structure

### Frontend (`/frontend`)
Angular application with pages for:
- User registration and login
- Bus search and filtering
- Seat selection and booking
- User booking history
- Admin management module with tabs for buses, routes, and bookings

### Backend (`/backend`)
Python Flask REST API with:
- User management endpoints
- Bus and route management
- Booking management
- Payment processing
- Admin-only features protected by `is_admin`

### Database (`/database`)
Schema and reference files for the booking system.

## Getting Started

### Run Locally
1. Start backend:
   `cd backend && python run.py`
2. Start frontend:
   `cd frontend && npm start`
3. Open the app at `http://localhost:4200`

## Notes
- Admin users are stored in the database through the `users.is_admin` field.
- Regular users do not see the Admin tab in the application.
- The header shows the logged-in username instead of the user ID.
- Existing SQLite databases are auto-updated to include the `is_admin` field.

## API Documentation
See `backend/API_DOCS.md` for endpoint documentation.
