import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddDevice } from './add-device';
import { DevicesService } from '../../../application/services/devices.service';
import { DashboardService } from '../../../application/services/dashboard.service';
import { CategoryService } from '../../../application/services/category.service';
import { LocationService } from '../../../application/services/location.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { DeviceStatus } from '../../../domain/model/device.entity';

describe('AddDevice', () => {
  let component: AddDevice;
  let fixture: ComponentFixture<AddDevice>;
  let devicesServiceMock: any;
  let dashboardServiceMock: any;
  let categoryServiceMock: any;
  let locationServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    devicesServiceMock = {
      createDevice: jasmine.createSpy('createDevice')
    };

    dashboardServiceMock = {
      getDashboardState: jasmine.createSpy('getDashboardState').and.returnValue(of({ devices: [] }))
    };

    categoryServiceMock = {
      getCategories: jasmine.createSpy('getCategories').and.returnValue(of([
        { id: 1, name: 'General' },
        { id: 2, name: 'Entretenimiento' }
      ]))
    };

    locationServiceMock = {
      getLocations: jasmine.createSpy('getLocations').and.returnValue(of([
        { id: 1, name: 'Sala' },
        { id: 2, name: 'Dormitorio' }
      ]))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [
        AddDevice,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DevicesService, useValue: devicesServiceMock },
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: LocationService, useValue: locationServiceMock },
        { provide: Router, useValue: routerMock },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddDevice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('US05 - Escenario 1: Dispositivo detectado (vinculación exitosa)', () => {
    it('debería vincular el dispositivo exitosamente y redirigir a devices', fakeAsync(() => {
      // Arrange
      devicesServiceMock.createDevice.and.returnValue(of({}));

      component.deviceForm.patchValue({
        name: 'Smart TV',
        category: 'Entretenimiento',
        status: DeviceStatus.ON,
        location: 'Sala',
        power: 120,
        isActive: true
      });

      // Act
      component.onSave();
      tick();

      // Assert
      expect(component.deviceForm.valid).toBe(true);
      expect(devicesServiceMock.createDevice).toHaveBeenCalled();

      const args = devicesServiceMock.createDevice.calls.mostRecent().args[0];
      expect(args.name).toBe('Smart TV');
      expect(args.category).toBe('Entretenimiento');
      expect(args.power).toBe(120);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/devices']);
      expect(component.saving).toBe(false);
    }));
  });

  describe('US05 - Escenario 2: Dispositivo no compatible (error de conexión)', () => {
    it('debería rechazar la conexión, no redirigir y mostrar un error cuando el servicio falla', fakeAsync(() => {
      // Arrange
      devicesServiceMock.createDevice.and.returnValue(throwError(() => new Error('Not compatible')));

      component.deviceForm.patchValue({
        name: 'Unknown Device',
        category: 'Desconocido',
        status: DeviceStatus.OFF,
        location: 'Dormitorio',
        power: 15,
        isActive: false
      });

      // Act
      component.onSave();
      tick();

      // Assert
      expect(devicesServiceMock.createDevice).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(component.saving).toBe(false);
      expect(component.error).not.toBeNull();
    }));

    it('debería rechazar el formulario si tiene datos inválidos', () => {
      // Arrange
      component.deviceForm.patchValue({
        name: '', // Required
        power: -5 // Invalid
      });

      // Act
      component.onSave();

      // Assert
      expect(component.deviceForm.valid).toBe(false);
      expect(devicesServiceMock.createDevice).not.toHaveBeenCalled();
    });
  });
});
