import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSession } from '@app/models/api.models';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'RedBus Clone';
  currentUser$: Observable<UserSession | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(user: UserSession | null): boolean {
    return !!user?.is_admin;
  }

  displayName(user: UserSession | null): string {
    return user?.username || 'Account';
  }

  homeLink(user: UserSession | null): string {
    return user?.is_admin ? '/admin' : '/';
  }
}
