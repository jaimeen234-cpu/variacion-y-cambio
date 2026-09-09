import { describe, expect, it } from 'vitest';
import { Reloj } from '../../domain/shared/ports/reloj';
import { SellarEvento } from './sellar-evento';

/**
 * Doble de prueba en memoria que implementa el puerto de dominio Reloj.
 * Permite simular el avance del tiempo de forma determinista sin dependencias externas ni de infraestructura.
 */
class RelojDePrueba implements Reloj {
  constructor(private instanteActual: number) {}

  public ahora(): number {
    return this.instanteActual;
  }

  public avanzarMilisegundos(deltaMs: number): void {
    this.instanteActual += deltaMs;
  }
}

describe('SellarEvento (Caso de uso)', () => {
  it('debe sellar un evento con la descripción y el instante exacto provisto por el reloj', () => {
    const reloj = new RelojDePrueba(1700000000000);
    const casoDeUso = new SellarEvento(reloj);

    const evento = casoDeUso.ejecutar('Inicio de simulación térmica');

    expect(evento.descripcion).toBe('Inicio de simulación térmica');
    expect(evento.sello.milisegundos).toBe(1700000000000);
    expect(evento.sello.aIso()).toBe('2023-11-14T22:13:20.000Z');
  });

  it('debe reflejar cambios temporales en ejecuciones sucesivas sin efectos secundarios', () => {
    const reloj = new RelojDePrueba(1000);
    const casoDeUso = new SellarEvento(reloj);

    const evento1 = casoDeUso.ejecutar('Paso 1');
    expect(evento1.sello.milisegundos).toBe(1000);

    reloj.avanzarMilisegundos(500);

    const evento2 = casoDeUso.ejecutar('Paso 2');
    expect(evento2.sello.milisegundos).toBe(1500);
  });
});
