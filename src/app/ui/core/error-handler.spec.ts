import { TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app';
import { appConfig } from '../../app.config';
import { RELOJ } from '../../infrastructure/di/tokens';
import { RelojFijo } from '../../infrastructure/tiempo/reloj-fijo';
import { ManejadorErrorGlobal } from './error-handler';

describe('ManejadorErrorGlobal y ErrorScreen (T-7 / RF-9.1 / RF-9.2)', () => {
  const INSTANTE_PRUEBA = 1710000000000;
  const ISO_ESPERADO = '2024-03-09T16:00:00.000Z';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        ...appConfig.providers,
        {
          provide: RELOJ,
          useValue: new RelojFijo(INSTANTE_PRUEBA),
        },
      ],
    }).compileComponents();
  });

  it('resuelve ErrorHandler como una instancia de ManejadorErrorGlobal desde appConfig', () => {
    const handler = TestBed.inject(ErrorHandler);
    expect(handler).toBeInstanceOf(ManejadorErrorGlobal);
  });

  it('captura una excepción, sella con SELLAR_EVENTO -> RELOJ y renderiza la pantalla de error en el DOM con el valor determinista', async () => {
    const spyConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    // Verificamos que inicialmente se muestra el shell normal y no la pantalla de error
    const domInicial = fixture.nativeElement as HTMLElement;
    expect(domInicial.querySelector('vc-error-screen')).toBeNull();
    expect(domInicial.querySelector('.vc-brand')?.textContent).toContain('Variación y Cambio');

    // Provocamos la excepción no controlada a través del ErrorHandler provisto por appConfig
    const handler = TestBed.inject(ErrorHandler);
    const errorSimulado = new TypeError('Fallo de cálculo en el motor de simulación');
    handler.handleError(errorSimulado);

    fixture.detectChanges();
    await fixture.whenStable();

    const domConError = fixture.nativeElement as HTMLElement;

    // 1. AFIRMACIÓN SOBRE EL DOM: la pantalla de error se renderiza y NO hay pantalla en blanco
    const errorScreen = domConError.querySelector('.vc-error-card');
    expect(errorScreen).not.toBeNull();
    expect(domConError.textContent).toContain('Ha ocurrido un error inesperado');

    // 2. CADENA HEXAGONAL EN RUNTIME: ui -> application -> domain <- infrastructure
    // El sello proviene de RelojFijo -> Reloj (domain) -> SelloDeTiempo (domain) -> SellarEvento (application) -> ErrorScreen (ui)
    expect(domConError.textContent).toContain(ISO_ESPERADO);

    // 3. SIN TRAZAS TÉCNICAS VISIBLES AL USUARIO
    expect(domConError.textContent).not.toContain('TypeError');
    expect(domConError.textContent).not.toContain('Fallo de cálculo en el motor de simulación');
    expect(domConError.textContent).not.toContain('stack');

    // 4. La traza técnica se registró en console.error con contexto
    expect(spyConsole).toHaveBeenCalled();
    const argumentos = spyConsole.mock.calls[0];
    expect(argumentos[0]).toContain('[Error No Controlado');
    expect(argumentos[1]).toMatchObject({
      error: errorSimulado,
      sello: ISO_ESPERADO,
    });

    spyConsole.mockRestore();
  });

  it('permite restablecer el estado al pulsar el botón de recarga', async () => {
    const spyConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fixture = TestBed.createComponent(App);
    const handler = TestBed.inject(ErrorHandler) as ManejadorErrorGlobal;
    handler.handleError(new Error('Error de prueba'));

    fixture.detectChanges();
    await fixture.whenStable();

    const botonRecargar = (fixture.nativeElement as HTMLElement).querySelector('.vc-btn-recargar') as HTMLButtonElement;
    expect(botonRecargar).not.toBeNull();
    botonRecargar.click();

    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('vc-error-screen')).toBeNull();
    spyConsole.mockRestore();
  });
});
