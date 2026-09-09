import { Provider } from '@angular/core';
import { Reloj } from '../../domain/shared/ports/reloj';
import { SellarEvento } from '../../application/diagnostico/sellar-evento';
import { RelojSistema } from '../tiempo/reloj-sistema';
import { RELOJ, SELLAR_EVENTO } from './tokens';

/**
 * Proveedores de infraestructura para la gestión del tiempo y diagnóstico.
 * Resuelven los puertos de dominio y casos de uso mediante adaptadores concretos.
 */
export const proveedoresTiempo: Provider[] = [
  {
    provide: RELOJ,
    useClass: RelojSistema,
  },
  {
    provide: SELLAR_EVENTO,
    useFactory: (reloj: Reloj) => new SellarEvento(reloj),
    deps: [RELOJ],
  },
];
