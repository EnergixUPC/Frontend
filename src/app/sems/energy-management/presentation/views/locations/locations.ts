import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '../../../domain/model/location.entity';
import { LocationService } from '../../../application/services/location.service';
import { AuthControllerService } from '../../../../authentication/application/services/auth-controller.service';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css'
})
export class Locations implements OnInit, OnDestroy {
  locations: Location[] = [];
  loading = true;
  saving = false;
  error: string | null = null;
  saveError: string | null = null;
  saveSuccess = false;

  locationForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly locationService: LocationService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly authController: AuthControllerService
  ) {}

  ngOnInit(): void {
    if (!this.authController.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
    this.loadLocations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLocations(): void {
    this.loading = true;
    this.error = null;
    this.locationService.getLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locs) => {
          this.locations = locs;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = this.translateService.instant('dashboard.devices.locationError');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onAddLocation(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.saveError = null;
    this.saveSuccess = false;
    const name = this.locationForm.value.name.trim();

    this.locationService.createLocation(name)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.saveSuccess = true;
          this.locationForm.reset();
          this.loadLocations();
        },
        error: () => {
          this.saving = false;
          this.saveError = this.translateService.instant('dashboard.devices.locationError');
          this.cdr.detectChanges();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/devices']);
  }
}
