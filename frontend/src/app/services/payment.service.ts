import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PaymentPayload, PaymentResponse } from '@app/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = this.resolveApiUrl();

  constructor(private http: HttpClient) { }

  processPayment(paymentData: PaymentPayload): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, paymentData);
  }

  getPaymentStatus(bookingId: string): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/${bookingId}`);
  }

  private resolveApiUrl(): string {
    if (typeof window === 'undefined') {
      return `${environment.apiUrl}/payments`;
    }

    const host = window.location.hostname || 'localhost';
    const backendHost = host === 'localhost' || host === '127.0.0.1' ? '127.0.0.1' : host;
    return `http://${backendHost}:5000/api/payments`;
  }
}
