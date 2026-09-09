# Propuesta — Retos de predicción, argumentación y evidencias

## Document Control

| Campo | Valor |
|---|---|
| Spec Path | `002-feature-experiencia-variacion-cpu/04-retos-argumentacion` |
| Parent Spec | `docs/specs/002-feature-experiencia-variacion-cpu/` |
| Type | **Change** |
| Approval Mode | `gated` |
| Depends on | `02-laboratorio-en-vivo` |
| Parallel-safe | no *(se inserta en los mismos archivos que produce `02`)* |
| Fecha | 2026-09-08 |

## Intent

Convertir la simulación de **algo que se mira** en algo que **obliga a comprometerse**: predecir antes de ejecutar, justificar con una representación, ver el contraste, y dejar registro exportable de todo ello.

Referencias: [PRD §5 S9, S10, S13](../../../prd.md), [§6 E4](../../../prd.md), [§7 AC-6](../../../prd.md).

## Problem / Current Behavior

Con solo `01`, `02` y `03`, la app es un simulador excelente y **cae en el nivel más bajo del criterio 6 de la rúbrica**, cuyo descriptor *Insuficiente* es literal:

> *"La actividad se limita a respuestas mecánicas."*

Y el documento del curso es explícito en que esto no es opcional:

> *"La argumentación matemática constituye un requisito obligatorio y no un componente opcional de la actividad."*

Un sandbox no promueve argumentación: la permite. La diferencia entre permitir y **obligar** es el medio punto del criterio 6, y también el criterio 7 (gestión de evidencias), que exige haber definido **antes** qué se recolecta.

## Proposed Outcome

El participante no puede ver el resultado de un reto sin haber escrito primero qué cree que va a pasar. Cuando el resultado aparece, la app le pide señalar **cuál de las cuatro representaciones sustenta su razonamiento**. Al terminar, el orientador exporta un archivo con predicciones, resultados, justificaciones y errores registrados, listo para adjuntar al informe.

## Scope

| # | Alcance | AC |
|---|---|---|
| 1 | **Catálogo de retos** como dato (no código): enunciado, variable a manipular, magnitud a predecir, tipo de respuesta y criterio de acierto | — |
| 2 | **Compuerta de predicción**: la corrida del reto **no arranca** hasta que hay una predicción registrada | **AC-6.1** |
| 3 | **Contraste predicción vs. resultado** con el error absoluto y relativo, sin lenguaje de premio ni castigo: el error es material de discusión, no una derrota | AC-6.2 |
| 4 | **Selector de justificación**: ¿en qué te apoyaste — la fórmula, la tabla, la gráfica o el contexto? Con espacio para una frase | **AC-6.2** |
| 5 | **Registro de errores conceptuales** por el orientador durante la sesión, precargado con los seis errores anticipados en `03` y con opción de añadir uno nuevo | AC-6.3 |
| 6 | **Exportación de evidencias**: un archivo descargable con la sesión completa — configuración, corridas, predicciones, justificaciones, errores y sello de tiempo | **AC-6.3** |
| 7 | **Identificación mínima del grupo**: nombre del subgrupo invitado y número de participantes, sin cuentas ni datos personales innecesarios | — |
| 8 | **Panel del orientador**: avance de los retos y qué falta, para manejar el tiempo de la sesión | — |

### Los retos propuestos *(borrador para revisar)*

| # | Reto | Concepto que fuerza | Error que provoca a propósito |
|---|---|---|---|
| R1 | "El voltaje pasa de 1,0 V a 2,0 V. ¿Qué le pasa a la potencia?" | Relación cuadrática | Responder "se duplica" |
| R2 | "¿Cuál de estos dos intervalos tuvo una subida de temperatura más rápida?" | RCP ≠ valor de la función | Elegir el intervalo con la temperatura más alta |
| R3 | "¿Hasta dónde va a subir la temperatura si dejamos la corrida indefinidamente?" | Acotamiento, `T_∞ = T_amb + P·R` | Responder "sube para siempre" |
| R4 | "Cambiamos a un disipador mejor sin tocar el procesador. ¿Qué se mueve?" | Independencia de variables | Creer que cambia la potencia |
| R5 | "¿Por qué el rendimiento **baja** si le estamos dando más energía?" | Función por tramos, realimentación | No relacionar el throttling con la temperatura |
| R6 | "Estima la RCP de la temperatura entre t=10 s y t=30 s **antes** de calcularla" | Lectura de pendiente en la gráfica | Confundir la pendiente con el valor |

Seis retos también responden a una restricción práctica de la guía: el material debe servir para grupos de **2 a 6 participantes**, y seis retos permiten un reparto de uno por persona o por parejas.

## Non-Goals

| # | Fuera de alcance |
|---|---|
| 1 | Puntajes, ranking, gamificación competitiva. La guía advierte que *"no se calificará únicamente el componente lúdico"*, y un marcador desplaza la atención del concepto al puntaje |
| 2 | Persistencia entre sesiones o cuentas de usuario |
| 3 | Corrección automática de las justificaciones en texto libre — las evalúa el orientador, que es precisamente el momento de discusión que la rúbrica quiere |
| 4 | Envío de las evidencias a algún servicio: se descargan (sin backend, sin internet) |

## Affected Users, Systems, And Specs

- **Áreas de código:** `src/app/ui/pages/laboratorio/**` (inserción en el flujo), `src/app/ui/shared/vc-challenge-*`, `src/app/domain/challenges/`, `src/app/application/challenges/`, `src/assets/data/retos.json`.
- **Consume:** el laboratorio de `02` y los errores anticipados de `03`.
- **Impacto constitucional:** añade un módulo de dominio (`challenges/`) no listado en [TRD §4](../../../trd/trd.md). Requiere **enmienda del árbol de módulos**.

## Visual Reference

- **Source:** None *(parcial)*
- **Location:** —
- **Notes:** el mock incluye el laboratorio pero **no** el flujo de retos. Se propone extender el mock, o diseñar esta pantalla durante `/akili-specify`. Es la única hija sin referencia visual, y conviene resolverlo antes de especificar.

## Requirement Delta Preview

### ADDED
- Compuerta de predicción obligatoria antes de ejecutar un reto.
- Registro de justificaciones por representación.
- Registro de errores conceptuales durante la sesión.
- Exportación de evidencias de la sesión.

### MODIFIED
- El flujo del laboratorio de `02`: los retos se insertan en él.
- TRD §4: nuevo módulo `challenges/`.

### REMOVED
- Ninguno.

## Approach Options

| Opción | Descripción | Ventaja | Desventaja |
|---|---|---|---|
| **A. Retos como datos + compuerta en el flujo del laboratorio** ✅ | `retos.json` define los retos; el laboratorio los ejecuta en un modo con compuerta | Añadir o reescribir un reto no requiere recompilar lógica; el orientador puede ajustarlos hasta el día antes | Requiere diseñar bien el contrato del dato |
| B. Retos como componentes Angular, uno por reto | Cada reto es su propio componente | Máxima libertad visual por reto | Seis componentes casi idénticos; cambiar el enunciado es cambiar código |
| C. Retos en un documento aparte y la app solo simula | Los retos van en la cartilla impresa | Trivial de construir | **No cumple AC-6.1**: nada obliga a predecir antes de ver, y la evidencia vuelve a ser papel suelto que se pierde |

## Recommended Approach

**Opción A.** Es la única que hace estructural la obligación de predecir: en la opción C la compuerta depende de que el orientador se acuerde de pedirla, y bajo la presión de una sesión con tiempo medido, eso no ocurre. El mismo razonamiento que hace estructural la separación autor/auditor en la metodología aplica aquí: una regla que depende de la disciplina humana en el momento de más presión no es una regla.

Los retos como dato aportan además algo práctico: el equipo puede afinar los enunciados tras la prueba piloto interna (que la guía recomienda) sin tocar el código.

## Risks, Dependencies, And Open Questions

| Riesgo / Pregunta | Mitigación |
|---|---|
| La compuerta puede sentirse como un examen y bloquear la exploración | Modo libre **sin** compuerta, separado del modo reto. Se explora primero, se predice después |
| Seis retos pueden no caber en el tiempo asignado | **Depende de PRD Q1** (duración). El catálogo es dato: se recorta sin tocar código |
| Escribir en un portátil compartido es lento con 6 personas | Las predicciones aceptan respuesta de opción múltiple además de numérica; la justificación puede ser oral y registrarla el orientador |
| El archivo de evidencias podría contener datos personales | Solo nombre del subgrupo y número de participantes. Sin nombres individuales, sin correos |
| ¿Formato del archivo de evidencias? | Se propone JSON + una vista imprimible. A decidir en `/akili-specify` |

## Success Criteria

- [ ] Un reto **no** revela su resultado sin predicción registrada — probado como restricción negativa
- [ ] Tras ver el resultado, la app solicita justificación indicando la representación
- [ ] El modo libre sigue disponible y sin compuerta
- [ ] El archivo exportado contiene predicciones, resultados, justificaciones, errores y sello de tiempo
- [ ] El archivo exportado no contiene datos personales individuales
- [ ] Los seis retos son editables desde `retos.json` sin recompilar lógica
- [ ] Funciona sin conexión: la descarga es local

## Next Step

```text
/akili-specify 002-feature-experiencia-variacion-cpu/04-retos-argumentacion
```
