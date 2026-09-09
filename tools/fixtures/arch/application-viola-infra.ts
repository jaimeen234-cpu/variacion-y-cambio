/**
 * Fixture de prueba de arquitectura:
 * Capa application importando infrastructure (infracción esperada según TRD §4 y RF-3.4).
 */
import { RelojSistema } from '../../../src/app/infrastructure/tiempo/reloj-sistema';

export const reloj = new RelojSistema();
