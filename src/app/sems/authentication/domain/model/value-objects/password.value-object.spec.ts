/**
 * Prueba unitaria: Password (Value Object)
 *
 * Buenas prácticas aplicadas:
 *  - Patrón AAA: Arrange / Act / Assert en cada test
 *  - Un solo expect por caso de prueba (single assertion rule)
 *  - Nombres de test en formato: "debe [comportamiento] cuando [condición]"
 *  - Tests independientes entre sí (sin estado compartido mutable)
 *  - Sin lógica condicional dentro de los tests
 *  - Agrupación por método con describe anidados
 *  - Cobertura de casos: caso feliz, casos límite y casos de error
 */

import { Password } from './password.value-object';

describe('Password', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // constructor
  // ─────────────────────────────────────────────────────────────────────────
  describe('constructor', () => {
    describe('cuando la contraseña es inválida', () => {
      it('debe lanzar un error cuando la contraseña está vacía', () => {
        // Arrange
        const passwordVacia = '';

        // Act & Assert
        expect(() => new Password(passwordVacia))
          .toThrow('Password cannot be empty');
      });

      it('debe lanzar un error cuando la contraseña es null', () => {
        // Arrange
        const passwordNula = null as unknown as string;

        // Act & Assert
        expect(() => new Password(passwordNula))
          .toThrow('Password cannot be empty');
      });

      it('debe lanzar un error cuando la contraseña tiene menos de 6 caracteres', () => {
        // Arrange
        const passwordCorta = 'abc12'; // 5 caracteres

        // Act & Assert
        expect(() => new Password(passwordCorta))
          .toThrow('Password must be at least 6 characters long');
      });
    });

    describe('cuando la contraseña es válida', () => {
      it('debe crearse sin errores con exactamente 6 caracteres (caso límite inferior)', () => {
        // Arrange
        const passwordMinima = 'abc123'; // exactamente 6 chars

        // Act & Assert
        expect(() => new Password(passwordMinima)).not.toThrow();
      });

      it('debe exponer el valor original a través del getter', () => {
        // Arrange
        const valorEsperado = 'MiClave1!';

        // Act
        const password = new Password(valorEsperado);

        // Assert
        expect(password.value).toBe(valorEsperado);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // validateStrength()
  // ─────────────────────────────────────────────────────────────────────────
  describe('validateStrength()', () => {
    describe('cuando la contraseña es débil', () => {
      it('debe indicar que no es fuerte cuando tiene menos de 8 caracteres', () => {
        // Arrange
        const password = new Password('Abc1@2'); // 6 chars válidos pero < 8

        // Act
        const { isStrong } = password.validateStrength();

        // Assert
        expect(isStrong).toBe(false);
      });

      it('debe reportar la razón de longitud cuando tiene menos de 8 caracteres', () => {
        // Arrange
        const password = new Password('Abc1@2');

        // Act
        const { reasons } = password.validateStrength();

        // Assert
        expect(reasons).toContain('Password should be at least 8 characters long');
      });

      it('debe indicar que no es fuerte cuando no tiene mayúsculas', () => {
        // Arrange
        const password = new Password('abcde1@!'); // sin mayúsculas

        // Act
        const { isStrong } = password.validateStrength();

        // Assert
        expect(isStrong).toBe(false);
      });

      it('debe reportar la razón de mayúsculas cuando no tiene ninguna', () => {
        // Arrange
        const password = new Password('abcde1@!');

        // Act
        const { reasons } = password.validateStrength();

        // Assert
        expect(reasons).toContain('Password should contain at least one uppercase letter');
      });

      it('debe indicar que no es fuerte cuando no tiene minúsculas', () => {
        // Arrange
        const password = new Password('ABCDE1@!'); // sin minúsculas

        // Act
        const { isStrong } = password.validateStrength();

        // Assert
        expect(isStrong).toBe(false);
      });

      it('debe indicar que no es fuerte cuando no tiene números', () => {
        // Arrange
        const password = new Password('Abcdefg@'); // sin dígitos

        // Act
        const { isStrong } = password.validateStrength();

        // Assert
        expect(isStrong).toBe(false);
      });

      it('debe indicar que no es fuerte cuando no tiene caracteres especiales', () => {
        // Arrange
        const password = new Password('Abcde123'); // sin especiales

        // Act
        const { isStrong } = password.validateStrength();

        // Assert
        expect(isStrong).toBe(false);
      });

      it('debe retornar múltiples razones cuando falla más de un criterio', () => {
        // Arrange
        const password = new Password('abcdef'); // minúsculas, sin mayúscula, número, especial, < 8

        // Act
        const { reasons } = password.validateStrength();

        // Assert — no verificamos el mensaje exacto, sino que hay más de una razón
        expect(reasons.length).toBeGreaterThan(1);
      });
    });

    describe('cuando la contraseña es fuerte', () => {
      it('debe indicar que es fuerte cuando cumple todos los criterios', () => {
        // Arrange — ≥8 chars, mayúscula, minúscula, número, especial
        const password = new Password('Abcde1@!');

        // Act
        const { isStrong } = password.validateStrength();

        // Assert
        expect(isStrong).toBe(true);
      });

      it('debe retornar una lista de razones vacía cuando es fuerte', () => {
        // Arrange
        const password = new Password('Abcde1@!');

        // Act
        const { reasons } = password.validateStrength();

        // Assert
        expect(reasons).toHaveLength(0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // equals()
  // ─────────────────────────────────────────────────────────────────────────
  describe('equals()', () => {
    it('debe retornar true cuando ambas contraseñas tienen el mismo valor', () => {
      // Arrange
      const p1 = new Password('abc123');
      const p2 = new Password('abc123');

      // Act
      const sonIguales = p1.equals(p2);

      // Assert
      expect(sonIguales).toBe(true);
    });

    it('debe retornar false cuando las contraseñas son distintas', () => {
      // Arrange
      const p1 = new Password('abc123');
      const p2 = new Password('xyz789');

      // Act
      const sonIguales = p1.equals(p2);

      // Assert
      expect(sonIguales).toBe(false);
    });

    it('debe distinguir entre mayúsculas y minúsculas', () => {
      // Arrange
      const p1 = new Password('abc123');
      const p2 = new Password('ABC123');

      // Act
      const sonIguales = p1.equals(p2);

      // Assert
      expect(sonIguales).toBe(false);
    });
  });
});
