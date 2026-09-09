# Propuesta — Visual 3D del procesador y el disipador

## Document Control

| Campo | Valor |
|---|---|
| Spec Path | `002-feature-experiencia-variacion-cpu/05-visual-3d-procesador` |
| Parent Spec | `docs/specs/002-feature-experiencia-variacion-cpu/` |
| Type | **Change** |
| Approval Mode | `gated` |
| Depends on | `02-laboratorio-en-vivo` |
| Parallel-safe | sí *(worktree separado; componente propio)* |
| Prioridad | **Could have** — RICE 0,10; es la hija recortable de la familia |
| Fecha | 2026-09-08 |

## Intent

Un visual tridimensional del procesador y su disipador que **reacciona a las variables dependientes**: el die cambia de color con la temperatura, el disipador muestra el flujo de calor, y el throttling se ve además de leerse.

Referencias: [PRD §5 S14](../../../prd.md), [§4 criterio 3](../../../prd.md).

## Problem / Current Behavior

No existe. Y a diferencia de las otras hijas, aquí hay que ser honesto sobre el valor: **la rúbrica no premia esto**. Su texto es explícito en dos lugares:

> *"Una actividad no será valorada por 'verse bonita' o por ocupar tiempo de clase."*
>
> *"No se calificará únicamente el componente lúdico o creativo; el centro de la evaluación será la coherencia matemática y la calidad de la argumentación."*

El único criterio que toca es el 3 (*materiales y recursos didácticos*: "elaborados con excelente calidad"), y ese criterio se puede alcanzar sin 3D.

**Entonces, ¿por qué proponerlo?** Por una razón didáctica concreta, no estética: el 3D **ancla la variable dependiente en un objeto físico**. Un número que dice `92 °C` es abstracto; un die que se pone rojo mientras la curva sube conecta el modelo matemático con la cosa modelada — que es literalmente la representación **contextual** de la Guía 1. Ese es el argumento válido. "Se ve bonito" no lo es.

## Proposed Outcome

Un panel dentro del laboratorio donde se ve el procesador y su disipador, con la temperatura mapeada a color, la carga de trabajo indicada visualmente y el throttling señalado. Sincronizado con el reproductor de `02`: cuando la corrida se pausa, el visual se pausa.

## Scope

| # | Alcance |
|---|---|
| 1 | Escena 3D con **geometría procedural**: die, encapsulado, base del disipador y aletas — generados por código, sin archivos de modelo |
| 2 | **Mapa de color por temperatura** usando los tokens de [`design.md` §7.3](../../../ux-ui/design.md): frío → `--vc-info`, tibio → `--vc-warning`, caliente → `--vc-danger`. Coherente con el color de la serie de temperatura en la gráfica |
| 3 | **Indicador visual de carga de trabajo** en el die (intensidad de actividad) |
| 4 | **Señal de throttling**: cuando entra, el visual lo marca de forma inequívoca y con etiqueta de texto, no solo con color |
| 5 | Sincronización con el reproductor: mismo instante, misma pausa |
| 6 | **Órbita limitada** con ratón o táctil; sin zoom libre que permita perder el objeto |
| 7 | **Degradación explícita**: si WebGL no está disponible, se muestra una silueta 2D con el mismo mapa de color. No una pantalla en blanco, no un error |
| 8 | `prefers-reduced-motion`: sin animación de rotación automática |

## Non-Goals

| # | Fuera de alcance |
|---|---|
| 1 | **Descargar modelos 3D de terceros.** La restricción C1 (cero licencias) y C7 (sin internet en el aula) lo hacen inviable: un modelo descargado hay que empaquetarlo, verificar su licencia y pesa. Geometría procedural: cero archivos, cero licencias, cero dudas |
| 2 | Simulación real de fluidos o mapa térmico por elementos finitos — sería una segunda simulación distinta de la que enseña el concepto |
| 3 | Texturas fotorrealistas, PBR, mapas de entorno |
| 4 | Vista explotada o despiece del hardware |

## Affected Users, Systems, And Specs

- **Áreas de código:** `src/app/ui/shared/vc-cpu-3d/` (único archivo que importa la librería 3D), integración en `ui/pages/laboratorio/`.
- **Impacto constitucional:** requiere **ADR nuevo en el TRD** para la librería 3D, con el mismo patrón de aislamiento que [TRD ADR-004](../../../trd/trd.md) usa para la librería de gráficas: un solo punto de importación.

## Visual Reference

- **Source:** Generated mockup (HTML autocontenido)
- **Location:** `docs/specs/002-feature-experiencia-variacion-cpu/mockup/index.html`
- **Notes:** el mock incluye una **representación 2D/CSS** del procesador con mapa de color por temperatura, suficiente para validar la idea visual y la coherencia de color. El paso a 3D real es de este spec.

## Requirement Delta Preview

### ADDED
- Panel visual del procesador sincronizado con la corrida.
- Mapa de color de temperatura coherente con los tokens.
- Camino de degradación sin WebGL.

### MODIFIED
- El layout del laboratorio de `02` cede espacio al panel.
- TRD: nuevo ADR para la librería 3D.

### REMOVED
- Ninguno.

## Approach Options

| Opción | Descripción | Ventaja | Desventaja |
|---|---|---|---|
| **A. Three.js con geometría procedural** ✅ | Cajas y aletas generadas por código, material con color por temperatura | 3D real; ~600 KB; MIT; sin assets externos | Es la dependencia más grande del proyecto |
| **B. SVG/CSS 3D con perspectiva** | Vista isométrica con transformaciones CSS y gradientes | Cero dependencias; funciona sin WebGL; ~2 KB | No es 3D navegable |
| C. Sprites o vídeo pregrabado | Secuencia de imágenes por rango de temperatura | Control artístico total | Peso alto; no reacciona a valores intermedios; se desincroniza |

## Recommended Approach

**Opción A si hay tiempo; Opción B si no** — y la decisión debe tomarse contra la fecha del encuentro presencial (PRD Q3), no contra el entusiasmo.

El razonamiento: la opción A es la que el usuario pidió y aporta el anclaje contextual real. Pero es simultáneamente la hija de menor RICE, la de mayor esfuerzo, la que suma la dependencia más pesada al bundle, y la que la rúbrica **explícitamente no premia**. Si el calendario se estrecha, recortar aquí no cuesta ningún criterio de evaluación; recortar en `04` cuesta medio punto.

La opción B merece una mirada seria antes de descartarla: una vista isométrica en CSS con el mismo mapa de color logra el 80% del anclaje contextual por el 5% del esfuerzo y sin dependencia alguna. Para una experiencia de una sesión, proyectada, eso puede ser suficiente.

## Risks, Dependencies, And Open Questions

| Riesgo / Pregunta | Mitigación |
|---|---|
| Three.js pesa más que todo el resto del bundle junto y compite con el presupuesto de [TRD PERF-3](../../../trd/trd.md) (< 500 KB inicial) | Carga **diferida**: el visual se carga solo al abrir el laboratorio, nunca en el arranque. Si aun así rompe el presupuesto, aplica la opción B |
| El portátil del aula puede no tener WebGL decente | Alcance 7: degradación a 2D, probada |
| El 3D puede robar atención a la matemática — el riesgo real de este spec | Ocupa un panel secundario, nunca el centro; la gráfica y la tabla mantienen la jerarquía visual |
| PRD Q3: ¿fecha del encuentro? | **Es la pregunta que decide entre la opción A y la B** |

## Success Criteria

- [ ] El color del die corresponde a la temperatura simulada, con los tokens de `design.md` §7.3
- [ ] El throttling se señala con color **y** con texto
- [ ] Pausar la corrida pausa el visual en el mismo instante
- [ ] Sin WebGL, aparece la silueta 2D — probado deshabilitando WebGL, no asumido
- [ ] `prefers-reduced-motion` desactiva la rotación automática
- [ ] Cero archivos de modelo 3D en el repositorio
- [ ] La carga diferida mantiene el bundle inicial por debajo del presupuesto de PERF-3
- [ ] Funciona sin conexión

## Next Step

```text
/akili-specify 002-feature-experiencia-variacion-cpu/05-visual-3d-procesador
```
