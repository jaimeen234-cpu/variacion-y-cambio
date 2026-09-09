# Requisitos — Dominio y modelo funcional

| Campo | Valor |
|---|---|
| Spec | `docs/specs/002-feature-experiencia-variacion-cpu/01-dominio-modelo-funcional/` |
| Estado | **Aprobado** — 2026-09-08, con Q1, Q2 y Q4 resueltas por el usuario |
| Fecha | 2026-09-08 |
| Profundidad | **Full** — núcleo matemático, tres capas, clases de defecto sin puerta automática |
| Familia | [`../family.md`](../family.md) — hija 1 de 5, `Depends on`: ninguna dentro de la familia |
| Modo de aprobación | `gated` *(heredado de [`proposal.md`](proposal.md))* |
| Fuente | PRD §1 · §5 S3–S7, S11 · §6 E1, E2, E3 · §7 AC-1.3, AC-2.*, AC-3.1, AC-3.4, AC-4.3, AC-5.*, AC-7.1, AC-7.2 · TRD §4, §5, §6.1, §7 W1, §11, §12 |
| Propuesta | [`proposal.md`](proposal.md) — F1–F8 aprobadas como intención |

---

## 1. Contexto y problema

**Lo que no existe.** El repositorio tiene la arquitectura hexagonal montada y verificada (spec `001`), pero `domain/` solo contiene `SelloDeTiempo` y el puerto `Reloj`. No hay una sola función del fenómeno que la aplicación enseña.

**Por qué esta pieza primero.** El criterio 1 de la rúbrica del curso — *fundamentación matemática*, 0,5 puntos — se califica **Insuficiente** cuando "se evidencian errores matemáticos significativos". Toda la aplicación puede verse impecable y perder ese punto si una fórmula está mal transcrita. Esta hija es la única de la familia cuyo modo de fallo es *silencioso*: un exponente equivocado produce curvas plausibles.

**La consecuencia de diseño que ordena el spec.** El dominio es **puro y determinista** (TRD ADR-005): sin `Date.now()`, sin `Math.random()`, sin Angular. La simulación completa se calcula de una vez y la interfaz la *reproduce*; pausar no altera la física. Eso hace que todo lo que este spec entrega sea verificable sin DOM y sin navegador — y por eso las puertas de verificación pueden ser duras.

---

## 2. Alcance

### En alcance

| # | Elemento | Capa |
|---|---|---|
| A1 | Value objects de magnitud física con dominio validado: `Voltios`, `Watts`, `Celsius`, `Hertz`, `Segundos`, `Adimensional` | `domain/shared/` |
| A2 | Unidad derivada (`°C/s`, `W/V`, `GHz/s`) como concepto de dominio | `domain/shared/` |
| A3 | `ModeloPotencia` — F1, F2, F3 | `domain/thermal/services/` |
| A4 | `ModeloTermico` — F4, F5 | `domain/thermal/services/` |
| A5 | `PoliticaThrottling` — F6, función por tramos con histéresis | `domain/thermal/services/` |
| A6 | `RazonDeCambioPromedio` — F7, con unidad derivada, secante, serie consecutiva y comparación de intervalos | `domain/shared/services/` |
| A7 | `SimuladorLazoTermico` — bucle determinista de paso fijo, eventos | `domain/thermal/services/` |
| A8 | `MetricasResumen` — resumen de corrida y rendimiento relativo (F8) | `domain/thermal/services/` |
| A9 | Entidades y configuración: `EspecificacionCpu`, `EspecificacionDisipador`, `EscenarioTermico`, `ConfiguracionSimulacion`, `PasoSimulacion`, `EventoSimulacion`, `ResultadoSimulacion` | `domain/thermal/model/` |
| A10 | `ComparadorCorridas` — deltas entre dos resultados | `domain/thermal/services/` |
| A11 | `CatalogoFormulas` — F1–F8 como dato: expresión, variables, unidades, dominio, supuesto y referencia APA 7 | `domain/formulas/` |
| A12 | Puertos `RepositorioEscenarios` y `RepositorioDisipadores` | `domain/thermal/ports/` |
| A13 | Adaptadores JSON + DTOs validados + datos estáticos locales | `infrastructure/`, `public/data/` |
| A14 | Casos de uso `ListarEscenarios`, `ListarDisipadores`, `EjecutarSimulacion`, `CalcularRazonDeCambio`, `CompararCorridas` | `application/thermal/` |

### Fuera de alcance

| # | Elemento | Razón |
|---|---|---|
| F-1 | **Cualquier componente, plantilla o estilo de interfaz** | Es la hija `02-laboratorio-en-vivo`. Este spec no crea un solo archivo bajo `ui/` |
| F-2 | Derivada, límite, razón de cambio **instantánea**, recta tangente | PRD C12 — son las Guías 2 y 4. Aparecer aquí sería incoherencia con el eje asignado |
| F-3 | Sumas de Riemann, integrales, acumulación (`Σ f·Δt`) | Eje de la Guía 6. Motivo por el que F8 usa **promedio aritmético** y no una suma ponderada por `Δt` |
| F-4 | Fuga dependiente de la temperatura `I_fuga(T)` | Crearía un segundo lazo, positivo. Matemáticamente atractivo, didácticamente confuso en un primer contacto. Se anota como refinamiento posible |
| F-5 | Persistencia de corridas (`localStorage`, puerto `AlmacenamientoSetupUsuario`) | TRD ADR-007 decide explícitamente **no** persistir resultados: la URL lleva la configuración |
| F-6 | Retos de predicción, registro de errores conceptuales, exportación de evidencias | Es la hija `04-retos-argumentacion` |
| F-7 | Reproductor temporal, cadencia de 1 s, corrección de deriva | Es reproducción, no física: hija `02`. El dominio recibe `Δt` como dato |
| F-8 | **Enmienda del TRD** para retirar la deriva constitucional detectada (§6) | Se anota, no se aplica: la deriva excede este spec y una enmienda parcial dejaría el TRD internamente inconsistente. Ver RF-11 y §7 Q1 |

---

## 3. Actores

| Actor | Relación con este spec |
|---|---|
| **Participante** (PRD P1) | No toca este código directamente, pero cada número que verá y cada unidad que leerá nace aquí |
| **Docente evaluadora** (PRD P3) | Consumidora real del `CatalogoFormulas`: es quien juzga si el rigor y las referencias son aceptables (criterio 1) |
| **Hijas 02–05 de la familia** | Consumidoras del contrato. `02` y `03` quedan desbloqueadas cuando este spec cierra |
| **Implementer / Reviewer** | Los requisitos de este documento son la única fuente de los valores esperados de las pruebas |

---

## 4. Requisitos funcionales

### RF-1 — Magnitudes físicas con dominio explícito y validado

**Historia:** Como participante, quiero que la aplicación rechace un valor imposible indicándome el rango válido, para entender que una función tiene dominio y que fuera de él no hay resultado.

**Fuente:** PRD AC-4.3, US-1.4 · TRD USA-2, §5.1, §11 *(taxonomía: validación de dominio)*

**Escenarios**

- **RF-1.1** — DADO un valor dentro del rango declarado de una magnitud,
  CUANDO se construye la magnitud,
  ENTONCES queda construida e inmutable,
  Y expone su valor numérico y el símbolo de su unidad.

- **RF-1.2** — DADO un valor fuera del rango declarado de una magnitud,
  CUANDO se intenta construirla,
  ENTONCES se produce un error tipado de rango inválido,
  Y el mensaje del error contiene el valor recibido **y** los extremos del rango válido,
  PERO **NO debe** construirse el objeto ni devolverse un valor por defecto o recortado al extremo.

- **RF-1.3** — DADO un valor no finito (`NaN`, `Infinity`, `-Infinity`),
  CUANDO se intenta construir cualquier magnitud,
  ENTONCES se produce el mismo error tipado de rango inválido,
  Y **DEBE** ocurrir para las seis magnitudes sin excepción.

- **RF-1.4** — DADAS dos magnitudes de **distinta** unidad,
  CUANDO se intenta operarlas o compararlas entre sí,
  ENTONCES el compilador de TypeScript lo rechaza,
  PERO **NO debe** apoyarse en una comprobación en tiempo de ejecución: la incompatibilidad de unidades es un error de tipo, no una excepción.

**Fuera de alcance:** las constantes internas del disipador y de la CPU (`R`, `C_térmica`, `C_conmutada`, `Δf`, histéresis) no se envuelven en value objects; se validan como invariantes de su entidad. Ver `design.md` DD-2.

---

### RF-2 — Modelo de potencia

**Historia:** Como participante, quiero mover el voltaje y ver que la potencia no sube en proporción, para descubrir que la relación es cuadrática y no lineal.

**Fuente:** PRD §1 *(tabla de conceptos: crecimiento no lineal)*, US-3.1, AC-1.3 · propuesta F1, F2, F3 · TRD §5.3

**Escenarios**

- **RF-2.1** — DADOS `α = 1,0`, `C = 15,3 nF`, `V = 1,20 V`, `f = 4,0 GHz`,
  CUANDO se calcula la potencia dinámica,
  ENTONCES el resultado es **88,128 W**,
  Y la magnitud devuelta está expresada en vatios.

- **RF-2.2** — DADA una potencia dinámica calculada a `α` y `f` constantes,
  CUANDO el voltaje se duplica,
  ENTONCES la potencia dinámica se multiplica **exactamente por 4**,
  Y **DEBE** verificarse como propiedad sobre al menos tres pares de voltajes distintos, no como un único ejemplo.

- **RF-2.3** — DADOS `P_est₀ = 12 W`, `V = V_nom`,
  CUANDO se calcula la potencia estática,
  ENTONCES el resultado es **12 W** *(la fuga a voltaje nominal es su propio valor de referencia)*.

- **RF-2.4** — DADA la configuración de RF-2.1 con `P_est₀ = 12 W` y `V_nom = 1,20 V`,
  CUANDO se calcula la potencia total,
  ENTONCES el resultado es **100,128 W**,
  Y ese valor es coherente con el TDP declarado del escenario, lo que hace la calibración auditable.

- **RF-2.5** — DADO `α = 0`,
  CUANDO se calcula la potencia total,
  ENTONCES la potencia dinámica es 0 W y la total es igual a la estática,
  PERO la potencia total **NO debe** ser 0 W: un procesador encendido y en reposo sigue disipando fuga.

---

### RF-3 — Modelo térmico de primer orden

**Historia:** Como participante, quiero ver que la temperatura no sube para siempre, para descubrir que una función puede estar acotada y tener una asíntota.

**Fuente:** PRD AC-5.1, A2, O5 · propuesta F4, F5 · TRD §5.3, TA-1

**Escenarios**

- **RF-3.1** — DADOS `T_amb = 25 °C`, `P = 100,128 W`, `R = 0,55 °C/W`,
  CUANDO se calcula la temperatura de equilibrio,
  ENTONCES el resultado es **80,0704 °C**.

- **RF-3.2** — DADOS `T = 25 °C`, `P = 100,128 W`, `R = 0,55 °C/W`, `C = 60 J/°C`, `T_amb = 25 °C`, `Δt = 1 s`,
  CUANDO se avanza un paso,
  ENTONCES la temperatura resultante es **26,643769 °C** *(tolerancia 1 × 10⁻⁶)*.

- **RF-3.3** — DADA la misma configuración partiendo de `T = T_amb`,
  CUANDO transcurre `t = R · C = 33 s`,
  ENTONCES la temperatura alcanzada cubre el **63,21 %** de la subida total hasta el equilibrio *(tolerancia 0,01 puntos porcentuales)*,
  Y ese porcentaje **DEBE** ser independiente de `T_amb`, de `P` y de `R`: es una propiedad de la exponencial, no del escenario.

- **RF-3.4** — DADA una corrida larga con potencia constante,
  CUANDO se avanza hasta `t ≥ 5 · R · C`,
  ENTONCES la temperatura queda a menos de 1 % del equilibrio,
  PERO **NO debe** superar la temperatura de equilibrio en ningún paso: el modelo se aproxima por debajo y nunca sobrepasa.

- **RF-3.5** — DADO un paso `Δt` grande frente a la constante de tiempo (`Δt = 10 · R · C`),
  CUANDO se avanza un paso,
  ENTONCES el resultado sigue siendo estable y acotado por el equilibrio,
  PERO **NO debe** oscilar ni divergir: la solución exponencial del paso es incondicionalmente estable, a diferencia de una aproximación de Euler.

---

### RF-4 — Política de throttling como función definida por tramos

**Historia:** Como participante, quiero ver el momento exacto en que el procesador se frena y por qué, para conectar la causa térmica con el efecto en el rendimiento.

**Fuente:** PRD AC-5.1, AC-5.2, US-3.3 · propuesta F6 · TRD BR-2, BR-4, §5.3

**Escenarios**

- **RF-4.1** — DADA una temperatura por debajo del umbral y una frecuencia efectiva ya igual a la objetivo,
  CUANDO se aplica la política,
  ENTONCES la frecuencia efectiva no cambia.

- **RF-4.2** — DADA una temperatura **por encima** del umbral,
  CUANDO se aplica la política,
  ENTONCES la frecuencia efectiva baja exactamente un escalón `Δf`,
  PERO **NO debe** bajar por debajo de la frecuencia base del escenario.

- **RF-4.3** — DADA una temperatura por debajo de `umbral − histéresis` y una frecuencia efectiva recortada,
  CUANDO se aplica la política,
  ENTONCES la frecuencia efectiva sube exactamente un escalón `Δf`,
  PERO **NO debe** superar la frecuencia objetivo solicitada.

- **RF-4.4** — DADA una temperatura dentro de la banda de histéresis (`umbral − h < T ≤ umbral`),
  CUANDO se aplica la política,
  ENTONCES la frecuencia efectiva **no cambia**,
  Y **DEBE** cumplirse tanto viniendo de un estado recortado como de un estado sin recorte: la banda es una zona muerta en ambos sentidos.

- **RF-4.5** — DADA una secuencia de temperaturas que oscila alrededor del umbral con amplitud **menor** que la histéresis,
  CUANDO se aplica la política paso a paso durante al menos 20 pasos,
  ENTONCES la frecuencia efectiva cambia **como máximo una vez** en toda la secuencia,
  PERO **NO debe** alternar en pasos consecutivos: esa alternancia es un artefacto numérico, no física, y enseñarla sería enseñar algo falso.

- **RF-4.6** — DADA cualquier secuencia de temperaturas, por extrema que sea,
  CUANDO se recorre la política,
  ENTONCES la frecuencia efectiva permanece en `[f_base, f_objetivo]` en **todos** los pasos,
  Y el valor devuelto **DEBE** ser exactamente representable como `f_objetivo − n · Δf` recortado al intervalo, con `n` entero — sin acumulación de error de punto flotante.

---

### RF-5 — Razón de cambio promedio

**Historia:** Como participante, quiero elegir dos instantes y obtener qué tan rápido cambió la magnitud entre ellos, con su unidad, para cuantificar la rapidez y no solo el valor.

**Fuente:** PRD AC-2.1, AC-2.2, AC-2.3, AC-2.4, US-2.1, US-2.3, US-2.4 · propuesta F7 · **es el objeto matemático central de la Guía 1**

**Escenarios**

- **RF-5.1** — DADOS dos puntos `(a, f(a))` y `(b, f(b))` con `a ≠ b`,
  CUANDO se calcula la razón de cambio promedio,
  ENTONCES el valor devuelto es `(f(b) − f(a)) / (b − a)`,
  Y viene acompañado de su **unidad derivada** como cociente de la unidad de `f` sobre la unidad de la variable independiente,
  Y viene acompañado de los **dos puntos** que definen la recta secante.

- **RF-5.2** — DADA una serie de temperatura sobre el eje del tiempo,
  CUANDO se calcula la razón de cambio promedio,
  ENTONCES la unidad derivada se presenta como `°C/s`;
  DADA una serie de potencia sobre el eje del voltaje, la unidad es `W/V`;
  DADA una serie de frecuencia sobre el eje del tiempo, la unidad es `GHz/s`.

- **RF-5.3** — DADOS dos puntos con **la misma** abscisa (`a = b`),
  CUANDO se intenta calcular la razón de cambio promedio,
  ENTONCES el resultado es **inexistente**,
  PERO **NO debe** devolverse `0`, ni `NaN`, ni `Infinity`: confundir "no existe" con "cero" es exactamente el error conceptual que esta aplicación existe para corregir.

- **RF-5.4** — DADA una serie de `n` filas,
  CUANDO se calculan las razones de cambio entre filas consecutivas,
  ENTONCES se obtienen `n` resultados alineados con las filas,
  Y el primero es **inexistente** — no existe fila anterior,
  PERO **NO debe** ser `0` ni omitirse de la lista: la fila existe y su razón de cambio no.

- **RF-5.5** — DADOS dos intervalos de distinta duración sobre la **misma** corrida no lineal,
  CUANDO se comparan sus razones de cambio promedio,
  ENTONCES los valores difieren más allá de la tolerancia de **1 % del mayor de los dos valores absolutos**,
  Y el resultado indica que difieren, dejando la redacción a la capa de interfaz,
  PERO **NO debe** afirmarse que difieren cuando la diferencia cae dentro de esa tolerancia: sobre un tramo casi lineal la respuesta honesta es "no se distingue".

- **RF-5.6** — DADA una serie de un solo punto,
  CUANDO se pide su razón de cambio entre consecutivos,
  ENTONCES se devuelve una lista de un elemento inexistente,
  PERO **NO debe** producirse un error ni una lista vacía.

---

### RF-6 — Corrida de simulación determinista

**Historia:** Como operador, quiero que dos corridas con los mismos parámetros den exactamente lo mismo, para poder repetir una demostración delante del grupo sin sorpresas.

**Fuente:** PRD AC-3.1, AC-3.4, AC-5.2 · TRD ADR-005, BR-1, BR-3, §7 W1

**Escenarios**

- **RF-6.1** — DADA una configuración con horizonte `H` y paso `Δt`,
  CUANDO se ejecuta la simulación,
  ENTONCES el resultado contiene exactamente `H/Δt + 1` pasos, incluido el instante inicial `t = 0`,
  Y cada paso lleva `t`, potencia, temperatura, frecuencia efectiva y si está en throttling.

- **RF-6.2** — DADA la misma configuración,
  CUANDO se ejecuta la simulación **dos veces**,
  ENTONCES ambos resultados son estructuralmente idénticos, paso a paso y evento a evento,
  PERO el dominio **NO debe** leer el reloj del sistema ni ninguna fuente de aleatoriedad: el determinismo se garantiza por ausencia de esas dependencias, no por una semilla.

- **RF-6.3** — DADA una configuración cuya temperatura de equilibrio supera el umbral de throttling,
  CUANDO se ejecuta la simulación,
  ENTONCES existe al menos un evento `THROTTLE_INICIO`,
  Y su causa está escrita con la forma `T = <valor> °C > T_límite = <valor> °C` con los dos valores reales del instante,
  PERO la causa **NO debe** ser una cadena genérica: sin los números no sirve para argumentar.

- **RF-6.4** — DADA una configuración cuya temperatura de equilibrio queda por debajo del umbral,
  CUANDO se ejecuta la simulación,
  ENTONCES no hay ningún evento de throttling,
  Y la frecuencia efectiva es igual a la objetivo en todos los pasos,
  PERO la lista de eventos **NO debe** ser `null` ni ausente: debe ser una lista vacía.

- **RF-6.5** — DADA una temperatura que supera la temperatura crítica,
  CUANDO continúa la corrida,
  ENTONCES se emite el evento correspondiente,
  PERO la simulación **NO debe** detenerse: el propósito didáctico es que se vea la consecuencia (TRD BR-3).

- **RF-6.6** — DADA una configuración cuyo número de pasos excede el máximo declarado,
  CUANDO se intenta ejecutar,
  ENTONCES se produce un error tipado antes de iterar,
  PERO **NO debe** truncarse la corrida en silencio.

- **RF-6.7** — DADA una configuración con `Δt ≤ 0`,
  CUANDO se intenta ejecutar,
  ENTONCES se produce un error tipado de rango inválido,
  PERO **NO debe** entrarse en el bucle: un paso no positivo es un bucle infinito o una serie invertida.

---

### RF-7 — Métricas de resumen y rendimiento relativo

**Historia:** Como participante, quiero un resumen de la corrida para poder argumentar qué configuración entrega más rendimiento y a qué costo térmico.

**Fuente:** PRD US-3.4, AC-5.3 · propuesta F8 · TRD §5.1

**Escenarios**

- **RF-7.1** — DADO un resultado de simulación,
  CUANDO se calculan las métricas,
  ENTONCES se obtienen potencia media, temperatura máxima, frecuencia efectiva media, tiempo en throttling y rendimiento relativo,
  Y cada una lleva su unidad.

- **RF-7.2** — DADA una corrida sin throttling,
  CUANDO se calcula el rendimiento relativo,
  ENTONCES vale exactamente 1 (100 %),
  PERO **NO debe** superar 1 en ninguna corrida: la frecuencia efectiva nunca excede la objetivo.

- **RF-7.3** — DADO un resultado de simulación,
  CUANDO se calcula la frecuencia efectiva media,
  ENTONCES es el **promedio aritmético** de la frecuencia efectiva sobre los pasos,
  PERO **NO debe** calcularse como `Σ f · Δt`: esa suma es una suma de Riemann, es acumulación, y pertenece a la Guía 6 (PRD C12).

- **RF-7.4** — DADA una corrida sin ningún paso en throttling,
  CUANDO se calcula el tiempo en throttling,
  ENTONCES vale 0 s,
  Y **DEBE** expresarse en segundos, no como número de pasos: el paso es un detalle de la simulación, el segundo es la magnitud del fenómeno.

---

### RF-8 — Comparación de dos corridas

**Historia:** Como participante, quiero cambiar el disipador y repetir la misma corrida, para comprobar que el límite se desplaza sin cambiar el procesador.

**Fuente:** PRD AC-5.3, US-3.2, US-3.4

**Escenarios**

- **RF-8.1** — DADAS dos corridas con idénticos parámetros salvo el disipador, siendo el segundo de **menor** resistencia térmica,
  CUANDO se comparan,
  ENTONCES la temperatura máxima de la segunda es menor,
  Y su tiempo en throttling es menor o igual,
  Y su rendimiento relativo es mayor o igual.

- **RF-8.2** — DADAS dos corridas,
  CUANDO se comparan,
  ENTONCES se obtienen los deltas de cada métrica de resumen,
  PERO **NO debe** compararse magnitud contra magnitud de distinta unidad, ni devolverse un "ganador": la conclusión la argumenta el participante, no la aplicación.

- **RF-8.3** — DADAS dos corridas con **distinto** número de pasos u horizonte,
  CUANDO se intentan comparar,
  ENTONCES se produce un error tipado,
  PERO **NO debe** compararse recortando la más larga: dos corridas de horizonte distinto no son comparables y ocultar eso enseña una falacia.

---

### RF-9 — Catálogo de fórmulas consultable

**Historia:** Como docente evaluadora, quiero ver todas las fórmulas usadas con sus supuestos y referencias, para valorar el rigor conceptual.

**Fuente:** PRD AC-7.1, AC-7.2, G5, US-5.3, C9 · UX F5 *(popover: fórmula + entradas + resultado)* · propuesta alcance 8

**Escenarios**

- **RF-9.1** — DADO el catálogo de fórmulas,
  CUANDO se consulta,
  ENTONCES contiene las ocho entradas F1–F8,
  Y cada una lleva identificador, nombre, expresión, variables con su significado, unidades, dominio, supuesto del modelo y **al menos una** referencia bibliográfica en APA 7.

- **RF-9.2** — DADA cualquier entrada del catálogo,
  CUANDO se inspecciona,
  ENTONCES ningún campo obligatorio está vacío ni contiene un texto de relleno,
  PERO **NO debe** aceptarse un guion, `TODO`, `—` o cadena vacía en `supuesto` ni en `referencia`: un supuesto no declarado es el modo de fallo del criterio 1 de la rúbrica.

- **RF-9.3** — DADA cada función de dominio implementada en este spec,
  CUANDO se busca su entrada en el catálogo,
  ENTONCES existe exactamente una,
  Y **DEBE** verificarse en ambas direcciones: ninguna fórmula implementada sin publicar, ninguna publicada sin implementar (PRD G5 al 100 %).

- **RF-9.4** — DADO el catálogo,
  CUANDO se revisa su contenido matemático,
  ENTONCES **NO debe** aparecer ningún término del eje de otra guía — derivada, límite, tangente, razón de cambio instantánea, integral, suma de Riemann, acumulación (PRD C12).

---

### RF-10 — Escenarios y disipadores tras un puerto

**Historia:** Como desarrollador, quiero poder sustituir el origen de los datos de escenarios sin tocar el dominio, para que la frontera hexagonal sea comprobable y no declarativa.

**Fuente:** TRD MOD-1, §6.1, §6.2, ADR-002 · PRD AC-8.1

**Escenarios**

- **RF-10.1** — DADO el catálogo de escenarios,
  CUANDO se lista a través del puerto,
  ENTONCES devuelve al menos dos escenarios, cada uno con su especificación de CPU completa y su disipador por defecto,
  PERO **NO debe** devolver una lista vacía: sin escenario no hay simulación posible.

- **RF-10.2** — DADO un identificador de escenario inexistente,
  CUANDO se solicita por identificador,
  ENTONCES se produce un error tipado de escenario no encontrado,
  PERO **NO debe** devolverse `null` ni el primer escenario de la lista.

- **RF-10.3** — DADO un archivo de datos con un registro inválido entre registros válidos,
  CUANDO se carga el catálogo,
  ENTONCES los registros válidos se cargan,
  Y el motivo del rechazo del registro inválido queda registrado,
  PERO un registro corrupto **NO debe** romper la carga del resto (TRD §6.2).

- **RF-10.4** — DADOS los datos estáticos de la aplicación,
  CUANDO se cargan,
  ENTONCES provienen de un origen local del propio despliegue,
  PERO **NO debe** hacerse ninguna petición a un origen externo (PRD AC-8.1, TRD SEC-2).

- **RF-10.5** — DADO el catálogo de disipadores,
  CUANDO se lista,
  ENTONCES devuelve al menos dos disipadores de **distinta** resistencia térmica,
  Y **DEBE** existir al menos un par cuya diferencia de resistencia produzca throttling en uno y no en el otro con la misma configuración: sin ese par, AC-5.3 no es demostrable en el aula.

---

### RF-11 — Coherencia declarada con la línea base constitucional

**Historia:** Como equipo, queremos que la diferencia entre lo que el TRD publica y lo que este spec construye quede escrita y localizable, para que nadie la descubra por sorpresa en una auditoría.

**Fuente:** [`proposal.md`](proposal.md) §Requirement Delta Preview *(MODIFIED: TRD §5.3)* · regla transversal *Escritura en archivos compartidos* de `AGENTS.md`/`CLAUDE.md` · KZ-001-setup-bootstrap-angular-3

**Escenarios**

- **RF-11.1** — DADA la deriva detectada entre el TRD y el PRD v0.2 *(inventariada en §6 de este documento)*,
  CUANDO se cierra este spec,
  ENTONCES la deriva está inventariada con el **valor literal** de cada sitio afectado y su número de línea,
  Y está registrada como pendiente para la rama por defecto,
  PERO este spec **NO debe** editar `docs/trd/trd.md`: la enmienda excede su alcance y una corrección parcial dejaría el TRD internamente inconsistente. Ver §7 Q1.

- **RF-11.2** — DADO el modelo físico que este spec implementa,
  CUANDO se compara con el publicado en TRD §5.3,
  ENTONCES las diferencias están enumeradas una por una con su justificación,
  Y **DEBE** incluirse el motivo por el que `trabajo útil = Σ f_ef · Δt · carga` se retira (PRD C12) y por el que `eficiencia (trabajo/energía)` se sustituye por rendimiento relativo.

---

## 5. Requisitos no funcionales

- **RNF-1** — Estudiante → ejecuta una corrida de 300 pasos sobre el motor de simulación durante operación normal ⇒ produce el resultado completo **medido por < 30 ms en hardware de gama media**.
  *Deriva de:* TRD PERF-4 *(que fija el mismo límite para 600 pasos; este spec lo acota a los 300 pasos de una corrida de 5 min a `Δt = 1 s`, PRD G3)*.
  **Cuándo la medición no vale:** si tres ejecuciones consecutivas varían más de 10 ms entre sí, la medición no es evidencia — se reporta la dispersión y queda **inconcluso**, no aprobado (convención E4).

- **RNF-2** — Prueba de arquitectura → inspecciona los imports de `domain/` y `application/` durante la verificación ⇒ falla si aparece `@angular/*`, `chart.js`, `rxjs` o cualquier import de `infrastructure/` o `ui/` **medido por código de salida ≠ 0**.
  *Deriva de:* TRD TEST-2, TC-3.

- **RNF-3** — Desarrollador → ejecuta la suite del dominio sobre `domain/` ⇒ cada fórmula publicada queda cubierta **medido por 100 % de las funciones de `domain/**/services/` con al menos un caso de referencia de valor calculado a mano, y 0 usos de `TestBed` en esas pruebas**.
  *Deriva de:* TRD TEST-1.
  **Cuándo la medición no vale:** un valor esperado obtenido ejecutando el propio código es una tautología y no cubre nada. Todo valor esperado de este documento fue calculado de forma independiente y aparece **literal** en RF-2 y RF-3; una prueba cuyo valor esperado no proceda de ahí o de un cálculo a mano documentado no cuenta como cobertura.

- **RNF-4** — Caso de uso → se ejecuta con adaptadores falsos en memoria durante pruebas ⇒ produce el mismo resultado que con los adaptadores reales **medido por suite de aplicación verde sin red, sin DOM y sin `TestBed`**.
  *Deriva de:* TRD TEST-3.

- **RNF-5** — Desarrollador → sustituye el origen de datos JSON por otro sobre la capa de infraestructura ⇒ el sistema funciona igual **medido por 0 archivos modificados en `domain/` y `application/`**.
  *Deriva de:* TRD MOD-1.

- **RNF-6** — Navegador → carga la aplicación sobre el despliegue estático ⇒ los datos de escenarios y disipadores se sirven del propio despliegue **medido por 0 peticiones a orígenes externos**.
  *Deriva de:* TRD SEC-2 · PRD AC-8.1. *Verificable con el script existente `tools/check-external-origins.mjs`.*

- **RNF-7** — Participante → introduce un valor fuera del dominio de una variable sobre un control ⇒ la aplicación lo rechaza y explica el rango **medido por 0 resultados numéricos producidos a partir de una entrada inválida**.
  *Deriva de:* TRD USA-2 · PRD AC-4.3. *Este spec cubre la mitad de dominio del escenario: la validación vive en los value objects (RF-1). La mitad de presentación es la hija `02`.*

---

## 6. Clases de defecto y su puerta de verificación

**El requisito que esta sección impone:** ningún defecto de la tabla puede quedar sin puerta, y donde no exista puerta automática, el sustituto se nombra o el riesgo se acepta por escrito. Una puerta verde ciega a la clase de defecto dominante del spec no es una puerta.

| # | Clase de defecto | Cómo se ve | Puerta | Entrada que la haría fallar |
|---|---|---|---|---|
| D1 | Fórmula mal transcrita (exponente, signo, paréntesis) | Números plausibles, curvas creíbles, resultado incorrecto | `npm run test:agent` con los valores literales de RF-2.1, RF-2.4, RF-3.1, RF-3.2 | Cambiar `V*V` por `V` en la potencia dinámica ⇒ 88,128 W pasa a 73,44 W ⇒ FALLA |
| D2 | Propiedad matemática rota aunque el caso puntual pase | Un valor correcto y la familia entera equivocada | Pruebas de propiedad: RF-2.2 (×4), RF-3.3 (63,21 % en `τ`), RF-4.6 (invariante de intervalo) | Fijar el exponente de `V` en 1,9: RF-2.1 seguiría cerca, RF-2.2 daría 3,73 ⇒ FALLA |
| D3 | Fuga de framework o de capa al dominio | `import` de Angular o de `infrastructure/` en `domain/` | `npm run test:arch` | Añadir `import { signal } from '@angular/core'` en cualquier servicio de dominio ⇒ salida ≠ 0 |
| D4 | Pérdida de determinismo | Dos corridas iguales dan distinto | RF-6.2 (igualdad estructural) **+** ausencia verificada de `Date.now`, `Math.random`, `performance.now` bajo `domain/` | Introducir `Math.random()*0.01` en el paso térmico ⇒ FALLA la igualdad y la búsqueda |
| D5 | Oscilación de throttling por histéresis mal aplicada | `f_ef` alterna cada paso; parece física y es ruido numérico | RF-4.5 (≤ 1 cambio en 20 pasos oscilando dentro de la banda) | Poner la histéresis en 0 ⇒ alternancia en pasos consecutivos ⇒ FALLA |
| D6 | Razón de cambio de la primera fila devuelta como `0` | La aplicación enseña que "no existe" es "cero" | RF-5.3, RF-5.4 — la prueba exige inexistencia y **falla ante `0`, `NaN` e `Infinity`** | Devolver `0` cuando no hay fila anterior ⇒ FALLA |
| D7 | Frecuencia efectiva fuera de `[f_base, f_obj]` | Rendimiento relativo > 100 % o negativo | RF-4.6 y RF-7.2 sobre una batería de corridas, no un caso | Quitar el recorte inferior ⇒ `f_ef` negativa tras suficientes pasos ⇒ FALLA |
| D8 | Deriva de unidades (GHz contra Hz, °C/W contra W/°C) | Resultados con órdenes de magnitud absurdos | RF-1.4 (incompatibilidad de tipos) **+** RF-2.4 anclado al TDP publicado | Pasar `f` en GHz donde se espera Hz ⇒ 88,128 W pasa a 8,8 × 10⁻⁸ W ⇒ FALLA |
| D9 | Acumulación de error de punto flotante en la escalera de frecuencia | `f_ef` con basura en el decimal 15; comparaciones de igualdad fallan de forma intermitente | RF-4.6 exige representabilidad exacta como `f_obj − n·Δf` | Calcular por resta repetida: **medido**, `f_obj = 4,0` y `Δf = 0,2` divergen ya en `n = 2` (3,5999999999999996447 contra 3,6000000000000000888) ⇒ FALLA |
| **D10** | **Calibración didáctica no declarada** — valores de `C` conmutada elegidos para cuadrar con un TDP, presentados como dato de fabricante | La docente pregunta de dónde sale `C` y no hay respuesta. Golpea el criterio 1 de la rúbrica | ⚠️ **Sin puerta automática.** RF-9.2 solo comprueba que el campo `supuesto` no esté vacío — es una **aserción de presencia**, no de veracidad. **Sustituto: revisión humana del texto de los ocho supuestos en la puerta de aprobación de este spec** | Ninguna entrada automática la hace fallar. Eso es precisamente el hallazgo |
| **D11** | **Referencia bibliográfica plausible pero inexistente o que no contiene la fórmula citada** | La cita se ve impecable, la fuente no dice eso. Es el modo de fallo más caro del criterio 1 | ⚠️ **Sin puerta automática.** RF-9.1 comprueba presencia del campo, no que la obra exista ni que contenga la fórmula. **Sustituto: verificación humana de las nueve referencias contra la bibliografía del curso, en la puerta de aprobación** | Ninguna. Una referencia inventada pasa todas las pruebas verdes |
| D12 | Adelanto de eje matemático (integral o derivada colada en el catálogo o en el código) | Viola PRD C12 sin que nadie lo note | RF-9.4 — búsqueda de términos prohibidos en `domain/` y en el catálogo | Cambiar la frecuencia media a `Σ f·Δt / H` ⇒ FALLA RF-7.3 y la búsqueda de conceptos |

**Riesgos aceptados por escrito**

| # | Riesgo | Por qué se acepta |
|---|---|---|
| RA-1 | D10 y D11 no tienen puerta automática y dependen de revisión humana | Ninguna herramienta disponible en este proyecto puede juzgar si un supuesto es honesto o si una cita existe. Declararlo es recuperable; no declararlo es lo que consume rondas de retrabajo |
| RA-2 | El determinismo se garantiza **dentro de un mismo motor de JavaScript**, no bit a bit entre motores | `Math.exp` no está especificado al último bit en ECMAScript. TRD BR-1 dice "bit a bit"; en la práctica eso vale dentro de una sesión y de un navegador, que es el único escenario de uso (una demostración presencial en un portátil). Se declara en lugar de prometerse |
| RA-3 | Los valores de `C` conmutada y `Δf` son calibración didáctica, no datos de fabricante | PRD A2 y O5 lo autorizan explícitamente: el modelo es didáctico, correcto en la tendencia. La honestidad se cubre por D10 |

**Inventario de deriva constitucional detectada** *(insumo de RF-11; cada fila verificada por búsqueda sobre el archivo, con número de línea y valor literal)*

| # | Sitio | Valor literal en el archivo | Contradicción |
|---|---|---|---|
| DR-1 | `docs/trd/trd.md:335` | Fila publicada: *Trabajo útil* → `W = Σ f_efectiva · Δt · carga` | Es una suma de Riemann. PRD C12 la reserva a la Guía 6 |
| DR-2 | `docs/trd/trd.md:314` | `MetricasResumen` incluye `trabajoUtilTotal` y `eficiencia` (trabajo/energía) | Ambas dependen de DR-1. Se sustituyen por rendimiento relativo (F8) |
| DR-3 | `docs/trd/trd.md:311` | `PasoSimulacion` incluye `trabajoAcumulado` | Acumulación: mismo motivo que DR-1 |
| DR-4 | `docs/trd/trd.md:23`, `:256-258`, `:262`, `:266`, `:316-324`, `:407-424` — 28 líneas mencionan el concepto | módulo `consumption` completo: `Aparato`, `PerfilUso`, `Tarifa`, `DesgloseConsumo`, el puerto `RepositorioCatalogoAparatos`, el workflow W2 y las reglas BR-6/BR-7/BR-8 | PRD v0.2 **O1** retira el módulo de consumo y costo del alcance |
| DR-5 | `docs/trd/trd.md:313`, `:401`, `:527` | El TRD cita `AC-1.4` como origen del determinismo | **`AC-1.4` no existe en el PRD v0.2** (AC-1 llega hasta AC-1.3). El determinismo es hoy **AC-3.4** |
| DR-6 | `docs/trd/trd.md:526`, y `:312` | §12 mapea el caso de referencia del throttling a `AC-1.2, AC-1.3`; §5.1 ata la causa del evento a `AC-1.3` | En v0.2, `AC-1.2` es la sincronía de las cuatro representaciones y `AC-1.3` es fórmula mostrada = calculada. La deriva no es de numeración: es de **significado** |
| DR-7 | `docs/trd/trd.md:136` | ADR-004: *"las series temporales del simulador se refrescan cada **100 ms**"* | PRD v0.2 G3 y AC-3.1 fijan la cadencia en **1 s exacto** |
| DR-8 | `docs/trd/trd.md:274` | `pages/ inicio, lazo-termico, consumo, conceptos, no-encontrado` | El código real tiene `inicio, laboratorio, cartilla, conceptos, formulas, no-encontrado`. `lazo-termico` y `consumo` no existen |
| DR-9 | `docs/trd/trd.md:144`, `:182`, `:196` | Usa el nombre de tipo `SimulationRun` | §5.1 (`:313`) lo llama `ResultadoSimulacion`. Inconsistencia interna del propio TRD |
| DR-10 | `docs/trd/trd.md:307` | `EscenarioTermico` embebe `disipador` | Este spec necesita elegir el disipador **por configuración** (PRD S8, US-3.2): el escenario lleva un disipador **por defecto** y la configuración lo sustituye |
| DR-11 | `docs/trd/trd.md:361` | La ruta declarada es `assets/data/escenarios.json` | El proyecto real no tiene `src/assets/`: `angular.json` declara un único origen de activos, `{ "glob": "**/*", "input": "public" }`. La ruta servida es `/data/…` desde `public/data/`. **Este spec lo resuelve en su propio diseño** y anota la corrección del TRD |
| DR-12 | `docs/ux-ui/design.md:144` | El layout LP-1 del laboratorio lista como indicador mostrado: `f·efectiva, trabajo útil` | Retirar *trabajo útil* del modelo (DR-1) deja al documento UX describiendo un indicador que no existirá. **Hallazgo del desafío de reversión del Paso 2.3**, no de la lectura inicial. `:203` también lo menciona, pero ahí es prosa sobre la frecuencia efectiva y no una promesa de indicador |

---

## 7. Supuestos y preguntas abiertas

### Supuestos

| # | Supuesto | Cómo se valida |
|---|---|---|
| S1 | Los valores de calibración del [`mockup`](../mockup/index.html) (`C = 15,3 nF`, `P_est₀ = 12 W`, `T_thr = 95 °C`, `Δf = 0,2 GHz`, `h = 3 °C`; disipadores `R ∈ {0,95; 0,55; 0,28; 0,18}`) son la base de los escenarios | Verificado numéricamente durante esta especificación: a `V = 1,20 V` y `f = 4,0 GHz` producen `P = 100,128 W`, TDP plausible para el escenario declarado; y los disipadores separan los casos con y sin throttling (`T_∞` = 120,12 °C con el pasivo, 80,07 °C con el de fábrica, 53,04 °C con la torre) |
| S2 | Añadir `Segundos` a los value objects de la propuesta es necesario | Descubrimiento de esta fase: sin él, el denominador de toda unidad derivada de RF-5.2 sería un número desnudo. La propuesta listaba cinco magnitudes; son seis |
| S3 | Los errores de dominio se **lanzan** como clases tipadas, no se devuelven como `Result` | Es la convención ya establecida en el repositorio (`SelloDeTiempoInvalidoError`) y la que declara TRD §11. Cambiarla sería un ADR, no una decisión de spec |
| S4 | El paso `Δt` y el horizonte llegan al dominio como dato de la configuración | TRD ADR-005. El dominio no conoce la cadencia de reproducción de la interfaz |

### Preguntas abiertas

| # | Pregunta | Impacto si no se resuelve | Dueño |
|---|---|---|---|
| ~~Q1~~ | **Resuelta (2026-09-08, usuario).** Este spec **no** edita `docs/trd/trd.md`. La deriva DR-1…DR-11 queda inventariada en §6 y se resuelve en un spec `003-docs-sincronizar-trd` en la rama por defecto. Motivo: una enmienda parcial dejaría §12 citando criterios que apuntan a un modelo que ya no dice eso — rompe el barrido hacia atrás | — | — |
| ~~Q2~~ | **Resuelta (2026-09-08, usuario).** Dos escenarios: escritorio 6 núcleos (`C = 15,3 nF`, `T_thr = 95 °C`) y portátil 4 núcleos (`C = 8,2 nF`, `T_thr = 90 °C`). Un tercero sería coste sin requisito que lo pida | — | — |
| Q3 | ¿La docente acepta el modelo de fuga simplificado `P_est = P_est₀ · (V/V_nom)`? | Está declarado como supuesto con referencia (PRD A2, catálogo F2). Si lo rechaza, cambia F2 y su prueba, no la arquitectura | Usuario / docente |
| ~~Q4~~ | **Resuelta (2026-09-08, usuario).** Tolerancia de RF-5.5: **1 % del mayor de los dos valores absolutos**. Relativa a la magnitud comparada, para que sobre un tramo casi lineal la respuesta sea "no se distingue" | — | — |

---

## 8. Trazabilidad

| Requisito | Origen (PRD / TRD / UX / propuesta) | Verificado por |
|---|---|---|
| RF-1 | PRD AC-4.3, US-1.4 · TRD USA-2, §5.1, §11 | `tasks.md` T-1 · pruebas de los seis value objects |
| RF-2 | PRD US-3.1, AC-1.3, §1 · propuesta F1–F3 · TRD §5.3 | `tasks.md` T-5 · `modelo-potencia.spec.ts` |
| RF-3 | PRD AC-5.1, A2, O5 · propuesta F4, F5 · TRD TA-1 | `tasks.md` T-6 · `modelo-termico.spec.ts` |
| RF-4 | PRD AC-5.1, AC-5.2, US-3.3 · propuesta F6 · TRD BR-2, BR-4 | `tasks.md` T-7 · `politica-throttling.spec.ts` |
| RF-5 | PRD AC-2.1–AC-2.4, US-2.1, US-2.3, US-2.4 · propuesta F7 | `tasks.md` T-2 · `razon-de-cambio-promedio.spec.ts` |
| RF-6 | PRD AC-3.1, AC-3.4, AC-5.2 · TRD ADR-005, BR-1, BR-3, §7 W1 | `tasks.md` T-8 · `simulador-lazo-termico.spec.ts` |
| RF-7 | PRD US-3.4, AC-5.3 · propuesta F8 · TRD §5.1 | `tasks.md` T-9 · `metricas-resumen.spec.ts` |
| RF-8 | PRD AC-5.3, US-3.2, US-3.4 | `tasks.md` T-10 · `comparador-corridas.spec.ts` |
| RF-9 | PRD AC-7.1, AC-7.2, G5, US-5.3, C9 · UX F5 | `tasks.md` T-11 · `catalogo-formulas.spec.ts` + prueba de coherencia bidireccional |
| RF-10 | TRD MOD-1, §6.1, §6.2, SEC-2 · PRD AC-8.1 | `tasks.md` T-3, T-12 · pruebas de adaptador + `tools/check-external-origins.mjs` |
| RF-11 | propuesta §Requirement Delta · regla transversal de escritura en archivos compartidos | `tasks.md` T-13 · §6 de este documento + anotación para la rama por defecto |
| RNF-1 | TRD PERF-4 | `tasks.md` T-8 · medición documentada en `execution.md` |
| RNF-2 | TRD TEST-2, TC-3 | Comprobación final · `npm run test:arch` |
| RNF-3 | TRD TEST-1 | Comprobación final · revisión del Reviewer sobre el origen de cada valor esperado |
| RNF-4 | TRD TEST-3 | `tasks.md` T-14 · suite de `application/` con dobles en memoria |
| RNF-5 | TRD MOD-1 | `tasks.md` T-12 · `npm run test:arch` |
| RNF-6 | TRD SEC-2 · PRD AC-8.1 | `tasks.md` T-12 · `tools/check-external-origins.mjs` |
| RNF-7 | TRD USA-2 · PRD AC-4.3 | `tasks.md` T-1 *(mitad de dominio; la mitad de presentación es la hija `02`)* |

**Requisitos del PRD que este spec habilita pero no cierra:** AC-1.1, AC-1.2 *(simultaneidad de las cuatro representaciones — hija `02`)*; AC-2.2 *(dibujo de la secante — hija `02`; el dominio entrega los dos puntos)*; AC-3.2, AC-3.3 *(cadencia y pausa — hija `02`)*; AC-4.1, AC-4.2 *(distinción visual de variables — hija `02`)*; AC-6.*, AC-7.3, AC-8.* *(hijas `03` y `04`)*.
