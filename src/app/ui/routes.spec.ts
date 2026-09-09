import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../app.routes';

describe('Tabla de rutas y componentes placeholder (T-6 / RF-6)', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    harness = await RouterTestingHarness.create();
  });

  it('navega a "" y renderiza el placeholder de Inicio', async () => {
    await harness.navigateByUrl('/');
    const content = harness.routeNativeElement?.textContent ?? '';
    expect(content).toContain('Inicio');
    expect(content).toContain('03-contenido-y-cartilla');
    expect(content).toContain('Módulo en Construcción');
  });

  it('navega a "/laboratorio" y renderiza el placeholder de Laboratorio', async () => {
    await harness.navigateByUrl('/laboratorio');
    const content = harness.routeNativeElement?.textContent ?? '';
    expect(content).toContain('Laboratorio');
    expect(content).toContain('02-laboratorio-en-vivo');
    expect(content).toContain('Módulo en Construcción');
  });

  it('navega a "/conceptos" y renderiza el placeholder de Conceptos', async () => {
    await harness.navigateByUrl('/conceptos');
    const content = harness.routeNativeElement?.textContent ?? '';
    expect(content).toContain('Conceptos');
    expect(content).toContain('03-contenido-y-cartilla');
    expect(content).toContain('Módulo en Construcción');
  });

  it('navega a "/formulas" y renderiza el placeholder de Fórmulas', async () => {
    await harness.navigateByUrl('/formulas');
    const content = harness.routeNativeElement?.textContent ?? '';
    expect(content).toContain('Fórmulas');
    expect(content).toContain('03-contenido-y-cartilla');
    expect(content).toContain('Módulo en Construcción');
  });

  it('navega a "/cartilla" y renderiza el placeholder de Cartilla', async () => {
    await harness.navigateByUrl('/cartilla');
    const content = harness.routeNativeElement?.textContent ?? '';
    expect(content).toContain('Cartilla');
    expect(content).toContain('03-contenido-y-cartilla');
    expect(content).toContain('Módulo en Construcción');
  });

  it('navega a una URL desconocida y renderiza NoEncontrado sin redirigir a la raíz', async () => {
    await harness.navigateByUrl('/ruta-inexistente-invalida');
    const content = harness.routeNativeElement?.textContent ?? '';
    expect(content).toContain('Página no encontrada');
    expect(content).toContain('001-setup-bootstrap-angular');

    // RF-6.3: Verifica que la URL permanezca en la ruta solicitada y NO redirija a "/"
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/ruta-inexistente-invalida');
  });
});
