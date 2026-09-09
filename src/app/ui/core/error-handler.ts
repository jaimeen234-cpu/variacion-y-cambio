import { ErrorHandler, Injectable, inject, signal } from '@angular/core';
import { SELLAR_EVENTO } from '../../infrastructure/di/tokens';
import { EventoSellado } from '../../application/diagnostico/sellar-evento';

/**
 * Manejador global de errores no controlados.
 * Integra la captura de excepciones con el sellado de eventos de diagnóstico
 * y expone el estado reactivo para renderizar la pantalla de error.
 */
@Injectable({
  providedIn: 'root',
})
export class ManejadorErrorGlobal implements ErrorHandler {
  private readonly sellarEvento = inject(SELLAR_EVENTO);
  readonly errorActivo = signal<EventoSellado | null>(null);

  handleError(error: unknown): void {
    const mensaje = error instanceof Error ? error.message : String(error);
    const evento = this.sellarEvento.ejecutar(`Excepción no controlada: ${mensaje}`);
    this.errorActivo.set(evento);

    // Registro técnico con contexto en console.error (nunca expuesto en pantalla al usuario)
    console.error('[Error No Controlado - Diagnóstico]', {
      error,
      sello: evento.sello.iso,
      descripcion: evento.descripcion,
    });
  }

  limpiar(): void {
    this.errorActivo.set(null);
  }
}
