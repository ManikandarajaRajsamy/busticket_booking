# Environment Setup Guide

## Prerequisites

- Node.js v16+ and npm
- Python 3.8+
- PostgreSQL 12+

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   ng serve
   ```
   Application will be available at `http://localhost:4200`

## Backend Setup

1. Create virtual environment:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   copy .env.example .env
   ```

4. Update database connection string in `.env`

5. Run the application:
   ```bash
   python run.py
   ```
   API will be available at `http://localhost:5000`

## Database Setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE redbus_db;
   CREATE USER redbus_user WITH PASSWORD 'password';
   ALTER ROLE redbus_user SET client_encoding TO 'utf8';
   ALTER ROLE redbus_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE redbus_user SET default_transaction_deferrable TO on;
   ALTER ROLE redbus_user SET default_transaction_read_uncommitted TO off;
   GRANT ALL PRIVILEGES ON DATABASE redbus_db TO redbus_user;
   ```

2. Run schema migration:
   ```bash
   psql -U redbus_user -d redbus_db -f database/schema.sql
   ```

## Troubleshooting

### Port Already in Use
- Frontend: Change port in `angular.json` or use `ng serve --port 4201`
- Backend: Change port in `run.py` or set environment variable

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string in `.env`
- Ensure database user has proper permissions
