import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Placeholder } from '../../shared/placeholder/placeholder';

@Component({
  selector: 'vc-no-encontrado',
  standalone: true,
  imports: [Placeholder, RouterLink],
  template: `
    <vc-placeholder
      nombre="Página no encontrada (404)"
      spec="docs/specs/001-setup-bootstrap-angular"
    />
    <div class="vc-actions">
      <a routerLink="/" class="vc-btn-volver">Volver al inicio</a>
    </div>
  `,
  styles: `
    .vc-actions {
      display: flex;
      justify-content: center;
      margin-top: var(--vc-space-4);
    }
    .vc-btn-volver {
      display: inline-flex;
      align-items: center;
      padding: var(--vc-space-2) var(--vc-space-4);
      background: var(--vc-grad-primary);
      color: var(--vc-text-primary);
      border-radius: var(--vc-radius-md);
      text-decoration: none;
      font-weight: 600;
      font-size: var(--vc-fs-caption);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      transition: opacity var(--vc-motion-fast);
    }
    .vc-btn-volver:hover {
      opacity: 0.85;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoEncontrado {}
