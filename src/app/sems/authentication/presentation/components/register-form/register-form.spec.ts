import { DEVICE_PREFERENCE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device-preference.repository.provider';
import { DEVICE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device.repository.provider';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterForm } from './register-form';
import { AuthControllerService } from '../../../application/services/auth-controller.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('RegisterForm', () => {
  let component: RegisterForm;
  let fixture: ComponentFixture<RegisterForm>;
  let authControllerMock: any;
  let authStateSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    authStateSubject = new BehaviorSubject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });

    authControllerMock = {
      authState$: authStateSubject.asObservable(),
      register: jasmine.createSpy('register'),
      clearAuthError: jasmine.createSpy('clearAuthError')
    };

    await TestBed.configureTestingModule({
      imports: [
        RegisterForm,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AuthControllerService, useValue: authControllerMock },
        TranslateService
      , provideHttpClient(), provideHttpClientTesting(), provideRouter([]), DEVICE_REPOSITORY_PROVIDER, DEVICE_PREFERENCE_REPOSITORY_PROVIDER]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('US01 - Escenario 2: Datos inválidos', () => {
    it('debería rechazar el registro e informar los errores cuando los datos son inválidos', () => {
      // Act
      component.onSubmit();

      // Assert
      expect(component.registerForm.valid).toBe(false);
      expect(authControllerMock.register).not.toHaveBeenCalled();
    });

    it('debería rechazar el registro cuando las contraseñas no coinciden', () => {
      // Arrange
      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password1234!',
        phoneNumber: '+51 987654321',
        address: '123 Main St, City'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.registerForm.valid).toBe(false);
      expect(component.registerForm.hasError('passwordMismatch', ['confirmPassword'])).toBe(true);
      expect(authControllerMock.register).not.toHaveBeenCalled();
    });
  });

  describe('US01 - Escenario 1: Registro válido', () => {
    it('debería crear la cuenta cuando confirmo mi registro con datos completos y válidos', fakeAsync(() => {
      // Arrange
      authControllerMock.register.and.returnValue(of(void 0));
      spyOn(component.onRegisterSuccess, 'emit');

      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phoneNumber: '+51 987654321',
        address: '123 Main St, City'
      });

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(component.registerForm.valid).toBe(true);
      expect(authControllerMock.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        phoneNumber: '+51 987654321',
        address: '123 Main St, City'
      });
      expect(component.onRegisterSuccess.emit).toHaveBeenCalled();
    }));
  });

  describe('US01 - Escenario 3: Correo duplicado', () => {
    it('debería rechazar el proceso cuando un correo ya está registrado', fakeAsync(() => {
      // Arrange
      const errorResponse = new Error('Email already registered');
      authControllerMock.register.and.returnValue(throwError(() => errorResponse));
      spyOn(component.onRegisterError, 'emit');

      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phoneNumber: '+51 987654321',
        address: '123 Main St, City'
      });

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(authControllerMock.register).toHaveBeenCalled();
      expect(component.onRegisterError.emit).toHaveBeenCalledWith('Email already registered');
    }));
  });
});
