import { Reloj } from '../../domain/shared/ports/reloj';
import { SelloDeTiempo } from '../../domain/shared/model/sello-de-tiempo';

export interface EventoSellado {
  descripcion: string;
  sello: SelloDeTiempo;
}

/**
 * Caso de uso puro de aplicación encargado de registrar un evento de diagnóstico
 * sellándolo con el instante temporal provisto por el puerto Reloj.
 *
 * Sigue la regla hexagonal: es una clase plana de TypeScript sin dependencias de framework.
 */
export class SellarEvento {
  constructor(private readonly reloj: Reloj) {}

  public ejecutar(descripcion: string): EventoSellado {
    const ahoraMs = this.reloj.ahora();
    const sello = new SelloDeTiempo(ahoraMs);
    return {
      descripcion,
      sello,
    };
  }
}
