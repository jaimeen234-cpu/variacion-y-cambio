import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Placeholder } from '../../shared/placeholder/placeholder';

@Component({
  selector: 'vc-formulas',
  standalone: true,
  imports: [Placeholder],
  template: `
    <vc-placeholder
      nombre="Fórmulas"
      spec="docs/specs/002-feature-experiencia-variacion-cpu/03-contenido-y-cartilla"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Formulas {}
