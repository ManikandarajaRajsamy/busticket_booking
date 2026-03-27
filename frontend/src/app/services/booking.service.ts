import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiMessage, BookingCreatePayload, BookingCreateResponse, UserBooking } from '@app/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = this.resolveApiUrl();

  constructor(private http: HttpClient) { }

  createBooking(bookingData: BookingCreatePayload): Observable<BookingCreateResponse> {
    return this.http.post<BookingCreateResponse>(this.apiUrl, bookingData);
  }

  getUserBookings(): Observable<UserBooking[]> {
    return this.http.get<UserBooking[]>(this.apiUrl);
  }

  cancelBooking(bookingId: string): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${this.apiUrl}/${bookingId}/cancel`, {});
  }

  private resolveApiUrl(): string {
    if (typeof window === 'undefined') {
      return `${environment.apiUrl}/bookings`;
    }

    const host = window.location.hostname || 'localhost';
    const backendHost = host === 'localhost' || host === '127.0.0.1' ? '127.0.0.1' : host;
    return `http://${backendHost}:5000/api/bookings`;
  }
}
