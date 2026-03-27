# RedBus Clone API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string"
  }
  ```

#### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "string",
    "user_id": "string"
  }
  ```

### Buses

#### Search Buses
- **GET** `/buses`
- **Query Parameters:**
  - `departure_city`: string
  - `arrival_city`: string
  - `departure_date`: YYYY-MM-DD

#### Get Bus Details
- **GET** `/buses/<route_id>`

### Bookings

#### Create Booking
- **POST** `/bookings` (requires authentication)
- **Body:**
  ```json
  {
    "route_id": "string",
    "seats": ["seat_number"],
    "passenger_name": "string",
    "passenger_email": "string",
    "passenger_phone": "string"
  }
  ```

#### Get User Bookings
- **GET** `/bookings` (requires authentication)

#### Cancel Booking
- **POST** `/bookings/<booking_id>/cancel` (requires authentication)

### Payments

#### Process Payment
- **POST** `/payments` (requires authentication)
- **Body:**
  ```json
  {
    "booking_id": "string",
    "amount": "number",
    "payment_method": "string"
  }
  ```

#### Get Payment Status
- **GET** `/payments/<booking_id>` (requires authentication)

### Admin

#### Create Bus
- **POST** `/admin/buses` (requires authentication + admin role)

#### Create Route
- **POST** `/admin/routes` (requires authentication + admin role)

#### Get All Bookings
- **GET** `/admin/bookings` (requires authentication + admin role)

#### Dashboard Stats
- **GET** `/admin/dashboard` (requires authentication + admin role)

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "Username already exists"
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Server Error
