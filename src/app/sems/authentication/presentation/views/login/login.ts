import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { LoginForm } from '../../components/login-form/login-form';
import { AuthControllerService } from '../../../application/services/auth-controller.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    LoginForm
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private authController: AuthControllerService
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authController.isAuthenticated()) {
      this.navigateToDashboard();
    }
  }

  onLoginSuccess(): void {
    const successMessage = this.translate.instant('auth.login.success') || 'Login successful!';
    this.snackBar.open(successMessage, '', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    
    setTimeout(() => {
      this.navigateToDashboard();
    }, 1000);
  }

  onLoginError(error: string): void {
    this.snackBar.open(error, this.translate.instant('common.close') || 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private navigateToDashboard(): void {
    // Navigate to home instead of dashboard
    this.router.navigate(['/home']);
  }
}
