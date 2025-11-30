import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthControllerService, LoginCommand } from '../../../application/services/auth-controller.service';
import { AuthState } from '../../../application/services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})
export class LoginForm implements OnInit, OnDestroy {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() loginError = new EventEmitter<string>();

  loginForm!: FormGroup;
  hidePassword = true;
  authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authController: AuthControllerService,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.subscribeToAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  private subscribeToAuthState(): void {
    this.authController.getCurrentAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState = state;

        if (state.isAuthenticated && !state.isLoading) {
          this.loginSuccess.emit();
        }

        if (state.error) {
          this.loginError.emit(state.error);
        }
      });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      const command: LoginCommand = {
        email,
        password
      };

      this.authController.executeLogin(command).subscribe({
        next: (result) => {
          console.log('Login successful:', result);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login error:', error);
          // Error handling is managed by the auth state subscription
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  clearError(): void {
    this.authController.clearAuthError();
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return this.translate.instant('auth.login.errors.required');
    }

    if (field.errors['email']) {
      return this.translate.instant('auth.login.errors.email');
    }

    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return this.translate.instant('auth.login.errors.minLength', { length: requiredLength });
    }

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Translation helper methods
  get emailLabel(): string {
    return this.translate.instant('auth.login.email');
  }

  get passwordLabel(): string {
    return this.translate.instant('auth.login.password');
  }

  get emailPlaceholder(): string {
    return this.translate.instant('auth.login.emailPlaceholder');
  }

  get passwordPlaceholder(): string {
    return this.translate.instant('auth.login.passwordPlaceholder');
  }

  get loginButtonText(): string {
    return this.translate.instant('auth.login.loginButton');
  }

  get loadingText(): string {
    return this.translate.instant('auth.login.loading');
  }
}
