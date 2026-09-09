# Ejecución — Bootstrap del proyecto Angular

## Document Control

| Campo | Valor |
|---|---|
| Spec | `docs/specs/001-setup-bootstrap-angular/` |
| Tareas | 10 (ver [`tasks.md`](tasks.md)) |
| Rama | `main` — decisión explícita del usuario, 2026-09-09 |
| Leader | Claude Code · `opus` |
| Implementer | **Google Antigravity** (`agy` 1.1.27) · `gemini-3.8-flash-high` · terminal Orca `term_66336f9f` |
| Reviewer | Claude Code · `opus` · solo lectura |
| Run de Orca | `run_5527c98d67f6` |
| Presupuesto | 10 tareas · ~940 LOC a mano · ~12 rondas de revisión |

### Desviaciones de proceso vigentes en esta corrida

Tres, todas declaradas antes de la primera tarea y ninguna descubierta a posteriori.

| # | Desviación | Motivo | Qué se conserva |
|---|---|---|---|
| P-1 | **Approval Mode relajado de `gated` a corrido** | El usuario lo autorizó explícitamente el 2026-09-09 al pedir la ejecución en bloque | Las excepciones siguen parando: HALT, `FATAL_FAIL`, pivote y presupuesto excedido |
| P-2 | **El Implementer corre en otro host** (Antigravity, no un subagente de Claude Code) | Petición del usuario | *Autor ≠ auditor* se refuerza, no se debilita: el auditor es de otra familia de modelos y de otro host |
| P-3 | **El Reviewer no usa su wrapper** `.claude/agents/akili-reviewer.md` | El harness de esta sesión no registró los wrappers del proyecto como tipos de agente | Eje de modelo intacto (`opus` ≠ Gemini). Eje de escritura **degradado**: la disciplina de solo lectura pasa de restricción de herramientas a instrucción. Es la misma asimetría que las guías raíz ya declaran para Antigravity |

### El falso negativo de Orca + Antigravity, y su rodeo

La combinación tiene un fallo de identificación de TUI, **no de tiempo de espera**. Diagnóstico de esta corrida:

```
orca terminal wait --for tui-idle  →  satisfied: false
                                      blockedReason: "codex-trust-workspace"
```

Orca aplica la heurística del prompt de confianza de **Codex** al TUI de Antigravity: cree que está detenido pidiendo permiso de carpeta cuando en realidad está ocioso y listo. De esa única causa salen los tres síntomas:

| Ruta de despacho | Resultado |
|---|---|
| `orca orchestration worker-start --agent …` | ✗ `agent_prompt_stalled` a los 8 s |
| `orca orchestration dispatch --inject` | ✗ `agent_prompt_blocked` |
| `orca orchestration dispatch` + `orca terminal send` | ✓ **funciona** |

**Rodeo adoptado para todas las tareas de este spec:**

1. Terminal de Antigravity creada a mano y reutilizada; nunca `worker-start`.
2. `dispatch` sin `--inject` — crea la trazabilidad (Task + Dispatch) sin sondear el prompt.
3. El preámbulo de ciclo de vida que Orca habría inyectado **lo escribe el Leader**: cada encargo lleva su `taskId`, su `dispatchId` y el comando `worker_done` literal. El cierre de tarea y dispatch queda idéntico al de un inject.
4. El encargo va a un **archivo** y al terminal se le manda **una sola línea** que lo referencia. Un pegado multilínea en un TUI se auto-envía por renglón y llegaría troceado.
5. Nunca se usa `terminal wait --for tui-idle` como compuerta: se lee el terminal o se espera el `worker_done`.

**Coste registrado:** el intento fallido de `--inject` en T-1 dejó `failure_count: 1` en su dispatch. Orca corta el circuito de una tarea a los 3 fallos, así que esa ruta no se reintenta en ninguna tarea posterior.

### Obligación heredada — RF-6.4

`tasks.md` declara que **RF-6.4 no tiene tarea en este spec y no puede tenerla**: es una propiedad de código que aún no existe. Queda registrada aquí como obligación transferida:

> Durante `/akili-execute` de `002/02`, `002/03` y `002/05`, si el diff toca `src/app/app.routes.ts`, el Reviewer marca **FAIL** citando RF-6.4 de este spec.

---

## Historial de ejecución

### T-1 — Crear el proyecto Angular 21 LTS en la raíz del repositorio

| Campo | Valor |
|---|---|
| **Estado** | ✅ **PASS** |
| Fecha | 2026-09-09 |
| Intentos del Implementer | **1** |
| Task / Dispatch de Orca | `task_a3f8c31d3162` / `ctx_58477bd45a4a` |
| Requisitos cubiertos | RF-1.1 · RF-4.1 *(parcial)* · RNF-4 · RNF-5 |
| Skills cargadas | `angular-developer` (leyó su `SKILL.md` íntegro y `references/testing-fundamentals.md`) |

#### Intento 1 — Implementer

25 archivos nuevos. El repositorio no tenía código antes de esta tarea.

`.editorconfig` · `.gitignore` · `.nvmrc` · `.prettierrc` · `.vscode/{extensions,launch,mcp,tasks}.json` · `README.md` · `angular.json` · `package.json` · `package-lock.json` · `public/favicon.ico` · `src/{index.html,main.ts,styles.scss}` · `src/app/{app.ts,app.html,app.scss,app.config.ts,app.routes.ts,app.spec.ts}` · `tsconfig{,.app,.spec}.json`

**Verificación ejecutada por el Implementer:**

| Comando | Resultado |
|---|---|
| `npm start` + `curl -i http://localhost:4200/` | `HTTP/1.1 200 OK` |
| `npx ng build` | exit `0` · chunk inicial 186,54 kB (50,73 kB transferidos) |
| `npx ng test --watch=false` | Vitest 4.1.11 · 1 archivo, **2/2 pruebas en verde** |

**Entrada negativa exigida por la tarea, efectivamente probada:** borrado temporal de `src/main.ts` → `Application bundle generation failed`, exit `1`. Archivo restaurado.

**Descalificador de la evidencia, salvado:** el `curl` es posterior a la compilación —build completo a `01:27:29.900Z`, cabecera `Date:` del curl a `01:27:34 GMT`—, así que el `200` no es un falso positivo de servidor a medio compilar.

#### Intento 1 — Reviewer · `STATUS: PASS`

> El proyecto Angular 21.2.22 LTS quedó creado en la raíz sin tocar un solo archivo constitucional, con zoneless real verificado en la plataforma (no por omisión), scss, `.nvmrc`/`engines` coherentes, y las tres verificaciones ejecutadas incluyendo la entrada negativa exigida.

Cuatro juicios pedidos por el Leader, con la evidencia que los sostiene:

| Punto | Veredicto |
|---|---|
| **Zoneless real** | ✅ Confirmado en la plataforma, no por omisión. `zone.js` no instalado y solo figura como peer opcional; `ZONELESS_ENABLED` tiene `factory: () => true` en `@angular/core` 21.2.22; el esquema del CLI trae `"zoneless": {"default": true}` y solo emite `provideZoneChangeDetection` cuando **no** es zoneless. El `app.config.ts` del diff coincide con la rama zoneless de la plantilla |
| **`signal` en `app.ts`** | ✅ Sin infracción de frontera: el shell raíz es capa `ui/`, donde la reactividad está permitida |
| **Alcance** | ✅ Limpio. Cero archivos bajo `domain/`, `application/` o `infrastructure/`. Ningún script del contrato de T-9 adelantado |
| **Borrado del SVG de `app.html`** | ✅ **Dentro de alcance.** La plantilla del CLI trae 344 líneas y **11 hexadecimales**: conservarla habría violado la regla de cero hex sueltos desde el primer commit y roto por construcción el `grep` de verificación de T-4. Además `design.md` §4 especifica `app.ts ← shell con <router-outlet>`, que es exactamente el resultado |

Añadidos por el Implementer sin que ninguna casilla los exigiera: `ChangeDetectionStrategy.OnPush` en `App` (regla constitucional) y `package-lock.json` versionado (RNF-5).

#### Hallazgo de spec — el comando de verificación de T-1 es inejecutable tal como está escrito

`tasks.md` T-1 dice `npx vitest run`. El Implementer corrió `npx ng test --watch=false`.

**Sustitución legítima, y el defecto está en el texto del spec, no en el diff.** Tres razones convergentes:

1. El preámbulo del propio `tasks.md` lo autoriza: *"Hasta que T-1 esté hecha no existe ningún comando de verificación… **T-1 verifica a mano**"*.
2. La lista *Hecho cuando* de T-1 tiene seis ítems y **ninguno menciona pruebas**. La línea `npx vitest run` es un medio, no una casilla del contrato.
3. No debilita la evidencia: es **el mismo runner** (Vitest 4.1.11 vía `@angular/build:unit-test`), no un sucedáneo. No existe `vitest.config.*` en la raíz, así que un `vitest` desnudo no tiene entorno jsdom, ni compilador de Angular, ni resolución de `templateUrl`.

**El defecto se propaga a cuatro tareas** y se corrige en el spec, no reabriendo T-1:

| Tarea | Comando escrito | Diagnóstico del Reviewer |
|---|---|---|
| T-2 | `npx vitest run src/app/domain src/app/application` | Probablemente corre —clases planas, sin TestBed— pero por accidente, no por diseño |
| T-4 | `npx vitest run src/app/ui/styles` | Dudoso |
| T-7 | `npx vitest run src/app/ui/core` | **No corre** — TestBed y componentes con `templateUrl` |
| T-8 | `npx vitest run src/app/infrastructure` | **No corre** — arranca el `app.config.ts` real |

Remediación verificada: `npx ng test --watch=false --include='<ruta>'`. El Reviewer comprobó en el esquema de `@angular/build:unit-test` que el builder acepta `include`, `exclude`, `filter`, `watch`, `reporters` y `coverage` — así que **T-9 puede construir `test:agent` sobre este builder**, y la fila `test:agent -- --include='**/<archivo>.spec.ts'` de las guías raíz (RF-4.3) sigue siendo realizable.

**Estado: pendiente de aprobación del usuario** antes de despachar T-2. Es una corrección a un documento aprobado, y eso para la corrida bajo la propia excepción que el modo corrido conserva.

#### ADVISORY del Reviewer *(lentes 4R — no gatillan retrabajo)*

| Lente | Hallazgo | Dónde se resuelve |
|---|---|---|
| Readability | `title = signal('variacion-y-cambio')` quedó **sin lectores**: el `<h1>` se escribió literal en vez de `{{ title() }}`, y la prueba `should render title` ya no prueba el título | T-6 reescribe el shell: o se enlaza o se borra el signal y se renombra la prueba |
| Risk *(cross-doc)* | `engines.node = "^22.18.0"` es **más estrecho** que `docs/infrastructure.md` §6 y que RNF-5, que dicen Node ≥ 20. En una máquina con Node 20.19 o 24 saldría `EBADENGINE`. Sin `engine-strict` no rompe nada hoy | **T-10 / RF-10.3**: alinear con el rango real de Angular (`^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0`) o declarar intencional el pin duro y corregir infra §6 |
| Risk *(idioma)* | `<html lang="en">`, `<title>VariacionYCambio</title>`, el `<h1>Hello, …` y el `README.md` son andamiaje del CLI en inglés, contra la regla transversal de idioma y el TRD ADR-008 | `lang="es"` y el `<title>` en T-6; el `README.md` en T-10 |
| Readability | `package.json` sin salto de línea final, contradiciendo el `.editorconfig` creado en el mismo diff | Se resuelve solo en la primera edición de T-9 |
| Reliability | `.vscode/launch.json` conserva la configuración de `ng test` apuntando a `http://localhost:9876/debug.html`, una URL de **Karma** sin sentido con Vitest | Residuo de plantilla; irrelevante para la verificación |

#### Impacto constitucional: T-1

- **Módulo creado:** el paquete Angular raíz. Es el primer código del repositorio.
- **¿Guía hija necesaria?** No todavía. El índice `## Module Guides` de las guías raíz ya declara la candidata futura (`src/app/domain/CLAUDE.md`) y sigue siendo futura: `domain/` no existe hasta T-2.
- **Tabla de comandos de las guías raíz:** desactualizada a partir de ahora — `start` y `build` ya existen. **No se corrige aquí**: es el entregable explícito de T-10, que además debe retirar la advertencia *"estos scripts aún no existen"*.
- **CodeGraph:** re-indexación pendiente. El repositorio pasó de cero código a un proyecto Angular; `codegraph init -i` corresponde tras el bootstrap, no en mitad de él.

#### Verificación final de T-1

Las seis casillas de *Hecho cuando* cerradas y comprobadas de forma independiente por el Leader: `npm start` → 200 · `npx ng build` → exit 0 · `angular.json` con `scss`, standalone y zoneless · `.nvmrc` `22.18.0` = `node -v` `v22.18.0` con `engines` coherente · `docs/`, `AGENTS.md`, `CLAUDE.md`, `.agents/` y `.claude/` intactos según `git status` · `.tmp-scaffold/` inexistente.
