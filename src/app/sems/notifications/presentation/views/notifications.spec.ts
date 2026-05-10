import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationsComponent } from './notifications';
import { NotificationService } from '../../infrastructure/notifications.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NotificationEntity } from '../../domain/model/notifications.entity';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let notificationServiceMock: any;

  const mockNotifications: NotificationEntity[] = [
    {
      id: '1',
      title: 'Alerta: consumo elevado',
      message: 'El dispositivo "Aire Acondicionado" superó su consumo.',
      timestamp: new Date().toISOString(),
      type: 'error',
      isRead: false,
      read: false
    },
    {
      id: '2',
      title: 'Sistema',
      message: 'Historial de alertas actualizado',
      timestamp: new Date().toISOString(),
      type: 'info',
      isRead: true,
      read: true
    }
  ];

  beforeEach(async () => {
    notificationServiceMock = {
      getNotifications: jest.fn().mockReturnValue(of(mockNotifications)),
      markAsRead: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [
        NotificationsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('US07 - Escenario 2: Registro de alerta en historial', () => {
    it('debería cargar el historial de notificaciones correctamente', () => {
      // Assert
      expect(notificationServiceMock.getNotifications).toHaveBeenCalled();
      expect(component.notifications.length).toBe(2);
      expect(component.unreadCount).toBe(1);
    });

    it('debería visualizar el popup de notificaciones al hacer toggle', () => {
      // Act
      component.toggleNotifications();

      // Assert
      expect(component.showNotifications).toBe(true);
      expect(document.body.classList.contains('show-notifications')).toBe(true);
      expect(notificationServiceMock.getNotifications).toHaveBeenCalledTimes(2); // Initial load + toggle load
    });
  });

  describe('US07 - Escenario 1: Envío de alerta por exceso de consumo', () => {
    it('debería manejar las notificaciones no leídas y permitir marcarlas como leídas', () => {
      // Arrange
      const alertNotification = component.notifications[0]; // ALERT type
      expect(alertNotification.read).toBe(false);

      // Act
      component.markAsRead(alertNotification);

      // Assert
      expect(notificationServiceMock.markAsRead).toHaveBeenCalledWith(alertNotification);
      expect(alertNotification.read).toBe(true);
      expect(component.unreadCount).toBe(0); // since the only unread was marked as read
    });

    it('no debería llamar al servicio si la notificación ya está leída', () => {
      // Arrange
      const infoNotification = component.notifications[1]; // INFO type
      expect(infoNotification.read).toBe(true);

      // Act
      component.markAsRead(infoNotification);

      // Assert
      expect(notificationServiceMock.markAsRead).not.toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    it('debería cerrar el popup al hacer click fuera', () => {
      // Arrange
      component.showNotifications = true;
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: document.createElement('div') });

      // Act
      component.onDocumentClick(event);

      // Assert
      expect(component.showNotifications).toBe(false);
    });
  });
});
