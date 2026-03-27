import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { BusRouteDetail, BusRouteSummary, BusSearchFilters } from '@app/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private apiUrl = this.resolveBusApiUrl();

  constructor(private http: HttpClient) { }

  searchBuses(filters: BusSearchFilters): Observable<BusRouteSummary[]> {
    const normalizedFilters = {
      departure_city: filters.departure_city.trim(),
      arrival_city: filters.arrival_city.trim(),
      departure_date: filters.departure_date
    };

    const params = new HttpParams({
      fromObject: {
        departure_city: normalizedFilters.departure_city,
        arrival_city: normalizedFilters.arrival_city,
        departure_date: normalizedFilters.departure_date
      }
    });

    return this.http.get<BusRouteSummary[]>(this.apiUrl, { params }).pipe(
      map((routes) => routes.map((route) => this.normalizeRoute(route)))
    );
  }

  getAllBuses(): Observable<BusRouteSummary[]> {
    return this.http.get<BusRouteSummary[]>(this.apiUrl).pipe(
      map((routes) => routes.map((route) => this.normalizeRoute(route)))
    );
  }

  getBusDetails(routeId: string): Observable<BusRouteDetail> {
    return this.http.get<BusRouteDetail>(`${this.apiUrl}/${routeId}`).pipe(
      map((route) => this.normalizeRoute(route) as BusRouteDetail)
    );
  }

  private resolveBusApiUrl(): string {
    if (typeof window === 'undefined') {
      return `${environment.apiUrl}/buses`;
    }

    const host = window.location.hostname || 'localhost';
    const backendHost = host === 'localhost' || host === '127.0.0.1' ? '127.0.0.1' : host;
    return `http://${backendHost}:5000/api/buses`;
  }

  private normalizeRoute<T extends BusRouteSummary | BusRouteDetail>(route: T): T {
    const normalizedId = route.id || route.route_id;

    return {
      ...route,
      id: normalizedId
    };
  }
}
