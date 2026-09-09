# Requisitos — Bootstrap del proyecto Angular

## 1. Document Control

| Campo | Valor |
|---|---|
| Spec | `docs/specs/001-setup-bootstrap-angular/` |
| Profundidad | **Standard** |
| Tipo | Change (setup habilitador) |
| Approval Mode | `gated` |
| Estado | **Aprobado** — Fase 1 aprobada por el usuario, 2026-09-08 |
| Fecha | 2026-09-08 |
| Propuesta | [`proposal.md`](proposal.md) |
| Fuentes | [`docs/prd.md`](../../prd.md) · [`docs/trd/trd.md`](../../trd/trd.md) §4, §12 · [`docs/ux-ui/design.md`](../../ux-ui/design.md) §7 · [`AGENTS.md`](../../../AGENTS.md) |
| Familia | Ninguna. Este spec es plano y es el `Depends on` de toda la familia `002` |

**Por qué Standard y no Full:** el trabajo es transversal (build, lint, pruebas, estilos, rutas), lo que empuja hacia Full. Pero no hay migración de datos, ni API, ni autenticación, ni comportamiento en producción que pueda romperse: **no existe nada construido encima todavía**, así que cada decisión aquí es barata de revertir. Full añadiría secciones de rollout y rollback para un artefacto que aún no se ha desplegado nunca.

---

## 2. Executive Summary

Hoy el repositorio contiene **solo documentación**. Este spec crea el proyecto Angular real y, con él, los cuatro comandos de verificación que las guías raíz ya declaran y advierten como inexistentes.

El entregable no es "un proyecto que compila". Son **cinco garantías verificables**:

| # | Garantía | Por qué es una garantía y no un detalle |
|---|---|---|
| G-A | El proyecto arranca, compila, pasa lint y pasa pruebas | Sin esto ningún agente puede verificar nada y todo reporte de "hecho" es incomprobable |
| G-B | La frontera hexagonal **rompe el build** si se viola | Convierte el requisito académico (PRD C3) en un hecho comprobable por la docente, no en una promesa |
| G-C | Los tokens de diseño están **verificados contra el SCSS real de BLK** | Cierra GQ-1 de `design.md` y evita que 5 specs construyan sobre colores inventados |
| G-D | La tabla de rutas está completa desde el día uno | Es lo que hace paralelizables a las hijas `02`, `03` y `05` de la familia `002` |
| G-E | Cero peticiones a orígenes externos en tiempo de ejecución | PRD C7: el aula puede no tener internet, y eso no es un detalle de despliegue sino una condición de que la experiencia ocurra |

---

## 3. Glosario

| Término | Definición en este spec |
|---|---|
| **Capa** | Uno de los cuatro directorios de `src/app/`: `domain/`, `application/`, `infrastructure/`, `ui/` |
| **Import prohibido** | Un `import` que viola la tabla de dependencias del [TRD §4](../../trd/trd.md) — p. ej. `@angular/core` dentro de `domain/` |
| **Prueba de arquitectura** | Verificación automática que analiza los imports del código fuente y falla con código de salida ≠ 0 ante un import prohibido |
| **Agent-lean** | Variante de un comando que en verde imprime una sola línea de resumen y en rojo imprime la salida completa y verbatim |
| **Placeholder** | Componente mínimo, ruteable, que ocupa el lugar de una página futura sin implementar su contenido |
| **Token de diseño** | Variable CSS del catálogo de [`design.md` §7](../../ux-ui/design.md) |
| **Puerto** | Interfaz declarada en `domain/**/ports/`, resuelta por Angular mediante un `InjectionToken` |

---

## 4. System Context & Scope

### En alcance

| # | Elemento |
|---|---|
| A1 | Proyecto Angular creado con el CLI, con componentes standalone y SCSS |
| A2 | Los cuatro directorios de capa, cada uno con **al menos un archivo real y usado** (no carpetas vacías) |
| A3 | Prueba de arquitectura ejecutable y **probada contra un caso negativo real** |
| A4 | Los cinco scripts de verificación con los nombres exactos ya declarados en `AGENTS.md` |
| A5 | `ui/styles/_tokens.scss` con los tokens verificados contra el SCSS de BLK |
| A6 | Tabla de rutas completa con `loadComponent` y cinco páginas placeholder |
| A7 | Un puerto de ejemplo con su `InjectionToken`, su adaptador en memoria y su proveedor registrado |
| A8 | Fuentes tipográficas **empaquetadas** en el proyecto, no traídas de una CDN |
| A9 | `ErrorHandler` global, `color-scheme: dark`, fondo del `body` pintado explícitamente |
| A10 | `.gitignore` con `node_modules/`, `dist/`, `.angular/` |
| A11 | Corrección de `design.md` §7 y de la tabla de comandos de `AGENTS.md`/`CLAUDE.md` con los valores reales |

### Fuera de alcance *(nunca vacío)*

| # | Elemento | Por qué |
|---|---|---|
| B1 | Cualquier lógica de dominio real (fórmulas, simulador) | Es el spec `002/01` |
| B2 | Cualquier página con contenido real | Las páginas quedan como placeholder |
| B3 | Chart.js y la librería 3D | Se instalan en el spec que las use, no antes (presupuesto de bundle) |
| B4 | Pipeline de despliegue y GitHub Actions | Depende de PRD Q7, sin responder |
| B5 | Pruebas E2E y Playwright | Opcionales según [TRD §12](../../trd/trd.md); no son parte del andamiaje |
| B6 | Datos JSON de escenarios y aparatos | Los define `002/01` junto con su modelo |
| B7 | Cartilla, hoja de impresión, contenido didáctico | Es el spec `002/03` |

### Sistemas y artefactos afectados

- **Crea:** todo `src/`, `angular.json`, `package.json`, `tsconfig*.json`, `.gitignore`, `tools/` (script de arquitectura).
- **Modifica:** `docs/ux-ui/design.md` §7, `AGENTS.md` y `CLAUDE.md` (tabla de comandos). Ambos están nombrados como entregables de este spec, lo que activa la excepción de la regla de escritura en archivos compartidos.

---

## 5. Stakeholders / Personas

| Persona | Qué espera de **este** spec |
|---|---|
| **Subgrupo diseñador** (el equipo) | Poder ejecutar `npm start` y ver algo, y poder confiar en que `npm run test:agent` significa algo |
| **Agentes AKILI** (Implementer, Reviewer, Tester) | Comandos de verificación reales. Hoy deben declarar todo como no verificable |
| **Docente evaluadora** | Que la arquitectura hexagonal sea demostrable, no declarada. G-B es la respuesta a "muéstreme que las capas están separadas" |

Las personas del PRD (estudiante, participante del subgrupo invitado) **no interactúan con este spec**: no hay experiencia didáctica todavía. Decirlo evita que alguien intente justificar aquí una decisión de UX.

---

## 6. Requisitos funcionales

### RF-1 — El proyecto arranca, compila y verifica

El sistema **DEBE** ofrecer un proyecto Angular ejecutable en local y compilable para producción.

**Fuente:** proposal alcance 1 · [`AGENTS.md`](../../../AGENTS.md) Verification Commands · [`docs/infrastructure.md`](../../infrastructure.md) §6

- **RF-1.1** — DADO un repositorio recién clonado con `npm ci` ejecutado, CUANDO se ejecuta `npm start`, ENTONCES el servidor de desarrollo sirve la aplicación en `http://localhost:4200`, Y responde `200` a una petición HTTP de la raíz.
- **RF-1.2** — DADO el proyecto instalado, CUANDO se ejecuta `npm run build`, ENTONCES la compilación termina con código de salida `0`, Y produce un directorio de artefactos, **PERO** la compilación **NO debe** emitir errores ni advertencias de presupuesto de tamaño.
- **RF-1.3** — DADO el proyecto instalado, CUANDO se ejecuta `npm run lint:agent`, ENTONCES termina con código `0`, **Y DEBE** imprimir como máximo una línea de resumen cuando no hay hallazgos.
- **RF-1.4** — DADO el proyecto instalado, CUANDO se ejecuta `npm run test:agent`, ENTONCES la suite se ejecuta completa y termina con código `0`, **Y DEBE** imprimir la salida completa y verbatim de cualquier prueba fallida.

### RF-2 — La estructura hexagonal existe y está habitada

El sistema **DEBE** materializar las cuatro capas del [TRD §4](../../trd/trd.md), cada una con al menos un archivo real que participe en el arranque de la aplicación.

**Fuente:** PRD C3 · TRD §4 · proposal alcance 2

- **RF-2.1** — DADO el árbol de `src/app/`, CUANDO se inspecciona, ENTONCES existen los directorios `domain/`, `application/`, `infrastructure/` y `ui/`.
- **RF-2.2** — DADA cada capa, CUANDO se inspecciona su contenido, ENTONCES contiene al menos un archivo TypeScript **referenciado desde el arranque de la aplicación**, **PERO NO debe** contener archivos vacíos, `index.ts` sin exportaciones, ni comentarios de marcador de posición como único contenido.
- **RF-2.3** — DADA la capa `domain/`, CUANDO se inspecciona, ENTONCES no contiene ningún `import` de `@angular/*`, `rxjs`, ni de las capas `application/`, `infrastructure/` o `ui/`.

> **RF-2.2 existe por una razón concreta:** cuatro carpetas vacías satisfarían RF-2.1 y no demostrarían nada. Una capa habitada por un artefacto que el arranque realmente usa es lo que hace que la separación sea un hecho y no un dibujo.

### RF-3 — La frontera se verifica automáticamente

El sistema **DEBE** proveer una verificación automática que falle cuando un import viole la tabla de dependencias del TRD §4.

**Fuente:** TRD TEST-2 · PRD AC-4.1 · proposal alcance 4

- **RF-3.1** — DADO el código fuente conforme a las reglas de capa, CUANDO se ejecuta `npm run test:arch`, ENTONCES termina con código de salida `0`.
- **RF-3.2** — DADO un `import` prohibido introducido deliberadamente en `domain/` (por ejemplo `import { signal } from '@angular/core'`), CUANDO se ejecuta `npm run test:arch`, ENTONCES termina con código de salida **distinto de `0`**, **Y DEBE** nombrar el archivo infractor y el import prohibido en su salida.
- **RF-3.3** — DADA la verificación, CUANDO analiza el código, ENTONCES cubre las cuatro filas de la tabla de dependencias del TRD §4, **PERO NO debe** marcar como infracción un `import type` que solo exista en tiempo de compilación **ni** un import de una ruta relativa dentro de la misma capa.
- **RF-3.4** — DADA la verificación, CUANDO se ejecuta, ENTONCES **DEBE** analizar también `application/`, y no solo `domain/`.

> **RF-3.2 es el requisito más importante de este spec.** Una prueba de arquitectura que solo se ha visto pasar no es evidencia de nada: un script que no analiza ningún archivo pasa igual de verde que uno correcto. El requisito exige demostrar el **fallo**, no el éxito.

### RF-4 — Los comandos coinciden con el contrato ya publicado

El sistema **DEBE** exponer los scripts con los nombres exactos que [`AGENTS.md`](../../../AGENTS.md) ya declara.

**Fuente:** `AGENTS.md` Verification Commands · proposal alcance 5

- **RF-4.1** — DADO `package.json`, CUANDO se leen sus `scripts`, ENTONCES existen exactamente: `start`, `build`, `test:agent`, `test:arch`, `lint:agent`.
- **RF-4.2** — DADA la tabla de comandos de `AGENTS.md` y `CLAUDE.md`, CUANDO se compara con los `scripts` reales, ENTONCES coinciden nombre por nombre, **Y DEBE** haberse retirado de ambas guías la advertencia *"estos scripts aún no existen"*.
- **RF-4.3** — DADO `npm run test:agent`, CUANDO se le pasa el filtro de un solo archivo de prueba, ENTONCES ejecuta únicamente ese archivo.

### RF-5 — Los tokens de diseño están verificados, no inventados

El sistema **DEBE** definir los tokens de diseño en un único archivo, con los valores verificados contra el SCSS publicado de BLK Design System.

**Fuente:** [`design.md`](../../ux-ui/design.md) §7 y GQ-1 · PRD C4 · proposal alcance 3

- **RF-5.1** — DADO `src/app/ui/styles/_tokens.scss`, CUANDO se inspecciona, ENTONCES declara todos los tokens del catálogo de `design.md` §7 (color, gradientes, tipografía, espaciado, radio, sombra, movimiento, breakpoints) como variables CSS en `:root`.
- **RF-5.2** — DADOS los tokens de acento y gradiente, CUANDO se comparan con el SCSS de BLK, ENTONCES coinciden exactamente con los valores publicados, **Y DEBE** quedar registrada en `design.md` §7 la procedencia de cada valor.
- **RF-5.3** — DADO cualquier archivo del proyecto que no sea `_tokens.scss`, CUANDO se inspecciona, ENTONCES no contiene valores de color literales (hexadecimal, `rgb()`, `hsl()`), **PERO** se permite `transparent`, `currentColor` e `inherit`.
- **RF-5.4** — DADA una discrepancia entre `design.md` §7 y el SCSS real de BLK, CUANDO se detecta, ENTONCES se corrige `design.md` **y se registra la decisión con su motivo**, en lugar de ajustar silenciosamente uno de los dos.

### RF-6 — La tabla de rutas está completa desde el inicio

El sistema **DEBE** declarar todas las rutas previstas de la aplicación con carga diferida y componentes placeholder.

**Fuente:** proposal alcance 6 · [`design.md`](../../ux-ui/design.md) §4 · `002/family.md` (paralelismo)

- **RF-6.1** — DADA la configuración de rutas, CUANDO se inspecciona, ENTONCES declara las rutas de las cinco páginas previstas (inicio, laboratorio, guía/conceptos, fórmulas, cartilla) más la ruta comodín de "no encontrado", cada una con carga diferida.
- **RF-6.2** — DADA cada ruta declarada, CUANDO se navega a ella, ENTONCES renderiza su componente sin error de consola, **Y DEBE** mostrar visiblemente que es un placeholder, de modo que nadie la confunda con una página terminada.
- **RF-6.3** — DADA una URL desconocida, CUANDO se navega a ella, ENTONCES se muestra la página de no encontrado dentro de la identidad visual, **PERO NO debe** redirigir silenciosamente a la raíz.
- **RF-6.4** — DADA la implementación de una página en un spec posterior, CUANDO se completa, ENTONCES **NO debe** requerir modificar el archivo de rutas.

> **RF-6.4 es la razón de ser de este requisito.** Es lo que hace que `02`, `03` y `05` de la familia `002` puedan ejecutarse en paralelo: si cada una tuviera que añadir su ruta, todas colisionarían en el mismo archivo y el manifiesto tendría que declararlas seriales.

### RF-7 — La inyección de puertos funciona de extremo a extremo

El sistema **DEBE** demostrar el mecanismo de puertos y adaptadores en funcionamiento, con al menos un puerto resuelto en el arranque real.

**Fuente:** TRD MOD-1, §6.1 · PRD AC-4.2 · proposal alcance 7

- **RF-7.1** — DADO un puerto declarado en `domain/`, CUANDO la aplicación arranca, ENTONCES un `InjectionToken` lo resuelve a un adaptador concreto registrado en `infrastructure/`.
- **RF-7.2** — DADO un caso de uso en `application/`, CUANDO se ejecuta en una prueba, ENTONCES puede recibir un doble en memoria sin `TestBed`, sin red y sin DOM.
- **RF-7.3** — DADO cualquier puerto declarado, CUANDO se verifica la configuración de proveedores, ENTONCES todos los tokens tienen proveedor registrado, **Y DEBE** existir una verificación que falle si un token queda sin proveedor.

> **RF-7.3 cubre un fallo que las pruebas unitarias no ven:** un `InjectionToken` sin proveedor compila, pasa el lint, pasa todas las pruebas unitarias con dobles — y estalla en tiempo de ejecución al abrir la página. Es un error de configuración, no de código.

### RF-8 — Cero orígenes externos en tiempo de ejecución

El sistema **DEBE** funcionar completo sin conexión a internet.

**Fuente:** PRD C7, AC-8.1 · TRD SEC-2 · proposal alcance 8

- **RF-8.1** — DADO el artefacto de producción, CUANDO se inspecciona, ENTONCES no contiene referencias a orígenes HTTP externos (CDN de fuentes, de librerías o de estilos).
- **RF-8.2** — DADA la aplicación servida sin conexión a internet, CUANDO se carga, ENTONCES renderiza con su tipografía correcta, **PERO NO debe** recurrir a una pila de fuentes de reserva del sistema por no haber podido descargar la fuente.
- **RF-8.3** — DADA la fuente tipográfica, CUANDO se empaqueta, ENTONCES se incluyen únicamente los pesos que los tokens declaran, **Y DEBE** usarse `font-display: swap` para no bloquear el primer render.

### RF-9 — Base visual y manejo de errores

El sistema **DEBE** establecer el tema oscuro base y una red de seguridad para errores no previstos.

**Fuente:** [`design.md`](../../ux-ui/design.md) §11 · TRD §11 · proposal alcance 8

- **RF-9.1** — DADO el documento, CUANDO se carga, ENTONCES declara `color-scheme: dark` y pinta explícitamente el fondo del `body` con un token, **PERO NO debe** heredar un fondo transparente.
- **RF-9.2** — DADA una excepción no controlada en cualquier parte de la aplicación, CUANDO ocurre, ENTONCES un `ErrorHandler` global la captura y muestra una pantalla de error dentro de la identidad visual, **PERO NO debe** dejar la pantalla en blanco.
- **RF-9.3** — DADOS los tokens, CUANDO se definen, ENTONCES viven en `:root` sin bloque `prefers-color-scheme: light`, **Y DEBE** existir un comentario que declare esa ausencia como deliberada (`design.md` §11) y no como un olvido.

### RF-10 — La constitución queda consistente con la realidad

El sistema **DEBE** dejar los documentos constitucionales alineados con lo que el código realmente expone.

**Fuente:** proposal Requirement Delta · `AGENTS.md`

- **RF-10.1** — DADAS las guías raíz, CUANDO se completa este spec, ENTONCES su tabla de comandos refleja los scripts reales y no contiene advertencias de inexistencia.
- **RF-10.2** — DADO `design.md` §7, CUANDO se completa este spec, ENTONCES cada token registra su valor verificado, y GQ-1 queda marcada como resuelta.
- **RF-10.3** — DADO cualquier cambio de valor en un documento, CUANDO se aplica, ENTONCES se barre el valor anterior en todo `docs/` y en las guías raíz, **Y DEBE** actualizarse o declararse intencional cada aparición restante.

---

## 7. Requisitos no funcionales

Formato de escenario de seis partes, heredando las medidas del TRD.

| ID | Escenario | Deriva de |
|---|---|---|
| **RNF-1** | Usuario → carga la aplicación sobre el artefacto inicial en red lenta ⇒ se sirve el bundle **medido por < 500 KB comprimido en el chunk inicial**, con el presupuesto declarado en la configuración del build para que romperlo falle la compilación | TRD PERF-3 |
| **RNF-2** | Desarrollador → ejecuta `npm run test:agent` sobre la suite en verde ⇒ obtiene el resultado **medido por una sola línea de resumen y < 30 s de duración** | `AGENTS.md` agent-lean |
| **RNF-3** | Cadena de suministro → introduce una vulnerabilidad conocida sobre las dependencias ⇒ se detecta antes de continuar **medido por `npm audit --audit-level=high` sin hallazgos altos ni críticos** | TRD SEC-3 |
| **RNF-4** | Agente → sigue el contrato de entorno local sobre un repositorio recién clonado ⇒ levanta la aplicación **medido por 0 pasos no documentados en `docs/infrastructure.md` §6** | Infra §6 |
| **RNF-5** | Desarrollador → clona el repositorio en otra máquina sobre Node ≥ 20 ⇒ `npm ci` instala de forma reproducible **medido por `package-lock.json` versionado y build verde** | TRD TA-6 |
| **RNF-6** | Reviewer → audita el diff sobre el proyecto nuevo ⇒ toda dependencia de runtime tiene licencia permisiva **medido por 0 dependencias fuera de MIT / Apache-2.0 / BSD / ISC** | PRD C1, TRD TC-1 |

---

## 8. Clases de defecto y su compuerta

Antes de fijar los comandos de verificación: **qué puede salir mal en este spec, y qué lo atrapa**. La tabla existe para evitar el fallo más caro de todos — una compuerta que pasa mientras el artefacto está equivocado.

| # | Clase de defecto | Compuerta | Entrada que la haría fallar |
|---|---|---|---|
| D1 | El script de arquitectura no detecta violaciones (no analiza nada, o el patrón está mal) | **Caso negativo obligatorio**: introducir `import { signal } from '@angular/core'` en `domain/` y exigir salida ≠ 0 | El propio import prohibido. Sin este caso, un script que analiza cero archivos pasa verde |
| D2 | Los nombres de los scripts no coinciden con el contrato de las guías | Comparación literal entre las claves de `scripts` y la tabla de `AGENTS.md` | Renombrar `test:agent` a `test`. Un `npm test` verde no lo detectaría |
| D3 | Un token existe pero con el valor equivocado | **Diff** de la lista de hex de `_tokens.scss` contra los valores verificados de BLK | Cambiar `#e14eca` por `#e14ecb`. Comprobar que el token *existe* no lo atraparía |
| D4 | Una petición a un origen externo se cuela (fuente por CDN) | `grep` de `https?://` sobre el artefacto de producción + revisión de la pestaña de red | Añadir un `<link>` a `fonts.googleapis.com` |
| D5 | Un `InjectionToken` queda sin proveedor | Prueba que arranca la configuración real de la aplicación y resuelve cada token | Borrar una entrada de `providers`. Las pruebas con dobles seguirían verdes |
| D6 | Presupuesto de bundle roto por una dependencia nueva | Presupuesto declarado en la configuración del build; la compilación falla al excederlo | Instalar e importar una librería grande |
| D7 | Una capa existe pero está vacía (cumple la letra, no el propósito) | Verificación de que cada capa tiene un archivo alcanzable desde el arranque | Dejar `domain/` con un `index.ts` vacío |
| D8 | **Apariencia visual incorrecta** (tokens bien, resultado feo o ilegible) | ⚠️ **Sin compuerta automática** | — |

### D8 no tiene compuerta automática, y hay que decirlo

Ninguna herramienta de este proyecto puede juzgar si una pantalla se ve bien. `axe` mide contraste sobre el DOM, no legibilidad; el lint no ve el resultado renderizado; una prueba de componente afirma que existe una clase, no que el resultado sea correcto.

**Sustituto declarado:** revisión humana en la pausa de aprobación de este spec — las cinco páginas son placeholders triviales, así que el costo de mirarlas es de segundos. Si más adelante hace falta juicio visual sobre una pantalla real, corresponde al nivel **T6 Multimodal** del registro de Model Routing, no a una prueba.

**Riesgo aceptado que queda registrado:** RF-5.3 impide hexadecimales sueltos, pero **no puede garantizar que el token correcto se use en el lugar correcto**. Un componente que usa `--vc-danger` para un estado de éxito pasa todas las compuertas de este spec. Lo atrapa el Reviewer leyendo el diff contra `design.md`, que es un control humano, no automático.

---

## 9. Índice de requisitos y trazabilidad

| Requisito | Origen | Se verifica con |
|---|---|---|
| RF-1 | proposal 1 · `AGENTS.md` | `npm start`, `npm run build`, `lint:agent`, `test:agent` |
| RF-2 | PRD C3 · TRD §4 | `test:arch` + inspección del árbol |
| RF-3 | TRD TEST-2 · PRD AC-4.1 | `test:arch` en caso positivo **y negativo** (D1) |
| RF-4 | `AGENTS.md` | Comparación literal de nombres (D2) |
| RF-5 | `design.md` §7, GQ-1 | Diff contra el SCSS de BLK (D3) + `grep` de hex (RF-5.3) |
| RF-6 | proposal 6 · `family.md` | Prueba de rutas + build de chunks diferidos |
| RF-7 | TRD MOD-1, §6.1 | Prueba de arranque de la configuración real (D5) |
| RF-8 | PRD C7, AC-8.1 | `grep` sobre el artefacto (D4) + carga sin red |
| RF-9 | `design.md` §11 · TRD §11 | Prueba de `ErrorHandler` + inspección visual (D8) |
| RF-10 | proposal Delta | Barrido de `docs/` y guías raíz (RF-10.3) |
| RNF-1 | TRD PERF-3 | Presupuesto en el build (D6) |
| RNF-2 | `AGENTS.md` | Medición de la corrida en verde |
| RNF-3 | TRD SEC-3 | `npm audit --audit-level=high` |
| RNF-4 | Infra §6 | Clonado limpio siguiendo el contrato |
| RNF-5 | TRD TA-6 | `package-lock.json` + build en limpio |
| RNF-6 | PRD C1 | Revisión de licencias de dependencias |

**Sin huérfanos:** los 10 RF y los 6 RNF tienen origen documentado y compuerta asignada. La única clase de defecto sin compuerta automática (D8) queda declarada con su sustituto humano.

---

## 10. Supuestos y preguntas abiertas

| # | Supuesto / Pregunta | Estado |
|---|---|---|
| S-1 | El CLI global instalado es **Angular 20.1.5**; la última versión publicada es **22.1.7**. La elección de versión —y con ella el runner de pruebas— es una **decisión de diseño de la Fase 2**, no un requisito | Se decide en `design.md` |
| S-2 | El SCSS de BLK es accesible desde npm (`blk-design-system@1.0.2`) y sus valores de acento **ya fueron verificados** durante esta fase | ✅ Resuelto |
| S-3 | Los colores de **superficie** de `design.md` §7 **no** coinciden con los del paquete BLK. Requiere decisión explícita | ⚠️ **Abierto — se decide en Fase 2** |
| S-4 | El paquete declara licencia MIT en su README y "Creative Tim License" en `package.json`. Solo se copian **valores** de tokens, no código | ⚠️ Se documenta en Fase 2 |
| S-5 | PRD Q7 (¿se evalúa el despliegue?) sigue sin responder | No bloquea: B4 lo deja fuera |
