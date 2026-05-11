import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DevicesService } from '../../../application/services/devices.service';
import { DashboardService } from '../../../application/services/dashboard.service';
import { CategoryService } from '../../../application/services/category.service';
import { LocationService } from '../../../application/services/location.service';
import { Device, DeviceStatus } from '../../../domain/model/device.entity';
import { Category } from '../../../domain/model/category.entity';
import { Location } from '../../../domain/model/location.entity';

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-device.html',
  styleUrl: './add-device.css'
})
export class AddDevice implements OnInit {
  deviceForm!: FormGroup;
  saving = false;
  error: string | null = null;

  // Dropdown state
  isStatusDropdownOpen = false;
  isCategoryDropdownOpen = false;
  isLocationDropdownOpen = false;

  // Data lists
  categories: Category[] = [];
  locations: Location[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly devicesService: DevicesService,
    private readonly dashboardService: DashboardService,
    private readonly categoryService: CategoryService,
    private readonly locationService: LocationService,
    private readonly router: Router,
    private readonly translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadLocations();
  }

  private initForm(): void {
    this.deviceForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ\-]+$/)
      ]],
      category: ['', [Validators.required]],
      status: [DeviceStatus.OFF, [Validators.required]],
      location: ['', [Validators.required]],
      power: [null, [
        Validators.required,
        Validators.min(0),
        Validators.max(20000)
      ]],
      isActive: [false]
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  private loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locs) => {
        this.locations = locs;
      },
      error: () => {
        this.locations = [];
      }
    });
  }

  get titleText(): string {
    return this.translateService.instant('dashboard.devices.addDeviceTitle');
  }

  get saveText(): string {
    return this.translateService.instant('dashboard.devices.addDeviceSave');
  }

  get cancelText(): string {
    return this.translateService.instant('dashboard.devices.addDeviceCancel');
  }

  // --- Status dropdown ---
  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
    this.isCategoryDropdownOpen = false;
    this.isLocationDropdownOpen = false;
  }

  selectStatus(status: string): void {
    this.deviceForm.patchValue({ status });
    this.isStatusDropdownOpen = false;
  }

  // --- Category dropdown ---
  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    this.isStatusDropdownOpen = false;
    this.isLocationDropdownOpen = false;
  }

  selectCategory(cat: Category): void {
    this.deviceForm.patchValue({ category: cat.name });
    this.isCategoryDropdownOpen = false;
  }

  get selectedCategoryName(): string {
    const val = this.deviceForm.get('category')?.value;
    return val || this.translateService.instant('dashboard.devices.selectCategory');
  }

  // --- Location dropdown ---
  toggleLocationDropdown(): void {
    this.isLocationDropdownOpen = !this.isLocationDropdownOpen;
    this.isStatusDropdownOpen = false;
    this.isCategoryDropdownOpen = false;
  }

  selectLocation(loc: Location): void {
    this.deviceForm.patchValue({ location: loc.name });
    this.isLocationDropdownOpen = false;
  }

  get selectedLocationName(): string {
    const val = this.deviceForm.get('location')?.value;
    return val || this.translateService.instant('dashboard.devices.selectLocation');
  }

  onCancel(): void {
    this.router.navigate(['/devices']);
  }

  onSave(): void {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const formVal = this.deviceForm.value;

    const newDevice: Device = {
      id: Date.now().toString(),
      name: formVal.name,
      category: formVal.category,
      type: 'UNKNOWN',
      brand: 'Sin asignar',
      model: 'Sin asignar',
      status: formVal.status as DeviceStatus,
      realTimeStatus: formVal.status,
      lastActive: 'Now',
      location: formVal.location,
      isActive: formVal.isActive ? 1 : 0,
      power: formVal.power ?? undefined
    };

    this.devicesService.createDevice(newDevice).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/devices']);
      },
      error: () => {
        this.saving = false;
        this.error = this.translateService.instant('dashboard.devices.addDeviceError');
      }
    });
  }
}
