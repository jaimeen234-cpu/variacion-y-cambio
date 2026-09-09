import { InjectionToken } from '@angular/core';
import { Reloj } from '../../domain/shared/ports/reloj';
import { SellarEvento } from '../../application/diagnostico/sellar-evento';

/**
 * Token de inyección para el puerto de dominio Reloj.
 */
export const RELOJ = new InjectionToken<Reloj>('RELOJ');

/**
 * Token de inyección para el caso de uso SellarEvento.
 */
export const SELLAR_EVENTO = new InjectionToken<SellarEvento>('SELLAR_EVENTO');
