/**
 * Fixture de prueba de arquitectura:
 * Capa domain importando vitest (válido según Enmienda D-1: lista negra).
 * NO debe marcarse como infracción.
 */
import { describe, expect, it } from 'vitest';

describe('domain fixture vitest', () => {
  it('es legal bajo lista negra', () => {
    expect(1 + 1).toBe(2);
  });
});
