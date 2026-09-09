/**
 * Fixture de prueba de arquitectura:
 * Capa domain importando @angular/core (infracción esperada según TRD §4 y RF-3.2).
 */
import { signal } from '@angular/core';

export const valor = signal(0);
