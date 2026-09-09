import { Reloj } from '../../domain/shared/ports/reloj';

/**
 * Adaptador de producción que lee el reloj en tiempo real del sistema.
 */
export class RelojSistema implements Reloj {
  public ahora(): number {
    return Date.now();
  }
}
