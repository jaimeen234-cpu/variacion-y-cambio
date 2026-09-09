# UX/UI Design — Variación y Cambio

> **Qué es esto:** el sistema visual y de interacción del producto. Define tokens, componentes, flujos y patrones. **No** define implementación técnica — eso vive en [`docs/trd/trd.md`](../trd/trd.md).

| Campo | Valor |
|---|---|
| Estado | Draft v0.1 |
| Base visual | **BLK Design System Angular — versión free (MIT)** de Creative Tim |
| Última actualización | 2026-09-08 |
| Fuente de requisitos | [`docs/prd.md`](../prd.md) |

---

## 1. Product Experience Principles

| # | Principio | Qué significa en la práctica | Qué prohíbe |
|---|---|---|---|
| PE1 | **La causa y el efecto caben en una pantalla** | Control y consecuencia siempre visibles juntos: si mueves un slider, la gráfica que cambia está a la vista | Prohibido esconder el resultado tras un scroll o una pestaña |
| PE2 | **Respuesta inmediata** | El cambio se ve en < 100 ms; no hay botón "Calcular" para los parámetros continuos | Prohibidos spinners para cálculo local |
| PE3 | **El número nunca viaja solo** | Todo valor lleva unidad, y su fórmula es consultable | Prohibido mostrar un `47.3` desnudo |
| PE4 | **Didáctico, no enciclopédico** | El texto explica lo justo en el momento justo; la profundidad se despliega bajo demanda | Prohibidos muros de texto en la pantalla principal |
| PE5 | **Manipulable antes que leíble** | La primera acción del usuario es mover algo, no leer algo | Prohibida una pantalla de bienvenida que bloquee el paso |
| PE6 | **El error enseña** | Un valor inválido explica el rango físico y por qué | Prohibido "Valor inválido" a secas |

---

## 2. Information Architecture

```
Variación y Cambio
│
├── Inicio                          Qué es variación, qué es cambio, y dos accesos directos
│
├── Lazo Térmico              [E1]  Módulo núcleo
│   ├── Simulador                   Escenario + controles + gráficas + línea de eventos
│   ├── Comparar                    Dos configuraciones del mismo escenario, lado a lado
│   └── Fórmulas                    Modelo aplicado, con sus supuestos
│
├── Consumo y Costo           [E2]  Módulo de aplicación
│   ├── Mis aparatos                Lista editable + catálogo precargado
│   ├── Desglose                    Ranking de consumo y costo
│   └── Comparar eficiencia         Aparato A vs. aparato B
│
└── Conceptos                 [E3]  Marco didáctico transversal
    ├── Variación
    ├── Cambio (transformación de energía)
    └── Realimentación
```

**Regla de profundidad:** máximo 2 niveles desde Inicio hasta cualquier acción. Nada útil vive a 3 clics.

---

## 3. Primary User Flows

### F1 — Primera simulación *(el flujo crítico; sirve a AC-5.1)*

```
Inicio  ──►  [Simular el lazo térmico]  ──►  Simulador con escenario por defecto ya cargado y corriendo
  1 clic                                       El estudiante mueve un slider  ──►  la gráfica responde
```

Sin login, sin selección obligatoria de escenario, sin tutorial modal. El escenario por defecto es real y funcional.

### F2 — Descubrir el throttling

```
Simulador  ──►  sube voltaje/frecuencia  ──►  temperatura cruza el umbral
                                                      ↓
        marcador en la línea de tiempo + banner "Throttling activo: 96 °C > 95 °C"
                                                      ↓
                            frecuencia efectiva baja  ──►  potencia baja  ──►  temperatura se estabiliza
```

El momento del cruce es el instante didáctico: se marca, se etiqueta y se explica en una línea.

### F3 — Comparar dos configuraciones *(sirve a la North Star)*

```
Simulador  ──►  [Guardar como configuración A]  ──►  ajustar parámetros  ──►  [Comparar con A]
                                                                                    ↓
                                                    Vista dividida: A | B, mismas escalas, delta explícito
```

**Regla dura:** en comparación las dos gráficas comparten ejes y escalas. Escalas distintas mienten.

### F4 — Del lazo a la factura

```
Simulador (potencia media bajo carga)  ──►  [Llevar a Consumo]  ──►  aparato precargado con esa potencia
                                                                            ↓
                                                            horas/día + tarifa  ──►  kWh/mes y costo
```

### F5 — Verificar un número

```
Cualquier valor mostrado  ──►  clic/tap en el valor  ──►  popover: fórmula + entradas + resultado
```

---

## 4. Screen Inventory

| # | Pantalla | Ruta | Propósito | Historias |
|---|---|---|---|---|
| SC-1 | Inicio | `/` | Explicar el concepto en 3 frases y lanzar a los módulos | US-3.1 |
| SC-2 | Simulador térmico | `/lazo-termico` | Simulación interactiva con controles y gráficas | US-1.1 – US-1.5, US-1.7 |
| SC-3 | Comparador térmico | `/lazo-termico/comparar` | Dos configuraciones lado a lado | US-1.6 |
| SC-4 | Fórmulas del modelo | `/lazo-termico/formulas` | Modelo, supuestos y rangos válidos | US-3.2 |
| SC-5 | Mis aparatos | `/consumo` | Lista editable de aparatos con potencia y uso | US-2.1, US-2.2 |
| SC-6 | Desglose de consumo | `/consumo/desglose` | Ranking, porcentajes, costo total | US-2.3 |
| SC-7 | Comparar eficiencia | `/consumo/comparar` | Aparato A vs. B, ahorro cuantificado | US-2.4 |
| SC-8 | Conceptos | `/conceptos` | Variación, cambio, realimentación | US-3.1 |
| SC-9 | No encontrado | `/**` | Error 404 dentro de la identidad visual | — |

---

## 5. Navigation Model

- **Navbar superior fija** (patrón BLK): logo/marca a la izquierda, enlaces de módulo a la derecha. Colapsa a menú hamburguesa bajo `md`.
- **Sin sidebar.** El producto tiene 3 módulos; un sidebar sería andamiaje vacío.
- **Migas de pan solo dentro de un módulo** (`Lazo Térmico › Comparar`), nunca en el primer nivel.
- **Estado activo** siempre visible: subrayado con gradiente primario en el enlace activo.
- **La ruta es el estado compartible**: la configuración del simulador se refleja en query params, de modo que un docente puede pasar un enlace con parámetros ya puestos.

---

## 6. Layout Patterns

### LP-1 — Laboratorio *(SC-2, la pantalla más importante)*

```
┌─────────────────────────────────────────────────────────────┐
│  Navbar                                                     │
├──────────────────┬──────────────────────────────────────────┤
│                  │  Gráfica principal: P, T, f(t)           │
│  Panel de        │  ───────────────────────────────────     │
│  controles       │                                          │
│  (sliders,       ├──────────────────────────────────────────┤
│   selects)       │  Línea de eventos (throttling, límites)  │
│                  ├──────────────────────────────────────────┤
│  [▶ ⏸ ↺]         │  Tarjetas de métricas: P·media, T·máx,   │
│                  │  f·efectiva, trabajo útil                │
└──────────────────┴──────────────────────────────────────────┘
   ~340 px fijo              resto fluido
```

Bajo `lg` el panel de controles pasa **arriba** de la gráfica, no debajo: PE1 exige que control y efecto se vean juntos, y en móvil eso significa control primero, gráfica inmediatamente después.

### LP-2 — Comparación

Dos columnas idénticas y espejadas (`A | B`), con una franja de *delta* entre ellas. Bajo `md` se apilan, y la franja de delta queda **al final**, no en medio.

### LP-3 — Lista + detalle *(SC-5)*

Tabla/tarjetas de aparatos a la izquierda, resumen persistente a la derecha (`sticky`). Bajo `md`, el resumen se ancla al pie.

### LP-4 — Contenido didáctico *(SC-1, SC-4, SC-8)*

Columna única, `max-width: 68ch`, tarjetas BLK para separar conceptos.

---

## 7. Design Tokens

> **Origen:** portados del SCSS de **BLK Design System (free, MIT)**. Los valores hex de esta tabla son la base declarada del sistema; la tarea de portado del primer spec debe **verificarlos contra el SCSS real** y corregir esta tabla si difieren — la tabla es la fuente de verdad a partir de ese momento.

### 7.1 Color

| Token | Valor | Uso |
|---|---|---|
| `--vc-bg-base` | `#1e1e2f` | Fondo de la aplicación |
| `--vc-bg-surface` | `#27293d` | Tarjetas, paneles |
| `--vc-bg-elevated` | `#2b3553` | Popovers, dropdowns, modales |
| `--vc-primary` | `#e14eca` | Acción principal, marca |
| `--vc-info` | `#1d8cf8` | Serie de datos "potencia", enlaces |
| `--vc-success` | `#00f2c3` | Estado nominal, ahorro |
| `--vc-warning` | `#ff8d72` | Cercanía al umbral térmico |
| `--vc-danger` | `#fd5d93` | Throttling activo, valor inválido |
| `--vc-text-primary` | `#ffffff` | Texto principal |
| `--vc-text-secondary` | `rgba(255,255,255,.6)` | Texto de apoyo, unidades |
| `--vc-border` | `rgba(255,255,255,.1)` | Bordes de tarjeta y separadores |

### 7.2 Gradientes *(firma visual de BLK)*

| Token | Valor |
|---|---|
| `--vc-grad-primary` | `linear-gradient(0deg, #ba54f5 0%, #e14eca 100%)` |
| `--vc-grad-info` | `linear-gradient(0deg, #1d8cf8 0%, #3358f4 100%)` |
| `--vc-grad-card` | `linear-gradient(0deg, #1e1e2f 0%, #1e1e24 100%)` |

### 7.3 Semántica de series *(regla dura del producto)*

Cada magnitud tiene **un solo color en toda la app**. Un color de serie nunca se reutiliza para otra magnitud, en ninguna pantalla.

| Magnitud | Token | Racional |
|---|---|---|
| Potencia (W) | `--vc-info` | Neutra, es la entrada |
| Temperatura (°C) | `--vc-danger` | El calor es la consecuencia que limita |
| Frecuencia efectiva (GHz) | `--vc-success` | El trabajo útil que se quiere maximizar |
| Umbral / límite | `--vc-warning`, línea discontinua | Es una restricción, no una medición |

### 7.4 Tipografía

| Token | Valor |
|---|---|
| `--vc-font-sans` | `'Poppins', -apple-system, 'Segoe UI', Roboto, sans-serif` |
| `--vc-font-mono` | `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace` |
| `--vc-fs-display` | `clamp(2rem, 4vw, 3.25rem)` / 700 |
| `--vc-fs-h1` | `clamp(1.6rem, 3vw, 2.25rem)` / 600 |
| `--vc-fs-h2` | `1.375rem` / 600 |
| `--vc-fs-body` | `0.9375rem` / 400 · line-height 1.6 |
| `--vc-fs-caption` | `0.75rem` / 400 · uppercase · letter-spacing .06em |
| `--vc-fs-metric` | `clamp(1.75rem, 3vw, 2.5rem)` / 700 · tabular-nums |

**Regla:** todo número que cambia en el tiempo usa `--vc-font-mono` con `font-variant-numeric: tabular-nums`. Sin ancho tabular, un valor en vivo tiembla y distrae del fenómeno.

### 7.5 Espaciado, radio, sombra, movimiento

| Token | Valor |
|---|---|
| `--vc-space-1 … 6` | `4px, 8px, 16px, 24px, 32px, 48px` |
| `--vc-radius-sm / md / lg` | `4px / 8px / 12px` |
| `--vc-shadow-card` | `0 1px 20px 0 rgba(0,0,0,.1)` |
| `--vc-shadow-raised` | `0 10px 25px 0 rgba(0,0,0,.3)` |
| `--vc-motion-fast` | `120ms cubic-bezier(.4,0,.2,1)` — hover, foco |
| `--vc-motion-base` | `240ms cubic-bezier(.4,0,.2,1)` — entradas, paneles |
| `--vc-tick-sim` | `100ms` — cadencia de refresco de la simulación en pantalla |

### 7.6 Breakpoints

| Nombre | Ancho | Cambio de layout |
|---|---|---|
| `sm` | ≥ 576 px | — |
| `md` | ≥ 768 px | Comparación pasa a 2 columnas |
| `lg` | ≥ 992 px | Laboratorio pasa a panel lateral + gráfica |
| `xl` | ≥ 1200 px | Ancho máximo de contenido 1140 px |

---

## 8. Component Inventory

| Componente | Origen | Propósito | Notas |
|---|---|---|---|
| `vc-navbar` | BLK adaptado | Navegación principal | Colapsa bajo `md` |
| `vc-card` | BLK | Contenedor base | Usa `--vc-grad-card` |
| `vc-slider` | BLK (nouislider) adaptado | Control continuo de parámetro | **Muestra siempre valor + unidad**; emite `input` con debounce ≤ 16 ms |
| `vc-metric-card` | Propio | Valor grande + unidad + etiqueta + tendencia | Clic abre el popover de fórmula (F5) |
| `vc-formula-popover` | Propio | Fórmula, entradas y resultado | Cumple PE3 y AC-2.1 |
| `vc-time-chart` | Propio sobre lib de gráficas | Series temporales con umbral y marcadores | Colores de §7.3, obligatorio |
| `vc-event-timeline` | Propio | Eventos discretos (inicio/fin de throttling) | Alineada al eje X de la gráfica |
| `vc-sim-controls` | Propio | ▶ / ⏸ / ↺ + velocidad | Objetivo táctil ≥ 44 px |
| `vc-scenario-picker` | BLK select adaptado | Escenario precargado | Nunca vacío: siempre hay uno por defecto |
| `vc-appliance-row` | Propio | Aparato: nombre, potencia, horas, kWh, costo | Editable en línea |
| `vc-comparison-pane` | Propio | Contenedor espejado A/B con franja delta | Escalas compartidas obligatorias |
| `vc-alert` | BLK | Aviso de throttling / validación | `--vc-danger` para throttling |
| `vc-concept-callout` | Propio | Nota didáctica breve dentro de un flujo | Máx. 2 frases |

---

## 9. Responsive Behavior

| Pantalla | < 768 px | 768 – 991 px | ≥ 992 px |
|---|---|---|---|
| Simulador | Controles arriba, gráfica debajo, métricas en 2 columnas | Igual, métricas en 4 columnas | Panel lateral fijo + gráfica fluida |
| Comparador | A y B apilados, delta al final | 2 columnas | 2 columnas + delta central |
| Mis aparatos | Tarjetas, resumen anclado al pie | Tabla, resumen al pie | Tabla + resumen `sticky` lateral |
| Contenido | Columna única | Columna única | Columna única centrada, 68ch |

**Reglas duras**
- Ningún scroll horizontal en ninguna pantalla desde 360 px (AC-5.3).
- Las gráficas desbordantes hacen scroll **dentro de su propio contenedor**, nunca en el `body`.
- Objetivo táctil mínimo 44 × 44 px en todo control de simulación.

---

## 10. Accessibility Expectations

Objetivo: **WCAG 2.1 AA** como práctica de diseño (no certificación formal — ver PRD A5).

| Área | Regla |
|---|---|
| Contraste | ≥ 4.5:1 texto normal, ≥ 3:1 texto grande y bordes de control. `--vc-text-secondary` **no** se usa para datos, solo para apoyo |
| Color no es el único canal | Las series se distinguen además por estilo de línea y por etiqueta directa; el throttling se anuncia con texto, no solo con rojo |
| Teclado | Todo control alcanzable con `Tab`; sliders operables con flechas (paso fino) y `PageUp/Down` (paso grueso); foco visible con anillo de 2 px en `--vc-primary` |
| Lectores de pantalla | La gráfica expone una tabla de datos equivalente (`aria-describedby`); los eventos de throttling se anuncian con `aria-live="polite"` |
| Movimiento | `prefers-reduced-motion: reduce` → transiciones a 0 ms y la simulación se refresca en pasos discretos sin animación de barrido |
| Formularios | Toda entrada con `<label>` asociada; error vinculado con `aria-describedby` y `aria-invalid` |

---

## 11. Dark Mode Behavior

**El producto es dark-only en v1** (PRD O7). BLK Design System es un sistema dark-first: su paleta, sus gradientes y sus sombras están calibrados sobre `#1e1e2f`, y forzar un modo claro exigiría recalibrar toda la §7 para un beneficio que ninguna persona del PRD pidió.

Consecuencias que sí se implementan:
- `color-scheme: dark` declarado, para que los controles nativos y las barras de scroll acompañen.
- El fondo se pinta explícitamente en `body`; nunca se hereda.
- Los tokens se declaran en `:root` sin bloque `@media (prefers-color-scheme: light)`, y esa ausencia es deliberada, no un olvido.
- Si en el futuro se añade modo claro, entra por ADR y recalibra §7.1 completa.

---

## 12. Design Decisions

| # | Decisión | Alternativa descartada | Razón |
|---|---|---|---|
| DD-1 | Portar los tokens y estilos de BLK a Angular actual | Fijar la versión Angular antigua del template | Herramientas modernas (standalone, signals) sin renunciar a la identidad visual; costo acotado a una tarea de portado |
| DD-2 | Solo la versión **free (MIT)** de BLK | Versión PRO | Restricción C1: cero licencias de pago |
| DD-3 | Dark-only | Doble tema | BLK es dark-first; el doble tema duplica el trabajo de tokens sin usuario que lo pida |
| DD-4 | Un color fijo por magnitud en toda la app (§7.3) | Paleta por gráfica | El estudiante aprende a leer el color; cambiarlo entre pantallas rompe el aprendizaje |
| DD-5 | Sin botón "Calcular" para parámetros continuos | Formulario + submit | PE2: el cálculo es local e instantáneo; un submit inserta una pausa artificial entre causa y efecto |
| DD-6 | Escalas compartidas obligatorias en comparación | Autoescala por panel | Autoescalar hace que dos curvas muy distintas se vean iguales: enseña lo contrario de lo que se quiere enseñar |
| DD-7 | Sin sidebar | Layout de dashboard | Tres módulos no justifican navegación persistente de segundo nivel |
| DD-8 | Estado del simulador en la URL | Solo estado en memoria | Permite al docente compartir una configuración exacta; cuesta poco y elimina la necesidad de "guardar" |
| DD-9 | Números en tipografía monoespaciada tabular | Tipografía proporcional | Un valor que cambia en vivo con ancho variable tiembla y roba atención al fenómeno |

---

## 13. Open Gaps / Open Questions

| # | Pregunta | Estado |
|---|---|---|
| GQ-1 | Los hex exactos del SCSS de BLK free deben verificarse contra la fuente durante la tarea de portado | Abierto — §7 es la fuente de verdad tras verificar |
| GQ-2 | ¿Librería de gráficas o SVG propio? Decisión técnica con impacto visual | Abierto — se decide en el TRD (ADR-004) |
| GQ-3 | ¿La app necesita logotipo propio o basta la marca tipográfica "Variación y Cambio"? | Abierto |
| GQ-4 | ¿Hay guía de identidad institucional que el proyecto deba respetar? | Abierto — depende del documento del curso |
| GQ-5 | Representación visual del lazo de realimentación en Conceptos: ¿diagrama animado o estático? | Abierto — un diagrama animado enseña mejor pero cuesta; decidir con el presupuesto de tiempo |
