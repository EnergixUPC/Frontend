import { DEVICE_PREFERENCE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device-preference.repository.provider';
import { DEVICE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device.repository.provider';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { LoginCredentials } from './login-credentials.value-object';

describe('LoginCredentials Value Object', () => {
  describe('constructor', () => {
    it('debería crear credenciales válidas', () => {
      expect(() => new LoginCredentials('user@sems.com', 'pass123')).not.toThrow();
    });

    it('debería lanzar error si username está vacío', () => {
      expect(() => new LoginCredentials('', 'pass123')).toThrow(new Error('Username cannot be empty'));
    });

    it('debería lanzar error si password está vacío', () => {
      expect(() => new LoginCredentials('user', '')).toThrow(new Error('Password cannot be empty'));
    });
  });

  describe('isEmail()', () => {
    it('debería retornar true para un email válido', () => {
      const creds = new LoginCredentials('user@sems.com', 'pass');
      expect(creds.isEmail()).toBe(true);
    });

    it('debería retornar false para un username sin @', () => {
      const creds = new LoginCredentials('username', 'pass');
      expect(creds.isEmail()).toBe(false);
    });

    it('debería retornar false para email malformado', () => {
      const creds = new LoginCredentials('user@', 'pass');
      expect(creds.isEmail()).toBe(false);
    });
  });

  describe('getUsernameNormalized()', () => {
    it('debería retornar el username en minúsculas y sin espacios', () => {
      const creds = new LoginCredentials('  USER@SEMS.COM  ', 'pass');
      expect(creds.getUsernameNormalized()).toBe('user@sems.com');
    });
  });
});
