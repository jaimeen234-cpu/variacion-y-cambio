# Propuesta — Dominio y modelo funcional

## Document Control

| Campo | Valor |
|---|---|
| Spec Path | `002-feature-experiencia-variacion-cpu/01-dominio-modelo-funcional` |
| Parent Spec | `docs/specs/002-feature-experiencia-variacion-cpu/` |
| Type | **Change** |
| Approval Mode | `gated` |
| Depends on | `docs/specs/001-setup-bootstrap-angular` |
| Parallel-safe | no |
| Fecha | 2026-09-08 |

## Intent

Construir la **matemática** de la experiencia: las funciones que modelan el fenómeno, la razón de cambio promedio, y el motor de simulación determinista que las evalúa paso a paso. Todo en `domain/`, sin una sola línea de Angular.

Referencias de intención: [PRD §1](../../../prd.md) (tabla de conceptos matemáticos), [§6 E1/E2](../../../prd.md), [§7 AC-1, AC-2, AC-3.4, AC-4, AC-5](../../../prd.md).

## Problem / Current Behavior

No existe. Y es la pieza que la rúbrica califica más duro: el criterio 1 (*fundamentación matemática*) califica *Insuficiente* cuando "se evidencian errores matemáticos significativos". Toda la app puede verse impecable y perder ese punto si una fórmula está mal.

## Proposed Outcome

Un conjunto de funciones puras, probadas con valores calculados a mano, que dado un escenario y unos parámetros produce una corrida completa: la serie temporal de potencia, temperatura y frecuencia efectiva, sus eventos de throttling y sus razones de cambio promedio.

## Scope

| # | Alcance |
|---|---|
| 1 | **Value objects con dominio explícito**: `Voltios`, `Watts`, `Celsius`, `Hertz`, `Adimensional`. Cada uno valida su rango y lleva su unidad. Rechazar fuera de rango es un requisito (AC-4.3), no una cortesía |
| 2 | **`ModeloPotencia`**: potencia dinámica y estática, con la relación **cuadrática en voltaje** como propiedad observable |
| 3 | **`ModeloTermico`**: modelo RC de primer orden, con solución exponencial por paso |
| 4 | **`PoliticaThrottling`**: **función definida por tramos** con histéresis, acotada por `[f_base, f_objetivo]` |
| 5 | **`RazonDeCambioPromedio`**: servicio de dominio que calcula `(f(b) − f(a))/(b − a)` sobre cualquier serie, devuelve el valor **con su unidad derivada** y los dos puntos de la secante |
| 6 | **`SimuladorLazoTermico`**: función pura `simular(config, horizonte, Δt) → ResultadoSimulacion`, determinista (TRD ADR-005) |
| 7 | **`MetricasResumen`**: potencia media, temperatura máxima, frecuencia efectiva media, **rendimiento relativo** (`f̄_ef / f_objetivo`), tiempo en throttling |
| 8 | **`CatalogoFormulas`**: cada fórmula como dato — expresión, variables, unidades, dominio, supuesto y referencia bibliográfica. Es la fuente única que consume la pantalla de fórmulas y los popovers |
| 9 | Puertos `RepositorioEscenarios` y `RepositorioDisipadores` + datos JSON de escenarios y disipadores |
| 10 | Casos de uso en `application/`: `ListarEscenarios`, `EjecutarSimulacion`, `CalcularRazonDeCambio`, `CompararCorridas` |

### Las fórmulas del modelo *(para revisar antes de especificar)*

| # | Magnitud | Expresión | Unidades | Referencia |
|---|---|---|---|---|
| F1 | Potencia dinámica | `P_din = α · C · V² · f` | W | Weste & Harris, *CMOS VLSI Design* |
| F2 | Potencia estática | `P_est = P_est₀ · (V / V_nom)` | W | Rabaey et al., *Digital Integrated Circuits* (simplificada) |
| F3 | Potencia total | `P = P_din + P_est` | W | — |
| F4 | Temperatura (paso Δt) | `T_{n+1} = T_amb + P·R + (T_n − T_amb − P·R) · e^(−Δt/(R·C))` | °C | Ley de enfriamiento de Newton / modelo RC concentrado; función exponencial en Stewart et al., *Precálculo* |
| F5 | Temperatura de equilibrio | `T_∞ = T_amb + P·R` | °C | Consecuencia de F4 cuando `t → ∞` |
| F6 | Throttling *(por tramos)* | `f_ef = f_obj` si `T ≤ T_thr` · `f_ef = máx(f_base, f_ef − Δf)` si `T > T_thr` · recupera si `T < T_thr − h` | Hz | Función definida por tramos — Stewart et al., *Precálculo* |
| F7 | **Razón de cambio promedio** | `RCP = (f(b) − f(a)) / (b − a)` | unidad de `f` / unidad de `x` | **Stewart, Redlin & Watson, *Precálculo* (6.ª ed.)** — bibliografía del propio curso |
| F8 | Rendimiento relativo | `R = f̄_ef / f_obj` | % | — |

**Nota deliberada sobre el alcance matemático:** el rendimiento se expresa como **promedio aritmético** de la frecuencia efectiva, y **no** como `Σ f_ef · Δt`. La segunda forma es una suma de Riemann, es decir, acumulación — el eje de la **Guía 6**, no de la Guía 1. La restricción C12 del PRD prohíbe adelantarse al eje asignado, y esta es exactamente la clase de detalle donde eso se rompe sin que nadie lo note.

## Non-Goals

| # | Fuera de alcance |
|---|---|
| 1 | Cualquier componente de UI |
| 2 | Derivadas, límites, razón de cambio **instantánea** (PRD C12 — son las Guías 2 y 4) |
| 3 | Sumas de Riemann, integrales, acumulación (Guía 6) |
| 4 | Fuga dependiente de la temperatura (`I_fuga(T)`), que crearía un **segundo lazo, positivo**. Es matemáticamente atractivo y didácticamente confuso para un primer contacto; se anota como refinamiento posible |
| 5 | Persistencia de corridas |

## Affected Users, Systems, And Specs

- **Habilita:** las cuatro hijas restantes de la familia.
- **Áreas de código:** `src/app/domain/**`, `src/app/application/**`, `src/assets/data/*.json`.
- **Impacto constitucional:** el [TRD §5.3](../../../trd/trd.md) publica hoy un modelo físico ligeramente distinto (incluía `trabajo útil` como suma acumulada). Requiere **enmienda del TRD** para alinearlo con F1–F8 y con la nota de alcance matemático.

## Visual Reference

- **Source:** Generated mockup (HTML autocontenido)
- **Location:** `docs/specs/002-feature-experiencia-variacion-cpu/mockup/index.html`
- **Notes:** el mock **implementa estas fórmulas en vivo**, así que sirve para validar el modelo numéricamente antes de escribir el dominio en Angular. Si las curvas del mock se ven razonables, el modelo lo es.

## Requirement Delta Preview

### ADDED
- Funciones de potencia, temperatura y throttling como servicios de dominio puros.
- Razón de cambio promedio como concepto de primera clase, con unidad derivada.
- Catálogo de fórmulas como dato consultable.

### MODIFIED
- TRD §5.3: el modelo publicado se sustituye por F1–F8.

### REMOVED
- `trabajo útil` como suma acumulada (queda fuera del eje de la Guía 1).

## Approach Options

| Opción | Descripción | Ventaja | Desventaja |
|---|---|---|---|
| **A. Paso fijo con solución exponencial exacta por paso** ✅ | Cada paso resuelve F4 analíticamente | Estable con cualquier Δt; exacto para P constante en el paso; el estudiante ve la exponencial explícita | Requiere entender la fórmula cerrada |
| B. Euler explícito (`T += (T_∞ − T)·Δt/(R·C)`) | Aproximación de primer orden | Más simple de leer | Inestable si `Δt` se acerca a `R·C`; introduce un error numérico que el estudiante confundiría con física |
| C. Solver genérico (Runge-Kutta) | Integrador numérico | Extensible | Caja negra: contradice C9 (todo debe poder explicarse) |

## Recommended Approach

**Opción A.** Con `Δt = 1 s` y constantes térmicas del orden de decenas de segundos, Euler funcionaría — pero introduciría un error que el participante no puede distinguir del fenómeno, y el objetivo de la app es justamente que la matemática sea confiable y explicable. La opción A no es más difícil de implementar y **enseña la función exponencial en lugar de esconderla**, lo cual sirve al criterio 1 y a la restricción C9.

## Risks, Dependencies, And Open Questions

| Riesgo / Pregunta | Mitigación |
|---|---|
| Valores realistas de `C` (capacitancia conmutada) son difíciles de citar | Se calibran los escenarios para que `P` a voltaje nominal coincida con TDP publicados, y se declara como **calibración didáctica** en los supuestos. Un valor inventado sin declararlo sería un error de rigor |
| La histéresis mal elegida produce oscilación o un escalón brusco | Se prueba con un caso que oscila alrededor del umbral (es una restricción negativa obligatoria) |
| ¿La docente aceptará el modelo simplificado de fuga? | Está declarado como supuesto con su referencia; PRD A2 |

## Success Criteria

- [ ] Cada fórmula F1–F8 tiene al menos un caso de referencia con valor **calculado a mano** en el test
- [ ] Duplicar `V` a `f` y `α` constantes cuadruplica `P_din` (propiedad, no ejemplo)
- [ ] Con `P` constante, `T` tiende a `T_amb + P·R` y se prueba el 63% en `t = R·C`
- [ ] `f_ef` nunca sale de `[f_base, f_obj]` — en ninguna corrida de la suite
- [ ] Con `T` oscilando alrededor del umbral, `f_ef` **no** alterna cada paso
- [ ] La RCP de la primera fila es **inexistente**, no cero
- [ ] Dos corridas idénticas producen resultados idénticos
- [ ] `npm run test:arch` pasa: cero imports de Angular en `domain/`
- [ ] Cada entrada del catálogo de fórmulas tiene referencia bibliográfica

## Next Step

```text
/akili-specify 002-feature-experiencia-variacion-cpu/01-dominio-modelo-funcional
```
