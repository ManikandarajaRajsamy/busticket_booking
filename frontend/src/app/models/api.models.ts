export interface UserSession {
  access_token: string;
  user_id: string;
  username: string;
  is_admin: boolean;
}

export interface ApiMessage {
  message: string;
}

export interface AuthRegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface BusSearchFilters {
  departure_city: string;
  arrival_city: string;
  departure_date: string;
}

export interface BusRouteSummary {
  id: string;
  route_id?: string;
  bus_name: string;
  bus_type: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  distance: number | null;
  duration: string | null;
  available_seats: number;
  amenities: string[] | null;
}

export interface BusRouteDetail extends BusRouteSummary {
  bus_id: string;
  bus_number: string;
  total_seats: number;
  operator_name: string;
}

export interface BookingCreatePayload {
  route_id: string;
  seats: string[];
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
}

export interface BookingCreateResponse extends ApiMessage {
  booking_id: string;
  total_price: number;
  status: string;
}

export interface TicketInfo {
  seat_number: string;
  ticket_number: string;
}

export interface UserBooking {
  booking_id: string;
  booking_date: string;
  status: string;
  total_price: number;
  passenger_name: string;
  route: {
    departure_city: string;
    arrival_city: string;
    departure_time: string;
  };
  tickets: TicketInfo[];
}

export interface PaymentPayload {
  booking_id: string;
  amount: number;
  payment_method: string;
}

export interface PaymentResponse extends ApiMessage {
  transaction_id: string;
  status: string;
  amount: number;
}

export interface AdminBusPayload {
  bus_name: string;
  bus_number: string;
  bus_type: string;
  total_seats: number;
  operator_name: string;
  amenities: string[];
}

export interface AdminBusResponse extends ApiMessage {
  bus_id: string;
}

export interface AdminBusItem {
  bus_id: string;
  bus_name: string;
  bus_number: string;
  bus_type: string;
  total_seats: number;
  operator_name: string;
  amenities: string[];
  created_at: string | null;
}

export interface AdminRoutePayload {
  bus_id: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  distance?: number | null;
  duration?: string | null;
  available_seats?: number;
}

export interface AdminRouteResponse extends ApiMessage {
  route_id: string;
}

export interface AdminRouteItem {
  route_id: string;
  bus_id: string;
  bus_name: string;
  bus_number: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  distance: number | null;
  duration: string | null;
  available_seats: number;
}

export interface AdminBookingItem {
  booking_id: string;
  user: string;
  route: string;
  passenger_name: string;
  total_price: number;
  status: string;
  booking_date: string;
}

export interface AdminDashboardStats {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  pending_bookings: number;
  confirmed_bookings: number;
}
