import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Register } from './register';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthControllerService } from '../../../application/services/auth-controller.service';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Register View', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let routerMock: any;
  let snackBarMock: any;
  let authControllerMock: any;

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    snackBarMock = {
      open: jasmine.createSpy('open')
    };

    authControllerMock = {
      authState$: new BehaviorSubject({}).asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [
        Register,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: AuthControllerService, useValue: authControllerMock },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onRegisterSuccess', () => {
    it('should show success snackbar and navigate to login after delay', fakeAsync(() => {
      // Act
      component.onRegisterSuccess();

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'auth.register.success',
        '',
        { duration: 3000, panelClass: ['success-snackbar'] }
      );

      // Verify it hasn't navigated yet
      expect(routerMock.navigate).not.toHaveBeenCalled();

      // Fast forward 1 second
      tick(1000);

      // Verify navigation happened
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    }));
  });

  describe('onRegisterError', () => {
    it('should show error snackbar', () => {
      // Arrange
      const errorMessage = 'Email already exists';

      // Act
      component.onRegisterError(errorMessage);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        errorMessage,
        'common.close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });
  });
});
