# Plantilla — `tasks.md`

> **Qué es esto:** el formato canónico de la lista de tareas de un spec. Es el archivo que `/akili-execute` lee y actualiza, y el único lugar donde vive el estado de avance. **No es un spec**: es la plantilla que los produce.

---

## Estructura obligatoria

```markdown
# Tareas — <Título del spec>

| Campo | Valor |
|---|---|
| Spec | `docs/specs/NNN-tipo-slug/` |
| Diseño | `design.md` |
| Estado | Pendiente / En ejecución / Completado |

## Grafo de dependencias
## Tareas
## Comprobación final
```

---

## Formato de una tarea

```markdown
### [ ] T-4 — Implementar `PoliticaThrottling` con histéresis

- **Capa:** `domain/thermal/services/`
- **Depende de:** T-2
- **Paralelizable:** sí (no comparte archivos con T-3, T-5)
- **Requisitos:** RF-2.1, RF-2.3
- **Skills:** `tdd` (lógica pura con valores esperados conocidos)
- **Ejemplar:** `domain/thermal/services/modelo-termico.ts` — imitar su estructura,
  nombres y estilo de pruebas
- **Alcance:**
  - Crear la política con el escalón de frecuencia y la histéresis de 3 °C.
  - Exponer `ajustar(frecuenciaActual, temperatura, spec): Hertz`.
- **Fuera de alcance:** integrar la política en el simulador (eso es T-5).
- **Verificación:** `npm run test:agent -- --include='**/politica-throttling.spec.ts'`
- **Hecho cuando:**
  - [ ] `f` nunca sale de `[frecuenciaBase, frecuenciaObjetivo]` (BR-2)
  - [ ] Con `T` oscilando alrededor del umbral, la frecuencia NO alterna cada paso (BR-4)
  - [ ] Cero imports de `@angular/*` en el archivo nuevo
  - [ ] La verificación pasa en verde
```

### Campos obligatorios

| Campo | Por qué es obligatorio |
|---|---|
| **Capa** | El Leader juzga independencia y frontera con esto |
| **Depende de** | Define el orden; `ninguna` es una respuesta válida y frecuente |
| **Paralelizable** | Declara si dos tareas pueden ejecutarse a la vez. **Archivos distintos no basta**: también deben no compartir salida de build, servidor de desarrollo, puerto ni dependencias generadas |
| **Requisitos** | Trazabilidad hacia `requirements.md`. Una tarea sin requisito es alcance inventado |
| **Verificación** | El comando exacto que el Implementer ejecuta antes de reportar. **Nunca "correr las pruebas"** |
| **Hecho cuando** | Lista verificable, no prosa. Es lo que el Reviewer audita |

Campos opcionales: **Skills** (el Leader puede sobreescribirlos), **Ejemplar** (el archivo existente más parecido, cuando lo haya — un ejemplo concreto guía mejor que una lista de convenciones).

---

## Estados

| Marca | Significado | Quién la pone |
|---|---|---|
| `[ ]` | Pendiente | `/akili-specify` al crear el archivo |
| `[~]` | En curso o reanudable | El Leader al asignarla; permanece si la sesión se corta |
| `[x]` | Completada **y auditada** | El Leader, **solo después** de registrar el PASS del Reviewer en `execution.md` |
| `[!]` | Bloqueada | El Leader, con el motivo escrito en `execution.md` |

**Regla de evidencia antes que casilla:** `execution.md` se escribe primero, `tasks.md` después. No son atómicos: una evidencia sin casilla se recupera leyendo; una casilla sin evidencia es una finalización que nadie puede falsar. En Claude Code este orden está **forzado por hook** (`.claude/hooks/akili-tasks-gate.sh`); en otras herramientas es regla escrita.

---

## Grafo de dependencias

Obligatorio en todo spec con más de tres tareas:

```
T-1 (setup) ──┬──► T-2 (modelo) ──► T-4 (política) ──► T-5 (simulador) ──► T-7 (página)
              └──► T-3 (VOs)    ──────────────────────┘
                                     T-6 (gráfica) ───────────────────────┘

Paralelizables: {T-2, T-3} · {T-4, T-6}
Serie forzada: T-5 depende de T-4 y T-2 (comparten el archivo del simulador)
```

Sin el grafo, el Leader deduce el orden de la numeración — y la numeración no distingue "va después" de "depende de".

---

## Granularidad

| Señal | Acción |
|---|---|
| La tarea toca más de 2 capas | Dividir |
| "Hecho cuando" tiene más de 6 puntos | Dividir |
| No se puede verificar con un solo comando | Dividir |
| La tarea es un solo `sed` de una línea | Fusionar con su vecina |
| El título necesita una "y" | Casi siempre son dos tareas |

Rango sano: **4–12 tareas por spec**. Más de 15 indica que la propuesta debió partirse en una familia de specs (ver `family.md`).

---

## Comprobación final

Todo `tasks.md` cierra con esta sección, y no se marca el spec como completo sin ella:

```markdown
## Comprobación final

- [ ] Todos los requisitos de `requirements.md` tienen al menos una tarea
- [ ] La suite completa pasa: `npm run test:agent`
- [ ] La prueba de arquitectura pasa: `npm run test:arch`
- [ ] El lint pasa: `npm run lint:agent`
- [ ] La compilación de producción funciona: `npm run build`
- [ ] Los tokens de diseño usados provienen de `docs/ux-ui/design.md` §7 (cero hex sueltos)
- [ ] Sin `console.log` de depuración en el código entregado
- [ ] `execution.md` registra un PASS del Reviewer por cada tarea marcada `[x]`
```

---

## Convenciones de ejecución

| # | Convención |
|---|---|
| E1 | Un commit por tarea completada: `[SPEC:docs/specs/NNN-tipo-slug] <mensaje en imperativo>` |
| E2 | Los comandos de verificación se usan en su variante *agent-lean*: silenciosos en verde, **completos y verbatim en rojo** |
| E3 | El Implementer ejecuta la verificación **antes** de reportar. Un reporte de "hecho" sin verificación verde es un incumplimiento del contrato, no un descuido |
| E4 | Verde no es automáticamente evidencia: si la medición no permite concluir, se reporta **inconcluso**, no aprobado |
| E5 | En rama de spec, ninguna tarea edita guías compartidas, personas de `.agents/`, plantillas o el TRD — salvo que el propio `tasks.md` aprobado nombre ese archivo como entregable del spec. El resto se anota como pendiente y se aplica en la rama por defecto |
