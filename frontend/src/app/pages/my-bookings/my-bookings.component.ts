import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UserBooking } from '@app/models/api.models';
import { BookingService } from '@app/services/booking.service';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: UserBooking[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = history.state?.['bookingSuccess'] || '';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getUserBookings()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to load your bookings.';
        }
      });
  }

  cancelBooking(bookingId: string): void {
    this.successMessage = '';
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadBookings();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to cancel booking.';
      }
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
