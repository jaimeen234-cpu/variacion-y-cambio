# Propuesta — Laboratorio en vivo (cuatro representaciones)

## Document Control

| Campo | Valor |
|---|---|
| Spec Path | `002-feature-experiencia-variacion-cpu/02-laboratorio-en-vivo` |
| Parent Spec | `docs/specs/002-feature-experiencia-variacion-cpu/` |
| Type | **Change** |
| Approval Mode | `gated` |
| Depends on | `01-dominio-modelo-funcional` |
| Parallel-safe | sí *(worktree separado; no toca rutas ni archivos de 03 y 05)* |
| Fecha | 2026-09-08 |

## Intent

La pantalla central de la experiencia: controles de variables independientes, indicadores de dependientes, **gráfica y tabla que avanzan cada segundo**, y el selector de intervalo que calcula la razón de cambio promedio dibujando la recta secante.

Referencias: [PRD §5 S3–S8](../../../prd.md), [§6 E2/E3](../../../prd.md), [§7 AC-1, AC-2, AC-3, AC-4, AC-5, AC-8](../../../prd.md), [`design.md` §6 LP-1](../../../ux-ui/design.md).

## Problem / Current Behavior

No existe. Sin esta pantalla no hay experiencia: es donde el participante manipula, observa y se equivoca.

## Proposed Outcome

Una pantalla donde el participante mueve el voltaje y ve, **en la misma acción**, cómo cambian la fórmula evaluada, la fila de la tabla, la curva y la frase que la interpreta. Y donde puede marcar dos instantes y obtener cuánto cambió la temperatura por segundo, con la secante dibujada encima.

## Scope

| # | Alcance | AC |
|---|---|---|
| 1 | **Panel de variables independientes**: voltaje, carga de trabajo, frecuencia objetivo, temperatura ambiente, disipador. Sliders y selectores con valor + unidad siempre visibles | AC-4.1 |
| 2 | **Panel de variables dependientes**: potencia, temperatura, frecuencia efectiva, rendimiento relativo. Presentados como **resultado**, visualmente distintos de los controles, no editables | AC-4.1 |
| 3 | Al intentar editar una dependiente, la app **explica de qué depende** en lugar de ignorar el gesto | AC-4.2 |
| 4 | **Gráfica temporal** con tres series (colores fijos de [`design.md` §7.3](../../../ux-ui/design.md)), línea de umbral discontinua y marcadores de evento | AC-3.1, AC-5.2 |
| 5 | **Tabla en vivo**: una fila por segundo con `t`, `P`, `T`, `f_ef` y **la RCP respecto de la fila anterior**. Autoscroll con opción de fijarlo | AC-2.3, AC-3.1 |
| 6 | **Selector de intervalo `[t₁, t₂]`** sobre la gráfica o la tabla → RCP con unidad + **recta secante** + los dos puntos marcados | AC-2.1, AC-2.2 |
| 7 | **Comparador de intervalos**: dos RCP de la misma corrida, con el señalamiento de que difieren y por qué eso significa que la función no es lineal | AC-2.4 |
| 8 | **Panel de las cuatro representaciones** de la función activa, sincronizadas: algebraica (fórmula con valores sustituidos), tabular, gráfica, contextual (frase generada) | AC-1.1, AC-1.2 |
| 9 | **Controles de corrida**: ▶ / ⏸ / ↺ y velocidad. Pausa detiene tabla, gráfica y 3D en el mismo instante | AC-3.3 |
| 10 | **Reloj de simulación sin deriva**: cadencia de 1 s corregida por tiempo transcurrido real, no por `setInterval` acumulativo | AC-3.2 |
| 11 | **Popover de fórmula** al pulsar cualquier valor: expresión, entradas, unidades, supuesto y referencia (consume el catálogo de `01`) | AC-7.1 |
| 12 | **Modo presentación**: tipografía y trazos ampliados para proyección a 1280×720 | AC-8.2 |
| 13 | Estado de la configuración reflejado en la URL, para compartir una corrida exacta | — |

### Por qué la tabla no es un adorno

Tres razones convergen en el mismo componente, y conviene verlas juntas:

1. La rúbrica exige la **representación tabular** (eje conceptual de la Guía 1).
2. El usuario la pidió explícitamente ("necesito una tabla en vivo").
3. Las guías de accesibilidad para gráficas en tiempo real piden **una alternativa tabular** y **un botón de pausa** — que ya están en el alcance 5 y 9.

Es el caso raro en que el requisito pedagógico, el requisito del usuario y el requisito de accesibilidad se satisfacen con la misma pieza.

## Non-Goals

| # | Fuera de alcance |
|---|---|
| 1 | Visual 3D — es `05` |
| 2 | Retos de predicción y registro de respuestas — es `04` |
| 3 | Páginas de introducción, fórmulas y cartilla — es `03` |
| 4 | Comparación de **dos corridas completas** lado a lado (US-3.4): se propone como spec posterior si el tiempo alcanza; la comparación de **intervalos** (alcance 7) ya cubre el objetivo matemático |

## Affected Users, Systems, And Specs

- **Áreas de código:** `src/app/ui/pages/laboratorio/**`, `src/app/ui/shared/vc-time-chart/`, `vc-live-table/`, `vc-metric-card/`, `vc-formula-popover/`, `vc-representation-panel/`, `vc-sim-controls/`.
- **Consume:** todo el dominio de `01`.
- **Habilita:** `04` y `05`.
- **Impacto constitucional:** [`design.md` §8](../../../ux-ui/design.md) no lista aún `vc-live-table` ni `vc-representation-panel`; requiere **enmienda del inventario de componentes**.

## Visual Reference

- **Source:** Generated mockup (HTML autocontenido)
- **Location:** `docs/specs/002-feature-experiencia-variacion-cpu/mockup/index.html`
- **Notes:** el mock cubre esta pantalla completa y **funciona**: simula, tabula, grafica y calcula la RCP con secante. Es la referencia visual y numérica de este spec.

## Requirement Delta Preview

### ADDED
- Pantalla de laboratorio con las cuatro representaciones sincronizadas.
- Tabla en vivo con RCP por fila.
- Selector de intervalo con recta secante.
- Reloj de simulación con corrección de deriva.

### MODIFIED
- `docs/ux-ui/design.md` §8: se añaden los componentes nuevos al inventario.

### REMOVED
- Ninguno.

## Approach Options

| Opción | Descripción | Ventaja | Desventaja |
|---|---|---|---|
| **A. Corrida precalculada + reproductor a 1 s** ✅ | El dominio calcula la corrida completa; la UI la reproduce fila a fila | Determinismo garantizado; pausa sin efectos; la secante puede usar puntos futuros ya conocidos; sin deriva por definición | Cambiar un parámetro exige recalcular desde el instante actual |
| B. Simular en vivo, un paso por tick | La UI llama al dominio en cada tick | Cambiar parámetros es inmediato y natural | El resultado depende de la puntualidad del reloj del navegador; rompe AC-3.4 |
| C. Web Worker con la simulación | Cálculo fuera del hilo principal | No bloquea la UI | Complejidad de mensajería para un bucle de <30 ms (TRD PERF-4): resuelve un problema que no existe |

## Recommended Approach

**Opción A**, con recálculo desde el instante actual cuando cambia una variable independiente — que además es **pedagógicamente correcto**: en el fenómeno real, subir el voltaje no reescribe el pasado, cambia el futuro. La opción B parece más natural y es la que rompe el determinismo que AC-3.4 exige y que el criterio 1 de la rúbrica premia: dos corridas iguales deben dar lo mismo, o la matemática deja de ser defendible.

## Risks, Dependencies, And Open Questions

| Riesgo / Pregunta | Mitigación |
|---|---|
| La tabla crece sin límite en corridas largas | Ventana visible acotada con virtualización simple; la corrida completa sigue disponible para exportar |
| Chart.js podría no sostener 30 fps con 4 series (TRD TA-3) | Se mide en la primera tarea que lo integre; el mock ya da una señal temprana. Plan B: SVG propio (TRD ADR-004) |
| Proyección a 1280×720: la tabla y la gráfica compiten por espacio | El modo presentación reduce columnas de la tabla a `t`, `T` y RCP |
| PRD Q5: ¿un equipo o varios? | No bloquea: la app es local y funciona igual en 1 o en 4 portátiles |

## Success Criteria

- [ ] Las cuatro representaciones son visibles a la vez, sin pestañas
- [ ] Un cambio de variable independiente actualiza las cuatro en la misma acción
- [ ] Una corrida de 5 min agrega exactamente 300 filas y 300 puntos por serie
- [ ] La deriva acumulada tras 5 min es < 100 ms
- [ ] Pausa detiene tabla y gráfica en el mismo instante; reanudar no duplica ni salta filas
- [ ] La RCP mostrada coincide con `(f(b)−f(a))/(b−a)` calculado a mano, con unidad correcta
- [ ] La secante pasa exactamente por los dos puntos marcados
- [ ] Intentar editar una variable dependiente produce la explicación, no el silencio
- [ ] Cero hex sueltos: todo color desde los tokens
- [ ] Sin scroll horizontal a 360 px; legible a 1280×720 proyectado

## Next Step

```text
/akili-specify 002-feature-experiencia-variacion-cpu/02-laboratorio-en-vivo
```
