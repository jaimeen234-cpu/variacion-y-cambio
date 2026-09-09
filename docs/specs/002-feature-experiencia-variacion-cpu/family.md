# Familia de specs — Experiencia Didáctica Matemática: Variación y Cambio en un procesador

## Control del documento

| Campo | Valor |
|---|---|
| Spec padre | `docs/specs/002-feature-experiencia-variacion-cpu/` |
| Fecha de creación | 2026-09-08 |
| Última actualización | 2026-09-08 |
| Estado de la familia | `open` |
| Fuente de intención | [`docs/prd.md`](../../prd.md) — §5 Scope (S1–S15), §6 User Stories, §7 Acceptance Criteria |
| Depende de | `docs/specs/001-setup-bootstrap-angular` *(toda la familia)* |

## Motivo de la partición

La aplicación completa cubre 15 elementos de alcance, 5 épicas y 8 grupos de criterios de aceptación del PRD, y toca las cuatro capas de la arquitectura. Un spec plano tendría muy por encima de 15 tareas, lo que la plantilla [`task.md`](../general-setup/task.md) señala como umbral de partición.

La partición sigue una frontera natural que además es útil: **cada hija atiende un criterio distinto de la rúbrica del curso**, de modo que recortar por tiempo es una decisión con consecuencia conocida en la nota, no una apuesta a ciegas.

## Specs hijos

| # | Ruta del spec | Depende de | Paralelizable | Estado |
|---|---|---|---|---|
| 1 | `002-feature-experiencia-variacion-cpu/01-dominio-modelo-funcional` | ninguno *(dentro de la familia)* | no | `pending` |
| 2 | `002-feature-experiencia-variacion-cpu/02-laboratorio-en-vivo` | `01-dominio-modelo-funcional` | sí | `pending` |
| 3 | `002-feature-experiencia-variacion-cpu/03-contenido-y-cartilla` | `01-dominio-modelo-funcional` | sí | `pending` |
| 4 | `002-feature-experiencia-variacion-cpu/04-retos-argumentacion` | `02-laboratorio-en-vivo` | no | `pending` |
| 5 | `002-feature-experiencia-variacion-cpu/05-visual-3d-procesador` | `02-laboratorio-en-vivo` | sí | `pending` |

**Por qué 02, 03 y 05 son paralelizables:** el spec `001` crea la tabla de rutas completa con componentes placeholder, así que ninguna hija necesita editar el archivo de rutas. Cada una trabaja en su propia página y sus propios componentes. Ejecutarlas a la vez exige worktrees separados (regla CC-3 de las guías raíz: el `dist/`, el servidor de desarrollo y `node_modules/` son compartidos en un mismo checkout).

**Por qué 04 no lo es:** los retos de argumentación se insertan **dentro** del flujo del laboratorio, es decir, en los mismos archivos que produce `02`.

## Orden de construcción (RICE)

`RICE = (Reach × Impact × Confidence) / Effort`, donde *Reach* = puntos de rúbrica que la hija influye directamente.

| Hija | Reach | Impact | Confidence | Effort | **RICE** | MoSCoW |
|---|---|---|---|---|---|---|
| 01 dominio y modelo funcional | 3,0 | 3 | 0,90 | 2 | **4,05** | **Must** |
| 03 contenido y cartilla | 1,5 | 2,5 | 0,95 | 1,5 | **2,38** | **Must** |
| 02 laboratorio en vivo | 2,0 | 3 | 0,90 | 3 | **1,80** | **Must** |
| 04 retos de argumentación | 1,0 | 3 | 0,85 | 2 | **1,28** | **Must** |
| 05 visual 3D | 0,5 | 1 | 0,60 | 3 | **0,10** | **Could** |

**El orden de la tabla de hijos no es el orden RICE, y es a propósito.** `03` puntúa más alto que `02` porque es barata y toca tres criterios de rúbrica, pero `02` es el corazón de la experiencia: sin laboratorio en vivo no hay nada que documentar en la cartilla ni contra qué predecir. RICE mide eficiencia, no dependencia lógica. El orden real prioriza la dependencia y usa RICE para desempatar.

**`05` (visual 3D) es la hija recortable, y hay que decirlo con claridad:** su RICE es dos órdenes de magnitud menor que el resto, y la guía metodológica advierte textualmente que *"una actividad no será valorada por 'verse bonita'"*. Si el calendario aprieta, esta es la que se cae — y la experiencia sigue cumpliendo todos los criterios centrales sin ella.

## Regla de conjunto cerrado

Esta tabla es el conjunto **exhaustivo** de specs hijos de esta familia. Ningún comando AKILI crea una carpeta de spec hijo sin una fila previa en este manifiesto. Añadir una fila es una edición del manifiesto aprobada por el usuario (HITL).

Si durante la ejecución aparece un sexto componente necesario, el procedimiento es: proponer la fila, obtener aprobación, y solo entonces crear la carpeta.
