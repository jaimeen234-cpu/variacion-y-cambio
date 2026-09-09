import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'vc-placeholder',
  standalone: true,
  template: `
    <section class="vc-placeholder-card" aria-label="Contenido en construcción">
      <div class="vc-badge-container">
        <span class="vc-placeholder-badge">Módulo en Construcción</span>
      </div>
      <h1 class="vc-placeholder-title">{{ nombre() }}</h1>
      <p class="vc-placeholder-desc">
        Esta sección se encuentra en desarrollo activo como parte de la experiencia didáctica.
      </p>
      <div class="vc-spec-box">
        <span class="vc-spec-label">Especificación responsable:</span>
        <code class="vc-spec-path">{{ spec() }}</code>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--vc-space-5) var(--vc-space-4);
    }
    .vc-placeholder-card {
      max-width: 640px;
      margin: 0 auto;
      padding: var(--vc-space-5);
      background: var(--vc-bg-surface);
      border: 1px dashed var(--vc-border);
      border-radius: var(--vc-radius-lg);
      box-shadow: var(--vc-shadow-card);
      text-align: center;
    }
    .vc-badge-container {
      margin-bottom: var(--vc-space-3);
    }
    .vc-placeholder-badge {
      display: inline-flex;
      align-items: center;
      padding: var(--vc-space-1) var(--vc-space-3);
      font-family: var(--vc-font-mono);
      font-size: var(--vc-fs-caption);
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vc-warning);
      border: 1px solid var(--vc-warning);
      border-radius: var(--vc-radius-sm);
    }
    .vc-placeholder-title {
      margin: 0 0 var(--vc-space-2);
      font-size: var(--vc-fs-display);
      font-weight: 700;
      color: var(--vc-text-primary);
    }
    .vc-placeholder-desc {
      margin: 0 0 var(--vc-space-4);
      color: var(--vc-text-secondary);
      font-size: var(--vc-fs-body);
      line-height: 1.5;
    }
    .vc-spec-box {
      display: flex;
      flex-direction: column;
      gap: var(--vc-space-1);
      padding: var(--vc-space-3);
      background: var(--vc-bg-base);
      border-radius: var(--vc-radius-md);
      border: 1px solid var(--vc-border);
    }
    .vc-spec-label {
      font-size: var(--vc-fs-caption);
      color: var(--vc-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .vc-spec-path {
      font-family: var(--vc-font-mono);
      font-size: var(--vc-fs-caption);
      color: var(--vc-info);
      word-break: break-all;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Placeholder {
  readonly nombre = input.required<string>();
  readonly spec = input.required<string>();
}
