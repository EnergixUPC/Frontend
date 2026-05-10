import { User } from './user.entity';

describe('User Entity', () => {
  const makeUser = () =>
    new User(
      '1',
      'iker@sems.com',
      'Iker',
      'Santos',
      'admin',
      true,
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      'Iker',
      '+51 987654321',
      'Av. Lima 123',
      'https://example.com/photo.jpg'
    );

  describe('getFullName()', () => {
    it('debería retornar nombre completo correctamente', () => {
      const user = makeUser();
      expect(user.getFullName()).toBe('Iker Santos');
    });

    it('debería retornar solo el nombre si no hay apellido', () => {
      const user = new User('1','a@b.com','Solo','','user',true,new Date());
      expect(user.getFullName()).toBe('Solo ');
    });
  });

  describe('hasRole()', () => {
    it('debería retornar true si el rol coincide', () => {
      const user = makeUser();
      expect(user.hasRole('admin')).toBe(true);
    });

    it('debería retornar false si el rol no coincide', () => {
      const user = makeUser();
      expect(user.hasRole('user')).toBe(false);
    });
  });

  describe('isAuthenticated()', () => {
    it('debería retornar true cuando isActive es true', () => {
      const user = makeUser();
      expect(user.isAuthenticated()).toBe(true);
    });

    it('debería retornar false cuando isActive es false', () => {
      const user = new User('1','a@b.com','X','Y','user',false,new Date());
      expect(user.isAuthenticated()).toBe(false);
    });
  });

  describe('updateLastLogin()', () => {
    it('debería retornar una nueva instancia con lastLogin actualizado', () => {
      const user = makeUser();
      const updated = user.updateLastLogin();

      expect(updated).not.toBe(user);
      expect(updated.lastLogin).toBeDefined();
      expect(updated.lastLogin!.getTime()).toBeGreaterThanOrEqual(Date.now() - 1000);
    });

    it('debería preservar todos los demás campos', () => {
      const user = makeUser();
      const updated = user.updateLastLogin();

      expect(updated.id).toBe(user.id);
      expect(updated.email).toBe(user.email);
      expect(updated.firstName).toBe(user.firstName);
      expect(updated.role).toBe(user.role);
      expect(updated.profilePhotoUrl).toBe(user.profilePhotoUrl);
    });
  });

  describe('deactivate()', () => {
    it('debería retornar usuario con isActive false', () => {
      const user = makeUser();
      const deactivated = user.deactivate();

      expect(deactivated.isActive).toBe(false);
    });

    it('debería retornar una nueva instancia', () => {
      const user = makeUser();

      expect(user.deactivate()).not.toBe(user);
    });
  });
});
