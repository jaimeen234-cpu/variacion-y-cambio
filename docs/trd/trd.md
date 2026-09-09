# TRD — Variación y Cambio

> **Qué es esto:** el plano técnico del sistema. Decide estructura, capas, modelo de datos, contratos y NFRs. El *qué* y el *por qué* de producto viven en [`docs/prd.md`](../prd.md); el *cómo se ve* en [`docs/ux-ui/design.md`](../ux-ui/design.md).

| Campo | Valor |
|---|---|
| Estado | Draft v0.1 |
| Tier arquitectónico | **LITE** (ver ADR-001) |
| Estilo | **Hexagonal (puertos y adaptadores)** dentro de una SPA única |
| Última actualización | 2026-09-08 |

---

## 1. System Overview

Aplicación web de página única (SPA) en Angular que ejecuta **simulaciones deterministas de física energética en el navegador**. No hay servidor de aplicación, ni base de datos, ni API propia: los datos de referencia se sirven como archivos JSON estáticos y todo el cómputo ocurre en el cliente.

Dos capacidades de dominio:

| Capacidad | Naturaleza técnica |
|---|---|
| **Lazo térmico** | Simulación numérica de paso fijo sobre un modelo potencia→calor→throttling con realimentación negativa |
| **Consumo y costo** | Cálculo aritmético determinista sobre un conjunto de aparatos y una tarifa |

Ambas son **funciones puras sobre datos de entrada**: sin efectos, sin reloj del sistema, sin aleatoriedad. Esa pureza es lo que hace posible que el dominio viva completamente fuera de Angular y sea verificable con pruebas unitarias sin DOM (AC-2.2, AC-4.1).

---

## 2. Architecture Overview & Decisions

### 2.1 C4 Nivel 1 — Contexto

```
                        ┌───────────────────────────────────┐
   ┌──────────┐         │                                   │
   │Estudiante│────────►│      Variación y Cambio           │
   └──────────┘  usa    │      (SPA, navegador)             │
                        │                                   │
   ┌──────────┐         │  Simula, calcula y explica el     │
   │ Docente  │────────►│  lazo energía → calor → límite    │
   └──────────┘ demuestra                                   │
                        └────────────────┬──────────────────┘
                                         │ HTTP GET (estático)
                                         ▼
                        ┌───────────────────────────────────┐
                        │  Hosting estático (CDN/Pages)     │
                        │  bundle + assets JSON             │
                        └───────────────────────────────────┘

LEYENDA
  ┌──┐ persona/sistema    ───► relación con su verbo
  No existen sistemas externos, APIs de terceros ni almacenes de datos remotos.
  El navegador es el único entorno de ejecución.
```

### 2.2 C4 Nivel 2 — Contenedores

```
┌─────────────────────────── NAVEGADOR ────────────────────────────────┐
│                                                                      │
│  ┌──────────────────────── SPA Angular ───────────────────────────┐  │
│  │                                                                │  │
│  │   ui/            Componentes standalone, signals, rutas        │  │
│  │     │  invoca (solo casos de uso, nunca el dominio directo)    │  │
│  │     ▼                                                          │  │
│  │   application/   Casos de uso — orquestan dominio + puertos    │  │
│  │     │  depende de ► interfaces (puertos), nunca de clases      │  │
│  │     ▼                                                          │  │
│  │   domain/        Entidades, value objects, servicios, PUERTOS  │  │
│  │                  ⚠ cero imports de @angular/* o de UI          │  │
│  │     ▲                                                          │  │
│  │     │  implementa                                              │  │
│  │   infrastructure/ Adaptadores: JSON HTTP, localStorage, URL    │  │
│  │                   + tokens de inyección de Angular             │  │
│  └────────────────────────────┬───────────────────────────────────┘  │
│                               │ fetch                                 │
│  ┌────────────────────────────▼───────────────────────────────────┐  │
│  │  assets/data/*.json  — escenarios térmicos, catálogo aparatos  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  localStorage — persistencia opcional del setup del usuario    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

LEYENDA
  ▼ / ▲ dirección de la dependencia de compilación (no del flujo de datos)
  ⚠     invariante verificable automáticamente (ver §12, prueba de arquitectura)
  La flecha de infrastructure hacia arriba es la INVERSIÓN de dependencias:
  el adaptador conoce el puerto; el dominio no conoce al adaptador.
```

### 2.3 Decisión de estilo y tier

**Tier: LITE.** La compuerta robust-vs-lite se resuelve sin ambigüedad: un único desplegable, un único entorno de ejecución (navegador), sin escalado independiente, sin equipos múltiples, sin requisitos regulatorios. Ninguna escenario de calidad de §3 requiere estructura adicional. Escalar a ROBUST aquí sería arquitectura decorativa.

**Estilo: Hexagonal.** No se elige por moda: es un requisito explícito del entregable académico (PRD C3) **y** está justificado por el escenario de modificabilidad MOD-1 (§3.4) — cambiar el origen de datos sin tocar el dominio es el criterio que el evaluador puede comprobar (AC-4.3).

### 2.4 Índice de ADRs

| # | Decisión | Estado |
|---|---|---|
| ADR-001 | Tier LITE — SPA única, hexagonal interno | Aceptada |
| ADR-002 | Sin backend: todo el cómputo en el cliente | Aceptada |
| ADR-003 | Angular actual + portado del SCSS de BLK free | Aceptada |
| ADR-004 | Chart.js (MIT) tras un adaptador, en vez de SVG propio | Aceptada |
| ADR-005 | Simulación de paso fijo, determinista, con reloj inyectado | Aceptada |
| ADR-006 | Signals solo en la capa `ui/`; el dominio no conoce reactividad | Aceptada |
| ADR-007 | Persistencia opcional en `localStorage` tras un puerto | Aceptada |
| ADR-008 | Español fijo, sin infraestructura de i18n en v1 | Aceptada |

---

#### ADR-001 — Tier LITE con hexagonal interno

- **Problema:** ¿cuánta arquitectura justifica una app didáctica de dos módulos sin backend?
- **Decisión:** un solo desplegable estático, con separación hexagonal **dentro** del bundle.
- **Alternativas:** (a) Angular "por defecto" con servicios que hacen todo — rechazada: incumple PRD C3 y hace el dominio no verificable sin DOM. (b) Monorepo con librerías Nx por capa — rechazada: la frontera se puede imponer con una prueba de arquitectura (§12) a coste cero, y Nx añade herramienta y ceremonia sin cambiar la propiedad.
- **Implicaciones:** la frontera es una convención **verificada por prueba automática**, no un acto de fe.

#### ADR-002 — Sin backend

- **Problema:** el dominio requiere cálculo, no almacenamiento compartido.
- **Decisión:** cero servidor de aplicación. Datos de referencia como JSON estático; estado de usuario en memoria + `localStorage` opcional.
- **Alternativas:** BaaS gratuito (Supabase/Firebase) — rechazada: introduce cuenta, claves, cuota y una dependencia externa que PRD C1/C2 prohíben, para resolver un problema que el producto no tiene.
- **Implicaciones:** no hay telemetría (PRD O8); no hay sincronización entre dispositivos; el despliegue es un directorio de archivos.

#### ADR-003 — Angular actual + SCSS de BLK portado

- **Problema:** BLK Design System Angular free está construido sobre Angular ~8–13 con Bootstrap 4.
- **Decisión:** usar la versión actual de Angular (componentes standalone, signals, `provideRouter`) y portar los tokens y estilos de BLK como SCSS propio del proyecto.
- **Alternativas:** (a) fijar la versión antigua de Angular del template — rechazada: condena todo el proyecto a herramientas, documentación y patrones obsoletos, justo lo que el evaluador mira. (b) Tomar solo la paleta sin el SCSS — descartada como decisión por defecto, pero sigue siendo el plan B si el portado resulta más caro de lo previsto.
- **Implicaciones:** una tarea de portado explícita al inicio; los hex de la §7 del documento UX/UI deben verificarse contra el SCSS fuente (GQ-1). Solo la versión **free (MIT)**; ningún asset PRO.

#### ADR-004 — Chart.js tras un adaptador

- **Problema:** las series temporales del simulador se refrescan cada 100 ms con umbral y marcadores, y el color por magnitud es una regla dura de producto (UX §7.3).
- **Decisión:** **Chart.js (MIT)** envuelto en el componente `vc-time-chart`, que es el **único** archivo del proyecto que importa la librería.
- **Alternativas:** (a) SVG propio — mejor control y cero dependencias, pero un costo de desarrollo que un proyecto académico con fecha no debería pagar por un beneficio marginal. (b) ngx-charts — otra capa Angular encima con menos control fino del eje y del umbral. (c) plugin de anotaciones de Chart.js — innecesario: el umbral se dibuja como una serie más.
- **Implicaciones:** un solo punto de sustitución si la librería estorba; la regla de color de UX §7.3 se configura en un único sitio.

#### ADR-005 — Simulación determinista de paso fijo

- **Problema:** una simulación acoplada a `requestAnimationFrame` o a `Date.now()` produce resultados distintos en cada corrida y en cada máquina — y AC-1.4 exige lo contrario.
- **Decisión:** el motor de simulación es una **función pura** `simular(config, horizonte, Δt) → SimulationRun` con paso fijo `Δt`. La animación en pantalla es un *reproductor* que recorre un resultado ya calculado; no es la simulación.
- **Alternativas:** simular en tiempo real dentro del bucle de render — rechazada: rompe el determinismo, hace las pruebas dependientes del tiempo y ata la física a la tasa de refresco del monitor.
- **Implicaciones:** comparar dos configuraciones es trivial (dos resultados, mismo eje). Pausar/reanudar no altera la física. La simulación completa se calcula de una vez y se reproduce.

#### ADR-006 — Signals solo en `ui/`

- **Problema:** ¿dónde vive el estado reactivo sin contaminar el dominio?
- **Decisión:** `signal` / `computed` se usan exclusivamente en `ui/`. Los casos de uso devuelven valores planos o `Promise`; el dominio devuelve estructuras inmutables.
- **Alternativas:** signals dentro de los casos de uso — rechazada: introduce `@angular/core` en `application/` y erosiona la frontera que AC-4.1 verifica. NgRx — rechazada: el estado global de esta app cabe en un puñado de signals; NgRx sería ceremonia pura.
- **Implicaciones:** los casos de uso son probables con `await` simple, sin `TestBed`.

#### ADR-007 — `localStorage` tras un puerto

- **Problema:** perder la lista de aparatos al recargar es molesto; depender de persistencia no lo es.
- **Decisión:** puerto `UserSetupStorage` con adaptador `LocalStorageUserSetup`, envuelto en `try/catch` y con adaptador nulo como respaldo (`InMemoryUserSetup`).
- **Alternativas:** persistir directamente desde el componente — rechazada: acopla la UI a una API del navegador y hace imposible probar el flujo sin navegador.
- **Implicaciones:** en modo incógnito o con almacenamiento bloqueado, la app funciona degradada sin errores visibles. Se decide **explícitamente no persistir** el resultado de simulaciones: la URL ya lleva la configuración (UX DD-8).

#### ADR-008 — Español fijo, sin i18n

- **Problema:** ¿montar `@angular/localize` para un idioma?
- **Decisión:** textos en español, en constantes de `ui/`, sin infraestructura de traducción.
- **Alternativas:** i18n desde el día uno — rechazada por PRD O6; añade un pipeline de extracción y compilación por un requisito que nadie pidió.
- **Implicaciones:** añadir un idioma después es un refactor acotado a `ui/`, no un rediseño. Condición para revisitar: que la rúbrica del curso lo exija.

---

## 3. Quality Attribute Scenarios (NFRs)

Formato: `[Fuente] → [Estímulo] sobre [Artefacto] durante [Entorno] ⇒ [Respuesta] medido por [Medida]`.

### 3.1 Rendimiento *(el atributo dominante — PE2 y AC-5.2 dependen de él)*

| ID | Escenario | Táctica |
|---|---|---|
| PERF-1 | Estudiante → arrastra un slider de parámetro sobre el simulador durante operación normal ⇒ la app recalcula y repinta la gráfica **medido por p95 < 100 ms** desde el evento `input` hasta el repintado | *Controlar la demanda*: recalcular solo la serie afectada; `Δt` acotado a ≤ 600 pasos por corrida |
| PERF-2 | Reproductor → avanza un fotograma de simulación sobre `vc-time-chart` durante reproducción ⇒ actualiza la vista **medido por ≥ 30 fps sostenidos y 0 fotogramas > 50 ms** | *Controlar la demanda*: `OnPush` + reproducción sobre datos precalculados (ADR-005); sin recomputar física por fotograma |
| PERF-3 | Usuario → abre la app en 3G simulado sobre el bundle inicial ⇒ primera simulación interactiva **medido por LCP < 2.5 s y bundle inicial < 500 KB comprimido** | *Gestionar recursos*: carga diferida por ruta de módulo; JSON de catálogo cargado bajo demanda, no en el arranque |
| PERF-4 | Estudiante → ejecuta una corrida de 600 pasos sobre el motor de simulación ⇒ produce el `SimulationRun` completo **medido por < 30 ms en hardware de gama media** | *Eficiencia computacional*: aritmética escalar, sin asignaciones por paso dentro del bucle |

### 3.2 Testabilidad *(atributo elevado a arquitectónico por AC-2.2 y AC-4.1)*

| ID | Escenario | Táctica |
|---|---|---|
| TEST-1 | Desarrollador → ejecuta la suite del dominio sobre `domain/` en CI o local ⇒ todas las fórmulas publicadas quedan cubiertas **medido por 100% de las funciones de `domain/services/` con caso de referencia, y 0 uso de `TestBed` en esas pruebas** | *Separación interfaz/implementación*; costuras deterministas (reloj y paso inyectados) |
| TEST-2 | Prueba de arquitectura → inspecciona los imports de `domain/` y `application/` durante CI ⇒ falla si aparece `@angular/*`, `chart.js` o cualquier import de `infrastructure/`/`ui/` **medido por exit code ≠ 0** | *Encapsulación* verificada, no confiada |
| TEST-3 | Caso de uso → se ejecuta con adaptadores falsos en memoria durante pruebas ⇒ produce el mismo resultado que con los adaptadores reales **medido por suite de aplicación verde sin red ni DOM** | *Inyección de dependencias* para dobles de prueba |

### 3.3 Usabilidad *(la porción arquitectónica)*

| ID | Escenario | Táctica |
|---|---|---|
| USA-1 | Docente → pausa la simulación en clase sobre el reproductor durante una demostración ⇒ la simulación se detiene sin perder estado y reanuda en el mismo punto **medido por igualdad exacta del `SimulationRun` antes y después de la pausa** | *Soporte de cancelar/reanudar*: reproducción desacoplada del cálculo (ADR-005) |
| USA-2 | Estudiante → introduce un valor fuera de rango físico sobre un control de parámetro ⇒ la app rechaza el valor y explica el rango **medido por 0 resultados numéricos producidos a partir de una entrada inválida** | *Separación UI/lógica*: la validación vive en los value objects del dominio, no en el formulario |
| USA-3 | Docente → comparte la URL del simulador sobre el enrutador ⇒ el receptor ve exactamente la misma configuración **medido por igualdad de todos los parámetros de simulación tras la carga** | *Estado externalizado* en query params |

### 3.4 Modificabilidad

| ID | Escenario | Táctica |
|---|---|---|
| MOD-1 | Desarrollador → sustituye el origen de datos JSON por otro (API, BaaS, IndexedDB) sobre la capa de infraestructura ⇒ el sistema funciona igual **medido por 0 archivos modificados en `domain/` y `application/`** | *Prevenir el efecto dominó*: patrón Repository tras puerto; *ligadura diferida* vía `InjectionToken` |
| MOD-2 | Desarrollador → añade un tercer módulo didáctico sobre la app ⇒ se integra **medido por ≤ 1 archivo de rutas tocado y 0 cambios en módulos existentes** | *Coherencia semántica*: un directorio por capacidad de dominio; rutas con carga diferida |
| MOD-3 | Desarrollador → cambia la librería de gráficas sobre la capa de presentación ⇒ el resto sigue igual **medido por ≤ 1 componente modificado (`vc-time-chart`)** | *Intermediario* (ADR-004) |

### 3.5 Seguridad

**Superficie real:** la app no autentica, no autoriza, no almacena datos personales, no expone API y no ejecuta código de servidor. Las tácticas de resistir/detectar/recuperar del catálogo estándar **no son arquitectónicamente significativas aquí** — declararlo es la salida requerida, no omitirlo.

Lo que **sí** aplica:

| ID | Escenario | Táctica |
|---|---|---|
| SEC-1 | Estudiante → pega una configuración manipulada en la URL sobre el enrutador ⇒ la app valida y descarta lo inválido, cargando el escenario por defecto **medido por 0 excepciones no controladas y 0 valores fuera de rango aceptados** | *Validar entradas* en el borde: todo query param pasa por los value objects del dominio |
| SEC-2 | Navegador → carga la app sobre el hosting estático ⇒ se sirve por HTTPS y sin dependencias de terceros en tiempo de ejecución **medido por 0 peticiones a orígenes externos en la pestaña de red** | *Limitar exposición*: assets y fuentes empaquetados con la app, no traídos de una CDN de terceros |
| SEC-3 | Cadena de suministro → una dependencia introduce una vulnerabilidad conocida sobre el bundle ⇒ se detecta antes del despliegue **medido por `npm audit` sin vulnerabilidades altas o críticas** | *Detección*: auditoría de dependencias en la verificación; superficie mínima de dependencias |

### 3.6 Disponibilidad, Escalabilidad, Observabilidad, Coste

| Atributo | Veredicto | Justificación |
|---|---|---|
| **Disponibilidad** | No arquitectónicamente significativa | Archivos estáticos en CDN. No hay proceso propio que pueda caerse, no hay RTO/RPO que diseñar. La única táctica aplicable — *degradación elegante* si `localStorage` falla — ya está en ADR-007 |
| **Escalabilidad** | No arquitectónicamente significativa | El cómputo ocurre en el dispositivo del usuario: N usuarios son N navegadores. Servir estáticos escala en el CDN, no en el diseño |
| **Observabilidad** | Deliberadamente ausente en v1 | Sin backend no hay telemetría (PRD O8). El sustituto es el registro en consola en desarrollo y `ErrorHandler` global en producción (§11). Añadir observabilidad real exigiría un servidor y una decisión de privacidad que nadie ha pedido |
| **Coste** | Objetivo: **0 USD/mes** | Hosting estático gratuito, dependencias OSS, sin servicios con cuota. Es una **restricción dura** (PRD C1), y es el motivo por el que ADR-002 rechaza el BaaS |

### 3.7 Tensiones declaradas

| Tensión | Resolución |
|---|---|
| Modificabilidad ↔ Rendimiento | La indirección hexagonal añade saltos irrelevantes frente al coste del bucle numérico. Se mantiene la indirección; si PERF-4 fallara, se aplana **solo** el bucle medido |
| Modificabilidad ↔ Simplicidad | Cuatro capas para dos módulos es más ceremonia de la que un producto comercial necesitaría. Se acepta porque la arquitectura **es parte del entregable evaluado** (PRD C3, AC-4) |
| Fidelidad física ↔ Claridad didáctica | Gana la claridad: modelo RC de primer orden, transparente y explicable (PRD A2, O5). Un solver más fiel enseñaría menos |
| Cero dependencias ↔ Tiempo de entrega | Gana el tiempo (ADR-004): Chart.js entra, aislado tras un componente |

---

## 4. Domain Modules & Responsibilities

```
src/app/
├── domain/                    ⚠ CERO imports de @angular/*, chart.js, rxjs
│   ├── shared/
│   │   ├── value-objects/     Voltios, Watts, Celsius, Hertz, Kilovatiohora, Dinero
│   │   └── errors/            RangoInvalidoError, EscenarioNoEncontradoError
│   ├── thermal/
│   │   ├── model/             EspecificacionCpu, EspecificacionDisipador, EscenarioTermico,
│   │   │                      ConfiguracionSimulacion, PasoSimulacion, EventoSimulacion,
│   │   │                      ResultadoSimulacion, MetricasResumen
│   │   ├── services/          ModeloPotencia, ModeloTermico, PoliticaThrottling,
│   │   │                      SimuladorLazoTermico, ComparadorConfiguraciones
│   │   └── ports/             RepositorioEscenarios
│   └── consumption/
│       ├── model/             Aparato, PerfilUso, Tarifa, DesgloseConsumo, ComparacionEficiencia
│       ├── services/          CalculadoraConsumo, ComparadorEficiencia
│       └── ports/             RepositorioCatalogoAparatos, AlmacenamientoSetupUsuario
│
├── application/               Casos de uso — una clase por caso, método `ejecutar()`
│   ├── thermal/               ListarEscenarios, EjecutarSimulacion, CompararSimulaciones
│   └── consumption/           CargarCatalogo, CalcularConsumoMensual, CompararAparatos,
│                              ImportarPotenciaDeSimulacion
│
├── infrastructure/            Adaptadores + tokens de inyección
│   ├── http/                  JsonRepositorioEscenarios, JsonRepositorioCatalogoAparatos
│   ├── storage/               LocalStorageSetupUsuario, EnMemoriaSetupUsuario (respaldo)
│   ├── routing/               AdaptadorEstadoUrl
│   └── di/                    tokens.ts + providers.ts
│
└── ui/                        Angular: componentes standalone, signals, rutas, estilos
    ├── shared/                vc-card, vc-slider, vc-metric-card, vc-formula-popover,
    │                          vc-time-chart, vc-event-timeline, vc-alert…
    ├── pages/                 inicio, lazo-termico, consumo, conceptos, no-encontrado
    └── styles/                tokens BLK portados (_tokens.scss, _blk.scss)
```

### Responsabilidades por capa *(la regla que la prueba TEST-2 verifica)*

| Capa | Puede importar de | Nunca importa de |
|---|---|---|
| `domain/` | solo de `domain/` | Angular, RxJS, Chart.js, `application/`, `infrastructure/`, `ui/` |
| `application/` | `domain/` | Angular, `infrastructure/`, `ui/` |
| `infrastructure/` | `domain/`, `application/`, Angular | `ui/` |
| `ui/` | todas | — |

### Patrones aplicados *(cada uno atado a un problema)*

| Patrón | Problema que resuelve | Alternativa más simple descartada |
|---|---|---|
| **Repository** (tras puerto) | El dominio necesita escenarios sin saber que son un JSON servido por HTTP | Llamar `fetch` desde el caso de uso — imposibilita MOD-1 y las pruebas sin red |
| **Strategy** (`PoliticaThrottling`) | Distintos escenarios recortan la frecuencia de forma distinta (escalón fijo, proporcional) | Un `if` por tipo dentro del simulador — crece con cada escenario y ensucia el bucle |
| **Value Object** (`Watts`, `Celsius`…) | Validar rangos físicos en un único lugar y evitar sumar voltios con vatios | `number` desnudo — la validación se repetiría en cada formulario (contradice USA-2) |
| **Adapter** (`vc-time-chart`) | Aislar Chart.js del resto de la UI | Usar Chart.js directamente en cada página — MOD-3 dejaría de cumplirse |
| **Null Object** (`EnMemoriaSetupUsuario`) | `localStorage` puede no existir o estar bloqueado | `if (localStorage)` esparcido por la UI |

---

## 5. Data Model & Entities

> Conceptual. Los tipos concretos se definen en el `design.md` de cada spec.

### 5.1 Dominio térmico

| Entidad / VO | Campos clave | Invariantes |
|---|---|---|
| `EspecificacionCpu` | `capacitanciaEfectiva` (F), `voltajeMin/Max` (V), `frecuenciaBase/Max` (Hz), `potenciaEstaticaBase` (W), `tempThrottle` (°C), `tempCritica` (°C) | `voltajeMin < voltajeMax`; `frecuenciaBase ≤ frecuenciaMax`; `tempThrottle < tempCritica` |
| `EspecificacionDisipador` | `resistenciaTermica` R (°C/W), `capacitanciaTermica` C (J/°C), `nombre` | `R > 0`, `C > 0` |
| `EscenarioTermico` | `id`, `nombre`, `descripcion`, `cpu`, `disipador`, `tempAmbiente` | referencia íntegra a cpu y disipador |
| `ConfiguracionSimulacion` | `escenarioId`, `voltaje`, `frecuenciaObjetivo`, `cargaTrabajo` (0–1), `tempAmbiente`, `disipadorId`, `horizonte` (s), `paso` (s) | cada valor dentro del rango de su especificación; `paso > 0`; `horizonte/paso ≤ 600` (PERF-1) |
| `PasoSimulacion` | `t`, `potencia`, `temperatura`, `frecuenciaEfectiva`, `enThrottling`, `trabajoAcumulado` | inmutable |
| `EventoSimulacion` | `t`, `tipo` (`THROTTLE_INICIO` \| `THROTTLE_FIN` \| `TEMP_CRITICA`), `causa` (texto) | `causa` siempre presente (AC-1.3) |
| `ResultadoSimulacion` | `configuracion`, `pasos[]`, `eventos[]`, `metricas` | determinista para una configuración dada (AC-1.4) |
| `MetricasResumen` | `potenciaMedia`, `tempMaxima`, `frecuenciaEfectivaMedia`, `trabajoUtilTotal`, `tiempoEnThrottling`, `eficiencia` (trabajo/energía) | derivadas, nunca almacenadas aparte |

### 5.2 Dominio de consumo

| Entidad / VO | Campos clave | Invariantes |
|---|---|---|
| `Aparato` | `id`, `nombre`, `categoria`, `potencia` (W), `origen` (`catalogo` \| `usuario` \| `simulacion`) | `potencia > 0` |
| `PerfilUso` | `aparatoId`, `horasDia`, `diasMes` | `0 ≤ horasDia ≤ 24`; `1 ≤ diasMes ≤ 31` |
| `Tarifa` | `costoPorKwh`, `moneda` | `costoPorKwh ≥ 0` |
| `DesgloseConsumo` | `lineas[] {aparato, kwhMes, costoMes, porcentaje}`, `kwhTotal`, `costoTotal` | `Σ porcentaje = 100 ± 0.01`; ordenado descendente (AC-3.2) |
| `ComparacionEficiencia` | `aparatoA`, `aparatoB`, `deltaKwh`, `deltaCosto`, `ahorroAnual` | ambos con el mismo `PerfilUso` |

### 5.3 Modelo físico *(publicado — AC-2.1 obliga a mostrarlo)*

| Magnitud | Fórmula | Nota |
|---|---|---|
| Potencia dinámica | `P_din = C · V² · f · carga` | Cuadrática en voltaje: la razón de que subir V queme desproporcionadamente |
| Potencia estática | `P_est = P_est_base · (V / V_nom)` | Simplificada a propósito (PRD A2) |
| Potencia total | `P = P_din + P_est` | |
| Temperatura (RC, paso `Δt`) | `T_{n+1} = T_amb + P·R + (T_n − T_amb − P·R) · e^(−Δt / (R·C))` | Modelo térmico de primer orden |
| Throttling | si `T > T_throttle` ⇒ `f ← max(f_base, f − Δf)`; si `T < T_throttle − histéresis` ⇒ `f ← min(f_obj, f + Δf)` | La histéresis evita oscilación de un paso |
| Trabajo útil | `W = Σ f_efectiva · Δt · carga` | Proxy didáctico de "trabajo realizado" |
| Consumo | `kWh = P · h · d / 1000` | AC-3.1 |
| Costo | `costo = kWh · tarifa` | |

---

## 6. API Surface & Contracts

**No hay API HTTP propia** (ADR-002). Los contratos del sistema son de dos tipos:

### 6.1 Puertos (contratos internos — la frontera hexagonal)

| Puerto | Operación | Contrato |
|---|---|---|
| `RepositorioEscenarios` | `listar(): Promise<EscenarioTermico[]>` | Nunca vacío; error tipado si el origen falla |
| | `obtenerPorId(id): Promise<EscenarioTermico>` | Lanza `EscenarioNoEncontradoError` si no existe |
| `RepositorioCatalogoAparatos` | `listar(): Promise<Aparato[]>` | Ordenado por categoría y nombre |
| `AlmacenamientoSetupUsuario` | `guardar(setup): Promise<void>` | Nunca lanza: falla en silencio y degrada (ADR-007) |
| | `recuperar(): Promise<SetupUsuario \| null>` | `null` si no hay nada guardado o el almacén no está disponible |

**Regla:** todo puerto devuelve tipos del dominio, nunca DTOs crudos. La traducción JSON → dominio ocurre en el adaptador, y ahí se valida.

### 6.2 Contrato de datos estáticos

| Archivo | Forma | Validación |
|---|---|---|
| `assets/data/escenarios.json` | `{ version: string, escenarios: EscenarioTermicoDto[] }` | El adaptador valida cada campo y rechaza el registro inválido registrando el motivo; un registro corrupto no rompe la carga del resto |
| `assets/data/aparatos.json` | `{ version: string, aparatos: AparatoDto[] }` | Igual |

El campo `version` existe para que un cambio de forma sea detectable en lugar de silencioso.

### 6.3 Contrato de URL *(estado compartible — USA-3, UX DD-8)*

```
/lazo-termico?esc=<id>&v=<voltios>&f=<GHz>&carga=<0-1>&amb=<°C>&dis=<id>
```

Todo parámetro es opcional; ausente ⇒ valor por defecto del escenario. Inválido ⇒ se descarta ese parámetro, se usa el defecto y se avisa (SEC-1).

---

## 7. Backend Workflows & Business Rules

No hay backend. Esta sección documenta los **flujos de negocio del cliente**, que es donde vive la lógica.

### W1 — Ejecutar una simulación

```
1. UI recoge parámetros                    ui/
2. Se construyen value objects             → validan rango; error ⇒ se aborta y se explica (USA-2)
3. EjecutarSimulacion.ejecutar(config)     application/
4.   ├─ RepositorioEscenarios.obtenerPorId()   puerto → adaptador JSON
5.   └─ SimuladorLazoTermico.simular(...)      domain/, función pura
6.        bucle de N pasos:
6.1         P    = ModeloPotencia.calcular(V, f_ef, carga)
6.2         T    = ModeloTermico.siguiente(T, P, R, C, Δt, T_amb)
6.3         f_ef = PoliticaThrottling.ajustar(f_ef, T, spec)
6.4         si cambió el estado de throttling ⇒ se registra EventoSimulacion
7. Se calculan MetricasResumen              domain/
8. UI reproduce el resultado paso a paso    ui/, sin recalcular (ADR-005)
```

**Reglas de negocio duras**

| # | Regla |
|---|---|
| BR-1 | La simulación es determinista: misma entrada ⇒ misma salida, bit a bit (AC-1.4) |
| BR-2 | La frecuencia efectiva nunca baja de `frecuenciaBase` ni sube por encima de `frecuenciaObjetivo` |
| BR-3 | Superar `tempCritica` emite el evento correspondiente y **no** detiene la simulación: el propósito didáctico es que el estudiante vea la consecuencia |
| BR-4 | El throttling incorpora histéresis; sin ella el sistema oscila cada paso y enseña un artefacto numérico en lugar de física |
| BR-5 | Ningún resultado se muestra sin la unidad y sin la fórmula consultable (PE3, AC-2.1) |

### W2 — Calcular consumo

```
1. CalcularConsumoMensual.ejecutar(aparatos, perfiles, tarifa)   application/
2.   └─ CalculadoraConsumo.desglosar(...)                        domain/
3.        por aparato: kWh = P·h·d/1000 ; costo = kWh · tarifa
4.        se ordena descendente y se calculan porcentajes         BR-6
5. AlmacenamientoSetupUsuario.guardar(setup)                      puerto, best-effort
```

| # | Regla |
|---|---|
| BR-6 | El desglose siempre va ordenado de mayor a menor consumo, con porcentaje sobre el total (AC-3.2) |
| BR-7 | Los porcentajes suman 100 ± 0.01; el redondeo nunca se muestra sin cuadrar |
| BR-8 | Un aparato importado desde una simulación conserva su origen (`simulacion`) para que el estudiante vea la trazabilidad entre módulos (US-2.5) |

---

## 8. Frontend Architecture & State Boundaries

| Aspecto | Decisión |
|---|---|
| Componentes | **Standalone**, sin `NgModule` |
| Detección de cambios | `ChangeDetectionStrategy.OnPush` en todos los componentes, sin excepción (PERF-2) |
| Reactividad | `signal` / `computed` / `effect`, solo en `ui/` (ADR-006) |
| Rutas | `provideRouter` con carga diferida por página (`loadComponent`) — sirve a PERF-3 y MOD-2 |
| Formularios | Reactive Forms; la validación de rango la aporta el dominio, el formulario solo la refleja |
| Inyección | Función `inject()`; los puertos se resuelven por `InjectionToken` |
| HTTP | `provideHttpClient` usado **solo** dentro de `infrastructure/http/` |

### Fronteras de estado

| Estado | Dónde vive | Por qué |
|---|---|---|
| Configuración actual del simulador | Signal en el componente de página, **espejada en la URL** | Compartible (USA-3) y desechable |
| Resultado de la simulación | Signal de solo lectura en la página; se reemplaza entero, nunca se muta | Inmutabilidad = determinismo verificable |
| Posición del reproductor (fotograma actual) | Signal local del reproductor | Es estado de presentación, no de dominio |
| Configuración guardada A/B para comparar | Signal en el componente comparador | Vive lo que dura la comparación |
| Lista de aparatos del usuario | Signal en la página de consumo + `localStorage` vía puerto | Sobrevive la recarga si el navegador lo permite |
| Catálogos (escenarios, aparatos) | Cargados por caso de uso, cacheados en el adaptador | Datos estáticos: se piden una vez |

**No hay store global.** Ningún estado se comparte entre módulos salvo el traspaso explícito de US-2.5, que viaja como parámetro de navegación. Introducir NgRx aquí sería resolver un problema que la app no tiene (ADR-006).

---

## 9. Integration Points

| Integración | Tipo | Nota |
|---|---|---|
| `assets/data/*.json` | Lectura HTTP del mismo origen | Único "origen de datos" del sistema |
| `localStorage` | API del navegador tras puerto | Opcional y degradable (ADR-007) |
| URL / History API | Vía `Router` de Angular, tras `AdaptadorEstadoUrl` | Estado compartible |
| Chart.js | Librería empaquetada | Aislada en `vc-time-chart` (ADR-004) |
| Fuentes tipográficas | **Empaquetadas con la app**, no traídas de una CDN externa | SEC-2: cero peticiones a terceros |

**Integraciones deliberadamente ausentes:** ninguna API de terceros, ningún servicio de analítica, ningún CDN de librerías, ninguna autenticación federada.

---

## 10. Security & Authorization Model

**No hay modelo de autorización, y esa es la decisión.** No existen usuarios, sesiones, roles ni datos privados: todo el contenido es público y didáctico, y todo el cómputo ocurre en el dispositivo del usuario con sus propios datos. Añadir autenticación sería introducir un riesgo (credenciales que gestionar) para proteger algo que no lo necesita.

Lo que sí se implementa, derivado de §3.5:

| # | Control | Implementación |
|---|---|---|
| SEC-A | Validación de toda entrada externa | Query params y JSON pasan por value objects antes de entrar al dominio |
| SEC-B | Sin `innerHTML` ni `bypassSecurityTrust*` | El contenido didáctico es estático en plantillas; la sanitización por defecto de Angular queda intacta |
| SEC-C | Cero orígenes externos en runtime | Fuentes y librerías empaquetadas; verificable en la pestaña de red |
| SEC-D | Transporte cifrado | Hosting estático con HTTPS obligatorio |
| SEC-E | Higiene de dependencias | `npm audit` sin severidad alta/crítica como parte de la verificación; superficie mínima de dependencias |
| SEC-F | Sin secretos en el repositorio | No hay claves que guardar — y no las habrá mientras ADR-002 se sostenga |

---

## 11. Error Handling & Observability

### Taxonomía de errores

| Clase | Ejemplo | Tratamiento |
|---|---|---|
| **Validación de dominio** | Voltaje fuera del rango de la CPU | Error tipado (`RangoInvalidoError`) con rango válido en el mensaje; la UI lo muestra junto al control (USA-2). **Esperado, no es un fallo** |
| **Datos no encontrados** | `escenarioId` inexistente en la URL | Se recurre al escenario por defecto y se avisa de forma no bloqueante (SEC-1) |
| **Fallo de carga de datos** | El JSON no responde o está corrupto | Mensaje explícito con acción de reintento; nunca una pantalla en blanco |
| **Almacenamiento no disponible** | `localStorage` bloqueado | Degradación silenciosa al adaptador en memoria (ADR-007). No se molesta al usuario con algo que no puede resolver |
| **Error inesperado** | Excepción no prevista | `ErrorHandler` global: pantalla de error dentro de la identidad visual + `console.error` con contexto |

**Regla:** los errores del dominio son **valores tipados**, no cadenas de texto. La UI decide cómo se ven; el dominio decide qué son.

### Observabilidad

Sin backend no hay telemetría (§3.6), y eso se declara en lugar de simularse.

| Entorno | Qué hay |
|---|---|
| Desarrollo | Registro estructurado en consola de cada corrida (configuración, duración, nº de eventos); marcas `performance.mark` alrededor del bucle para verificar PERF-4 |
| Producción | `ErrorHandler` global; sin telemetría remota, sin cookies, sin identificadores |

Si más adelante se exige medir G1/G5 de verdad, exige servidor y una decisión de privacidad: entra por ADR, no por parche.

---

## 12. Testing Strategy

| Nivel | Alcance | Herramienta | Regla |
|---|---|---|---|
| **Unitarias de dominio** | `domain/` — fórmulas, value objects, políticas, simulador | Runner por defecto del Angular CLI, **sin `TestBed`** | Cada fórmula publicada en §5.3 tiene al menos un caso de referencia con valor esperado calculado a mano (AC-2.2) |
| **Unitarias de aplicación** | `application/` — casos de uso con adaptadores falsos en memoria | Igual, sin `TestBed` | Ninguna prueba toca red, DOM ni `localStorage` real (TEST-3) |
| **Prueba de arquitectura** | Los imports de `domain/` y `application/` | Script propio en la verificación | Falla el build si aparece un import prohibido (TEST-2, AC-4.1). **Es la prueba que convierte la frontera en un hecho** |
| **Componentes** | Componentes de `ui/` con lógica no trivial (`vc-slider`, `vc-time-chart`, comparador) | `TestBed` | Se prueba comportamiento observable, no detalles internos |
| **E2E** *(opcional, según tiempo)* | Flujos F1 y F2 completos | Playwright (MIT) | Solo si el presupuesto de tiempo lo permite; su ausencia se declara, no se disimula |

**Casos de referencia obligatorios del dominio térmico**

| Caso | Verifica |
|---|---|
| Estado estacionario sin throttling: `T → T_amb + P·R` | Corrección del modelo RC en régimen permanente |
| Doblar el voltaje a frecuencia constante ⇒ potencia dinámica ×4 | La relación cuadrática (§5.3) |
| Configuración que cruza `tempThrottle` ⇒ existe `THROTTLE_INICIO` y `f_efectiva` decrece | AC-1.2, AC-1.3 |
| Dos corridas idénticas ⇒ resultados idénticos | AC-1.4, BR-1 |
| `f_efectiva` nunca sale de `[frecuenciaBase, frecuenciaObjetivo]` | BR-2 |
| Disipador con menor `R` a igual carga ⇒ `tempMaxima` menor y `tiempoEnThrottling` menor | US-1.5 |

**Comandos de verificación:** ver `## Verification Commands` en `AGENTS.md` / `CLAUDE.md`. Se usan siempre en su variante *agent-lean* (silenciosa en verde, verbatim completa en rojo).

---

## 13. Technical Constraints & Assumptions

### Restricciones

| # | Restricción | Origen |
|---|---|---|
| TC-1 | Solo dependencias con licencia permisiva (MIT / Apache-2.0 / BSD / OFL-1.1 para fuentes `@fontsource`). Cero paquetes de pago, cero versiones PRO, cero servicios con cuota | PRD C1 |
| TC-2 | Sin backend ni base de datos | PRD C2, ADR-002 |
| TC-3 | Arquitectura hexagonal obligatoria y **verificada automáticamente** | PRD C3, TEST-2 |
| TC-4 | Angular + identidad visual BLK free | PRD C4, ADR-003 |
| TC-5 | El bundle debe poder servirse desde un directorio estático, sin reescritura de rutas del servidor más allá del *fallback* a `index.html` | ADR-002 |
| TC-6 | Navegadores objetivo: dos últimas versiones de Chrome, Firefox, Edge y Safari. Sin soporte para navegadores legados | Contexto académico |
| TC-7 | Español en interfaz, documentación de producto y nombres del dominio; inglés en las palabras clave del lenguaje | PRD C6, ADR-008 |

### Supuestos técnicos

| # | Supuesto | Condición para revisarlo |
|---|---|---|
| TA-1 | El modelo RC de primer orden y la potencia dinámica cuadrática bastan para el propósito didáctico | Que el docente o el documento del curso exija otro modelo |
| TA-2 | 600 pasos de simulación cubren todos los horizontes didácticos útiles | Que un escenario requiera más resolución temporal |
| TA-3 | Chart.js rinde a ≥ 30 fps con ~600 puntos y 4 series en hardware de gama media | Medición real en la primera tarea que lo integre; si falla, aplica el plan B de ADR-004 |
| TA-4 | El SCSS de BLK free se porta a Angular actual en una tarea acotada | Si el portado desborda, se aplica la alternativa (b) de ADR-003: solo tokens |
| TA-5 | El runner por defecto del Angular CLI instalado sirve para las pruebas de dominio sin configuración extra | Resuelto en 001 — Vitest es el runner configurado y verificado (`npm run test:agent`), con soporte para filtro por archivo |
| TA-6 | Node v22.18.0 / npm 11.6.0 del entorno actual son la base de desarrollo | Fijado en 001 — `.nvmrc` fija `22.18.0` y `engines.node` en `package.json` declara `^20.19.0 || ^22.12.0 || >=24.0.0` |
