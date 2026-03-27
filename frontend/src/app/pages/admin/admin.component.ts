import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  AdminBookingItem,
  AdminBusItem,
  AdminDashboardStats,
  AdminRouteItem
} from '@app/models/api.models';
import { AdminService } from '@app/services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab: 'overview' | 'buses' | 'routes' | 'bookings' = 'overview';
  dashboard: AdminDashboardStats | null = null;
  buses: AdminBusItem[] = [];
  routes: AdminRouteItem[] = [];
  bookings: AdminBookingItem[] = [];
  busSuccess = '';
  routeSuccess = '';
  pageError = '';
  isLoading = true;
  isSubmittingBus = false;
  isSubmittingRoute = false;

  readonly tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'buses', label: 'Buses' },
    { key: 'routes', label: 'Routes' },
    { key: 'bookings', label: 'Bookings' }
  ] as const;

  busForm = this.fb.nonNullable.group({
    bus_name: ['', Validators.required],
    bus_number: ['', Validators.required],
    bus_type: ['AC Sleeper', Validators.required],
    total_seats: [40, [Validators.required, Validators.min(1)]],
    operator_name: ['', Validators.required],
    amenities: ['WiFi, Charging Port']
  });

  routeForm = this.fb.nonNullable.group({
    bus_id: ['', Validators.required],
    departure_city: ['', Validators.required],
    arrival_city: ['', Validators.required],
    departure_time: ['', Validators.required],
    arrival_time: ['', Validators.required],
    price: [999, [Validators.required, Validators.min(1)]],
    distance: [0],
    duration: ['8h 00m'],
    available_seats: [40, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  setActiveTab(tab: 'overview' | 'buses' | 'routes' | 'bookings'): void {
    this.activeTab = tab;
  }

  loadAdminData(): void {
    this.isLoading = true;
    this.pageError = '';

    forkJoin({
      dashboard: this.adminService.getDashboard(),
      buses: this.adminService.getBuses(),
      routes: this.adminService.getRoutes(),
      bookings: this.adminService.getBookings()
    })
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: ({ dashboard, buses, routes, bookings }) => {
          this.dashboard = dashboard;
          this.buses = buses;
          this.routes = routes;
          this.bookings = bookings;
        },
        error: (error) => {
          this.pageError = error?.error?.message || 'Unable to load admin dashboard. Please log in again.';
          this.buses = [];
          this.routes = [];
          this.bookings = [];
        }
      });
  }

  createBus(): void {
    if (this.busForm.invalid) {
      this.busForm.markAllAsTouched();
      return;
    }

    this.isSubmittingBus = true;
    this.busSuccess = '';
    this.pageError = '';

    const raw = this.busForm.getRawValue();
    this.adminService.createBus({
      ...raw,
      amenities: raw.amenities.split(',').map((item) => item.trim()).filter(Boolean)
    })
      .pipe(finalize(() => {
        this.isSubmittingBus = false;
      }))
      .subscribe({
        next: (response) => {
          this.busSuccess = `Bus created successfully. Bus ID: ${response.bus_id}`;
          this.routeForm.patchValue({
            bus_id: response.bus_id,
            available_seats: raw.total_seats
          });
          this.busForm.reset({
            bus_name: '',
            bus_number: '',
            bus_type: 'AC Sleeper',
            total_seats: 40,
            operator_name: '',
            amenities: 'WiFi, Charging Port'
          });
          this.activeTab = 'buses';
          this.loadAdminData();
        },
        error: (error) => {
          this.pageError = error?.error?.message || 'Unable to create bus.';
        }
      });
  }

  createRoute(): void {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    this.isSubmittingRoute = true;
    this.routeSuccess = '';
    this.pageError = '';
    const raw = this.routeForm.getRawValue();

    this.adminService.createRoute({
      ...raw,
      departure_time: new Date(raw.departure_time).toISOString(),
      arrival_time: new Date(raw.arrival_time).toISOString(),
      distance: raw.distance || null,
      duration: raw.duration || null
    })
      .pipe(finalize(() => {
        this.isSubmittingRoute = false;
      }))
      .subscribe({
        next: (response) => {
          this.routeSuccess = `Route created successfully. Route ID: ${response.route_id}`;
          this.routeForm.reset({
            bus_id: raw.bus_id,
            departure_city: '',
            arrival_city: '',
            departure_time: '',
            arrival_time: '',
            price: 999,
            distance: 0,
            duration: '8h 00m',
            available_seats: 40
          });
          this.activeTab = 'routes';
          this.loadAdminData();
        },
        error: (error) => {
          this.pageError = error?.error?.message || 'Unable to create route.';
        }
      });
  }

  formatDate(value: string | null): string {
    if (!value) {
      return 'Not available';
    }

    return new Date(value).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
