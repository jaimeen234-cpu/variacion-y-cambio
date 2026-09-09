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

**Estado: aprobado y aplicado.** Ver [`## Pivot Record: corrección del comando de verificación`](#pivot-record--corrección-del-comando-de-verificación) al final de este documento.

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

---

### T-2 — Cadena hexagonal del reloj a través de las cuatro capas

| Campo | Valor |
|---|---|
| **Estado** | ✅ **PASS** — en el **segundo** intento |
| Fecha | 2026-09-09 |
| Intentos del Implementer | **2** |
| Task de Orca | `task_457e985dae0b` |
| Dispatches | intento 1 `ctx_22f716ca1aa4` · intento 2 `ctx_5e1b8692512b` |
| Requisitos cubiertos | RF-2.1 · RF-2.2 · RF-2.3 · RF-7.1 · RF-7.2 |
| Skills cargadas | `angular-developer`, `tdd` — por **ruta absoluta** en el encargo (ver nota de mecanismo abajo) |

#### Intento 1 — Implementer

Diez archivos: el puerto `Reloj`, el value object `SelloDeTiempo` con su prueba, el caso de uso `SellarEvento` con su prueba, los adaptadores `RelojSistema` y `RelojFijo`, `tokens.ts`, `providers.ts` y el registro en `app.config.ts`.

Verificación `npx ng test --watch=false --include=src/app/domain --include=src/app/application` → **5/5 en verde**, 2 archivos.

Ciclo TDD con **fase RED observada** (fallo de resolución de módulo antes de implementar). Entrada negativa del contrato efectivamente ejercida: alterada la validación para admitir negativos, la prueba falló con `expected function to throw an error, but it didn't`; restaurada, verde otra vez.

`Not Done / Assumptions: NINGUNO`.

#### Intento 1 — Reviewer · `STATUS: FAIL`

Un único hallazgo, y material:

> `sellar-evento.spec.ts:2` importa `RelojFijo` desde `../../infrastructure/tiempo/reloj-fijo`. Import de **valor** (se usa con `new`), de `application/` hacia `infrastructure/`.

**Reglas violadas:** la casilla *Hecho cuando* de T-2 (*"`application/` no importa `@angular/*` ni `infrastructure/`"*, cláusula negativa sin calificar por tipo de archivo) · `design.md` §7.1, fila `application/` → *Prohíbe `infrastructure/`*, con entrada declarada *"todos los `.ts` bajo `src/app/`"* y solo dos exclusiones (`import type` y rutas relativas intra-capa) · TRD TEST-2 · la tabla de capas de `CLAUDE.md`.

**Consecuencia que lo hacía urgente:** la pasada 1 de T-3 exige que `src/app/` salga limpia. Ese import la habría hecho fallar **por construcción**, y RF-3.2 es, según `requirements.md`, *"el requisito más importante de este spec"*.

**El spec se contradijo a sí mismo.** El *Alcance* de T-2 ordena literalmente *"`SellarEvento` con `RelojFijo`"*, y `design.md` §5 designa `RelojFijo` como *"adaptador determinista (pruebas y simulación)"* residente en `infrastructure/`. El Reviewer buscó la exención en `design.md` §7.1, RF-3.3, TRD TEST-2 y TRD §4 y **ninguno la da**. Adjudicación del Leader: pesa más la casilla negativa, explícita y respaldada por cuatro documentos, que una frase descriptiva del Alcance respaldada por uno.

#### Intento 2 — Implementer

**Un solo archivo:** `src/app/application/diagnostico/sellar-evento.spec.ts`. Se sustituyó el import del adaptador por un doble local `RelojDePrueba` que declara `implements Reloj` contra el puerto de dominio.

La remediación **refuerza** RF-7.2 en vez de debilitarlo: el requisito pide *"un doble en memoria sin `TestBed`, sin red y sin DOM"*, y un doble local demuestra que el caso de uso se prueba con nada más que tipos de dominio. Se descartó la alternativa —conservar el import y enmendar el spec— porque habría exigido excluir `**/*.spec.ts` de `design.md` §7.1, calificar la casilla de T-2, añadir un requisito de exclusión a T-3, y **dejar la frontera sin verificar en los archivos de prueba**.

#### Intento 2 — Reviewer · `STATUS: PASS`

> El hallazgo único quedó resuelto — no queda ningún import de `application/` o `domain/` hacia `infrastructure/`, ni en producción ni en pruebas, y el doble `RelojDePrueba` implementa el puerto de dominio `Reloj` sin debilitar la cobertura ni introducir `TestBed`/DOM/red. Ningún otro archivo del intento 1 cambió.

Barridos propios del auditor sobre el árbol, no confiados al reporte: `infrastructure` en `domain/` y `application/` → **sin coincidencias**, `.spec.ts` incluidos · `@angular`/`rxjs`/`chart.js` en esas capas → sin coincidencias · `Date.now`/`Math.random` en `domain/` → sin coincidencias.

Verificado en verde en la ronda 1 y no reabierto: alcanzabilidad real de RF-2.2 —la cadena `main.ts` → `app.config.ts` → `providers.ts` → `SellarEvento` → `SelloDeTiempo` y `Reloj` se cierra con imports de valor, así que `domain/` se alcanza **de hecho, no de dibujo**— · `SellarEvento` como clase plana sin `inject()` · `RELOJ` y `SELLAR_EVENTO` con `useFactory` y `deps: [RELOJ]` según §6.3 · invariantes de `SelloDeTiempo` probadas en 3 casos incluidos `NaN`, `Infinity` y `-Infinity` · alcance limpio, un solo puerto.

#### Casilla que T-2 no puede cerrar, y por qué no es un fallo suyo

La **primera** casilla de *Hecho cuando* dice *"Las **cuatro** capas existen"*. `src/app/ui/` no existe y **no puede existir dentro de T-2**: el campo *Capa* de la propia tarea lista solo `domain/`, `application/` e `infrastructure/`, y `ui/` pertenece a T-4, T-6 y T-7.

La casilla está **mal especificada** — pide a una tarea demostrar algo fuera de su propio alcance declarado. Es la misma clase de defecto que el comando de verificación corregido en T-1. Queda como **obligación transferida a T-6**, que es la tarea que crea `ui/`.

Y arrastra una consecuencia mayor para el DAG, registrada abajo entre las decisiones pendientes: la **pasada 3 de T-3** (alcanzabilidad de una capa por capa desde `main.ts`, RF-2.2) tampoco puede pasar antes de T-6.

#### Corrección de texto aplicada en el mismo cierre

Tras aprobar la remediación, dos sitios del spec quedaron afirmando justo lo prohibido:

| Sitio | Antes | Después |
|---|---|---|
| `tasks.md` T-2, *Alcance* | *"`SellarEvento` con `RelojFijo` **sin `TestBed`**"* | *"`SellarEvento` con un **doble en memoria del puerto `Reloj`**, declarado en el propio archivo de prueba, **sin `TestBed`**"* |
| `design.md` §11, fila RF-7.2 | *"Prueba de `SellarEvento` con `RelojFijo`, **sin `TestBed`**"* | *"Prueba de `SellarEvento` con un **doble local del puerto**, **sin `TestBed`**"* |

Sin esta corrección, `/akili-validate` volvería a levantar el mismo conflicto contra el código ya aprobado. **`RelojFijo` sigue siendo entregable exigido por `design.md` §5** y se conserva; simplemente hoy no tiene consumidores, hecho que se registra para que nadie lo lea como código muerto.

#### ADVISORY del Reviewer *(no gatillan retrabajo)*

| Lente | Hallazgo | Dónde se resuelve |
|---|---|---|
| **Riesgo → T-3** | Ambos `.spec.ts` importan `'vitest'`. La columna *Prohíbe* de §7.1 no lo incluye —así que es legal— pero la columna *Permite* está redactada como **lista blanca** (*"solo `domain/`"*). Si `arch-test.mjs` se implementa como lista blanca, la pasada 1 marcará los dos archivos de prueba y **T-3 fallará por construcción** | **Decisión pendiente D-1**, abajo. T-3 debe tratar los especificadores de paquete npm ausentes de *Prohíbe* como permitidos |
| Fiabilidad | La invariante de §5 *"`RelojFijo` nunca retrocede"* está **implementada** (`fijar()` lanza si el nuevo instante es menor) pero **no probada**: no existe `reloj-fijo.spec.ts` y ninguna tarea posterior la cubre. Queda declarada sin compuerta permanente | Sin dueño. Candidata a `/akili-test` |
| Legibilidad *(ejemplar de `002/01`)* | Tres formas que no conviene que copien `Voltios`, `Celsius` y `Watts`: **(a)** API ISO duplicada — `aIso()` **y** el getter `iso` que solo delega, cuando §5 dice "su representación ISO" en singular; **(b)** `esIgual()` es API pública **sin ninguna prueba**, y en un value object la igualdad es el método que define la categoría; **(c)** `SelloDeTiempoInvalidoError` vive dentro del archivo del value object, mientras el **TRD §4** designa `domain/shared/errors/` como su hogar y nombra `RangoInvalidoError` para esta familia. Si `002/01` copia la forma, `RangoInvalidoError` no nace nunca | Decidir **antes** de que `002/01` lo replique |
| Riesgo *(menor)* | `providers.ts` registra `RELOJ` con `useClass: RelojSistema` sobre una clase sin `@Injectable()`. Funciona porque su constructor no tiene parámetros; el día que gane una dependencia falla en runtime con NG0204. `useFactory: () => new RelojSistema()` sería inmune y simétrico con `SELLAR_EVENTO`. §6.3 solo exige `useFactory` para `SELLAR_EVENTO`, así que no es violación | Sin dueño |

#### Nota de mecanismo — cómo se cargan las skills en Antigravity

Confirmado por el propio worker: **no existe herramienta nativa `skill(name)`**. Una skill se carga **leyendo su `SKILL.md` por ruta absoluta**. En T-1 el encargo decía *"carga las skills X"* y funcionó porque el modelo dedujo el mecanismo — suerte, no contrato. Desde T-2 el encargo resuelve las rutas:

```
/Users/pelitos/.gemini/config/plugins/akili-skills/skills/<skill>/SKILL.md
```

y exige al worker confirmar cuáles leyó.

#### Nota de operación — reabrir una tarea para retrabajo

Un `worker_done` con `--outcome succeeded` **cierra la tarea en Orca automáticamente**. Un segundo `dispatch` sobre ella falla con `Task ... is completed; only ready tasks can be dispatched`. El retrabajo exige reabrirla primero:

```
orca orchestration task-update --id <task_id> --status ready --json
orca orchestration dispatch --task <task_id> --to <handle> --json
```

---

## Pivot Record — corrección del comando de verificación

| Campo | Valor |
|---|---|
| Descubierto en | T-1, por el Reviewer |
| Fecha | 2026-09-09 |
| Alcance | `tasks.md` — seis líneas de **Verificación** |
| Aprobado por | El usuario, 2026-09-09, antes de despachar T-2 |
| ¿Afecta requisitos o diseño? | **No.** Ningún RF, ningún RNF y ninguna DD cambian. Es el *medio* de verificación el que estaba mal escrito, no lo que se verifica |
| ¿ADR afectado? | Ninguno |

### El bloqueo

`tasks.md` mandaba `npx vitest run <ruta>`. El proyecto no tiene `vitest.config.*`: el runner vive detrás del builder `@angular/build:unit-test`, que es quien aporta el entorno jsdom, el compilador de Angular y la resolución de `templateUrl`. Un `vitest` desnudo no dispone de ninguno de los tres.

Consecuencia por tarea, según el análisis del Reviewer:

| Tarea | Habría pasado |
|---|---|
| T-2 | Sí, pero **por accidente** — clases planas sin TestBed |
| T-4 | Dudoso |
| T-6 | No — `RouterTestingHarness` |
| T-7 | No — TestBed y componentes con `templateUrl` |
| T-8 | No — arranca el `app.config.ts` real |

Un comando de verificación que no corre no es una compuerta laxa: es **una compuerta ausente que parece presente**. Exactamente la clase de defecto que la §8 de `requirements.md` existe para impedir.

### La corrección

`npx ng test --watch=false --include=<ruta>`, verificada contra `node_modules/@angular/build/src/builders/unit-test/schema.json`: `include` es un arreglo de cadenas con **manejo especial de rutas de directorio** (incluye todos los archivos de prueba que contenga), y el flag se repite para añadir entradas.

| Tarea | Antes | Después |
|---|---|---|
| T-1 | `npx vitest run` | `npx ng test --watch=false` |
| T-2 | `npx vitest run src/app/domain src/app/application` | `npx ng test --watch=false --include=src/app/domain --include=src/app/application` |
| T-4 | `npx vitest run src/app/ui/styles` | `npx ng test --watch=false --include=src/app/ui/styles` |
| T-6 | `npx vitest run src/app/ui` | `npx ng test --watch=false --include=src/app/ui` |
| T-7 | `npx vitest run src/app/ui/core` | `npx ng test --watch=false --include=src/app/ui/core` |
| T-8 | `npx vitest run src/app/infrastructure` | `npx ng test --watch=false --include=src/app/infrastructure` |

`Vitest` **sigue siendo el runner**: DD-1 no se toca. Lo que cambia es cómo se le invoca.

### Barrido de cierre en dos direcciones (RF-10.3)

**Hacia adelante** — `grep -rn "vitest\|Vitest"` sobre `docs/`, `AGENTS.md` y `CLAUDE.md`. Seis ocurrencias del comando, **una más de las cuatro que identificó el análisis inicial**: se había escapado **T-6**, que usa `RouterTestingHarness` y por tanto era un fallo seguro. Las seis corregidas. Las menciones restantes a *Vitest* (DD-1, la tabla de versiones, TA-5, la fila de riesgo de §12, `proposal.md`) hablan del **runner**, que no cambió, y se declaran intencionales.

**Hacia atrás** — quién cita las secciones corregidas:

| Documento que cita | Veredicto |
|---|---|
| `AGENTS.md:74` — `npm run test:agent -- --include='**/<archivo>.spec.ts'` | ✅ **Reforzado, no invalidado.** Era una suposición sin verificar; el esquema del builder confirma que `--include` existe. **RF-4.3 queda respaldado** y T-9 puede construir `test:agent` sobre este builder |
| `design.md` §11, estrategia de pruebas | ✅ No nombra comandos concretos. Nada que corregir |
| `requirements.md` §9, trazabilidad | ✅ Solo cita `test:arch`, que no está afectado |
| `proposal.md` — *"la primera tarea determina el runner y fija el comando real"* | ✅ Esto es precisamente lo que ocurrió. Coherente |

**Ningún documento quedó afirmando algo falso.**

### Nota sobre un riesgo declarado que se materializó de otra forma

`design.md` §12 anticipaba: *"Vitest en Angular 21 con pruebas de dominio en Node podría necesitar configuración de entorno por archivo"*, con la mitigación de declarar el entorno `node` por patrón. El riesgo era el correcto; la **forma** fue otra — no hace falta configurar entornos, hace falta invocar el runner a través del builder, que ya los resuelve. La fila de riesgo no es falsa y se deja como está.
