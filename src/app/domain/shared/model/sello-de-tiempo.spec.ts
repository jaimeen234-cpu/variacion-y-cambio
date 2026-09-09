import { describe, expect, it } from 'vitest';
import { SelloDeTiempo, SelloDeTiempoInvalidoError } from './sello-de-tiempo';

describe('SelloDeTiempo (Value Object)', () => {
  it('debe aceptar un valor de milisegundos válido y exponer su representación ISO', () => {
    const epochZero = new SelloDeTiempo(0);
    expect(epochZero.milisegundos).toBe(0);
    expect(epochZero.aIso()).toBe('1970-01-01T00:00:00.000Z');
    expect(epochZero.iso).toBe('1970-01-01T00:00:00.000Z');

    const fechaFija = new SelloDeTiempo(1700000000000);
    expect(fechaFija.milisegundos).toBe(1700000000000);
    expect(fechaFija.aIso()).toBe('2023-11-14T22:13:20.000Z');
  });

  it('debe rechazar valores negativos con un error tipado SelloDeTiempoInvalidoError', () => {
    expect(() => new SelloDeTiempo(-1)).toThrow(SelloDeTiempoInvalidoError);
    expect(() => new SelloDeTiempo(-500)).toThrow(SelloDeTiempoInvalidoError);
  });

  it('debe rechazar valores no finitos (NaN, Infinity, -Infinity) con SelloDeTiempoInvalidoError', () => {
    expect(() => new SelloDeTiempo(NaN)).toThrow(SelloDeTiempoInvalidoError);
    expect(() => new SelloDeTiempo(Infinity)).toThrow(SelloDeTiempoInvalidoError);
    expect(() => new SelloDeTiempo(-Infinity)).toThrow(SelloDeTiempoInvalidoError);
  });
});
