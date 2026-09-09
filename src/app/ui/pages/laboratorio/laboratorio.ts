import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Placeholder } from '../../shared/placeholder/placeholder';

@Component({
  selector: 'vc-laboratorio',
  standalone: true,
  imports: [Placeholder],
  template: `
    <vc-placeholder
      nombre="Laboratorio"
      spec="docs/specs/002-feature-experiencia-variacion-cpu/02-laboratorio-en-vivo"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Laboratorio {}
