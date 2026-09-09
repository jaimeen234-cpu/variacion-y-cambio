# Diseño — Dominio y modelo funcional

| Campo | Valor |
|---|---|
| Spec | `docs/specs/002-feature-experiencia-variacion-cpu/01-dominio-modelo-funcional/` |
| Estado | **Draft — pendiente de aprobación** |
| Fecha | 2026-09-08 |
| Requisitos | [`requirements.md`](requirements.md) — RF-1…RF-11, RNF-1…RNF-7 |
| Profundidad | Full |
| Referencia visual | [`../mockup/index.html`](../mockup/index.html) — implementa F1–F8 en vivo; es la referencia numérica, no de interfaz |

---

## 1. Resumen de la solución

Se construye el núcleo matemático completo en `domain/`, su frontera hexagonal en `domain/**/ports/` + `infrastructure/`, y los cinco casos de uso que lo exponen en `application/`. Cero archivos bajo `ui/`.

La pieza central es una **función pura** `simular(escenario, disipador, configuracion) → ResultadoSimulacion`: recibe el paso `Δt` y el horizonte como dato, itera aritmética escalar sin leer reloj ni azar, y devuelve la corrida completa con sus eventos. La reproducción en pantalla es asunto de la hija `02`; aquí no existe el concepto de "tiempo real".

Dos decisiones cargan casi todo el peso del diseño, y ambas se tomaron contra medición, no contra intuición: el **estado de throttling es un entero** (escalón), no un flotante, lo que hace exacta la invariante de intervalo y exacta la métrica de rendimiento en el caso frontera; y cada **magnitud física lleva una marca nominal privada**, sin la cual TypeScript acepta asignar voltios a vatios.

---

## 2. Capas tocadas

| Capa | Archivos nuevos | Archivos modificados | Justificación |
|---|---|---|---|
| `domain/` | `shared/errors/errores-de-dominio.ts` · `shared/model/{magnitud,voltios,watts,celsius,hertz,segundos,adimensional,unidad-derivada,serie}.ts` · `shared/services/razon-de-cambio-promedio.ts` · `thermal/model/{especificacion-cpu,especificacion-disipador,escenario-termico,configuracion-simulacion,resultado-simulacion}.ts` · `thermal/services/{modelo-potencia,modelo-termico,politica-throttling,simulador-lazo-termico,metricas-resumen,comparador-corridas}.ts` · `thermal/ports/{repositorio-escenarios,repositorio-disipadores}.ts` · `formulas/{catalogo-formulas,registro-de-implementaciones}.ts` | — | Todo el modelo es lógica pura. Nada aquí importa Angular (RNF-2) |
| `application/` | `thermal/{listar-escenarios,listar-disipadores,ejecutar-simulacion,calcular-razon-de-cambio,comparar-corridas}.ts` | — | Un caso de uso por archivo, con método `ejecutar()`, dependiendo de puertos (TRD MOD-1) |
| `infrastructure/` | `http/{json-repositorio-escenarios,json-repositorio-disipadores}.ts` · `http/dto/{escenario-dto,disipador-dto}.ts` · `memoria/{en-memoria-repositorio-escenarios,en-memoria-repositorio-disipadores}.ts` | `di/tokens.ts` · `di/providers.ts` | Adaptadores + dobles en memoria para RNF-4. Los tokens y proveedores se **extienden**, no se reescriben |
| `ui/` | — | — | **Ninguno, a propósito.** Es la hija `02` |
| Datos | `public/data/escenarios.json` · `public/data/disipadores.json` | — | `angular.json` declara un único origen de activos: `{ "glob": "**/*", "input": "public" }`. La ruta servida es `/data/…` |

**Adición al árbol del TRD §4:** `domain/formulas/` no existe en el TRD. Se justifica porque el catálogo publica fórmulas de **dos** capacidades — las térmicas (F1–F6, F8) y la razón de cambio compartida (F7) — así que no puede vivir bajo `thermal/` sin mentir sobre su alcance. Queda anotado con la deriva DR-1…DR-12 para el spec `003`.

**Regla dura verificada:** ningún archivo nuevo de `domain/` ni de `application/` importa `@angular/*`, `rxjs`, `chart.js`, `infrastructure/` ni `ui/`. Lo comprueba `npm run test:arch`, que es lista negra y cubre los archivos nuevos sin configuración.

---

## 3. Modelo de dominio

### 3.1 Magnitudes físicas

Cada magnitud es una clase inmutable con: el valor numérico, el símbolo de su unidad, su rango válido declarado, y **una marca nominal privada** (DD-3).

| Magnitud | Unidad | Rango | Origen del rango |
|---|---|---|---|
| `Voltios` | `V` | `> 0`, y dentro de `[voltajeMin, voltajeMax]` cuando la valida una `EspecificacionCpu` | TRD §5.1 |
| `Watts` | `W` | `≥ 0` | Potencia disipada, nunca negativa |
| `Celsius` | `°C` | `> −273,15` | Cero absoluto |
| `Hertz` | `Hz` | `> 0` | Frecuencia de reloj |
| `Segundos` | `s` | `≥ 0` | Añadida en esta fase (requisitos S2): sin ella el denominador de toda unidad derivada sería un número desnudo |
| `Adimensional` | *(ninguna)* | `[0, 1]` para carga `α`; sin cota superior para rendimiento relativo, que solo se acota por RF-7.2 | PRD §1, F8 |

`Hertz` expone además una lectura en GHz para presentación. **La conversión vive en la magnitud, no en la interfaz**: es el único lugar donde el factor `1e9` puede estar escrito una vez, y D8 (deriva de unidades) es la clase de defecto que más caro sale.

### 3.2 Unidad derivada y serie

- `UnidadDerivada` — par (numerador, denominador) con un símbolo compuesto: `°C/s`, `W/V`, `GHz/s`. Es lo que hace verificable RF-5.2.
- `Serie` — value object inmutable que lleva **sus puntos y sus dos símbolos de unidad**. Que la serie conozca sus unidades es lo que permite derivar la unidad del cociente sin pasarla por parámetro en cada llamada, y es lo que hace que la misma `Serie` sirva para `T` sobre `t` (°C/s) y para `P` sobre `V` (W/V) sin código nuevo.
- `RazonDeCambio` — `{ valor, unidad, puntoA, puntoB }`. Los dos puntos van dentro **por requisito**: son los extremos de la secante que la hija `02` dibujará (AC-2.2). Devolverlos aquí evita que la interfaz los recalcule y se desincronice del valor.

### 3.3 Escenario y configuración

| Tipo | Contenido | Invariantes verificadas en el constructor |
|---|---|---|
| `EspecificacionCpu` | `capacitanciaConmutada`, `potenciaEstaticaBase`, `voltajeNominal`, `voltajeMin/Max`, `frecuenciaBase/Max`, `tempThrottle`, `tempCritica`, `escalonFrecuencia`, `histeresis` | `voltajeMin < voltajeMax` · `frecuenciaBase ≤ frecuenciaMax` · `tempThrottle < tempCritica` · `escalonFrecuencia > 0` · `histeresis > 0` |
| `EspecificacionDisipador` | `id`, `nombre`, `resistenciaTermica` R, `capacitanciaTermica` C | `R > 0` · `C > 0` |
| `EscenarioTermico` | `id`, `nombre`, `descripcion`, `cpu`, `disipadorPorDefectoId`, `tempAmbientePorDefecto` | Referencia íntegra a la CPU |
| `ConfiguracionSimulacion` | `escenarioId`, `disipadorId`, `voltaje`, `frecuenciaObjetivo`, `carga`, `tempAmbiente`, `horizonte`, `paso` | `paso > 0` (RF-6.7) · `horizonte/paso ≤ 600` (RF-6.6, TRD PERF-1) · cada valor dentro del rango de su especificación |

`EscenarioTermico` lleva un disipador **por defecto**, no uno embebido: la configuración lo sustituye. Es lo que hace posible PRD S8 y US-3.2 — cambiar el disipador y repetir la misma corrida. Difiere del TRD §5.1 (deriva DR-10).

### 3.4 Resultado de la corrida

| Tipo | Contenido |
|---|---|
| `PasoSimulacion` | `t: Segundos`, `potencia: Watts`, `temperatura: Celsius`, `frecuenciaEfectiva: Hertz`, `escalon: number` *(entero)*, `enThrottling: boolean` |
| `EventoSimulacion` | `t: Segundos`, `tipo: 'THROTTLE_INICIO' \| 'THROTTLE_FIN' \| 'TEMP_CRITICA'`, `causa: string` |
| `ResultadoSimulacion` | `configuracion`, `pasos: readonly PasoSimulacion[]`, `eventos: readonly EventoSimulacion[]` |
| `MetricasResumen` | `potenciaMedia: Watts`, `tempMaxima: Celsius`, `frecuenciaEfectivaMedia: Hertz`, `tiempoEnThrottling: Segundos`, `rendimientoRelativo: Adimensional` |

`PasoSimulacion` **no** lleva `trabajoAcumulado` (deriva DR-3) y `MetricasResumen` **no** lleva `trabajoUtilTotal` ni `eficiencia` (DR-2): son acumulación, eje de la Guía 6, prohibido por PRD C12.

`enThrottling` es un derivado de `escalon > 0`, no una comparación de flotantes. Se guarda por comodidad de la interfaz; la verdad está en el entero.

---

## 4. Puertos y adaptadores

| Puerto | Firma | Adaptador | Doble de prueba |
|---|---|---|---|
| `RepositorioEscenarios` | `listar(): Promise<EscenarioTermico[]>` · `obtenerPorId(id): Promise<EscenarioTermico>` | `JsonRepositorioEscenarios` | `EnMemoriaRepositorioEscenarios` |
| `RepositorioDisipadores` | `listar(): Promise<EspecificacionDisipador[]>` · `obtenerPorId(id): Promise<EspecificacionDisipador>` | `JsonRepositorioDisipadores` | `EnMemoriaRepositorioDisipadores` |

`listar()` nunca devuelve vacío: lanza si el origen no aporta ningún registro válido (RF-10.1). `obtenerPorId()` lanza el error de no encontrado; nunca devuelve `null` ni el primero de la lista (RF-10.2).

**Tokens y proveedores.** Se **extienden** `infrastructure/di/tokens.ts` y `providers.ts`, siguiendo el patrón ya establecido por `RELOJ` y `SELLAR_EVENTO`: un `InjectionToken` por puerto y por caso de uso, y un `proveedoresDominioTermico: Provider[]` nuevo que se añade a `appConfig`. Un puerto sin proveedor registrado es un fallo en tiempo de ejecución que ninguna prueba unitaria atrapa, así que el registro entra en la misma tarea que el adaptador (T-12), no en una posterior.

---

## 5. Casos de uso

Una clase por archivo, método `ejecutar()`, dependencias por constructor. Sin Angular, sin signals, sin RxJS (TRD ADR-006).

| Caso de uso | Firma | Requisitos |
|---|---|---|
| `ListarEscenarios` | `ejecutar(): Promise<EscenarioTermico[]>` | RF-10.1 |
| `ListarDisipadores` | `ejecutar(): Promise<EspecificacionDisipador[]>` | RF-10.5 |
| `EjecutarSimulacion` | `ejecutar(config): Promise<ResultadoSimulacion & { metricas }>` | RF-6, RF-7 |
| `CalcularRazonDeCambio` | `ejecutar(serie, a, b): RazonDeCambio \| null` | RF-5 |
| `CompararCorridas` | `ejecutar(a, b): ComparacionDeCorridas` | RF-8 |

`EjecutarSimulacion` es el flujo W1 del TRD §7, sin desviación: resuelve escenario y disipador por los puertos, construye los value objects (que validan), llama al simulador puro y calcula las métricas.

---

## 6. Componentes de UI

**Ninguno.** No es una omisión: es el alcance F-1 de los requisitos. Este spec no crea ni modifica un solo archivo bajo `src/app/ui/`, y el Reviewer debe rechazar el diff si aparece uno.

---

## 7. Contratos de datos

```
public/data/escenarios.json    { "version": "1", "escenarios": [ … ] }
public/data/disipadores.json   { "version": "1", "disipadores":  [ … ] }
```

El campo `version` existe para que un cambio de forma sea detectable en lugar de silencioso (TRD §6.2). Los DTO son tipos planos separados de las entidades: la traducción y la validación ocurren **en el adaptador**, y ahí un registro inválido se descarta con su motivo sin tumbar la carga del resto (RF-10.3, DD-12).

**Calibración de los dos escenarios** *(decisión del usuario: solo dos)*. Los valores vienen del prototipo y se verificaron numéricamente durante la fase de requisitos:

| Escenario | `C` | `P_est₀` | `V_nom` | `f_base…f_max` | `T_thr` | `T_crít` | `Δf` | `h` |
|---|---|---|---|---|---|---|---|---|
| Escritorio, 6 núcleos | 15,3 nF | 12 W | 1,20 V | 1,2…5,0 GHz | 95 °C | 105 °C | 0,2 GHz | 3 °C |
| Portátil, 4 núcleos | 8,2 nF | 6 W | 1,05 V | 0,8…4,2 GHz | 90 °C | 100 °C | 0,15 GHz | 3 °C |

| Disipador | `R` (°C/W) | `C` (J/°C) | `T_∞` con el escenario de escritorio a 1,20 V / 4,0 GHz |
|---|---|---|---|
| Pasivo sin ventilador | 0,95 | 40 | **120,12 °C** → entra en throttling |
| Stock del fabricante | 0,55 | 60 | 80,07 °C |
| Torre de aire | 0,28 | 120 | 53,04 °C |
| Refrigeración líquida | 0,18 | 200 | 43,02 °C |

El contraste entre el pasivo y los demás es lo que hace **demostrable en el aula** el criterio AC-5.3. Sin al menos un par que cruce el umbral en un caso y no en el otro, ese criterio no se puede enseñar (RF-10.5).

---

## 8. Manejo de errores

Jerarquía con una base común, para que el `ErrorHandler` global de `ui/core/` pueda distinguir *lo esperado* de *lo imprevisto* con un solo `instanceof`:

```
ErrorDeDominio  (base abstracta)
├── RangoInvalidoError            valor fuera del dominio de una magnitud        RF-1.2, RF-1.3
├── ConfiguracionInvalidaError    paso ≤ 0, o pasos por encima del máximo        RF-6.6, RF-6.7
├── EscenarioNoEncontradoError    id inexistente                                 RF-10.2
├── DisipadorNoEncontradoError    id inexistente                                 RF-10.2
├── CatalogoVacioError            el origen no aportó ningún registro válido     RF-10.1
└── CorridasNoComparablesError    horizonte o paso distintos                     RF-8.3
```

*Leyenda:* la indentación es herencia de clase · la columna central describe cuándo se lanza · la columna derecha es el requisito que lo obliga.

| Clase de fallo | Tratamiento |
|---|---|
| Validación de dominio | `RangoInvalidoError` con el valor recibido **y** los extremos del rango en el mensaje. Esperado, no es un fallo (TRD §11) |
| Registro corrupto en el JSON | Se descarta ese registro, se acumula su motivo, se cargan los válidos. Solo si **no** queda ninguno se lanza `CatalogoVacioError` |
| Origen de datos inaccesible | El error de red sube tal cual desde el adaptador; la interfaz decide el reintento (hija `02`) |

Los errores se **lanzan** como clases tipadas; no se devuelven como `Result` (DD-4).

---

## 9. Decisiones de diseño (ADR-lite)

### DD-1 — El estado de throttling es un escalón entero, no una frecuencia flotante

- **Problema:** bajar la frecuencia por resta repetida (`f ← f − Δf`) acumula error de punto flotante. Es lo que obliga al prototipo a envolver cada paso en `.toFixed(4)`, un ida y vuelta por cadena de texto dentro del bucle numérico.
- **Decisión:** el estado es un entero `n ∈ [0, n_max]` con `n_max = ⌈(f_obj − f_base)/Δf⌉`, y la frecuencia se **deriva**: `f_ef = máx(f_base, f_obj − n · Δf)`.
- **Medición que lo justifica:** con `f_obj = 4,0` y `Δf = 0,2`, la resta repetida y `f_obj − n·Δf` divergen ya en `n = 2` — `3,5999999999999996447` contra `3,6000000000000000888` — y a `n = 14` el error es de ~1,1 × 10⁻¹⁵.
- **Alternativas:** (a) resta repetida con `toFixed`, como el prototipo — rechazada: mete formateo de cadenas en el dominio y deja el epsilon como constante mágica; (b) aritmética en enteros de milihercios — rechazada: resuelve lo mismo con una unidad que nadie más del sistema usa.
- **Implicaciones, y son tres, todas buenas:** la invariante de RF-4.6 pasa a ser exacta y no aproximada; `enThrottling` se vuelve `n > 0` en lugar de una comparación de flotantes con epsilon; y **RF-7.2 se cumple exactamente** — sin throttling todos los `n` valen 0, su suma es 0, la media es 0 exacta y el rendimiento relativo sale exactamente 1, cosa que promediar flotantes no garantiza. Además el modelo es más explicable: *"el procesador baja escalones"*.
- **Revisar si:** un escenario necesita recorte proporcional en lugar de por escalones (ver DD-6).

### DD-2 — Value objects solo para las seis magnitudes que el usuario manipula o lee

- **Problema:** envolver cada cantidad física del sistema en un value object multiplica los archivos sin multiplicar la seguridad.
- **Decisión:** VO para `Voltios`, `Watts`, `Celsius`, `Hertz`, `Segundos`, `Adimensional`. Las constantes de especificación (`R`, `C` térmica, `C` conmutada, `Δf`, histéresis) son `number` con su invariante verificada en el constructor de su entidad.
- **Argumento:** las seis con VO son exactamente las que cruzan la frontera desde un control de la interfaz o hacia un indicador — es donde USA-2 y AC-4.3 exigen validación, y donde RF-5.2 necesita un símbolo de unidad. Las constantes vienen de un catálogo cerrado, nunca de un teclado.
- **Alternativas:** VO para todo — rechazada: cinco archivos más para validar valores que ningún usuario introduce; `number` para todo — rechazada: contradice USA-2 y hace imposible RF-1.4.
- **Revisar si:** un spec futuro permite editar las constantes del disipador desde la interfaz.

### DD-3 — Cada magnitud lleva una marca nominal privada, y su puerta es el compilador

- **Problema:** RF-1.4 exige que asignar voltios donde se esperan vatios sea un error. TypeScript es estructural: dos clases con la misma forma son mutuamente asignables.
- **Medición que lo justifica:** se comprobó. `class VoltiosA { constructor(public readonly valor: number) {} }` y su gemela `WattsA` **se asignan entre sí sin error**. Añadiendo un `private readonly` distinto a cada una, el compilador lo rechaza con `TS2322: Types have separate declarations of a private property`.
- **Decisión:** cada magnitud declara un miembro `private readonly` con su símbolo. La verificación es un archivo de pruebas de tipos con `@ts-expect-error` sobre cada par incompatible.
- **Por qué esa puerta es falsable, y no una aserción de presencia:** si alguien quita la marca, la asignación pasa a ser legal, el `@ts-expect-error` queda sin usar y `tsc` falla con `TS2578: Unused '@ts-expect-error' directive`. Se verificó en este repositorio: `npx tsc -p tsconfig.spec.json --noEmit` sale limpio hoy y falla con `TS2578` ante una directiva inútil.
- **Consecuencia operativa:** `npm run test:agent` **no** sirve como puerta de RF-1.4. Vitest transpila con esbuild y no comprueba tipos: borraría el `@ts-expect-error` sin validarlo. La verificación de esa tarea es `npx tsc -p tsconfig.spec.json --noEmit`, y así queda escrita en `tasks.md`.

### DD-4 — Los errores de dominio se lanzan como clases tipadas; `Result` se descarta

- **Problema:** la validación de rango es un fallo *esperado*, y la escuela funcional recomienda `Result` para lo esperado y excepciones para lo excepcional.
- **Decisión:** clases tipadas lanzadas, con base común `ErrorDeDominio`.
- **Argumento, en tres partes:** es la convención ya establecida en el repositorio (`SelloDeTiempoInvalidoError`); es la que declara el TRD §11; y con `Result` cada constructor de magnitud pasaría a ser una fábrica que devuelve un contenedor, lo que llena de desempaquetado el bucle numérico de PERF-4 sin ganar nada — el `throw` en el constructor es precisamente lo que garantiza RF-1.2 («no debe construirse el objeto»).
- **Alternativa:** `Result<T, E>` — rechazada por lo anterior. Cambiarla más adelante sería un ADR del TRD, no una decisión de spec.
- **Revisar si:** aparece un flujo que deba acumular varios errores de validación para mostrarlos juntos. Nótese que el adaptador ya hace **agregación** (DD-12) sin necesitar `Result`.

### DD-5 — El adaptador usa `fetch`, no `HttpClient`

- **Problema:** ¿con qué se leen dos JSON estáticos del propio despliegue?
- **Decisión:** `fetch` dentro del adaptador de `infrastructure/http/`.
- **Argumento decisivo:** el TRD §6.1 ya declaró que los puertos devuelven `Promise`. `HttpClient` devuelve `Observable`, así que usarlo obligaría a una capa de conversión en cada adaptador para satisfacer un contrato que `fetch` cumple directamente. Y exigiría añadir `provideHttpClient` a `appConfig`, que hoy no está.
- **Alternativa:** `HttpClient` — rechazada: aporta interceptores, cancelación y reintentos que este caso no tiene (mismo origen, sin autenticación, dos archivos), a cambio de esa conversión y de superficie de RxJS.
- **Revisar si:** aparece la necesidad de interceptar o cancelar peticiones, o de un backend real (que sería ADR-002 revisado, no esta decisión).

### DD-6 — Una sola política de throttling, sin abstracción de Strategy todavía

- **Problema:** el TRD §4 lista *Strategy* como patrón aplicado a `PoliticaThrottling`, con el argumento de que distintos escenarios recortan la frecuencia de distinta forma. Este spec tiene **una** política.
- **Decisión:** implementar una sola política en su propio módulo, con la firma que una futura interfaz tendría, y **no** crear la interfaz ni el punto de selección.
- **Argumento:** un patrón entra ligado al problema que resuelve; con una sola implementación, la interfaz es ceremonia. La costura que el TRD realmente quiere — la política fuera del bucle del simulador — **sí** se respeta, y es distinta de la alternativa que el TRD rechaza (*«un `if` por tipo dentro del simulador»*), que aquí tampoco se hace.
- **Es una desviación declarada del TRD §4**, no un descuido. Se anota junto a DR-1…DR-12 para el spec `003`.
- **Revisar si:** aparece una segunda política — recorte proporcional a `T − T_umbral`, por ejemplo. Promoverla es entonces un cambio de un archivo.

### DD-7 — La serie conoce sus unidades; la razón de cambio es un servicio sin estado

- **Problema:** RF-5.2 exige que el mismo cálculo produzca `°C/s`, `W/V` o `GHz/s` según los ejes.
- **Decisión:** `Serie` (value object) lleva sus puntos y sus dos símbolos de unidad. `RazonDeCambioPromedio` (servicio sin estado) opera sobre una `Serie` y expone `entre(serie, a, b)`, `entreConsecutivos(serie)` y `compararIntervalos(serie, i1, i2)`.
- **Alternativa:** pasar las unidades como parámetro en cada llamada — rechazada: tres argumentos que siempre viajan juntos son un objeto que falta, y se repetirían en cada punto de llamada de la hija `02`.
- **Implicación:** el dominio soporta `ΔP/ΔV` sin código nuevo, aunque su serie la construya la interfaz a partir de varias corridas.

### DD-8 — «No existe» se representa con `null`, nunca con `0`

- **Problema:** la razón de cambio de la primera fila no existe. Devolver `0` enseñaría a los estudiantes exactamente el error conceptual que esta aplicación existe para corregir (AC-2.3).
- **Decisión:** `RazonDeCambio | null`. `entreConsecutivos` devuelve una lista alineada con las filas cuyo primer elemento es `null` — la fila existe, su razón de cambio no.
- **Alternativas:** omitir el primer elemento — rechazada: desalinea la lista de la tabla y traslada un desfase de índices a la interfaz; `NaN` — rechazada: se propaga en silencio por la aritmética y se imprime como `NaN` en pantalla.
- **La prueba se escribe para fallar ante `0`, `NaN` e `Infinity`**, no solo para pasar ante `null`.

### DD-9 — `TEMP_CRITICA` se emite en el flanco de subida, una vez por cruce

- **Problema:** una corrida de 300 pasos que se mantiene sobre la temperatura crítica generaría cientos de eventos idénticos.
- **Decisión:** los tres tipos de evento se emiten en el flanco: `THROTTLE_INICIO` cuando `n` pasa de 0 a positivo, `THROTTLE_FIN` cuando vuelve a 0, `TEMP_CRITICA` cuando la temperatura cruza el umbral hacia arriba. Un paso puede emitir más de un evento.
- **Alternativa:** un evento por paso en estado crítico — rechazada: convierte la línea de tiempo en ruido y el propósito del evento es marcar el *momento*.
- **Implicación de BR-3, que se conserva:** la simulación **no** se detiene al superar la crítica. El propósito didáctico es que se vea la consecuencia.

### DD-10 — La coherencia catálogo ↔ implementación se verifica en las dos direcciones

- **Problema:** PRD G5 exige al 100 % que las fórmulas mostradas sean las implementadas. Una prueba de que «el campo existe» no prueba nada de eso.
- **Decisión:** un `registro-de-implementaciones.ts` mapea cada identificador de fórmula a la función que la implementa. La prueba de coherencia comprueba tres cosas: que todo identificador del catálogo tiene entrada en el registro; que llamar a esa función con las entradas de referencia de `requirements.md` da el valor de referencia; y que el **número de módulos de servicio** en disco coincide con el número de entradas registradas.
- **Por qué la tercera comprobación:** cierra la dirección difícil. Sin ella, un servicio nuevo que nadie registre pasaría inadvertido. Con ella, añadir un archivo a `services/` sin publicar su fórmula rompe la prueba. Es un conteo de archivos, así que vive en un spec que puede leer el sistema de archivos, con el precedente de `src/app/scripts.spec.ts`.
- **Gap residual, declarado:** dos servicios que no publiquen fórmula y se registren mutuamente como «sin fórmula» burlarían el conteo. Es rebuscado y queda como punto de la lista del Reviewer, no como puerta.

### DD-11 — Los datos estáticos viven en `public/data/`, no en `src/assets/`

- **Problema:** el TRD §6.2 declara la ruta `assets/data/escenarios.json`. Ese directorio no existe en este proyecto.
- **Decisión:** `public/data/`. `angular.json` declara un único origen de activos, `{ "glob": "**/*", "input": "public" }`, y la ruta servida resultante es `/data/…`.
- **Es la deriva DR-11.** Este spec sigue la realidad del proyecto y anota la corrección del TRD.

### DD-12 — El adaptador agrega los motivos de rechazo en lugar de fallar al primero

- **Problema:** RF-10.3 exige que un registro corrupto no tumbe la carga del resto.
- **Decisión:** el adaptador valida registro a registro, acumula los motivos de rechazo y devuelve los válidos. Solo lanza `CatalogoVacioError` si no sobrevive ninguno.
- **Alternativa:** fallar al primer registro inválido — rechazada: contradice RF-10.3 y el contrato del TRD §6.2.
- **Nota:** los motivos acumulados se registran por consola en desarrollo (TRD §11, sin telemetría). No hay pantalla que los muestre en v1, y decirlo es mejor que insinuar que la habrá.

---

## 10. Resultado del desafío de reversión (Paso 2.3)

Se buscó toda decisión de diseño que **retire, desactive o invierta** algo ya entregado. Candidatas evaluadas:

| Candidata | Veredicto |
|---|---|
| Retirar `trabajo útil` y `eficiencia` del modelo publicado | **No es reversión en código:** `src/app/domain/` no los implementa. Y por la decisión Q1, este spec no edita el TRD, así que aquí no se retira nada — la contradicción queda registrada, no ejecutada |
| No aplicar Strategy en `PoliticaThrottling` (DD-6) | No es reversión: es diferir una abstracción que nunca se construyó |
| `fetch` en lugar de `HttpClient` (DD-5) | No es reversión: nada del proyecto usa `HttpClient` hoy |

**Pero el desafío encontró una rotura concreta, y no la había visto la lectura inicial:**

> `docs/ux-ui/design.md:144` — el layout LP-1 del laboratorio lista entre sus indicadores mostrados `f·efectiva, trabajo útil`. Retirar *trabajo útil* del modelo deja al documento de UX prometiendo un indicador que no existirá.

La lectura inicial solo había barrido el TRD; la deriva vivía en el documento de UX. Queda registrada como **DR-12** en `requirements.md` §6. No se corrige aquí — misma razón que Q1 — y **es información que la hija `02` necesita antes de maquetar LP-1**, así que va explícita en el traspaso.

---

## 11. Presupuesto (Paso 2.4)

Tres números derivados del diseño ya escrito. **No son un techo de calidad: son un cable trampa.** `/akili-execute` compara los reales contra ellos y, si los excede, el Leader se detiene y escala en lugar de continuar.

| Magnitud | Estimación | Nota |
|---|---|---|
| **Tareas** | **14** | Por encima del rango sano de 4–12 de la plantilla, por debajo del umbral de 15 que obliga a partir en familia. Es consciente: este spec ya **es** una hija de familia y partirlo otra vez fragmentaría el modelo matemático en pedazos que no se pueden verificar por separado |
| **LOC** | **≈ 4.070** (≈ 2.050 de código, ≈ 2.020 de pruebas) | La paridad código/pruebas no es casual: RNF-3 exige un caso de referencia por fórmula y las restricciones negativas llevan prueba propia |
| **Rondas de revisión** | **≈ 18** | Una por tarea, más una segunda esperada en las cuatro de más riesgo: `PoliticaThrottling`, `SimuladorLazoTermico`, el adaptador JSON y el catálogo |

**Comparación con la profundidad declarada:** coincide con `Full`. Ninguna señal de sobredimensión ni de infradimensión, así que no hay recomendación de cambio de nivel.

**Estrategia de PR recomendada** — con ≈ 4.070 LOC, un solo PR es irrevisable. Cuatro fronteras naturales, y conviene recordar que la convención E1 ya da un commit por tarea, así que el PR es agrupación de lectura, no de revisión:

| PR | Tareas | LOC aprox. | Qué se revisa primero |
|---|---|---|---|
| 1 — Vocabulario y razón de cambio | T-1, T-2 | ≈ 870 | Las magnitudes y la marca nominal. Todo lo demás se apoya aquí |
| 2 — Entidades y modelo físico | T-3…T-7 | ≈ 1.120 | Las cuatro fórmulas contra sus valores de referencia |
| 3 — Motor, métricas y comparación | T-8…T-10 | ≈ 710 | El bucle, el determinismo y la exactitud de RF-7.2 |
| 4 — Fórmulas publicadas y frontera hexagonal | T-11…T-14 | ≈ 1.370 | El catálogo, sus referencias y el registro de proveedores |

---

## 12. Estrategia de pruebas

| Requisito | Nivel | Ubicación | Nota |
|---|---|---|---|
| RF-1.1, RF-1.2, RF-1.3 | Dominio, sin `TestBed` | `domain/shared/model/*.spec.ts` | Un caso válido, uno fuera de rango y los tres no finitos, por magnitud |
| **RF-1.4** | **Tipos, en compilación** | `domain/shared/model/unidades-incompatibles.spec.ts` | **Puerta: `npx tsc -p tsconfig.spec.json --noEmit`**, no `test:agent`. Ver DD-3 |
| RF-2.1…RF-2.5 | Dominio | `modelo-potencia.spec.ts` | Valores literales de `requirements.md`; RF-2.2 como propiedad sobre tres pares |
| RF-3.1…RF-3.5 | Dominio | `modelo-termico.spec.ts` | Incluye el 63,21 % en `τ` con tres escenarios distintos, para probar que es propiedad y no coincidencia |
| RF-4.1…RF-4.6 | Dominio | `politica-throttling.spec.ts` | RF-4.5 es una secuencia de 20 pasos oscilando dentro de la banda |
| RF-5.1…RF-5.6 | Dominio | `razon-de-cambio-promedio.spec.ts` | RF-5.3 y RF-5.4 fallan explícitamente ante `0`, `NaN` e `Infinity` |
| RF-6.1…RF-6.7 | Dominio | `simulador-lazo-termico.spec.ts` | RF-6.2 compara dos corridas por igualdad estructural profunda |
| RF-7.1…RF-7.4 | Dominio | `metricas-resumen.spec.ts` | RF-7.2 exige exactamente 1, que DD-1 hace alcanzable |
| RF-8.1…RF-8.3 | Dominio | `comparador-corridas.spec.ts` | RF-8.1 se prueba con el par pasivo/torre de §7 |
| RF-9.1, RF-9.2, RF-9.4 | Dominio | `catalogo-formulas.spec.ts` | Rechaza `—`, `TODO` y cadena vacía en `supuesto` y `referencia` |
| RF-9.3 | Dominio + sistema de archivos | `formulas/coherencia-formulas.spec.ts` | Las tres comprobaciones de DD-10 |
| RF-10.1…RF-10.5 | Adaptador, sin red real | `infrastructure/http/*.spec.ts` | `fetch` sustituido por un doble; incluye el JSON con un registro corrupto |
| RNF-1 | Medición manual | Documentada en `execution.md` | **Inconcluso si tres corridas varían más de 10 ms entre sí** — se reporta la dispersión, no se aprueba |
| RNF-2, RNF-5 | Arquitectura | `npm run test:arch` | Cubre los archivos nuevos sin configuración: es lista negra |
| RNF-3 | Revisión | Lista del Reviewer | Verifica que cada valor esperado procede de `requirements.md` o de un cálculo a mano documentado, **no** de ejecutar el código |
| RNF-4 | Aplicación, sin `TestBed` | `application/thermal/*.spec.ts` | Con los dobles en memoria |
| RNF-6 | Script existente | `tools/check-external-origins.mjs` | Ya está en el repositorio |
| **D10, D11** | **Revisión humana** | Puerta de aprobación de este spec | **Sin puerta automática posible.** Los ocho supuestos y las nueve referencias del catálogo los lee una persona. Declarado como riesgo aceptado RA-1 |

Reglas que se conservan: el dominio se prueba **sin `TestBed`**; ningún nivel toca red ni `localStorage` real; y **toda restricción negativa (`PERO … NO debe`) lleva prueba propia**, porque es la que atrapa la regresión.

---

## 13. Riesgos y alternativas descartadas

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Una referencia bibliográfica del catálogo no existe o no contiene la fórmula que se le atribuye | **Media** | **Alto** — golpea el criterio 1 de la rúbrica, el más caro | Revisión humana contra la bibliografía del curso en la puerta de aprobación. **No hay puerta automática**: una cita inventada pasa todas las pruebas verdes (clase D11, riesgo aceptado RA-1) |
| La calibración de `C` se lee como dato de fabricante y no como calibración didáctica | Media | Alto | El campo `supuesto` de F1 lo dice literalmente. La prueba comprueba que no está vacío; que sea **honesto** lo juzga una persona (clase D10) |
| El presupuesto de 14 tareas se desborda al ejecutar | Media | Medio | Es un cable trampa explícito: el Leader escala en lugar de continuar |
| `Math.exp` no es idéntico al último bit entre motores de JavaScript | Baja | Bajo | Declarado como riesgo aceptado RA-2. El determinismo vale dentro de una sesión y un portátil, que es el único escenario de uso |
| El docente rechaza el modelo lineal de fuga (F2) | Baja | Medio | Declarado como supuesto con referencia (pregunta abierta Q3). Si se rechaza, cambia F2 y su prueba, no la arquitectura |

**Alternativas descartadas ya registradas**, para que nadie reabra la discusión: `Result` en lugar de excepciones (DD-4) · `HttpClient` en lugar de `fetch` (DD-5) · Strategy anticipado (DD-6) · Euler explícito y Runge-Kutta en lugar de la solución exponencial exacta del paso ([`proposal.md`](proposal.md) §Approach Options) · value objects para todas las cantidades físicas (DD-2) · resta repetida con `toFixed` (DD-1).
