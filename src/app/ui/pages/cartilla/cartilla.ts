import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Placeholder } from '../../shared/placeholder/placeholder';

@Component({
  selector: 'vc-cartilla',
  standalone: true,
  imports: [Placeholder],
  template: `
    <vc-placeholder
      nombre="Cartilla"
      spec="docs/specs/002-feature-experiencia-variacion-cpu/03-contenido-y-cartilla"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cartilla {}
