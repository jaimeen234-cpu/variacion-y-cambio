import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Placeholder } from '../../shared/placeholder/placeholder';

@Component({
  selector: 'vc-conceptos',
  standalone: true,
  imports: [Placeholder],
  template: `
    <vc-placeholder
      nombre="Conceptos"
      spec="docs/specs/002-feature-experiencia-variacion-cpu/03-contenido-y-cartilla"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Conceptos {}
