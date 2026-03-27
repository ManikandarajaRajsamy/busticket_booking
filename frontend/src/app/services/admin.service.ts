import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AdminBookingItem,
  AdminBusItem,
  AdminBusPayload,
  AdminBusResponse,
  AdminDashboardStats,
  AdminRouteItem,
  AdminRoutePayload,
  AdminRouteResponse
} from '@app/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  createBus(payload: AdminBusPayload): Observable<AdminBusResponse> {
    return this.http.post<AdminBusResponse>(`${this.apiUrl}/buses`, payload);
  }

  getBuses(): Observable<AdminBusItem[]> {
    return this.http.get<AdminBusItem[]>(`${this.apiUrl}/buses`);
  }

  createRoute(payload: AdminRoutePayload): Observable<AdminRouteResponse> {
    return this.http.post<AdminRouteResponse>(`${this.apiUrl}/routes`, payload);
  }

  getRoutes(): Observable<AdminRouteItem[]> {
    return this.http.get<AdminRouteItem[]>(`${this.apiUrl}/routes`);
  }

  getDashboard(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getBookings(): Observable<AdminBookingItem[]> {
    return this.http.get<AdminBookingItem[]>(`${this.apiUrl}/bookings`);
  }
}
