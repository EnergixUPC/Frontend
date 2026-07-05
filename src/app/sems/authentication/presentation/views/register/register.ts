import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { RegisterForm } from '../../components/register-form/register-form';
import { AuthControllerService } from '../../../application/services/auth-controller.service';
import { ExperimentService } from '../../../../../shared/infrastructure/services/experiment.service';

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
  /** US25: cuando se llega desde /demo, muestra un resumen de la sesión simulada. */
  fromDemo = false;
  demoWeeklyKwh: number | null = null;
  demoSavingsPct: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private authController: AuthControllerService,
    private experimentService: ExperimentService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state
      ?? (typeof window !== 'undefined' ? window.history.state : null);
    if (state?.['fromDemo']) {
      this.fromDemo = true;
      this.demoWeeklyKwh = state['weeklyKwh'] ?? null;
      this.demoSavingsPct = state['savingsPct'] ?? null;
    }

    // Q1: cubre el flujo variante A (control), que llega directo del landing a /register?exp_visitor=...
    // sin pasar por /demo. Adopta el visitorId y calienta la cache de variante antes del registro.
    const expVisitor = this.route.snapshot.queryParamMap.get('exp_visitor');
    if (expVisitor) {
      this.experimentService.adoptVisitorId(expVisitor);
      this.experimentService.getVariant('demo-onboarding').subscribe();
    }
  }

  onRegisterSuccess(): void {
    console.log('Register View - Registration success handler called');

    // Q6/Q1: cierra el ciclo de medición de conversión (demo->registro y landing->registro).
    this.experimentService.track('demo-conversion', 'signup_completed', { fromDemo: this.fromDemo });
    this.experimentService.track('demo-onboarding', 'signup_completed');

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