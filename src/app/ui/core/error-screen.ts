import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EventoSellado } from '../../application/diagnostico/sellar-evento';

@Component({
  selector: 'vc-error-screen',
  standalone: true,
  template: `
    <div class="vc-error-wrapper" role="alert" aria-live="assertive">
      <section class="vc-error-card">
        <div class="vc-error-badge-container">
          <span class="vc-error-badge">Error del Sistema</span>
        </div>
        <h1 class="vc-error-title">Ha ocurrido un error inesperado</h1>
        <p class="vc-error-msg">
          La aplicación encontró una condición imprevista. Los datos de diagnóstico fueron
          registrados para su análisis.
        </p>

        <div class="vc-sello-box">
          <span class="vc-sello-label">Sello de tiempo (diagnóstico):</span>
          <code class="vc-sello-valor mono">{{ evento().sello.iso }}</code>
        </div>

        <div class="vc-error-actions">
          <button type="button" class="vc-btn-recargar" (click)="alRecargar()">
            Recargar aplicación
          </button>
        </div>
      </section>
    </div>
  `,
  styles: `
    .vc-error-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      padding: var(--vc-space-5) var(--vc-space-4);
      background-color: var(--vc-bg-base);
    }
    .vc-error-card {
      max-width: 580px;
      width: 100%;
      padding: var(--vc-space-5);
      background-color: var(--vc-bg-surface);
      border: 1px solid var(--vc-danger);
      border-radius: var(--vc-radius-lg);
      box-shadow: var(--vc-shadow-raised);
      text-align: center;
    }
    .vc-error-badge-container {
      margin-bottom: var(--vc-space-3);
    }
    .vc-error-badge {
      display: inline-flex;
      align-items: center;
      padding: var(--vc-space-1) var(--vc-space-3);
      font-family: var(--vc-font-mono);
      font-size: var(--vc-fs-caption);
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vc-danger);
      border: 1px solid var(--vc-danger);
      border-radius: var(--vc-radius-sm);
    }
    .vc-error-title {
      margin: 0 0 var(--vc-space-2);
      font-size: var(--vc-fs-h1);
      font-weight: 700;
      color: var(--vc-text-primary);
    }
    .vc-error-msg {
      margin: 0 0 var(--vc-space-4);
      color: var(--vc-text-secondary);
      font-size: var(--vc-fs-body);
      line-height: 1.6;
    }
    .vc-sello-box {
      display: flex;
      flex-direction: column;
      gap: var(--vc-space-1);
      padding: var(--vc-space-3);
      background-color: var(--vc-bg-base);
      border-radius: var(--vc-radius-md);
      border: 1px solid var(--vc-border);
      margin-bottom: var(--vc-space-4);
    }
    .vc-sello-label {
      font-size: var(--vc-fs-caption);
      color: var(--vc-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .vc-sello-valor {
      font-family: var(--vc-font-mono);
      font-size: var(--vc-fs-caption);
      color: var(--vc-warning);
    }
    .vc-error-actions {
      display: flex;
      justify-content: center;
    }
    .vc-btn-recargar {
      display: inline-flex;
      align-items: center;
      padding: var(--vc-space-2) var(--vc-space-5);
      background: var(--vc-grad-primary);
      color: var(--vc-text-primary);
      border: none;
      border-radius: var(--vc-radius-md);
      font-family: var(--vc-font-sans);
      font-weight: 600;
      font-size: var(--vc-fs-body);
      cursor: pointer;
      transition: opacity var(--vc-motion-fast);
    }
    .vc-btn-recargar:hover {
      opacity: 0.85;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorScreen {
  readonly evento = input.required<EventoSellado>();
  readonly recargar = output<void>();

  protected alRecargar(): void {
    this.recargar.emit();
  }
}
