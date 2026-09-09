# Kaizen Entry — 001-setup-bootstrap-angular

## Document Control

| Field | Value |
|---|---|
| Spec Path | `001-setup-bootstrap-angular` |
| Date | 2026-09-09 |
| Branch | `main` *(rama por defecto)* |
| Archive Run | 1 |
| Approval Mode | `pre-approved` *(desviación P-4)* |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tareas ejecutadas | **11** (10 originales + T-11 por la enmienda D-2) | `tasks.md` |
| Intentos de rework por `FAIL` del Reviewer | **6** en 5 tareas — T-2 ×1, T-4 ×1, T-5 ×1, T-9 ×1, **T-10 ×2** | `execution.md` |
| Tareas con PASS al primer intento | **6** de 11 | `execution.md` |
| HALT / `FATAL_FAIL` | **0** | `execution.md` |
| Pivotes | **0** | `execution.md` |
| Enmiendas al spec | **4** — D-1, D-2, D-3, D-4 | `execution.md` |
| `PRODUCT_BUG` | n/a — `/akili-test` no ejecutado | — |
| Validación FAIL / WARN | n/a — `/akili-validate` no ejecutado | — |
| Deriva atribuible | n/a — `docs/specs/audits/` sin informes | — |
| Presupuesto | **excedido y aceptado** (~980 LOC previstos) | `design.md` §1 |
| Incidentes del Leader | **2**, ambos corregidos | `execution.md` — T-11, T-7 |

## Lessons

- **KZ-001-setup-bootstrap-angular-1 — Un spec escrito antes de que exista el artefacto produce reglas de verificación inimplementables.** *(Product + Methodology, **High**)*
  - **Causa raíz:** las cuatro enmiendas (D-1 a D-4) corrigen comandos de verificación redactados **contra un artefacto que aún no existía**. No fueron cambios de alcance ni errores del Implementer: cada una habría hecho fallar su tarea *por construcción*. D-1 declaraba infractores los `.spec.ts` que importan `vitest`; D-2 exigía `src/app/ui/` cuatro tareas antes de crearlo; D-3 exigía una prueba que compara hex y a la vez declaraba ilegal el archivo que la sostiene; D-4 pedía una lista blanca vacía cuando el bundle de Angular emite seis URIs del W3C.
  - **Evidencia:** `execution.md` — secciones de enmienda D-1/D-2 (T-3), D-3 (T-4 intento 1), D-4 (T-5).
  - **5W1H:** *¿por qué?* porque el spec de bootstrap es el único que se escribe sin poder ejecutar nada de lo que especifica.
  - **Estandarización:** → **P1** *(local)* + **P2** *(upstream a AKILI)*

- **KZ-001-setup-bootstrap-angular-2 — `git add -A` con un agente delegado activo commitea trabajo saboteado.** *(Product, **Medium**)*
  - **Causa raíz:** el Leader cerró T-8 con `git add -A src/` mientras Antigravity ejecutaba el sabotaje 2 de T-11, que consiste en **vaciar un archivo de dominio**. El commit `b75af0f` quedó con `reloj.ts` reducido a una línea de comentario, con la suite en verde porque las pruebas de T-8 habían corrido antes. La regla CC-3 cubre la *contención entre tareas*, no el **área de preparación de git**, que es estado compartido invisible.
  - **Evidencia:** `execution.md` — T-11, *"Incidente de concurrencia — error del Leader"*.
  - **Estandarización:** → **P3**

- **KZ-001-setup-bootstrap-angular-3 — Las tareas de documentación fallan por afirmaciones plausibles y falsas; las de código, por verificaciones decorativas. El `grep` por frase literal no las atrapa.** *(Product + Methodology, **Medium**)*
  - **Causa raíz:** T-10 gastó **los tres intentos**, y los tres fallos fueron afirmaciones nuevas que no coincidían con el archivo citado: `engines` `>=22.18.0` cuando decía `^22.18.0`; *"verificados en T-5/T-10"* cuando T-5 son fuentes; `provideExperimentalZonelessChangeDetection()`, API inexistente. Las tareas de código gastaron **0 o 1**. Sincronizar documentación consiste en escribir con autoridad sobre hechos no verificados, y ahí el error **no chirría: pasa por conocimiento**. Agravante medido: el barrido hacia atrás declaró 27 citantes coherentes y dejó viva una falsedad, porque buscaba *"estos scripts aún no existen"* y el documento decía *"El script no existe aún"* — misma falsedad, otra redacción.
  - **Evidencia:** `execution.md` — T-10, tabla *"El patrón de esta tarea"* y *"El agujero del barrido, y su lección"*.
  - **Estandarización:** → **P4**

## Noted, not a lesson

- **Un brief del Leader con una instrucción falsa** (*"`ui/` no puede importar de `infrastructure/`"*, cuando la tabla de capas se lo permite). No causó rework: el Implementer siguió la tabla real y `arch-test` lo confirmó. Alimenta la comprobación de recurrencia — si un brief vuelve a contradecir la constitución, sube a lección.
- **19 hallazgos `ADVISORY`** registrados sin dueño en T-3, T-4 y T-5. Ninguno gatea por diseño; los cuatro con consecuencia externa ya están anotados contra su destino.
- **El régimen P-5 redujo el tiempo de auditoría de ~300 s a ~90 s sin perder ningún FAIL.** Dato favorable a auditar solo conformidad bajo presión de calendario, pero **una sola corrida no es evidencia** — se anota para acumular.
- **Ninguna tarea de código necesitó los tres intentos.** El techo de 3 nunca se alcanzó salvo en documentación.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `docs/specs/general-setup/task.md` |
| Edit | Un comando de verificación que apunte a un artefacto **que la tarea aún no ha construido** se marca `provisional` y se **re-deriva contra el artefacto real** antes de despachar la tarea. En un spec de bootstrap, asumirlo escrito es el modo de fallo por defecto. |
| Severity | High |
| Status | applied (2026-09-09) |

### P2

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | **Upstream — repositorio de la metodología AKILI** |
| Edit | `/akili-specify` debería marcar los comandos de verificación de un spec de bootstrap como provisionales por defecto: es el único tipo de spec que se escribe sin poder ejecutar nada de lo que especifica. |
| Severity | High |
| Status | pending *(upstream — no se aplica en este repositorio)* |

### P3

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `CLAUDE.md` y `AGENTS.md` — sección **Concurrencia** |
| Edit | `CC-5` — Mientras haya un agente delegado activo, los `git add` van **por ruta explícita**, nunca `-A`. El área de preparación es estado compartido invisible: un sabotaje de verificación a medio revertir entra al commit sin que ninguna prueba lo note. |
| Severity | Medium |
| Status | applied (2026-09-09) |

### P4

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `docs/specs/general-setup/task.md` |
| Edit | En una tarea de sincronización documental, toda afirmación sobre otro archivo **cita su valor literal**, nunca lo parafrasea; y el barrido en dos direcciones se busca **por concepto, no por frase literal** — la misma falsedad sobrevive con otra redacción. |
| Severity | Medium |
| Status | applied (2026-09-09) |
