# RedBus India Clone - Development Guide

## Project Overview
Full-stack RedBus India clone application built with:
- **Frontend**: Angular (TypeScript)
- **Backend**: Python Flask with SQLAlchemy ORM
- **Database**: PostgreSQL

## Project Structure
```
├── frontend/          # Angular application
├── backend/           # Python Flask application
├── database/          # PostgreSQL schemas and migrations
└── README.md          # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js and npm (v16+)
- Python 3.8+
- PostgreSQL 12+

### Frontend Setup
```bash
cd frontend
npm install
ng serve  # Runs on http://localhost:4200
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python run.py  # Runs on http://localhost:5000
```

### Database Setup
1. Create PostgreSQL database
2. Run migration scripts from `database/` folder
3. Update backend `.env` with database connection

## Key Features
- User authentication and registration
- Bus search and filtering
- Seat management and booking
- Payment processing
- Booking history
- Admin panel
