import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DevicesService } from '../../../application/services/devices.service';
import { DashboardService } from '../../../application/services/dashboard.service';
import { Device, DeviceStatus } from '../../../domain/model/device.entity';

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
  uniqueCategories: string[] = [];
  isStatusDropdownOpen = false;
  isCategoryDropdownOpen = false;
  filteredCategories: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly devicesService: DevicesService,
    private readonly dashboardService: DashboardService,
    private readonly router: Router,
    private readonly translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.deviceForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ\-]+$/)
      ]],
      category: ['', [
        Validators.required,
        Validators.maxLength(25),
        Validators.pattern(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ\-]+$/)
      ]],
      status: [DeviceStatus.OFF, [Validators.required]],
      location: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      power: [null, [
        Validators.required,
        Validators.min(0),
        Validators.max(20000)
      ]],
      isActive: [false]
    });

    this.deviceForm.get('category')?.valueChanges.subscribe(value => {
      if (!value) {
        this.filteredCategories = [...this.uniqueCategories];
      } else {
        const lower = value.toLowerCase();
        this.filteredCategories = this.uniqueCategories.filter(c =>
          c.toLowerCase().includes(lower)
        );
      }
    });
  }

  private loadCategories(): void {
    this.dashboardService.getDashboardState().subscribe(state => {
      const devices = state.devices || [];
      const cats = devices
        .map(d => d.category)
        .filter((c): c is string => !!c && c.trim().length > 0);
      this.uniqueCategories = [...new Set(cats)];
      this.filteredCategories = [...this.uniqueCategories];
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

  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  selectStatus(status: string): void {
    this.deviceForm.patchValue({ status: status });
    this.isStatusDropdownOpen = false;
  }

  selectCategory(cat: string): void {
    this.deviceForm.patchValue({ category: cat });
    this.isCategoryDropdownOpen = false;
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
