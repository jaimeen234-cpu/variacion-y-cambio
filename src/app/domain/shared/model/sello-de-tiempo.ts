/**
 * Error de dominio lanzado cuando se intenta instanciar un SelloDeTiempo
 * con un valor inválido (negativo o no finito).
 */
export class SelloDeTiempoInvalidoError extends Error {
  constructor(public readonly valorInvalido: number) {
    super(
      `El sello de tiempo debe ser un número finito no negativo en milisegundos desde epoch. Valor recibido: ${valorInvalido}`
    );
    this.name = 'SelloDeTiempoInvalidoError';
  }
}

/**
 * Value Object inmutable que representa un instante temporal en milisegundos desde Unix Epoch.
 * Garantiza determinismo y validación de rangos según la regla del dominio.
 */
export class SelloDeTiempo {
  public readonly milisegundos: number;

  constructor(milisegundos: number) {
    if (!Number.isFinite(milisegundos) || milisegundos < 0) {
      throw new SelloDeTiempoInvalidoError(milisegundos);
    }
    this.milisegundos = milisegundos;
  }

  /**
   * Devuelve la representación en formato ISO 8601 en UTC.
   */
  public aIso(): string {
    return new Date(this.milisegundos).toISOString();
  }

  public get iso(): string {
    return this.aIso();
  }

  public esIgual(otro: SelloDeTiempo): boolean {
    return this.milisegundos === otro.milisegundos;
  }
}
