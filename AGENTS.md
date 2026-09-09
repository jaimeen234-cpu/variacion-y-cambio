# AGENTS.md — Variación y Cambio

> Guía raíz para agentes de IA que trabajan en este repositorio. `CLAUDE.md` es su espejo para Claude Code: **ambos archivos deben decir lo mismo**; si divergen, gana este y se corrige el otro.

**Qué es este proyecto:** aplicación web didáctica en Angular que enseña cómo la energía eléctrica **varía** y **cambia**, mediante simulaciones interactivas del lazo energía → potencia → calor → *thermal throttling*. Proyecto académico (Técnico Electrónico). Sin backend. Arquitectura hexagonal. Identidad visual BLK Design System.

`Default Branch: main`

---

## Línea base constitucional

Estos cinco documentos son la **constitución** del proyecto. Todo spec, tarea y revisión se justifica contra ellos. Si el código y estos documentos discrepan, uno de los dos está mal — y se resuelve explícitamente, nunca ignorando la diferencia.

| Documento | Para qué sirve | Consúltalo cuando… |
|---|---|---|
| [`docs/prd.md`](docs/prd.md) | Problema, personas, alcance, historias y criterios de aceptación | …dudes de **qué** construir o de si algo está dentro del alcance |
| [`docs/ux-ui/design.md`](docs/ux-ui/design.md) | Sistema visual y de interacción: tokens, componentes, flujos, accesibilidad | …escribas o revises cualquier cosa que se vea en pantalla |
| [`docs/trd/trd.md`](docs/trd/trd.md) | Arquitectura, capas, modelo de dominio, contratos, NFRs, ADRs | …decidas dónde va un archivo, cómo se cruza una frontera o qué debe medir una prueba |
| [`docs/infrastructure.md`](docs/infrastructure.md) | Entornos, despliegue, reglas de infraestructura, **contrato de entorno local** | …necesites arrancar el proyecto o tocar algo de despliegue |
| [`docs/specs/general-setup/`](docs/specs/general-setup/) | Plantillas canónicas de `requirements.md`, `design.md`, `tasks.md` y `family.md` | …redactes un spec nuevo |

**Orden de lectura para máximo aprovechamiento de la caché de prompt:** `AGENTS.md` → `docs/trd/trd.md` → `docs/ux-ui/design.md` → archivos del spec activo. Mantén siempre el mismo orden.

---

## Organización de `docs/specs/`

```
docs/specs/
├── general-setup/        Plantillas de la metodología (no es producto)
├── kaizen/               Una entrada por spec, escrita por la skill `kaizen`
├── audits/               Un informe por corrida de /akili-audit
└── NNN-<tipo>-<slug>/    Un spec: requirements.md · design.md · tasks.md · execution.md
```

`NNN` secuencial de tres dígitos (nunca reutilizado) · `<tipo>` ∈ `setup` · `feature` · `enhancement` · `bugfix` · `refactor` · `docs` · `<slug>` en kebab-case español.
`family.md` aparece **solo** en la carpeta padre de una propuesta que se partió en varios specs hijos. Su ausencia significa spec plano, sin obligaciones extra.

---

## Arquitectura en una pantalla

```
ui/  ──►  application/  ──►  domain/  ◄──  infrastructure/
```

| Capa | Puede importar de | Nunca importa de |
|---|---|---|
| `domain/` | solo `domain/` | Angular, RxJS, Chart.js, `application/`, `infrastructure/`, `ui/` |
| `application/` | `domain/` | Angular, `infrastructure/`, `ui/` |
| `infrastructure/` | `domain/`, `application/`, Angular | `ui/` |
| `ui/` | todas | — |

**Esta regla no es honorífica: la verifica una prueba automática** (`npm run test:arch`, TRD TEST-2). Un import prohibido rompe el build, no la revisión.

Reglas derivadas de uso diario:
- El dominio es **puro y determinista**: sin `Date.now()`, sin `Math.random()`, sin efectos. El reloj y el paso se inyectan (TRD ADR-005).
- Los casos de uso dependen de **puertos** (interfaces), nunca de adaptadores concretos (TRD MOD-1).
- `signal` / `computed` viven **solo en `ui/`** (TRD ADR-006).
- Chart.js se importa en **un único archivo**: `ui/shared/vc-time-chart` (TRD ADR-004).
- Todo componente es standalone y `OnPush`, sin excepción.
- Cero valores hexadecimales sueltos: los colores salen de los tokens de `docs/ux-ui/design.md` §7 (excepción enmienda D-3: archivos `*.spec.ts` que prueban valores de tokens).

---

## Verification Commands

Variante **agent-lean**: silenciosa en verde, **completa y verbatim en rojo**. Un verde solo necesita una línea de resumen; todo lo demás es ruido que se paga en cada verificación de cada tarea. Un fallo es evidencia: se reporta entero, sin recortar.

| Propósito | Comando |
|---|---|
| Pruebas (agentes) | `npm run test:agent` |
| Pruebas (una sola) | `npm run test:agent -- --include='**/<archivo>.spec.ts'` |
| Prueba de arquitectura | `npm run test:arch` |
| Lint (agentes) | `npm run lint:agent` *(`eslint --quiet`)* |
| Compilación de producción | `npm run build` |
| Auditoría de dependencias | `npm audit --audit-level=high` |
| Arrancar en local | `npm start` → `http://localhost:4200` |

Para arrancar el entorno local, consulta el contrato de [`docs/infrastructure.md` §6](docs/infrastructure.md) — no adivines comandos.

---

## Model Routing

Registro editable de selección de modelo por fase. Es **guía**, no imposición: ningún comando lleva `model:` en su frontmatter. Las únicas vinculaciones aplicadas son los wrappers de agente (Paso 8E de `/akili-constitution`).

**Filosofía:** primero el criterio, después el modelo. Principios rectores: *elige según la demanda dominante de la fase* · *ARQUITECTO = CONSTRUCTOR* (quien diseña, construye) · **autor ≠ auditor** · reserva el razonamiento profundo para proponer, especificar, verificar **y para el Leader que orquesta** · rápido y barato solo para archivado y formateo — **la descomposición de `tasks.md` es T1, no formateo barato**.

### Niveles de capacidad

| Nivel | Definición |
|---|---|
| **T1 Architect** | Razonamiento arquitectónico, **descomposición de tareas** y **juicio de orquestación en vivo** (descomponer sobre la marcha, seleccionar skills, adjudicar FAILs, decidir pivotes) |
| **T2 Coder** | Máximo rendimiento de codificación: implementar tareas bien especificadas y escribir pruebas |
| **T3 Auditor** | Auditoría independiente y adversarial de un diff contra su spec |
| **T4 Context-Ingest** | Ingesta de repositorio, exploración amplia, síntesis de evidencia |
| **T5 Fast-Cheap** | Archivado, formateo, tareas mecánicas |
| **T6 Multimodal** | Visión: capturas, diagramas, verificación visual de UI |

### Mapa fase → nivel

| Fase AKILI | Nivel | Nota |
|---|---|---|
| `/akili-constitution` | T4 (ingesta) + T1 (síntesis) | |
| `/akili-propose` | T1 | |
| `/akili-specify` | T1 | Incluye la descomposición de `tasks.md` |
| `/akili-execute` → **Leader** | **T1** | No escribe código, pero selecciona skills, adjudica FAILs y decide pivotes |
| `/akili-execute` → **Implementer** | **T2** | |
| `/akili-execute` → **Reviewer** | **T3** | **Debe ser un modelo distinto al del Implementer** |
| `/akili-test` → **Leader** | **T1** | Orquestación |
| `/akili-test` → **Tester(s)** | **T2** | Se **prefiere** un modelo distinto al del Implementer (autor ≠ tester) |
| `/akili-validate` | T3 | |
| `/akili-audit` | T4 + T3 | |
| `/akili-archive` | T5 | |
| Verificación visual de UI | T6 | Comparar la pantalla contra `docs/ux-ui/design.md` |

### Registro de modelos

`Updated: 2026-09`

| Nivel | Claude Code | OpenCode | Antigravity | Fallback |
|---|---|---|---|---|
| T1 Architect | `opus` | `<CONFIRM SLUG>` | `gemini-3.1-pro-high` | `opus` |
| T2 Coder | `sonnet` | `<CONFIRM SLUG>` | `gemini-3.8-flash-high` | `sonnet` |
| T3 Auditor | `opus` | `<CONFIRM SLUG>` | `gemini-3.1-pro-high` | `opus` |
| T4 Context-Ingest | `sonnet` | `<CONFIRM SLUG>` | `gemini-3.8-flash-medium` | `sonnet` |
| T5 Fast-Cheap | `haiku` | `<CONFIRM SLUG>` | `gemini-3.8-flash-low` | `haiku` |
| T6 Multimodal | `opus` | `<CONFIRM SLUG>` | `gemini-3.1-pro-high` | `opus` |

**Invocación de CLI por host**

| Host | Comando | Estado |
|---|---|---|
| Claude Code | `claude` | ✅ Confirmado — `/Users/pelitos/.local/bin/claude` |
| OpenCode | `<CONFIRM INVOCACIÓN>` | ❌ No instalado en esta máquina. La columna se conserva: el repositorio sobrevive a la herramienta |
| Antigravity | `agy` *(no `antigravity`)* | ✅ Confirmado — `/Users/pelitos/.local/bin/agy`, verificado con `agy models` |

**Nota sobre los identificadores de Antigravity:** los valores de la columna son los que devuelve `agy models` (verificado 2026-09-08) y sirven para `agy --model <id>` y para el selector. En cambio, el campo `model:` del frontmatter de un wrapper de `.agents/agents/` acepta el enum del host — `inherit` / `flash` / `pro` — y es lo que llevan los wrappers generados. Antigravity también expone modelos Claude y GPT-OSS en su roster; se documentan aquí por si se quiere dividir el nivel entre familias, pero el defecto se mantiene en Gemini para que el despacho cruzado aporte una capacidad distinta y no la misma en otro envoltorio.

**Cross-host dispatch:** T6 Multimodal → Antigravity (visión de Gemini), cuando esté disponible. Regla: *cruza de host antes de degradar dentro de uno, pero solo por una carencia real de capacidad* — un salto entre hosts cuesta un contexto nuevo, y una diferencia de un solo nivel no lo paga.

**Para cambiar de modelo, edita únicamente esta tabla.** Nunca fijes un nombre de modelo con fecha donde exista un alias flotante (`opus`, `sonnet`, `haiku` siempre apuntan a la última generación). La selección de modelo es guía en los prompts de comando; las vinculaciones aplicadas viven solo en los wrappers del Paso 8E.

### Effort dial

El *effort* es la **segunda dimensión de enrutamiento, por tarea**, ortogonal al nivel: el nivel elige el modelo, el effort elige cuánto piensa en **esta** tarea.

| Señal de la tarea | Effort |
|---|---|
| Trivial / mecánica (renombrar, mover, formatear) | `low` |
| Alcance estándar y bien especificado | `medium` |
| Compleja: algoritmo, concurrencia, seguridad, ambigüedad | `xhigh` |
| Crítica para la corrección (el modelo físico, la política de throttling) | `max` |

| Rol | Effort por defecto |
|---|---|
| T1 propose / specify / Leader | `high` |
| T2 Implementer / Tester | `medium` (flexible por tarea) |
| T3 Reviewer | `high` |
| T5 archive | `low` |

- **Regla de reintento:** sube un nivel de effort en **cada** reintento. Una corrección que falló suele ser falta de pensamiento, no falta de instrucciones.
- **Regla nivel ↔ effort:** nunca pongas `max` a un nivel más barato — escala el nivel.
- **Regla de re-calibración:** estos valores por defecto son **por generación de modelo**. Cuando cambie la generación subyacente, hay que barrerlos de nuevo (`medium` / `high` / `xhigh` sobre un spec real). El mapa de niveles sobrevive al recambio de modelos; estos valores no. Una tarea que llega poco especificada — un `[~]` reanudado, un reintento tras un pivote — arranca un nivel más arriba.
- **El effort no es un control de verbosidad.** Bajarlo no acorta la salida de forma fiable. Si un informe es largo, se arregla en el brief (`caveman`, `cognitive-doc-design`), nunca bajando el effort.

---

## Skill Map

Skills dependientes del stack que aplican a este proyecto. Las skills `core` y `conditional` ya están cableadas en los prompts de los comandos; **estas son las que llegan a los agentes por este mapa**.

| Skill | Aplica a | Cuándo cargarla |
|---|---|---|
| `angular-developer` | Todo `ui/`, `infrastructure/`, configuración del CLI | Cualquier tarea que escriba componentes, rutas, DI, formularios, signals o pruebas de Angular |
| `ui-ux-pro-max` | `ui/`, tokens, layouts | Tareas de diseño visual, layout, paleta, tipografía o accesibilidad. Preferida sobre `frontend-design` cuando esté disponible |
| `frontend-design` | `ui/` | Alternativa a la anterior si no está disponible |
| `tailwind-design-system` | `ui/styles/` | **Solo si** el proyecto adopta Tailwind. Hoy **no**: los estilos son SCSS portado de BLK (TRD ADR-003). Fila informativa, no activa |
| `tdd` | `domain/`, `application/` | Tareas de lógica pura con valores esperados conocidos: modelo de potencia, modelo térmico, política de throttling, calculadora de consumo. **No** en tareas de estilo, copy o configuración |
| `systematic-debugging` | Todo el repo | Ante cualquier fallo de prueba o comportamiento inesperado, antes de proponer un arreglo |
| `error-handling-patterns` | `domain/`, `application/` | Al diseñar la taxonomía de errores tipados (TRD §11) |
| `cognitive-doc-design` | `docs/` | Al escribir o revisar cualquier documento persistente |
| `caveman` | Comunicación entre agentes | Salida **transitoria** de agentes en `/akili-execute` y `/akili-test`. Nunca en documentos persistentes ni en puertas de aprobación humana |
| `software-architect` | `docs/trd/`, `design.md` de specs | Diseño arquitectónico, NFRs, ADRs, decisiones de patrón |
| `product-manager-toolkit` | `docs/prd.md` | Trabajo sobre el PRD, priorización, criterios de aceptación |
| `playwright-cli` | E2E | **Solo si** está instalado en la máquina y se decide hacer E2E (TRD §12, opcional). Es por desarrollador, no del repositorio |

**Uso:** durante `/akili-specify`, deriva las skills de cada tarea de este mapa. Durante `/akili-execute` y `/akili-test`, el **Leader** asigna las skills — puede ampliar, recortar o sustituir lo que diga el archivo de tareas — y el Implementer/Tester **debe cargarlas antes** de escribir código o pruebas.

**Skills que este proyecto NO usa:** `nestjs-expert`, `aws-serverless`, `shadcn-ui`, `react-doctor`, `vercel-react-best-practices`, `api-design-principles` (no hay API propia), `ai-agent-development`. No las cargues: el stack no las justifica.

---

## Module Guides

Índice de guías hijas. Una guía hija se crea **solo** cuando las convenciones de un módulo divergen de verdad de la raíz; nunca como andamiaje vacío. Una guía hija que no aparezca en este índice se considera deriva.

*(Ninguna todavía — el proyecto es un único paquete Angular. Candidata futura: `src/app/domain/CLAUDE.md` si las reglas de pureza necesitaran detalle propio.)*

---

## CodeGraph

**Estado: código base disponible para inicializar.** El proyecto Angular y la arquitectura hexagonal ya están creados (`src/app/`). Para habilitar el grafo en este checkout:
- Ejecuta `codegraph init -i` para generar la base de conocimiento inicial.
- A partir de ahí, usa CodeGraph **antes** que `grep`/`find` para localizar símbolos, entender llamadas y medir el radio de impacto.
- Las búsquedas en el grafo **no cuentan** para el umbral de "4+ archivos" que obliga a delegar en un scout.
- El grafo indexa la última re-indexación: para archivos ya tocados en el spec en curso, lee el árbol de trabajo.
- No versiones las bases de datos generadas; solo `.codegraph/config.json` si resulta útil.

---

## Reglas transversales

### Escritura en archivos compartidos

En una **rama de spec**, ninguna escritura de efecto secundario del ciclo de vida — estandarizaciones de kaizen, sincronizaciones de `/akili-archive`, salidas de `/akili-audit` — edita guías compartidas (`AGENTS.md`, `CLAUDE.md`), personas de `.agents/`, plantillas de `docs/specs/general-setup/` ni el TRD. Cada edición pendiente se **anota** y se aplica en la rama por defecto (`main`).

**Excepción:** si un `tasks.md` aprobado nombra explícitamente uno de esos archivos como entregable del spec, ese archivo sí se edita. La excepción existe porque hay proyectos cuyo producto **son** sus guías; quitarla no haría la regla más corta, la haría equivocada.

### Concurrencia

| # | Regla |
|---|---|
| CC-1 | **Una sesión AKILI por checkout.** Sesiones adicionales van en un `git worktree` aparte |
| CC-2 | **Ningún comando de medición** (build, benchmark, Lighthouse, E2E) mientras haya un agente delegado activo. La medición sale contaminada y nadie lo nota |
| CC-3 | Dos tareas en paralelo exigen archivos distintos **y** ninguna salida de build, servidor de desarrollo, puerto o dependencia generada en común. Archivos distintos no basta: la contención aparece como errores absurdos en el agente equivocado |
| CC-4 | Se aísla por **conflicto**, no por paralelismo. Si el único argumento es "corren a la vez", se queda en un solo checkout |

### Idioma

Español para documentación, nombres de dominio, textos de interfaz y mensajes de commit. Inglés solo donde el lenguaje, el framework o la herramienta lo imponen (`describe`, `it`, `signal`, nombres de archivo de configuración).

### Licencias

Cero dependencias de pago, cero versiones PRO, cero servicios con cuota (PRD C1). Toda dependencia nueva debe ser MIT, Apache-2.0, BSD o SIL Open Font License 1.1 (OFL-1.1 para tipografías empaquetadas `@fontsource`), y justificarse contra el presupuesto de bundle (TRD PERF-3). El repositorio **no lleva archivo de licencia**: es un trabajo académico.

---

## El equipo de agentes

| Persona | Archivo | Rol |
|---|---|---|
| Leader | [`.agents/leader.md`](.agents/leader.md) | Orquesta el ciclo Implementer → Reviewer, mantiene `execution.md` y `tasks.md` |
| Implementer | [`.agents/implementer.md`](.agents/implementer.md) | Implementa una tarea, verifica antes de reportar |
| Reviewer | [`.agents/reviewer.md`](.agents/reviewer.md) | Audita el diff contra el spec. **Solo lectura** |
| Tester | [`.agents/tester.md`](.agents/tester.md) | Escribe y ejecuta una suite de pruebas |

Las personas están **atadas a un modelo por configuración**, no por disciplina:

| Host | Wrappers | Modelos |
|---|---|---|
| Claude Code | `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` | leader `opus` · implementer `sonnet` · reviewer `opus` · tester `sonnet` |
| Antigravity | `.agents/agents/akili-*/agent.md` (el anidado es obligatorio: Antigravity solo descubre agentes bajo `.agents/agents/`) | leader `pro` · implementer `flash` · reviewer `pro` · tester `flash` |

Los wrappers **nunca** duplican el contenido de la persona: apuntan a `.agents/<rol>.md`. Editar una persona no requiere tocar el wrapper; cambiar un modelo solo requiere editar el wrapper.

**Autor ≠ auditor, en dos ejes.** Eje de modelo: el Reviewer corre en un modelo distinto al del Implementer, en ambos hosts. Eje de escritura: en Claude Code el wrapper del Reviewer declara `tools: Read, Grep, Glob` — sin `Write`, sin `Edit`, sin `Bash` — de modo que un auditor tentado de arreglar lo que audita lo tiene prohibido por configuración. En Antigravity ese eje es **solo instrucción**: los nombres de herramienta del binario instalado no se pudieron verificar, y un nombre equivocado cuelga el subagente sin producir error, así que se omitió `tools` a propósito. Es el **único** wrapper con restricción: un Leader, Implementer o Tester restringido no es más estricto, es un rol roto.

### Guardarraíl aplicado por el harness

`.claude/hooks/akili-tasks-gate.sh` (registrado en `.claude/settings.json` como hook `PreToolUse`) **bloquea** cualquier escritura que marque una tarea como `[x]` en un `docs/specs/*/tasks.md` si el `execution.md` de ese mismo spec no existe o no contiene evidencia de `PASS`. Es la regla "evidencia antes que casilla" convertida en hecho.

- Aplica a **todos** en este checkout, agentes y humanos. Quien tenga un motivo legítimo registra la evidencia o desactiva el hook: ambas cosas son actos visibles.
- La comprobación es la **heurística v1**: busca `PASS` en cualquier parte del `execution.md` del spec. Es tosca, pero atrapa el fallo que importa — una casilla sin ningún rastro de auditoría.
- **Solo Claude Code aplica esto.** En Antigravity y OpenCode la misma invariante sigue siendo prosa. La asimetría es la misma que en la restricción de herramientas del Reviewer.
- Requiere `jq` (presente en esta máquina) y, en Windows, git-bash.
