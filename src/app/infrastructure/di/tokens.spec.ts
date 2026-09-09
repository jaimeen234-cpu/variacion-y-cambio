import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { appConfig } from '../../app.config';
import * as tokensModulo from './tokens';

describe('Resolución de InjectionTokens contra appConfig real (T-8 / RF-7.3)', () => {
  // Se deriva dinámicamente la lista de tokens exportados del módulo, sin lista estática escrita a mano.
  const entradasTokens = Object.entries(tokensModulo).filter(
    (entrada): entrada is [string, InjectionToken<unknown>] => entrada[1] instanceof InjectionToken
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers],
    });
  });

  it('debe encontrar al menos un InjectionToken exportado en tokens.ts', () => {
    expect(entradasTokens.length).toBeGreaterThan(0);
  });

  for (const [nombre, token] of entradasTokens) {
    it(`debe resolver el token '${nombre}' utilizando la configuración real de la aplicación`, () => {
      const instancia = TestBed.inject(token, null);
      expect(instancia, `El token '${nombre}' no tiene proveedor registrado en appConfig.providers`).not.toBeNull();
      expect(instancia).toBeDefined();
    });
  }

  it('verifica exhaustivamente que ningún token exportado quede sin proveedor en appConfig', () => {
    for (const [nombre, token] of entradasTokens) {
      expect(
        () => TestBed.inject(token),
        `El token '${nombre}' debe resolverse sin lanzar error de proveedor faltante`
      ).not.toThrow();
    }
  });
});
