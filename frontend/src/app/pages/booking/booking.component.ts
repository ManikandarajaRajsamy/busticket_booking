import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BusRouteDetail } from '@app/models/api.models';
import { BookingService } from '@app/services/booking.service';
import { BusService } from '@app/services/bus.service';
import { PaymentService } from '@app/services/payment.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  routeDetail: BusRouteDetail | null = null;
  selectedSeats: string[] = [];
  isLoadingRoute = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  bookingForm = this.fb.nonNullable.group({
    passenger_name: ['', Validators.required],
    passenger_email: ['', [Validators.required, Validators.email]],
    passenger_phone: ['', Validators.required],
    payment_method: ['upi', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private busService: BusService,
    private bookingService: BookingService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('routeId');

    if (!routeId) {
      this.errorMessage = 'No route was selected.';
      this.isLoadingRoute = false;
      return;
    }

    this.busService.getBusDetails(routeId)
      .pipe(finalize(() => {
        this.isLoadingRoute = false;
      }))
      .subscribe({
        next: (detail) => {
          this.routeDetail = detail;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to load route details.';
        }
      });
  }

  updateSelectedSeats(seats: string[]): void {
    this.selectedSeats = seats;
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (!this.routeDetail) {
      this.errorMessage = 'Route details are still unavailable.';
      return;
    }

    if (!this.selectedSeats.length) {
      this.errorMessage = 'Select at least one seat before continuing.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { payment_method, ...passengerData } = this.bookingForm.getRawValue();

    this.bookingService.createBooking({
      route_id: this.routeDetail.id,
      seats: this.selectedSeats,
      ...passengerData
    }).subscribe({
      next: (bookingResponse) => {
        this.paymentService.processPayment({
          booking_id: bookingResponse.booking_id,
          amount: bookingResponse.total_price,
          payment_method
        })
          .pipe(finalize(() => {
            this.isSubmitting = false;
          }))
          .subscribe({
            next: (paymentResponse) => {
              this.successMessage = `Payment completed. Transaction ID: ${paymentResponse.transaction_id}`;
              this.router.navigate(['/bookings'], {
                state: {
                  bookingSuccess: this.successMessage
                }
              });
            },
            error: (error) => {
              this.errorMessage = error?.error?.message || 'Booking was created but payment failed.';
            }
          });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'Unable to create booking.';
      }
    });
  }

  get totalAmount(): number {
    return this.routeDetail ? this.selectedSeats.length * this.routeDetail.price : 0;
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
