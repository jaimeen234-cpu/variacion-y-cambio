import { Reloj } from '../../domain/shared/ports/reloj';

/**
 * Adaptador de prueba y simulación que devuelve un instante fijo y determinista.
 * Invariante: nunca retrocede en el tiempo ni admite valores no finitos.
 */
export class RelojFijo implements Reloj {
  private instanteActual: number;

  constructor(instanteInicial: number = 0) {
    if (!Number.isFinite(instanteInicial) || instanteInicial < 0) {
      throw new Error(`El instante inicial debe ser un número finito no negativo: ${instanteInicial}`);
    }
    this.instanteActual = instanteInicial;
  }

  public ahora(): number {
    return this.instanteActual;
  }

  public fijar(nuevoInstante: number): void {
    if (!Number.isFinite(nuevoInstante) || nuevoInstante < this.instanteActual) {
      throw new Error(
        `El reloj fijo no puede retroceder en el tiempo. Instante actual: ${this.instanteActual}, nuevo: ${nuevoInstante}`
      );
    }
    this.instanteActual = nuevoInstante;
  }

  public avanzarMilisegundos(deltaMs: number): void {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) {
      throw new Error(`El incremento de tiempo debe ser un número finito no negativo: ${deltaMs}`);
    }
    this.instanteActual += deltaMs;
  }
}
