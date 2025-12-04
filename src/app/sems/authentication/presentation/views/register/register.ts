import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { RegisterForm } from '../../components/register-form/register-form';
import { AuthControllerService } from '../../../application/services/auth-controller.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RegisterForm
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private authController: AuthControllerService
  ) { }

  onRegisterSuccess(): void {
    console.log('Register View - Registration success handler called');

    const successMessage = this.translate.instant('auth.register.success') || 'Usuario registrado exitosamente!';
    console.log('Register View - Showing success message:', successMessage);

    this.snackBar.open(successMessage, '', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });

    console.log('Register View - Will navigate to login in 1 second...');

    setTimeout(() => {
      console.log('Register View - Navigating to login...');
      this.navigateToLogin();
    }, 1000);
  }

  onRegisterError(error: string): void {
    console.error('Register View - Registration error handler called:', error);

    this.snackBar.open(error, this.translate.instant('common.close') || 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  navigateToLogin(): void {
    console.log('Register View - Navigating to /auth/login...');
    this.router.navigate(['/auth/login']);
  }
}