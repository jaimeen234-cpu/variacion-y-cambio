# Propuesta — Bootstrap del proyecto Angular

## Document Control

| Campo | Valor |
|---|---|
| Spec Path | `001-setup-bootstrap-angular` |
| Slug | `bootstrap-angular` — derivado del argumento en texto libre de `/akili-propose` |
| Type | **Change** (setup habilitador) |
| Approval Mode | `gated` |
| Depends on | ninguno |
| Parallel-safe | no *(es el habilitador de todo lo demás)* |
| Fecha | 2026-09-08 |

## Intent

Crear el proyecto Angular real con el esqueleto hexagonal, los tokens de BLK y los comandos de verificación que hoy solo existen como contrato escrito en [`AGENTS.md` → Verification Commands](../../../AGENTS.md).

Hoy el repositorio contiene **solo documentación**. Cualquier tarea de las demás propuestas es inejecutable hasta que exista un proyecto que compile.

## Problem / Current Behavior

`AGENTS.md` declara `npm run test:agent`, `npm run test:arch`, `npm run lint:agent` y `npm run build`, y advierte que **aún no existen**. Un agente que intente verificar algo debe declararlo como no verificable. Esa es una deuda deliberada del paso de constitución, y este spec la paga.

## Proposed Outcome

Un proyecto Angular que arranca con `npm start`, compila en producción, pasa lint, pasa una suite de pruebas (aunque sea mínima) y **falla el build si alguien viola la frontera hexagonal**.

## Scope

| # | Alcance |
|---|---|
| 1 | Proyecto Angular con la versión actual del CLI: componentes standalone, `provideRouter`, `provideHttpClient`, SCSS |
| 2 | Estructura de directorios de [TRD §4](../../trd/trd.md): `domain/`, `application/`, `infrastructure/`, `ui/`, con un archivo mínimo real en cada capa (no carpetas vacías) |
| 3 | **Tokens de BLK portados** a `ui/styles/_tokens.scss`, verificados contra el SCSS de la versión free y corrigiendo [`design.md` §7](../../ux-ui/design.md) si algún hex difiere (cierra GQ-1) |
| 4 | **Prueba de arquitectura** (`npm run test:arch`): script que recorre los imports de `domain/` y `application/` y sale con código ≠ 0 ante un import prohibido (TRD TEST-2) |
| 5 | Scripts *agent-lean* en `package.json` con los nombres exactos que ya declara `AGENTS.md` |
| 6 | **Tabla de rutas completa con `loadComponent` y componentes placeholder** para las cinco páginas previstas (inicio, laboratorio, fórmulas, cartilla, conceptos) |
| 7 | Tokens de inyección (`InjectionToken`) para los puertos previstos, con un adaptador en memoria trivial, para que la DI quede probada de extremo a extremo |
| 8 | `.gitignore`, `ErrorHandler` global, `color-scheme: dark`, fuentes **empaquetadas** (no CDN — restricción C7: sin internet en el aula) |

**Por qué el punto 6 importa más de lo que parece:** si cada spec posterior tuviera que añadir su propia ruta, todos tocarían el mismo archivo y **ninguna pareja de specs sería paralelizable**. Declarando la tabla completa aquí, con placeholders, las cinco propuestas hijas de la familia `002` quedan verdaderamente independientes. Es una decisión de 20 líneas que determina si el resto se puede ejecutar en paralelo.

## Non-Goals

| # | Fuera de alcance |
|---|---|
| 1 | Cualquier lógica de dominio real — es el spec `002/01` |
| 2 | Cualquier pantalla con contenido real — las páginas quedan como placeholder |
| 3 | Pipeline de despliegue (depende de PRD Q7) |
| 4 | Chart.js y three.js: se instalan en el spec que los use, no antes |

## Affected Users, Systems, And Specs

- **Habilita:** toda la familia `002-feature-experiencia-variacion-cpu`.
- **Puede corregir:** [`docs/ux-ui/design.md`](../../ux-ui/design.md) §7 (hex reales de BLK) y la tabla de comandos de `AGENTS.md`/`CLAUDE.md` si algún script real difiere. Ambos archivos están **nombrados explícitamente como entregables de este spec**, lo que activa la excepción de la regla de escritura en archivos compartidos.

## Visual Reference

- **Source:** None
- **Location:** —
- **Notes:** spec de andamiaje. Las páginas son placeholder; el diseño visual entra con cada página en la familia `002`. Los tokens sí se portan aquí, pero no se aplica ninguna pantalla.

## Requirement Delta Preview

### ADDED
- El repositorio contiene un proyecto Angular ejecutable.
- Existen los cuatro comandos de verificación declarados en las guías raíz.
- La frontera hexagonal se verifica automáticamente.

### MODIFIED
- `docs/ux-ui/design.md` §7: los hex quedan verificados contra el SCSS real de BLK.
- `AGENTS.md` / `CLAUDE.md`: se retira la advertencia "estos scripts aún no existen".

### REMOVED
- Ninguno.

## Approach Options

| Opción | Descripción | Ventaja | Desventaja |
|---|---|---|---|
| **A. `ng new` + portado manual de tokens** ✅ | Proyecto limpio del CLI actual; se traen de BLK solo variables, gradientes y tipografía | Herramientas modernas; control total; bundle mínimo | Hay que portar SCSS a mano |
| B. Clonar el template de BLK y actualizarlo | Se arrastra el proyecto de Creative Tim y se migra | Componentes visuales ya hechos | Migrar 6+ versiones mayores de Angular; se hereda Bootstrap 4 completo y jQuery/nouislider; contamina el bundle y el árbol de dependencias |
| C. `ng new` + solo paleta, sin SCSS de BLK | Se toman colores y tipografía como tokens propios | Lo más limpio | Se pierde la firma visual de BLK (gradientes, sombras, tarjetas) |

## Recommended Approach

**Opción A.** Es el camino más pequeño que cumple las cuatro restricciones a la vez: Angular actual (C4), identidad BLK (C4), sin dependencias de pago (C1) y sin internet en el aula (C7). La opción B parece un atajo y no lo es: migrar el template arrastra Bootstrap 4 y jQuery a un proyecto que no los necesita, y ese peso viaja en cada build por el resto del semestre. La opción C queda como **plan B documentado** si el portado desborda su tarea (TRD ADR-003, alternativa b).

## Risks, Dependencies, And Open Questions

| Riesgo / Pregunta | Mitigación |
|---|---|
| El portado de SCSS de BLK desborda la tarea | Plan B de TRD ADR-003: solo tokens. Se decide con una tarea acotada, no abierta |
| El runner de pruebas por defecto del CLI instalado puede ser Karma o Vitest según la versión | La primera tarea lo determina y **fija el comando real** en las guías raíz (TA-5) |
| La prueba de arquitectura puede dar falsos positivos con imports de tipos | Solo se analizan imports en tiempo de ejecución; los `import type` se excluyen explícitamente |
| PRD Q7: ¿se evalúa el despliegue? | No bloquea: el pipeline es un spec aparte si la respuesta es sí |

## Success Criteria

- [ ] `npm start` sirve la app en `http://localhost:4200`
- [ ] `npm run build` produce un artefacto de producción sin errores
- [ ] `npm run lint:agent` pasa
- [ ] `npm run test:agent` pasa
- [ ] `npm run test:arch` **falla** si se introduce a propósito un `import { signal } from '@angular/core'` en `domain/` — probado con un caso negativo real, no asumido
- [ ] Las cinco rutas resuelven a sus placeholders con carga diferida
- [ ] Cero peticiones a orígenes externos con la pestaña de red abierta
- [ ] `docs/ux-ui/design.md` §7 refleja los hex verificados de BLK

## Next Step

```text
/akili-specify 001-setup-bootstrap-angular
```
