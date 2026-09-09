# PRD — Variación y Cambio

> **Qué es esto:** experiencia didáctica **matemática** en formato de aplicación web, para la **Guía Específica No. 1** de Laboratorio de Matemáticas II. Enseña *variación y cambio*, *funciones como modelos de fenómenos*, *razón de cambio promedio* y las *cuatro representaciones de una función*, usando como contexto real el comportamiento térmico de un procesador.

## Document Control

| Campo | Valor |
|---|---|
| Estado | **Draft v0.2** — dependencia del documento del curso **resuelta** |
| Modo AKILI | Brand-new (Seed Setup) |
| Última actualización | 2026-09-08 |
| Asignatura | Laboratorio de Matemáticas II · Institución Universitaria Antonio José Camacho |
| Guía específica | **No. 1** |
| Ejes conceptuales | Variación y cambio · Funciones como modelos de fenómenos · Razón de cambio promedio · Representaciones gráfica, tabular, algebraica y contextual de funciones |
| RAA asociados | **RAA 1:** Identificación e interpretación conceptual · **RAA 2:** Aplicación en contextos reales |
| Fuente normativa | `LM2_Guia_Metodologica_General_(V3).docx` — Sandra Esther Suárez Chávez |
| Documentos hermanos | [`docs/ux-ui/design.md`](ux-ui/design.md) · [`docs/trd/trd.md`](trd/trd.md) · [`docs/infrastructure.md`](infrastructure.md) |

---

## 1. Overview & Purpose

> ⚠️ **Corrección de encuadre respecto a la v0.1.** Este **no** es un proyecto de electrónica que usa matemáticas. Es un **laboratorio de matemáticas** cuyo eje evaluado es matemático, y el procesador es el **contexto real** con el que se aplica ese eje (RAA 2). La rúbrica califica *fundamentación matemática* y *argumentación matemática*; no califica cuánto se sabe de disipadores.

La aplicación es una **Experiencia Didáctica Matemática**: el subgrupo diseñador la implementa sobre otro subgrupo (implementación cruzada) durante un encuentro presencial, con grupos de **2 a 6 participantes**.

El fenómeno modelado es un lazo de realimentación negativa que todo estudiante ha visto como usuario:

```
↑ Energía (voltaje) → ↑ Potencia → ↑ Temperatura
                                        ↓
        ↓ Rendimiento ← thermal throttling ← Temperatura alta
                            ↑
                     un mejor disipador desplaza este límite
```

Lo que se **aprende** con eso no es electrónica, es matemática:

| Concepto matemático | Cómo aparece en el fenómeno |
|---|---|
| **Variable independiente** | Lo que el participante manipula: voltaje, carga de trabajo, disipador, temperatura ambiente |
| **Variable dependiente** | Lo que resulta y **no se puede fijar a mano**: potencia, temperatura, frecuencia efectiva |
| **Función como modelo** | `P(V) = C·V²·f·carga` y `T(t)` son funciones que *predicen* el fenómeno |
| **Razón de cambio promedio** | `ΔT/Δt` en °C/s entre dos instantes; `ΔP/ΔV` en W/V entre dos voltajes |
| **Cuatro representaciones** | La fórmula (algebraica), la tabla en vivo (tabular), la curva (gráfica) y la frase que la explica (contextual) — **de la misma función, al mismo tiempo** |
| **Comportamiento funcional** | Crecimiento no lineal (cuadrático en V), acotamiento (asíntota térmica), decrecimiento por throttling |

**El hallazgo que ordena todo el diseño:** el propio usuario observó que *"hay variables que no se pueden cambiar manualmente, como la temperatura, que depende del disipador y la energía"*. Esa frase **es** la distinción entre variable independiente y dependiente. El panel de controles de la app es el **dominio**; los indicadores son el **rango**. La arquitectura de la interfaz enseña el concepto antes de que nadie lea una definición.

**Alineación con el documento del curso:** el Anexo A.1 (*Laboratorio de modelación funcional*) lista entre sus situaciones sugeridas **"Variación de temperatura de un dispositivo electrónico"**. El contexto elegido no solo es válido: es uno de los ejemplos que propone la guía.

---

## 2. Problem Statement

| Dimensión | Detalle |
|---|---|
| **Problema de aprendizaje** | El estudiante manipula funciones como objetos algebraicos aislados. Ve `f(x) = x²`, tabula puntos y grafica — pero no reconoce que las tres cosas son **la misma función**, ni que la razón de cambio promedio significa algo en el mundo. Las cuatro representaciones se aprenden como cuatro ejercicios distintos |
| **Por qué duele** | Sin conectar representaciones, el estudiante no puede modelar: ante un fenómeno real no sabe qué es la variable independiente, ni qué pregunta responde una pendiente |
| **Por qué esta forma** | Una simulación en vivo permite algo que el tablero no: **mover la variable independiente y ver simultáneamente cómo cambian la tabla, la curva y la interpretación**. El estudiante no aprende la conexión: la observa |
| **Por qué este contexto** | El throttling térmico es un fenómeno que el estudiante ya conoce como usuario ("mi PC se pone lento cuando se calienta") pero nunca como función. Ese salto de la intuición al modelo es exactamente RAA 2 |
| **El obstáculo que ataca** | La confusión más frecuente en este eje: creer que "sube más" y "sube más rápido" son lo mismo. La app las separa: el valor está en la tabla, la rapidez es la razón de cambio |

---

## 3. Target Personas

### P1 — Subgrupo invitado *(usuario primario real)*

| Campo | Detalle |
|---|---|
| Quiénes | 2 a 6 compañeros de otro subgrupo, con eje conceptual distinto al nuestro |
| Contexto | Encuentro presencial. Reciben la experiencia sin haberla visto antes, y deben **participar, argumentar y ser corregidos** |
| Job-to-be-done | *"Cuando me entregan una simulación que no conozco, quiero entender en un minuto qué puedo mover y qué se mueve solo, para poder predecir, equivocarme y entender por qué me equivoqué."* |
| Éxito | Puede predecir el efecto de un cambio, justificar su predicción con la fórmula o la tabla, y reconocer su error cuando la simulación lo contradice |
| Restricción crítica | **No hay tutorial largo.** Las instrucciones se socializan en voz alta y por cartilla; la app debe ser evidente |

### P2 — Subgrupo diseñador *(operador de la experiencia)*

| Campo | Detalle |
|---|---|
| Quiénes | El equipo de 4–5 integrantes, con roles definidos (coordinador, orientador conceptual, responsable de materiales, responsable de evidencias, relator) |
| Contexto | Orientan permanentemente durante la implementación: formulan preguntas, piden justificaciones, registran errores conceptuales. **La guía prohíbe limitarse a observar** |
| Job-to-be-done | *"Cuando implemento la experiencia, quiero que la app me dé los momentos de pregunta y me deje registrar lo que respondieron, para que la argumentación quede documentada y no dependa de mi memoria."* |
| Éxito | Terminan la sesión con evidencias organizadas y con los errores conceptuales registrados |

### P3 — Docente evaluadora *(stakeholder que califica)*

| Campo | Detalle |
|---|---|
| Contexto | Evalúa con una rúbrica analítica de 10 criterios, 0,5 puntos cada uno (5,0 total) |
| Job-to-be-done | *"Cuando evalúo, quiero ver rigor conceptual y argumentación real, no una actividad bonita."* |
| Éxito | Los conceptos son rigurosos y referenciados; la actividad obliga a justificar, no a responder mecánicamente |
| Advertencia textual de la guía | *"Una actividad no será valorada por 'verse bonita' o por ocupar tiempo de clase."* y *"No se calificará únicamente el componente lúdico o creativo; el centro de la evaluación será la coherencia matemática y la calidad de la argumentación."* |

---

## 4. Goals & Success Metrics

**North Star Metric:** *proporción de participantes que, ante un cambio de variable independiente, **predicen antes de ver el resultado** y luego **justifican** su predicción con una de las cuatro representaciones.*

Es la métrica correcta porque es literalmente el criterio 6 de la rúbrica (*argumentación matemática*), donde el nivel Insuficiente se define como *"la actividad se limita a respuestas mecánicas"*. Una app que solo se mira, por bonita que sea, cae en ese nivel.

### Cómo la app atiende cada criterio de la rúbrica

| # | Criterio de la rúbrica | Pts | ¿La app influye? | Cómo |
|---|---|---|---|---|
| 1 | Fundamentación matemática | 0,5 | ✅ Directo | Sección de fórmulas con definiciones formales, dominio/rango, unidades y referencias APA |
| 2 | Diseño de la experiencia | 0,5 | ✅ Directo | Variables manipulables + retos de predicción; no es una demo pasiva |
| 3 | Materiales y recursos | 0,5 | ✅ Directo | La app terminada antes del encuentro, funcional para 2–6 participantes, **operable sin internet** |
| 4 | Organización e implementación | 0,5 | ✅ Parcial | Guía de manejo con momentos y tiempos sugeridos; modo presentación |
| 5 | Orientación y comunicación **+ cartilla o folleto** | 0,5 | ✅ Directo | **Cartilla imprimible obligatoria**, generada desde la app |
| 6 | Argumentación matemática | 0,5 | ✅ Directo | Momentos obligatorios de predicción y justificación dentro del flujo |
| 7 | Gestión de evidencias | 0,5 | ✅ Directo | Exportación de corridas, respuestas y errores registrados |
| 8 | Registros fotográficos | 0,5 | ❌ No | Es trabajo del equipo durante la sesión |
| 9 | Informe académico | 0,5 | ⚠️ Insumo | La app aporta datos, fórmulas y referencias; el informe lo escribe el equipo |
| 10 | Trabajo colaborativo | 0,5 | ❌ No | Es proceso de equipo |

**Lectura honesta:** la app influye directamente en **6 criterios (3,0 puntos)**, parcialmente en 2 y en nada en 2. Construir una app perfecta no asegura 5,0: los registros fotográficos, el informe y el reparto de roles son trabajo humano que ninguna aplicación sustituye.

### Objetivos medibles del producto

| # | Objetivo | Métrica | Meta |
|---|---|---|---|
| G1 | Las cuatro representaciones se leen como una sola función | Las 4 visibles simultáneamente sin navegar | 100% de las pantallas de laboratorio |
| G2 | La razón de cambio promedio se calcula sobre datos reales | El participante elige `t₁` y `t₂` y obtiene `Δf/Δt` con unidad y recta secante | Disponible en toda serie temporal |
| G3 | La tabla y la gráfica avanzan en vivo | Actualización cada **1 s** exacto, con pausa | Deriva acumulada < 100 ms en 5 min |
| G4 | Comprensible sin tutorial | Tiempo hasta la primera predicción registrada | < 2 min desde que se entrega el equipo |
| G5 | Rigor verificable | Fórmulas mostradas = fórmulas implementadas, con referencia | 100%, verificado por prueba |
| G6 | Funciona en el aula | Operativa sin conexión a internet | 0 peticiones externas |

---

## 5. Scope

### In Scope — v1

| # | Alcance | Criterio de rúbrica que atiende |
|---|---|---|
| S1 | **Introducción**: qué es variación y cambio, qué es una función como modelo, qué es razón de cambio promedio, y por qué el procesador sirve de contexto | 1, 5 |
| S2 | **Guía de manejo de la simulación**: qué se puede mover, qué se mueve solo, cómo leer cada representación, secuencia sugerida con tiempos | 4, 5 |
| S3 | **Laboratorio en vivo**: controles de variables independientes + indicadores de dependientes, con simulación temporal | 2 |
| S4 | **Gráfica temporal** de potencia, temperatura y frecuencia efectiva, actualizada cada segundo, con umbral de throttling y marcadores de evento | 1, 2 |
| S5 | **Tabla en vivo** de los mismos valores, una fila por segundo, con columna de **razón de cambio promedio** entre filas consecutivas | 1, 2 |
| S6 | **Selector de intervalo** `[t₁, t₂]` que calcula la razón de cambio promedio y dibuja la **recta secante** sobre la gráfica | 1, 2, 6 |
| S7 | **Panel de las cuatro representaciones** de la función activa: algebraica, tabular, gráfica y contextual, sincronizadas | 1, 2 |
| S8 | **Efecto del disipador**: cambiar de disipador mueve la temperatura y el punto de throttling sin tocar el procesador | 2 |
| S9 | **Retos de predicción y argumentación**: la app pide predecir antes de ejecutar, registra la respuesta y la contrasta | **6** |
| S10 | **Registro de errores conceptuales** frecuentes, con la corrección | 6, 7 |
| S11 | **Sección de fórmulas y referencias**: toda ecuación usada, con definición, unidades, supuestos y referencia bibliográfica en APA 7 | **1** |
| S12 | **Cartilla/folleto imprimible** con la secuencia de implementación (contextualización, orientación inicial, desarrollo, cierre) | **5** |
| S13 | **Exportación de evidencias**: la corrida y las respuestas de los participantes, en formato descargable | **7** |
| S14 | **Visual 3D del procesador y el disipador** que reacciona a la temperatura y al throttling | 3 *(apoyo, no núcleo)* |
| S15 | Funcionamiento **sin conexión**, en un portátil, proyectable | 3, 4 |

### Out of Scope — v1 *(explícito)*

| # | Fuera de alcance | Razón |
|---|---|---|
| O1 | **Módulo de consumo y costo eléctrico (kWh, tarifa, factura)** | Estaba en la v0.1 del PRD y **se retira**: no pertenece a los ejes de la Guía 1. Es material natural para una guía posterior (optimización o integración), no para esta |
| O2 | Backend, base de datos, API propia | Todo se procesa en el cliente |
| O3 | Cuentas de usuario, login, puntajes persistentes entre sesiones | La experiencia dura una sesión presencial |
| O4 | Dependencias de pago, versiones PRO, servicios con cuota | Restricción dura |
| O5 | Precisión de ingeniería (SPICE, CFD térmico) | Es un modelo **didáctico**: correcto en la tendencia y transparente, no exacto al vatio |
| O6 | Multi-idioma | Español únicamente |
| O7 | Modo claro | Sistema dark-first |
| O8 | Derivada, razón de cambio **instantánea**, límites | Son las Guías 2 y 4. La Guía 1 llega hasta la razón de cambio **promedio** — la secante, no la tangente. Meterlas aquí sería incoherencia con el eje asignado |
| O9 | Registros fotográficos, informe académico, reparto de roles | Trabajo del equipo humano, no de la app |
| O10 | Telemetría o analítica remota | Sin backend y sin internet en el aula |

---

## 6. User Stories

### Épica E1 — Comprender la función como modelo *(RAA 1)*

| ID | Historia |
|---|---|
| US-1.1 | Como **participante**, quiero ver de un golpe qué variables puedo mover y cuáles se calculan solas, para entender la diferencia entre variable independiente y dependiente sin que me la definan. |
| US-1.2 | Como **participante**, quiero ver la fórmula que la app está usando junto a la curva y la tabla que produce, para reconocer que las tres son la misma función. |
| US-1.3 | Como **participante**, quiero leer en una frase qué significa lo que veo ("por cada voltio que subo, la potencia sube 18 W"), para conectar el número con el mundo. |
| US-1.4 | Como **participante**, quiero conocer el dominio y el rango de cada variable, para saber qué valores tienen sentido físico y cuáles no. |

### Épica E2 — Razón de cambio promedio *(el objeto matemático central)*

| ID | Historia |
|---|---|
| US-2.1 | Como **participante**, quiero elegir dos instantes de la tabla y obtener la razón de cambio promedio entre ellos, con su unidad, para cuantificar qué tan rápido cambió la temperatura. |
| US-2.2 | Como **participante**, quiero ver la recta secante dibujada entre esos dos puntos sobre la gráfica, para asociar la razón de cambio promedio con una pendiente. |
| US-2.3 | Como **participante**, quiero comparar la razón de cambio de dos intervalos distintos de la misma corrida, para descubrir que no es constante y que por eso la función no es lineal. |
| US-2.4 | Como **participante**, quiero ver la razón de cambio entre filas consecutivas en la propia tabla, para notar que crece, se estabiliza o cae según el momento. |

### Épica E3 — Explorar el fenómeno *(RAA 2)*

| ID | Historia |
|---|---|
| US-3.1 | Como **participante**, quiero mover el voltaje y ver el efecto en potencia y temperatura, para descubrir que la relación no es proporcional. |
| US-3.2 | Como **participante**, quiero cambiar el disipador y repetir la misma corrida, para comprobar que el límite se desplaza sin cambiar el procesador. |
| US-3.3 | Como **participante**, quiero ver el momento exacto en que entra el thermal throttling y por qué, para conectar la causa con el efecto. |
| US-3.4 | Como **participante**, quiero comparar dos corridas lado a lado con las mismas escalas, para argumentar cuál configuración entrega más rendimiento y a qué costo térmico. |
| US-3.5 | Como **operador**, quiero pausar, reanudar y reiniciar la corrida, para explicar mientras el grupo mira. |

### Épica E4 — Argumentación y evidencias *(criterios 6 y 7 de la rúbrica)*

| ID | Historia |
|---|---|
| US-4.1 | Como **participante**, quiero que la app me pida **predecir antes de ejecutar** y luego me muestre el resultado real, para que mi error sea visible y discutible. |
| US-4.2 | Como **participante**, quiero justificar mi predicción eligiendo cuál representación la sustenta, para practicar argumentación matemática y no solo acertar. |
| US-4.3 | Como **operador**, quiero registrar los errores conceptuales que surgen y la corrección dada, para documentar el momento de discusión. |
| US-4.4 | Como **operador**, quiero exportar la corrida y las respuestas del grupo al terminar, para adjuntarlas como evidencia en el informe. |

### Épica E5 — Marco documental *(criterios 1 y 5)*

| ID | Historia |
|---|---|
| US-5.1 | Como **participante**, quiero una introducción breve al tema antes de tocar la simulación, para saber qué concepto estoy a punto de explorar. |
| US-5.2 | Como **participante**, quiero una guía corta de cómo se maneja la simulación, para empezar sin depender de que alguien me explique. |
| US-5.3 | Como **docente evaluadora**, quiero ver todas las fórmulas usadas con sus supuestos y referencias, para valorar el rigor conceptual. |
| US-5.4 | Como **subgrupo diseñador**, quiero imprimir la cartilla de implementación desde la app, para entregarla a los participantes como exige la rúbrica. |

---

## 7. Acceptance Criteria

### AC-1 — Las cuatro representaciones son una sola función

- **AC-1.1** DADA una función activa en el laboratorio, CUANDO se muestra la pantalla, ENTONCES la representación algebraica, la tabular, la gráfica y la contextual son visibles **al mismo tiempo**, sin navegar entre pestañas.
- **AC-1.2** DADO un cambio en una variable independiente, CUANDO se aplica, ENTONCES las cuatro representaciones se actualizan **en la misma acción**, y ninguna queda mostrando el estado anterior.
- **AC-1.3** DADA la fórmula mostrada en pantalla, CUANDO se compara con el cálculo implementado, ENTONCES coinciden — verificado por prueba automática, no por inspección visual.

### AC-2 — Razón de cambio promedio

- **AC-2.1** DADOS dos instantes `t₁ < t₂` de una corrida, CUANDO el participante los selecciona, ENTONCES la app muestra `(f(t₂) − f(t₁)) / (t₂ − t₁)` con su unidad correcta (°C/s, W/V, GHz/s según la magnitud).
- **AC-2.2** DADA una razón de cambio promedio calculada, CUANDO se muestra, ENTONCES la **recta secante** entre los dos puntos aparece dibujada sobre la gráfica, y los dos puntos quedan marcados.
- **AC-2.3** DADA la tabla en vivo, CUANDO se agrega una fila, ENTONCES incluye la razón de cambio promedio respecto de la fila anterior, y la primera fila la deja explícitamente vacía (no en cero: **no existe**, y confundir "no existe" con "cero" es precisamente un error conceptual que la app no debe cometer).
- **AC-2.4** DADOS dos intervalos de distinta duración en la misma corrida, CUANDO se comparan sus razones de cambio, ENTONCES los valores difieren, y la app lo señala como evidencia de que la función no es lineal.

### AC-3 — La simulación en vivo

- **AC-3.1** DADA una corrida en marcha, CUANDO transcurre un segundo, ENTONCES se agrega **exactamente una** fila a la tabla y **exactamente un** punto a cada serie de la gráfica.
- **AC-3.2** DADA una corrida de 5 minutos, CUANDO termina, ENTONCES la deriva acumulada del reloj de la simulación es menor a 100 ms respecto del tiempo nominal.
- **AC-3.3** DADA una corrida en marcha, CUANDO el operador pulsa pausa, ENTONCES la tabla, la gráfica y el visual 3D se detienen en el mismo instante, y al reanudar continúan sin salto ni fila duplicada.
- **AC-3.4** DADOS los mismos parámetros iniciales, CUANDO se ejecuta la corrida dos veces, ENTONCES ambas producen valores idénticos (simulación determinista, sin aleatoriedad).

### AC-4 — Variables independientes vs. dependientes

- **AC-4.1** DADO el panel de controles, CUANDO se inspecciona, ENTONCES **solo** las variables independientes son editables, y las dependientes se presentan como resultado, visiblemente distinguidas.
- **AC-4.2** DADA una variable dependiente, CUANDO el participante intenta modificarla, ENTONCES la app explica de qué variables depende, en lugar de simplemente ignorar la acción.
- **AC-4.3** DADO un valor fuera del dominio de una variable, CUANDO se introduce, ENTONCES la app lo rechaza indicando el dominio válido, y **no** produce resultado.

### AC-5 — Throttling y disipador

- **AC-5.1** DADA una temperatura simulada que supera el umbral de throttling, CUANDO continúa la corrida, ENTONCES la frecuencia efectiva se reduce, la potencia baja y la temperatura se estabiliza alrededor del umbral.
- **AC-5.2** DADO un evento de throttling, CUANDO ocurre, ENTONCES queda marcado en la gráfica y en la tabla con su causa explícita (`T = X °C > T_límite = Y °C`).
- **AC-5.3** DADA la misma configuración con un disipador de menor resistencia térmica, CUANDO se ejecuta, ENTONCES la temperatura máxima es menor y el tiempo en throttling es menor o nulo.

### AC-6 — Argumentación *(criterio 6 de la rúbrica)*

- **AC-6.1** DADO un reto de predicción, CUANDO se presenta, ENTONCES el participante **debe** registrar su predicción antes de que la app ejecute la corrida.
- **AC-6.2** DADA una predicción registrada, CUANDO se ejecuta la corrida, ENTONCES la app contrasta predicción y resultado, y solicita una justificación indicando cuál representación la sustenta.
- **AC-6.3** DADA una sesión terminada, CUANDO el operador exporta las evidencias, ENTONCES el archivo contiene las predicciones, los resultados, las justificaciones y los errores registrados.

### AC-7 — Rigor documental *(criterio 1 de la rúbrica)*

- **AC-7.1** DADA cualquier magnitud mostrada, CUANDO se consulta su detalle, ENTONCES se ve la fórmula aplicada, las entradas usadas, las unidades y el supuesto del modelo.
- **AC-7.2** DADA la sección de fórmulas, CUANDO se revisa, ENTONCES toda ecuación tiene definición, unidades, dominio y **al menos una referencia bibliográfica en APA 7**.
- **AC-7.3** DADA la cartilla imprimible, CUANDO se genera, ENTONCES contiene contextualización, orientación inicial, desarrollo y cierre, y cabe en un formato imprimible sin recortes.

### AC-8 — Condiciones de aula

- **AC-8.1** DADO un portátil sin conexión a internet, CUANDO se abre la app, ENTONCES funciona completa: cero peticiones a orígenes externos.
- **AC-8.2** DADA una pantalla proyectada a 1280×720, CUANDO se muestra el laboratorio, ENTONCES gráfica, tabla e indicadores son legibles desde el fondo del salón.
- **AC-8.3** DADO un viewport de 360 px de ancho, CUANDO se navega cualquier pantalla, ENTONCES no hay scroll horizontal y los controles siguen operables.

---

## 8. Assumptions, Dependencies & Constraints

### Assumptions

| ID | Hipótesis | Cómo se valida |
|---|---|---|
| A1 | *Creemos que* mostrar las cuatro representaciones simultáneamente enseña la conexión mejor que mostrarlas en secuencia *porque* la conexión es precisamente lo que no se ve cuando están separadas. *Sabremos que acertamos si* los participantes citan más de una representación al justificar. | Prueba piloto interna del equipo |
| A2 | *Creemos que* el modelo térmico RC de primer orden basta *porque* reproduce la tendencia y el punto de estabilización sin ocultar la matemática tras un solver opaco. | Revisión de la docente |
| A3 | *Creemos que* un paso de simulación de 1 s es la cadencia correcta *porque* es suficientemente lento para narrar en voz alta y suficientemente rápido para no aburrir. | Piloto |
| A4 | *Creemos que* el visual 3D aumenta el criterio 3 (materiales) sin restar del criterio 1 *porque* es apoyo y no sustituye ninguna representación matemática. **Riesgo:** la guía advierte explícitamente que "verse bonita" no otorga valoración. | Piloto + criterio de la docente |
| A5 | *Creemos que* los retos de predicción son la forma más económica de cumplir el criterio 6 *porque* obligan a comprometerse antes de ver la respuesta. | Piloto |
| A6 | Se asume que hay un portátil disponible y proyector, y que **no se puede contar con internet** en el aula. | Confirmación con el usuario |
| A7 | Se asume que el subgrupo invitado usa la app en grupos de 2–6 sobre uno o dos equipos, no uno por persona. | Confirmación |

### Dependencies

| Dependencia | Estado |
|---|---|
| `LM2_Guia_Metodologica_General_(V3).docx` — guía metodológica del curso | ✅ **Recibida y leída** (Guía Específica 1, rúbrica, informe, anexos) |
| Plantilla institucional del informe de laboratorio | ⚠️ **Pendiente** — no está en la guía general; se necesita para el informe (no para la app) |
| BLK Design System Angular — versión free (MIT) | Disponible |
| Angular CLI + Node.js | Instalado (Node v22.18.0, npm 11.6.0) |

### Constraints

| # | Restricción | Origen |
|---|---|---|
| C1 | **Cero licencias de pago.** Solo dependencias OSS permisivas (MIT / Apache-2.0 / BSD); ninguna versión PRO, ningún asset comercial, ningún servicio con cuota | Usuario |
| C2 | **Sin backend.** Todo el procesamiento en el cliente | Usuario |
| C3 | **Arquitectura hexagonal** obligatoria | Usuario |
| C4 | **Angular** + identidad visual **BLK Design System** | Usuario |
| C5 | El repositorio no lleva archivo de licencia: es trabajo académico | Usuario |
| C6 | Idioma español en interfaz y documentación | Contexto |
| C7 | **Debe funcionar sin internet**, en un portátil, y ser proyectable | Guía: implementación presencial en aula |
| C8 | **Cartilla o folleto imprimible obligatorio** con la descripción de la implementación | Guía, rúbrica criterio 5 |
| C9 | **El equipo debe poder explicar y justificar cada fórmula y decisión.** La app no puede ser una caja negra: toda ecuación visible y referenciada | Guía §10: *"el uso de IA podrá apoyar… pero no podrá sustituir el proceso de construcción conceptual"* |
| C10 | **Material terminado antes del encuentro presencial.** La improvisación afecta la valoración | Guía §7 |
| C11 | Debe soportar **participación simultánea de 2 a 6 personas** | Guía §7 |
| C12 | El eje llega hasta la **razón de cambio promedio**. Derivada, límites y razón instantánea pertenecen a otras guías y **no** deben aparecer | Guía, tabla de ejes conceptuales |

---

## 9. Open Questions

| # | Pregunta | Impacto si no se resuelve | Dueño |
|---|---|---|---|
| Q1 | ¿Cuánto dura la implementación presencial (minutos asignados por subgrupo)? | Define cuántos retos caben y los tiempos de la cartilla | Usuario |
| Q2 | ¿Cuántos integrantes tiene el subgrupo y qué rol asume cada uno? | La cartilla y la guía de manejo los nombran | Usuario |
| Q3 | ¿Fecha del encuentro presencial de la Guía 1? | Define si el visual 3D (S14) entra o se recorta | Usuario |
| Q4 | ¿Se dispone de la plantilla institucional del informe? | Necesaria para el informe, no para la app | Usuario |
| Q5 | ¿Cuántos equipos habrá disponibles durante la implementación (uno para todos, o uno por pareja)? | Define si el laboratorio debe soportar varias sesiones simultáneas o una proyectada | Usuario |
| Q6 | ¿La docente acepta una app web como "material didáctico", o espera además algún material manipulable físico? | La guía habla mucho de material impreso y manipulativo; la cartilla cubre parte, pero conviene confirmarlo | Usuario |
| Q7 | ¿Se evalúa el despliegue en línea, o basta con ejecutarla en el portátil? | Define si el pipeline de despliegue entra en v1 | Usuario |
