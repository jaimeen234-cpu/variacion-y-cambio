/**
 * Fixture de prueba de arquitectura:
 * Capa domain usando import type (válido según RF-3.3: no crea acoplamiento en runtime).
 * NO debe marcarse como infracción.
 */
import type { Signal } from '@angular/core';
import type { RelojSistema } from '../../../src/app/infrastructure/tiempo/reloj-sistema';

export type MiSignal = Signal<number>;
export type MiReloj = RelojSistema;
