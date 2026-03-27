import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: (session) => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const fallbackUrl = session.is_admin ? '/admin' : '/';
          const destination = session.is_admin && returnUrl && returnUrl !== '/admin'
            ? '/admin'
            : returnUrl || fallbackUrl;

          this.router.navigateByUrl(destination);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
        }
      });
  }
}
