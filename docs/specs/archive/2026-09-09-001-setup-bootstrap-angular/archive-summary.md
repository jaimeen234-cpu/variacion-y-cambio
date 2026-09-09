# Resumen de archivado — Bootstrap del proyecto Angular

## Control del documento

| Campo | Valor |
|---|---|
| Ruta original | `docs/specs/001-setup-bootstrap-angular/` |
| Fecha de archivado | 2026-09-09 |
| Estado final | ✅ **Completado** — 10 de 11 tareas en `[x]`, 1 en `[~]` por verificación humana pendiente |
| Rama | `main` |
| Commits | 15 con prefijo `[SPEC:001-setup-bootstrap-angular]` |

## Qué entregó

El proyecto Angular 21 LTS existe, con las cuatro capas de la arquitectura hexagonal **habitadas y verificadas automáticamente**. Antes de este spec no había una sola línea de código.

| Entregable | Estado |
|---|---|
| Proyecto Angular 21 LTS, zoneless, con Vitest | ✅ |
| Cadena hexagonal `ui → application → domain ← infrastructure`, ejercida en runtime | ✅ |
| Prueba de arquitectura con auto-verificación (3 pasadas) | ✅ |
| Tokens de diseño verificados contra BLK, con procedencia por grupo | ✅ |
| Fuentes empaquetadas, cero orígenes externos | ✅ (falta comprobación visual humana) |
| Seis rutas con carga diferida y páginas placeholder en ubicación final | ✅ |
| `ErrorHandler` global y pantalla de error | ✅ |
| Verificación de tokens de inyección sin proveedor | ✅ |
| Cinco scripts *agent-lean* + presupuesto de bundle | ✅ |
| Constitución sincronizada con la realidad | ✅ |

## Números duros

| Medida | Valor | Presupuesto |
|---|---|---|
| Bundle inicial, gzip real | **70,23 KB** | 500 KB — **14 %** |
| Suite completa, en reposo | **2,15 s** | 30 s |
| Pruebas | **31**, en 8 archivos | — |
| Vulnerabilidades altas o críticas | **0** | 0 |
| Dependencias de runtime | 10 · MIT / Apache-2.0 / 0BSD / OFL-1.1 | — |

## Requisitos entregados

Los diez grupos (RF-1 a RF-10) y los seis no funcionales (RNF-1 a RNF-6) quedan cubiertos, con **una excepción declarada desde la fase de especificación**: **RF-6.4** —*"implementar una página en un spec posterior no debe requerir modificar `app.routes.ts`"*— no tiene tarea porque es una propiedad de código que aún no existe. Se cierra como obligación heredada: durante `/akili-execute` de `002/02`, `002/03` y `002/05`, si el diff toca `app.routes.ts`, el Reviewer marca **FAIL** citando RF-6.4.

El Reviewer de T-6 cruzó las cinco páginas contra lo que promete la familia `002` y confirmó que **ninguna es previsiblemente partible o renombrable**.

## Cuatro enmiendas al spec, ninguna un pivote

Todas corrigen **reglas inimplementables escritas antes de que el artefacto existiera**, no cambios de alcance.

| # | Qué corrigió |
|---|---|
| **D-1** | La tabla de capas se lee como **lista negra**. Bajo lista blanca, los `.spec.ts` que importan `vitest` harían fallar la pasada 1 por construcción |
| **D-2** | La pasada de alcanzabilidad sale de T-3 y pasa a ser **T-11**, tras T-6: exigía `src/app/ui/`, que no existía aún |
| **D-3** | El `grep` de hex sueltos exime a los `*.spec.ts`. La redacción original era contradictoria: exigía una prueba que compara hex y declaraba ilegal el archivo que la sostiene |
| **D-4** | La lista blanca de orígenes externos no puede ser literalmente vacía: el bundle de Angular emite seis URIs de espacio de nombres del W3C |

## Evidencia de pruebas

**No se ejecutó `/akili-test`.** Aceptado explícitamente: cada tarea llevaba su propia verificación con **descalificador de la evidencia** y una **entrada que debía hacerla fallar**, probada y registrada. Las suites que existen (31 pruebas) se escribieron dentro de las tareas.

Un patrón que conviene preservar: en cinco tareas la evidencia decisiva fue **demostrar el fallo**, no el éxito —analizador neutralizado, import prohibido inyectado, proveedor borrado, archivo de dominio vaciado, dependencias grandes importadas—. Un verde sin su rojo correspondiente no se aceptó como evidencia.

## Validación

**No se ejecutó `/akili-validate`.** Aceptado explícitamente por la entrega del 2026-09-10. Sustituto real: **11 auditorías independientes del Reviewer** (`opus`, wrapper de solo lectura) contra un Implementer de otra familia de modelos y otro host.

## Advertencias aceptadas y trabajo de seguimiento

| # | Pendiente | Dueño |
|---|---|---|
| 1 | **T-5 `[~]`** — *"con la red deshabilitada, la app renderiza con Poppins"*. Verificación **humana**; ningún agente puede cerrarla | Usuario |
| 2 | **RF-6.4** — obligación heredada, se cierra en `002/02`, `03` y `05` | Reviewer de esos specs |
| 3 | El repositorio remoto sigue **vacío**; nada se ha empujado | Usuario |
| 4 | **`/akili-test` y `/akili-validate`** no ejecutados | Decisión de calendario |
| 5 | 19 hallazgos `ADVISORY` registrados sin dueño. Los cuatro con consecuencia fuera del spec ya están anotados contra su destino: peso mono 600 para `002/02`, subsetting de fuentes para RNF-1, `npm ci` en limpio, y el `prefers-reduced-motion` global | `/akili-propose` si alguno crece |

## Notas históricas

**El presupuesto se excedió y se aceptó.** ~980 LOC previstos frente al gasto real, con los tres excesos (T-3 4×, T-4 2,4×, T-5 1,6×) verificados como **verbosidad y trabajo exigido, nunca alcance colado**. El spec se estimó bajo; la ejecución no se desmadró.

**Dos incidentes registrados**, ambos del Leader y ambos corregidos:

1. **`git add -A` con un agente delegado activo** commiteó `reloj.ts` mientras Antigravity lo tenía vaciado para un sabotaje. Corregido con `--amend`. Es lección de kaizen.
2. **Un brief con una instrucción falsa** (*"`ui/` no puede importar de `infrastructure/`"*, cuando la tabla de capas se lo permite). El Implementer hizo lo correcto y `arch-test` lo confirmó.

**El régimen cambió a mitad de corrida** (desviación P-5): auditorías reducidas a conformidad, sin lentes 4R, por la fecha de entrega. El tiempo de auditoría cayó de ~300 s a ~90 s **sin perder ningún FAIL**: las dos tareas auditadas bajo el régimen nuevo que fallaron (T-9, T-10) fallaron por defectos reales.
