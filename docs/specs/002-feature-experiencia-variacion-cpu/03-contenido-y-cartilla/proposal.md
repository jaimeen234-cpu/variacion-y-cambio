# Propuesta — Contenido didáctico, fórmulas y cartilla

## Document Control

| Campo | Valor |
|---|---|
| Spec Path | `002-feature-experiencia-variacion-cpu/03-contenido-y-cartilla` |
| Parent Spec | `docs/specs/002-feature-experiencia-variacion-cpu/` |
| Type | **Change** |
| Approval Mode | `gated` |
| Depends on | `01-dominio-modelo-funcional` |
| Parallel-safe | sí *(worktree separado; páginas propias, no toca las de 02)* |
| Fecha | 2026-09-08 |

## Intent

Las tres piezas de texto que la rúbrica califica directamente: la **introducción** al tema, la **guía de manejo** de la simulación, y la **sección de fórmulas y referencias**. Más la **cartilla imprimible** que la guía metodológica exige entregar a los participantes.

Referencias: [PRD §5 S1, S2, S11, S12](../../../prd.md), [§6 E5](../../../prd.md), [§7 AC-7](../../../prd.md).

## Problem / Current Behavior

No existe. Y a diferencia del resto de la familia, aquí hay una exigencia **textual** del documento del curso que no admite interpretación:

> *"Durante la implementación el subgrupo diseñador deberá entregar una **cartilla o folleto** con la descripción de la implementación de la experiencia siguiendo la secuencia prevista en su planeación."*

Es el criterio 5 de la rúbrica, con nombre propio. Una app sin cartilla pierde ese medio punto por omisión, no por calidad.

## Proposed Outcome

Un participante que abre la app entiende en un minuto qué concepto va a explorar y cómo se maneja la simulación. Una docente que revisa encuentra toda ecuación con su definición, unidades, supuestos y referencia en APA 7. Y el subgrupo puede imprimir la cartilla desde la propia app.

## Scope

| # | Alcance | Rúbrica |
|---|---|---|
| 1 | **Página de inicio / introducción**: qué es variación y cambio, qué es una función como modelo de un fenómeno, qué es la razón de cambio promedio y por qué el procesador sirve de contexto. Con los RAA declarados | 1, 5 |
| 2 | **Guía de manejo de la simulación**: qué variables se pueden mover, cuáles se calculan solas y por qué, cómo leer cada una de las cuatro representaciones, y una secuencia sugerida con tiempos | 4, 5 |
| 3 | **Página de conceptos**: variable independiente vs. dependiente, dominio y rango, comportamiento creciente/decreciente/acotado, funciones definidas por tramos, y **qué diferencia hay entre "subió más" y "subió más rápido"** | 1 |
| 4 | **Página de fórmulas y referencias**: renderiza el `CatalogoFormulas` de `01` — expresión, variables, unidades, dominio, supuesto y referencia bibliográfica por cada una | **1** |
| 5 | **Lista de referencias en APA 7**, incluyendo la bibliografía propia del curso donde aplique (Stewart et al. para funciones y razón de cambio promedio; Swokowski para álgebra) | **1** |
| 6 | **Cartilla imprimible** con los cuatro momentos que exige la guía: (a) contextualización — nombre, propósito, eje, RAA; (b) orientación inicial — dinámica, reglas, organización, materiales, criterios de validación; (c) desarrollo; (d) cierre | **5** |
| 7 | **Anticipación de errores conceptuales frecuentes** con su corrección — sección requerida por el informe y usada por el orientador durante la implementación | 6 |
| 8 | Hoja de estilos de impresión: la cartilla cabe en el formato sin recortes ni fondos oscuros que consuman tinta | 5 |

### Errores conceptuales que la sección 7 debe anticipar

Vienen del propio fenómeno, y son la materia prima de la discusión que la rúbrica exige:

| Error frecuente | Por qué ocurre | Corrección |
|---|---|---|
| "Si duplico el voltaje, se duplica la potencia" | Se asume linealidad por defecto | `P ∝ V²`: se **cuadruplica**. La tabla lo muestra en dos filas |
| Confundir "la temperatura es más alta" con "sube más rápido" | Se confunde el valor de la función con su razón de cambio | Comparar dos intervalos: el valor crece mientras la RCP **decrece** |
| "La temperatura sube para siempre" | No se reconoce el acotamiento | `T_∞ = T_amb + P·R`: hay una asíntota, y se puede calcular |
| "El disipador enfría el procesador" | Se invierte la causalidad | El disipador **no enfría**: reduce la resistencia térmica, y por eso baja la temperatura de equilibrio |
| "La razón de cambio promedio de la primera fila es 0" | Se confunde "no existe" con "cero" | Una RCP necesita **dos** puntos. Sin intervalo no hay razón |
| "Al bajar el rendimiento, el procesador se daña" | Se lee el throttling como falla | Es un mecanismo de **protección**: es el sistema autolimitándose |

## Non-Goals

| # | Fuera de alcance |
|---|---|
| 1 | El informe académico completo — lo escribe el equipo con la plantilla institucional (PRD O9) |
| 2 | La simulación y sus componentes — es `02` |
| 3 | Derivadas, límites o acumulación en el contenido teórico (PRD C12) |
| 4 | Generar PDF por librería: se usa la impresión del navegador con hoja de estilos de impresión (cero dependencias) |

## Affected Users, Systems, And Specs

- **Áreas de código:** `src/app/ui/pages/inicio/`, `guia/`, `conceptos/`, `formulas/`, `cartilla/`, `src/app/ui/styles/_print.scss`.
- **Consume:** `CatalogoFormulas` de `01`.
- **Impacto constitucional:** [`design.md` §4](../../../ux-ui/design.md) declara 9 pantallas; este spec añade `guia` y `cartilla`. Requiere **enmienda del inventario de pantallas y del modelo de navegación**.

## Visual Reference

- **Source:** Generated mockup (HTML autocontenido)
- **Location:** `docs/specs/002-feature-experiencia-variacion-cpu/mockup/index.html`
- **Notes:** el mock incluye las secciones de introducción, guía de manejo y fórmulas/referencias. La cartilla imprimible **no** está en el mock; se propone diseñarla en la fase de `/akili-specify` de este spec.

## Requirement Delta Preview

### ADDED
- Páginas de introducción, guía de manejo, conceptos y fórmulas.
- Cartilla imprimible con los cuatro momentos exigidos.
- Lista de referencias en APA 7.
- Catálogo de errores conceptuales anticipados.

### MODIFIED
- `docs/ux-ui/design.md` §§2, 4, 5: arquitectura de información, inventario de pantallas y navegación.

### REMOVED
- Ninguno.

## Approach Options

| Opción | Descripción | Ventaja | Desventaja |
|---|---|---|---|
| **A. Contenido en plantillas Angular + hoja de impresión** ✅ | Cada página es un componente; la cartilla es una ruta con `@media print` | Cero dependencias; el contenido vive con el código y se versiona; funciona sin internet | El texto está en plantillas, no en un CMS (irrelevante aquí) |
| B. Markdown compilado en tiempo de build | El contenido en `.md` y un pipeline que lo transforma | Más cómodo de editar | Añade dependencia y paso de build por 5 páginas de texto |
| C. Cartilla como PDF generado por librería | `jsPDF` o similar | Archivo entregable | +200 KB de dependencia para algo que `Ctrl+P` ya hace mejor, y el navegador respeta la hoja de impresión |

## Recommended Approach

**Opción A.** La restricción C7 (sin internet) y C1 (sin dependencias de pago) empujan a lo mínimo, y aquí lo mínimo es también lo mejor: la impresión del navegador con una hoja `@media print` produce una cartilla correcta sin sumar un solo kilobyte. La opción C es la tentación clásica de resolver con librería algo que la plataforma ya resuelve.

## Risks, Dependencies, And Open Questions

| Riesgo / Pregunta | Mitigación |
|---|---|
| La cartilla necesita datos que aún no existen: nombres de integrantes, roles, duración | **Bloquea parcialmente**: son PRD Q1 y Q2. Se diseña con campos declarados y se completan al responderlas |
| Un tema dark impreso desperdicia tinta y queda ilegible | La hoja de impresión invierte a fondo blanco y texto negro — es una regla, no una preferencia |
| El texto teórico puede sonar a copia de libro | Se redacta desde el fenómeno y se referencia; C9 exige que el equipo pueda explicarlo con sus palabras |
| ¿La docente espera además material manipulable físico? | PRD Q6, abierta. La cartilla cubre el mínimo textual exigido |

## Success Criteria

- [ ] Toda ecuación de la página de fórmulas tiene definición, unidades, dominio, supuesto y **al menos una referencia APA 7**
- [ ] Las fórmulas mostradas coinciden con las implementadas — verificado por prueba, no por lectura (AC-1.3)
- [ ] La cartilla contiene los cuatro momentos exigidos por la guía metodológica
- [ ] La cartilla imprime sin recortes y con fondo claro
- [ ] La guía de manejo explica, para cada variable, si es independiente o dependiente y por qué
- [ ] Los seis errores conceptuales están documentados con su corrección
- [ ] Ancho de línea ≤ 75 caracteres en el contenido teórico
- [ ] Funciona sin conexión

## Next Step

```text
/akili-specify 002-feature-experiencia-variacion-cpu/03-contenido-y-cartilla
```
