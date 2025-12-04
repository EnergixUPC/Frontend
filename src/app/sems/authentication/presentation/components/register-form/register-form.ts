import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthControllerService } from '../../../application/services/auth-controller.service';
import { AuthState } from '../../../application/services/auth.service';

export interface RegisterCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css'
})
export class RegisterForm implements OnInit, OnDestroy {
  @Output() onRegisterSuccess = new EventEmitter<void>();
  @Output() onRegisterError = new EventEmitter<string>();

  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
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
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.strongPasswordValidator]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, this.phoneValidator]],
      address: ['', [Validators.required, Validators.minLength(10)]]
    }, { validators: this.passwordMatchValidator });
  }

  private strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const valid = hasNumber && hasUpper && hasLower && password.length >= 8;

    if (!valid) {
      return { strongPassword: true };
    }

    return null;
  }

  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    const phone = control.value;
    if (!phone) return null;

    // Validar formato de teléfono peruano (+51 seguido de 9 dígitos)
    const phonePattern = /^\+51\s?[0-9]{9}$/;

    if (!phonePattern.test(phone)) {
      return { phone: true };
    }

    return null;
  }

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove the error if passwords match
      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }

    return null;
  }

  private subscribeToAuthState(): void {
    this.authController.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState = state;

        if (state.error) {
          this.onRegisterError.emit(
            this.translate.instant(state.error) || 'Error en el registro. Intenta nuevamente.'
          );
        }
      });
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.authState.isLoading) {
      const formValue = this.registerForm.value;
      const registerCommand: RegisterCommand = {
        firstName: formValue.firstName.trim(),
        lastName: formValue.lastName.trim(),
        email: formValue.email.trim().toLowerCase(),
        password: formValue.password,
        phoneNumber: formValue.phoneNumber.trim(),
        address: formValue.address.trim()
      };

      this.authController.register(registerCommand)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.onRegisterSuccess.emit();
          },
          error: (error) => {
            console.error('Register error:', error);
            this.onRegisterError.emit(
              error.message || this.translate.instant('auth.register.failed') || 'Error en el registro'
            );
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);

    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translate.instant(`auth.register.errors.${fieldName}.required`) || `${fieldName} es requerido`;
      }

      if (control.errors['email']) {
        return this.translate.instant('auth.register.errors.email.invalid') || 'Email inválido';
      }

      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return this.translate.instant(`auth.register.errors.${fieldName}.minlength`) ||
               `Mínimo ${requiredLength} caracteres`;
      }

      if (control.errors['strongPassword']) {
        return this.translate.instant('auth.register.errors.password.weak') ||
               'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números';
      }

      if (control.errors['passwordMismatch']) {
        return this.translate.instant('auth.register.errors.confirmPassword.mismatch') ||
               'Las contraseñas no coinciden';
      }

      if (control.errors['phone']) {
        return this.translate.instant('auth.register.errors.phone.invalid') ||
               'Formato: +51 seguido de 9 dígitos';
      }
    }

    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  clearError(): void {
    this.authController.clearAuthError();
  }
}
