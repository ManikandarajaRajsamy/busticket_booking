import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isPublicBusRequest = request.url.includes('/api/buses');
    const isPublicAuthRequest =
      request.url.includes('/api/auth/login') ||
      request.url.includes('/api/auth/register');

    if (!isPublicBusRequest && !isPublicAuthRequest) {
      const token = localStorage.getItem('token');
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const tokenExpired = error.status === 401 && (
          error.error?.msg === 'Token has expired' ||
          error.error?.msg === 'Missing Authorization Header'
        );

        if (tokenExpired) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          void this.router.navigate(['/login'], {
            queryParams: {
              reason: 'session-expired'
            }
          });
        }

        return throwError(() => error);
      })
    );
  }
}
