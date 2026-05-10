import type { Config } from 'jest';

/**
 * Configuración de Jest para pruebas unitarias de lógica de dominio pura.
 *
 * Jest solo ejecuta specs ubicados en las capas:
 *   - domain/      (Value Objects, Entities)
 *   - application/ (Services de aplicación sin HttpClient)
 *
 * Los specs de componentes Angular (presentation/) siguen usando
 * Karma + Jasmine a través de `npm test`.
 */
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],

  // Solo buscar specs dentro de domain/ o application/ para evitar
  // archivos que importan @angular/core/testing (incompatibles con Jest)
  testMatch: [
    '**/domain/**/*.spec.ts',
    '**/application/**/*.spec.ts',
  ],

  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/domain/**/*.ts',
    'src/**/application/**/*.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage/jest',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
