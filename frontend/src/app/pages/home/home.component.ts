import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BusRouteSummary } from '@app/models/api.models';
import { BusService } from '@app/services/bus.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  searchForm = this.fb.nonNullable.group({
    departure_city: ['', Validators.required],
    arrival_city: ['', Validators.required],
    departure_date: ['', Validators.required]
  });

  results: BusRouteSummary[] = [];
  isLoading = false;
  errorMessage = '';
  hasSearched = false;

  constructor(
    private fb: FormBuilder,
    private busService: BusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.searchForm.patchValue({
      departure_date: today.toISOString().split('T')[0]
    });
  }

  searchRoutes(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;

    const filters = this.searchForm.getRawValue();

    this.busService.searchBuses(filters)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (routes) => {
          const matchedRoutes = routes.filter((route) =>
            this.matchesFilters(route, filters.departure_city, filters.arrival_city, filters.departure_date)
          );

          if (matchedRoutes.length) {
            this.results = matchedRoutes;
            return;
          }

          this.loadRoutesFromClientFallback(filters.departure_city, filters.arrival_city, filters.departure_date);
        },
        error: (error) => {
          this.loadRoutesFromClientFallback(
            filters.departure_city,
            filters.arrival_city,
            filters.departure_date,
            error?.error?.message || 'Unable to load buses right now.'
          );
        }
      });
  }

  private loadRoutesFromClientFallback(
    departureCity: string,
    arrivalCity: string,
    selectedDate: string,
    fallbackErrorMessage = ''
  ): void {
    this.busService.getAllBuses().subscribe({
      next: (routes) => {
        this.results = routes.filter((route) =>
          this.matchesFilters(route, departureCity, arrivalCity, selectedDate)
        );
        this.errorMessage = this.results.length ? '' : fallbackErrorMessage;
      },
      error: () => {
        this.results = [];
        this.errorMessage = fallbackErrorMessage || 'Unable to load buses right now.';
      }
    });
  }

  private matchesFilters(route: BusRouteSummary, departureCity: string, arrivalCity: string, selectedDate: string): boolean {
    return this.normalizeCity(route.departure_city) === this.normalizeCity(departureCity) &&
      this.normalizeCity(route.arrival_city) === this.normalizeCity(arrivalCity) &&
      this.matchesSelectedDate(route, selectedDate);
  }

  private matchesSelectedDate(route: BusRouteSummary, selectedDate: string): boolean {
    const departureDate = route.departure_time.split('T')[0];
    const arrivalDate = route.arrival_time.split('T')[0];

    return selectedDate === departureDate || selectedDate === arrivalDate;
  }

  private normalizeCity(value: string): string {
    return value.trim().toLowerCase();
  }

  bookRoute(routeId: string): void {
    this.router.navigate(['/booking', routeId]);
  }

  getAmenities(route: BusRouteSummary): string[] {
    return route.amenities ?? [];
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}
