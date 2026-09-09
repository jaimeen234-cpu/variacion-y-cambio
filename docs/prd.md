# PRD — Variación y Cambio

> **Qué es esto:** aplicación web didáctica que enseña cómo la energía eléctrica **varía** (una magnitud cambia en el tiempo) y **cambia** (se transforma en otra forma de energía), usando simulaciones interactivas donde el estudiante ve el lazo de realimentación con sus propias manos.

## Document Control

| Campo | Valor |
|---|---|
| Estado | Draft v0.1 — **pendiente de contraste con el documento del curso** |
| Modo AKILI | Brand-new (Seed Setup) |
| Última actualización | 2026-09-08 |
| Contexto | Proyecto académico — carrera de Técnico Electrónico |
| Documentos hermanos | [`docs/ux-ui/design.md`](ux-ui/design.md) · [`docs/trd/trd.md`](trd/trd.md) · [`docs/infrastructure.md`](infrastructure.md) |

---

## 1. Overview & Purpose

La app enseña un concepto que los estudiantes suelen aprender como fórmula suelta y no como sistema: **subir la energía entregada a un dispositivo no sube su desempeño de forma indefinida**, porque parte de esa energía *cambia* de forma (se vuelve calor) y ese calor *realimenta* al sistema hasta limitarlo.

El caso guía es el procesador:

```
↑ Energía (voltaje/frecuencia) → ↑ Potencia de trabajo → ↑ Calor disipado
                                                              ↓
                        ↓ Potencia de trabajo ← Thermal throttling ← ↑ Temperatura
```

Ese lazo de **realimentación negativa** es el corazón didáctico del producto. Todo lo demás (consumo, costo, eficiencia) son aplicaciones del mismo principio.

**Propósito del documento:** fijar el problema, los usuarios y los criterios de aceptación antes de escribir una línea de código. En AKILI-SPECS este PRD es constitución: `/akili-propose`, `/akili-specify` y `/akili-execute` lo obedecen.

---

## 2. Problem Statement

| Dimensión | Detalle |
|---|---|
| **Problema** | La relación energía → potencia → calor → límite se enseña con fórmulas estáticas y gráficas de libro. El estudiante memoriza `P = V·I` pero no percibe que el sistema **se autolimita**: no ve el lazo, ve puntos aislados. |
| **Por qué duele** | Sin la noción de realimentación, el estudiante no puede explicar fenómenos cotidianos de su oficio: por qué un equipo baja de rendimiento al calentarse, por qué un disipador mejor "da más potencia", por qué duplicar el voltaje no duplica el trabajo útil. |
| **Por qué ahora** | Un simulador en el navegador vuelve visible en segundos algo que en laboratorio requiere instrumentación, tiempo de calentamiento y equipo que se puede dañar. |
| **Por qué esta forma** | Todo el fenómeno es determinista y calculable en el cliente. No necesita servidor, cuenta, ni datos de terceros: la barrera de entrada es abrir un enlace. |

---

## 3. Target Personas

### P1 — Estudiante de Técnico Electrónico *(usuario primario)*

| Campo | Detalle |
|---|---|
| Contexto | Cursando la materia; maneja Ley de Ohm y potencia a nivel de fórmula |
| Job-to-be-done | *"Cuando tengo que explicar por qué más energía no siempre da más desempeño, quiero mover parámetros y ver la consecuencia, para poder razonar el sistema y no solo recitar la fórmula."* |
| Frustración actual | Las gráficas del libro son estáticas; los números no le dicen qué pasa **después** |
| Éxito para él/ella | Puede predecir el efecto de un cambio antes de aplicarlo, y explicar el lazo con sus palabras |

### P2 — Docente / Instructor *(usuario secundario)*

| Campo | Detalle |
|---|---|
| Contexto | Necesita demostrar el concepto en clase, proyectado, sin montar laboratorio |
| Job-to-be-done | *"Cuando explico thermal throttling, quiero un demostrador en vivo que responda a mis parámetros, para que la clase vea la causa y el efecto en la misma pantalla."* |
| Éxito | Una sola pantalla, controles grandes, cambio visible en menos de un segundo |

### P3 — Evaluador académico *(stakeholder)*

| Campo | Detalle |
|---|---|
| Contexto | Califica el entregable contra la rúbrica del curso |
| Job-to-be-done | *"Cuando evalúo el proyecto, quiero ver que la física es correcta y que la arquitectura está separada de verdad, para calificar con evidencia."* |
| Éxito | Cálculos verificables, capas separadas, dominio con pruebas propias |

---

## 4. Goals & Success Metrics

**North Star Metric:** *sesiones en las que el estudiante completa al menos una simulación con **dos configuraciones distintas** del mismo escenario.*

Elegida porque comparar dos configuraciones es el momento exacto en que el concepto se entiende: un solo run enseña un número, dos runs enseñan una relación.

| # | Objetivo | Métrica | Meta v1 |
|---|---|---|---|
| G1 | El estudiante entiende el lazo, no la fórmula | ≥ 2 configuraciones comparadas por sesión | ≥ 60% de sesiones |
| G2 | La simulación se siente instantánea | Latencia entre mover un control y ver la gráfica actualizada | < 100 ms (p95) |
| G3 | Los cálculos son defendibles ante el evaluador | Casos de referencia del dominio cubiertos por pruebas unitarias | 100% de las fórmulas publicadas |
| G4 | La arquitectura es demostrable | Capa de dominio sin ningún `import` de Angular | 0 imports de framework en `domain/` |
| G5 | Accesible sin fricción | Pasos hasta la primera simulación desde el enlace | ≤ 2 clics, sin login |

> **Assumption (A1):** G1 y G2 son métricas propias, no de la rúbrica del curso. Se revisan cuando llegue el documento del curso.

---

## 5. Scope

### In Scope — v1

| # | Alcance | Nota |
|---|---|---|
| S1 | **Módulo Lazo Térmico**: simulador interactivo del ciclo energía → potencia → calor → throttling | Núcleo del producto |
| S2 | **Módulo Consumo y Costo**: cálculo de kWh y costo a partir de aparatos y horas de uso | Aterriza el concepto en la factura |
| S3 | Catálogo de escenarios y aparatos precargados desde JSON local | Sin backend |
| S4 | Visualización temporal de las magnitudes (potencia, temperatura, frecuencia efectiva, trabajo útil) | Gráficas |
| S5 | Comparación de dos configuraciones del mismo escenario, lado a lado | Sirve directo a la North Star |
| S6 | Contenido explicativo breve por módulo (qué es variación, qué es cambio, qué es el lazo) | Didáctico, no enciclopédico |
| S7 | Interfaz en español, responsive, con la identidad visual de BLK Design System | |

### Out of Scope — v1 *(explícito)*

| # | Fuera de alcance | Razón |
|---|---|---|
| O1 | Backend, base de datos, API propia | Decisión del usuario: todo se procesa en el cliente |
| O2 | Cuentas de usuario, login, perfiles | Sin servidor no hay identidad; añade fricción a P1 y P2 |
| O3 | Persistencia entre dispositivos | Sin backend. `localStorage` es el techo (y es opcional) |
| O4 | Cualquier dependencia de pago, servicio con cuota, o asset con licencia comercial | Restricción dura del proyecto |
| O5 | Simulación con precisión de ingeniería (SPICE, CFD térmico) | Es una herramienta **didáctica**: el modelo debe ser correcto en la tendencia y transparente, no exacto al vatio |
| O6 | Multi-idioma | Español únicamente en v1 |
| O7 | Modo claro | BLK es un sistema dark-first; ver [design.md](ux-ui/design.md) §11 |
| O8 | Backend de analítica para medir G1/G5 | Sin servidor no hay telemetría. Las métricas se validan por observación en clase |

---

## 6. User Stories

### Épica E1 — Lazo Térmico

| ID | Historia |
|---|---|
| US-1.1 | Como **estudiante**, quiero elegir un escenario precargado (p. ej. "CPU de escritorio con disipador estándar") para empezar a simular sin configurar nada. |
| US-1.2 | Como **estudiante**, quiero ajustar voltaje, frecuencia y carga de trabajo con controles continuos para ver el efecto inmediato de cada uno. |
| US-1.3 | Como **estudiante**, quiero ver en una gráfica temporal cómo evolucionan potencia, temperatura y frecuencia efectiva durante la simulación, para observar el momento exacto en que entra el throttling. |
| US-1.4 | Como **estudiante**, quiero que la app me señale cuándo se activó el throttling y por qué, para conectar el efecto con la causa. |
| US-1.5 | Como **estudiante**, quiero cambiar el disipador o la temperatura ambiente para comprobar que el límite se mueve sin cambiar el procesador. |
| US-1.6 | Como **estudiante**, quiero comparar dos configuraciones lado a lado para ver cuál entrega más trabajo útil y a qué costo térmico. |
| US-1.7 | Como **docente**, quiero pausar, reanudar y reiniciar la simulación para explicar mientras la clase mira. |

### Épica E2 — Consumo y Costo

| ID | Historia |
|---|---|
| US-2.1 | Como **estudiante**, quiero armar una lista de aparatos con su potencia y horas de uso diario para calcular el consumo mensual en kWh. |
| US-2.2 | Como **estudiante**, quiero fijar la tarifa por kWh para obtener el costo mensual en mi moneda local. |
| US-2.3 | Como **estudiante**, quiero ver qué aparato pesa más en la factura, ordenado, para identificar dónde está el consumo real. |
| US-2.4 | Como **estudiante**, quiero comparar dos aparatos equivalentes con distinta eficiencia para cuantificar el ahorro. |
| US-2.5 | Como **estudiante**, quiero llevar el resultado del módulo de Lazo Térmico (potencia media bajo carga) al cálculo de consumo, para unir los dos conceptos. |

### Épica E3 — Marco didáctico

| ID | Historia |
|---|---|
| US-3.1 | Como **estudiante**, quiero una explicación corta de qué significa *variación* y qué significa *cambio* en este contexto, accesible desde cualquier módulo. |
| US-3.2 | Como **estudiante**, quiero ver las fórmulas que la app está usando, para poder verificarlas y citarlas en mi trabajo. |

---

## 7. Acceptance Criteria

Formato: `DADO … CUANDO … ENTONCES …`. Estos criterios son la fuente que `/akili-specify` expande en escenarios numerados.

### AC-1 — El lazo es observable

- **AC-1.1** DADO un escenario cargado, CUANDO el estudiante incrementa el voltaje, ENTONCES la potencia disipada aumenta de forma superlineal y la curva de temperatura sube en la misma corrida.
- **AC-1.2** DADO que la temperatura simulada supera el umbral de throttling del escenario, CUANDO continúa la simulación, ENTONCES la frecuencia efectiva se reduce, la potencia baja y la temperatura se estabiliza por debajo o alrededor del umbral.
- **AC-1.3** DADO un evento de throttling, CUANDO ocurre, ENTONCES la interfaz lo marca visiblemente en la línea de tiempo con la causa (`T = X °C > T_límite = Y °C`).
- **AC-1.4** DADO el mismo escenario y los mismos parámetros, CUANDO se ejecuta la simulación dos veces, ENTONCES el resultado es idéntico (simulación determinista, sin aleatoriedad).

### AC-2 — Los cálculos son verificables

- **AC-2.1** DADO cualquier resultado numérico mostrado, CUANDO el estudiante abre el detalle, ENTONCES ve la fórmula aplicada y los valores de entrada usados.
- **AC-2.2** DADO el conjunto de casos de referencia documentados en el TRD, CUANDO se ejecuta la suite de pruebas del dominio, ENTONCES todos pasan sin depender de Angular ni del DOM.
- **AC-2.3** DADO un parámetro fuera del rango físico admitido, CUANDO el estudiante lo introduce, ENTONCES la app lo rechaza con un mensaje que explica el rango válido, y **no** produce un resultado.

### AC-3 — Consumo y costo

- **AC-3.1** DADO un aparato de potencia `P` watts usado `h` horas/día durante `d` días, CUANDO se calcula el consumo, ENTONCES el resultado es `P·h·d/1000` kWh, redondeado a 2 decimales y mostrado con unidad.
- **AC-3.2** DADA una lista de aparatos, CUANDO se muestra el desglose, ENTONCES aparece ordenado de mayor a menor consumo, con el porcentaje de cada uno sobre el total.
- **AC-3.3** DADO un costo por kWh, CUANDO cambia, ENTONCES todos los costos derivados se recalculan sin recargar la página.

### AC-4 — Arquitectura y calidad *(criterio del evaluador)*

- **AC-4.1** DADO el código de `src/app/domain/`, CUANDO se inspecciona, ENTONCES no contiene ningún import de `@angular/*` ni de librerías de UI.
- **AC-4.2** DADO un caso de uso de aplicación, CUANDO accede a datos, ENTONCES lo hace exclusivamente a través de un **puerto** (interfaz), nunca de una implementación concreta.
- **AC-4.3** DADO el cambio del origen de datos (JSON → cualquier otro), CUANDO se sustituye el adaptador, ENTONCES ni el dominio ni los casos de uso requieren modificación.

### AC-5 — Experiencia

- **AC-5.1** DADO el enlace de la app, CUANDO se abre, ENTONCES el estudiante llega a una simulación funcional en ≤ 2 clics, sin registro.
- **AC-5.2** DADO un ajuste de control, CUANDO el estudiante lo mueve, ENTONCES la visualización refleja el cambio en < 100 ms.
- **AC-5.3** DADO un viewport de 360 px de ancho, CUANDO se navega cualquier pantalla, ENTONCES no hay scroll horizontal y los controles siguen siendo operables.

---

## 8. Assumptions, Dependencies & Constraints

### Assumptions *(pendientes de validar — formato hipótesis)*

| ID | Hipótesis | Cómo se valida |
|---|---|---|
| A1 | *Creemos que* las métricas G1/G2 son un proxy razonable del aprendizaje *porque* comparar configuraciones es donde aparece la relación causal. *Sabremos que acertamos si* el documento del curso no exige otras. | Contraste con el documento del curso |
| A2 | *Creemos que* un modelo térmico RC de primer orden basta para enseñar el lazo *porque* reproduce la tendencia y el punto de estabilización sin ocultar la física tras un solver opaco. | Revisión del docente / contraste con datos publicados |
| A3 | *Creemos que* el ejemplo del procesador es el mejor vehículo *porque* el estudiante ya lo conoce como usuario. | Confirmado por el usuario en la sesión de constitución |
| A4 | *Creemos que* dos módulos (Lazo Térmico + Consumo) son el alcance correcto de v1 *porque* cubren variación y cambio sin dispersar el esfuerzo. | Contraste con la rúbrica |
| A5 | *Creemos que* no se requiere accesibilidad certificada (WCAG AA formal) *pero* se diseña conforme a ella igual, por bajo costo marginal. | Rúbrica |
| A6 | El proyecto se entrega como sitio estático, sin dominio propio ni infraestructura pagada. | Confirmado (restricción de costos) |

### Dependencies

| Dependencia | Estado |
|---|---|
| **Documento del curso** con requisitos adicionales y posible rúbrica | ⚠️ **Pendiente de entrega** — bloquea el cierre de §4 y §7 |
| BLK Design System Angular — **versión free (MIT)** de Creative Tim | Disponible; se porta el SCSS a Angular actual |
| Angular CLI + Node.js | Instalado (Node v22.18.0, npm 11.6.0) |

### Constraints

| # | Restricción | Origen |
|---|---|---|
| C1 | **Cero licencias de pago.** Solo dependencias OSS permisivas (MIT / Apache-2.0 / BSD). Ninguna versión PRO de ningún template, ningún asset comercial, ningún servicio con cuota. | Decisión del usuario |
| C2 | **Sin backend.** Todo el procesamiento ocurre en el cliente. | Decisión del usuario |
| C3 | **Arquitectura hexagonal** (puertos y adaptadores) obligatoria — es parte del entregable evaluado. | Decisión del usuario |
| C4 | **Angular** como framework, con **BLK Design System** como identidad visual. | Decisión del usuario |
| C5 | El repositorio **no lleva archivo de licencia**: es un trabajo académico, no un producto distribuible. | Decisión del usuario |
| C6 | Idioma de la interfaz y de la documentación de producto: **español**. | Contexto académico |

---

## 9. Open Questions

| # | Pregunta | Impacto si no se resuelve | Dueño |
|---|---|---|---|
| Q1 | ¿Qué exige exactamente el documento del curso? ¿Hay rúbrica con pesos? | §4 y §7 quedan como criterios propios, no como los evaluados | Usuario |
| Q2 | ¿El entregable incluye documentación escrita aparte (informe, presentación), o el repositorio es el entregable completo? | Puede requerir un módulo o formato de exportación no contemplado | Usuario |
| Q3 | ¿Hay fecha de entrega? Define si v1 se recorta a un solo módulo | Riesgo de alcance | Usuario |
| Q4 | ¿La moneda y tarifa eléctrica de referencia para el módulo de costo? | Se asume tarifa configurable con valor inicial genérico | Usuario |
| Q5 | ¿Se evalúa el despliegue en línea o basta con que corra localmente? | Define si se configura GitHub Pages | Usuario |
