# Tareas — Bootstrap del proyecto Angular

| Campo | Valor |
|---|---|
| Spec | `docs/specs/001-setup-bootstrap-angular/` |
| Diseño | [`design.md`](design.md) |
| Requisitos | [`requirements.md`](requirements.md) |
| Estado | **Aprobado, pendiente de ejecución** — Fase 3 aprobada 2026-09-08 |
| Presupuesto | 10 tareas · ~940 LOC a mano · ~12 rondas de revisión |

> **Nota para el Implementer:** este spec **crea** el proyecto. Hasta que T-1 esté hecha no existe ningún comando de verificación, así que las tareas anteriores a ella no existen y T-1 verifica a mano. A partir de T-2, toda tarea corre su comando antes de reportar.

---

## Grafo de dependencias

```
T-1 (crear proyecto)
 ├──► T-2 (cadena hexagonal) ──┬──► T-3 (prueba de arquitectura) ──┐
 │                             └──► T-7 (ErrorHandler + base) ──┐  │
 ├──► T-4 (tokens) ──┬──► T-5 (fuentes) ──────────► T-9 (scripts + presupuesto) ──┐
 │                   ├──► T-6 (rutas + placeholders) ──┐                          │
 │                   └──► T-7                          │                          │
 └───────────────────────────────────────────► T-8 (proveedores) ◄────────────────┘
                                                                    T-10 (constitución)

Serie forzada:  T-1 antes que todo · T-3 tras T-2 · T-8 tras T-2, T-6 y T-7 · T-10 al final
Paralelizables: {T-2, T-4} · {T-5, T-6} · pero solo en worktrees separados (regla CC-3:
                dist/, el servidor de desarrollo y node_modules/ son compartidos en un checkout)
```

---

## Tareas

### [x] T-1 — Crear el proyecto Angular 21 LTS en la raíz del repositorio

- **Capa:** raíz del proyecto (configuración)
- **Depende de:** ninguna
- **Paralelizable:** no — es el habilitador de todo
- **Tamaño:** ~90 LOC a mano (el resto lo genera el CLI)
- **Requisitos:** RF-1.1, RF-4.1 *(parcial)*, RNF-5
- **Diseño:** [§4](design.md), [DD-1](design.md)
- **Skills:** `angular-developer`
- **Ejemplar:** ninguno — no hay código previo en el repositorio
- **Alcance:**
  - Generar el proyecto con `npx @angular/cli@v21-lts new variacion-y-cambio --style=scss --ssr=false --package-manager=npm` **en un directorio temporal** (`.tmp-scaffold/`).
  - Mover el contenido generado a la raíz **sin sobrescribir** `docs/`, `AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/` ni `.git/`. Borrar el temporal.
  - Confirmar que el proyecto quedó con `testRunner: vitest` y `zoneless: true` (defaults verificados de Angular 21).
  - Crear `.nvmrc` con la versión de Node en uso y declarar `engines` en `package.json`.
  - Verificar que el `.gitignore` generado incluye `node_modules/`, `dist/` y `.angular/`; completarlo si falta alguno.
- **Fuera de alcance:** cualquier archivo bajo `src/app/domain|application|infrastructure`; los scripts del contrato (son T-9).
- **Verificación:** `npm start` responde `200` en `http://localhost:4200` · `npx ng build` termina en `0` · `npx ng test --watch=false` ejecuta la suite generada.
- **Descalificador de la evidencia:** si el proceso de `npm start` se levantó pero la petición HTTP se hizo antes de que el servidor terminara de compilar, un `curl` fallido **no** es evidencia de fallo. Esperar el mensaje de compilación completa y reintentar; si sigue fallando, entonces sí es fallo.
- **Entrada que haría fallar la verificación:** borrar `src/main.ts` — el build debe romper.
- **Hecho cuando:**
  - [ ] `npm start` sirve la aplicación y responde `200`
  - [ ] `npx ng build` termina con código `0`
  - [ ] `angular.json` declara `scss` y el proyecto es standalone + zoneless
  - [ ] `.nvmrc` y `engines` existen y coinciden con el Node en uso
  - [ ] **Ninguno** de `docs/`, `AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/` fue modificado o borrado — verificado con `git status`
  - [ ] `.tmp-scaffold/` ya no existe

---

### [ ] T-2 — Cadena hexagonal del reloj a través de las cuatro capas

- **Capa:** `domain/`, `application/`, `infrastructure/`
- **Depende de:** T-1
- **Paralelizable:** sí, con T-4 (archivos disjuntos)
- **Tamaño:** ~130 LOC
- **Requisitos:** RF-2.1, RF-2.2, RF-2.3, RF-7.1, RF-7.2
- **Diseño:** [§3.1](design.md), [§3.2](design.md), [§5](design.md), [§6](design.md), [DD-6](design.md)
- **Skills:** `angular-developer`, `tdd` *(el value object tiene valores esperados conocidos: red → green paga aquí)*
- **Ejemplar:** ninguno todavía. **Este archivo se convierte en el ejemplar** de los value objects de `002/01` (`Voltios`, `Celsius`, `Watts`), así que su estructura y su estilo de pruebas importan más que su tamaño.
- **Alcance:**
  - `domain/shared/ports/reloj.ts` — interfaz con `ahora(): number`.
  - `domain/shared/model/sello-de-tiempo.ts` — value object que valida su entrada y expone su representación ISO.
  - `application/diagnostico/sellar-evento.ts` — clase plana, dependencias por constructor, **sin `inject()` ni `@angular/*`**.
  - `infrastructure/tiempo/reloj-sistema.ts` y `reloj-fijo.ts`.
  - `infrastructure/di/tokens.ts` (`RELOJ`, `SELLAR_EVENTO`) y `providers.ts` con `useFactory`.
  - Registrar los proveedores en `app.config.ts`.
  - Pruebas: `SelloDeTiempo` acepta válidos y **rechaza** negativos y no finitos; `SellarEvento` con `RelojFijo` **sin `TestBed`**.
- **Fuera de alcance:** modelo de dominio del simulador; cualquier otro puerto.
- **Verificación:** `npx ng test --watch=false --include=src/app/domain --include=src/app/application`
- **Descalificador de la evidencia:** si la prueba de `SellarEvento` importa algo de `@angular/*` para construirse, la prueba pasa pero **no demuestra RF-7.2**. Revisar los imports del archivo de prueba, no solo su resultado.
- **Entrada que haría fallar la verificación:** pasar `-1` a `SelloDeTiempo` y esperar que lo acepte.
- **Hecho cuando:**
  - [ ] Las cuatro capas existen y cada una tiene al menos un archivo con contenido real
  - [ ] `domain/` no importa `@angular/*`, `rxjs`, ni otras capas
  - [ ] `application/` no importa `@angular/*` ni `infrastructure/`
  - [ ] `SellarEvento` se prueba con un doble, **sin `TestBed`, sin DOM, sin red**
  - [ ] `SelloDeTiempo` rechaza negativos y no finitos con error tipado
  - [ ] `app.config.ts` registra `RELOJ` y `SELLAR_EVENTO`

---

### [ ] T-3 — Prueba de arquitectura con auto-verificación permanente

- **Capa:** `tools/`
- **Depende de:** T-2 *(necesita capas reales que analizar)*
- **Paralelizable:** no
- **Tamaño:** ~140 LOC (script + fixtures)
- **Requisitos:** RF-3.1, RF-3.2, RF-3.3, RF-3.4, RF-2.2 *(alcanzabilidad)*
- **Diseño:** [§7.1](design.md), [DD-3](design.md)
- **Skills:** `tdd` *(los fixtures son las pruebas)*
- **Ejemplar:** ninguno
- **Alcance:**
  - `tools/arch-test.mjs`: parsea cada `.ts` con `ts.createSourceFile`, resuelve cada import a su capa y lo evalúa contra la tabla de reglas de [§7.1](design.md).
  - **Pasada 1:** `src/app/` debe salir limpia.
  - **Pasada 2:** `tools/fixtures/arch/` debe producir **exactamente** las infracciones esperadas, declaradas en el script.
  - **Pasada 3:** desde `main.ts`, seguir los imports relativos transitivamente y verificar que se alcanza al menos un archivo de cada capa (RF-2.2).
  - Fixtures permanentes: `domain-viola-angular.ts`, `application-viola-infra.ts`, y `domain-import-type.ts` *(caso válido que **no** debe marcarse)*.
  - Excluir `tools/fixtures/` del `tsconfig` de la aplicación para que no rompa el build.
  - Ignorar declaraciones `import type`.
- **Fuera de alcance:** detección de ciclos, huérfanos o métricas de acoplamiento (ver DD-3, condición de revisión).
- **Verificación:** `node tools/arch-test.mjs` termina en `0` con las tres pasadas.
- **Descalificador de la evidencia:** un `exit 0` **no** es evidencia si la pasada 2 no reportó las infracciones esperadas. El script debe imprimir cuántas infracciones esperaba y cuántas encontró; si esos números no aparecen en la salida, la corrida es **inconcluso**, no aprobado.
- **Entrada que haría fallar la verificación:** *(dos, y ambas deben probarse)*
  1. Añadir `import { signal } from '@angular/core'` a un archivo de `domain/` → la pasada 1 debe fallar nombrando el archivo.
  2. Neutralizar el analizador (por ejemplo, hacer que devuelva lista vacía) → la pasada 2 debe fallar aunque la 1 pase.
- **Hecho cuando:**
  - [ ] `node tools/arch-test.mjs` termina en `0` sobre el código actual
  - [ ] Con el import prohibido inyectado a mano, termina en ≠ `0` **y nombra el archivo y el import**
  - [ ] Con el analizador neutralizado, **la pasada 2 falla** — probado, no asumido
  - [ ] `domain-import-type.ts` **no** se marca como infracción
  - [ ] `application-viola-infra.ts` **sí** se marca (RF-3.4: se analiza `application/`, no solo `domain/`)
  - [ ] La pasada 3 alcanza al menos un archivo por capa desde `main.ts`
  - [ ] `npx ng build` sigue verde: los fixtures no entran al build

---

### [ ] T-4 — Tokens de diseño verificados contra BLK

- **Capa:** `ui/styles/`
- **Depende de:** T-1
- **Paralelizable:** sí, con T-2
- **Tamaño:** ~120 LOC
- **Requisitos:** RF-5.1, RF-5.2, RF-5.3, RF-9.3
- **Diseño:** [§8.1](design.md), [DD-2](design.md)
- **Skills:** `ui-ux-pro-max`
- **Ejemplar:** el mock `docs/specs/002-feature-experiencia-variacion-cpu/mockup/index.html` — su bloque `:root` es la lista de tokens ya validada visualmente por el usuario. **Imitar sus nombres y valores.**
- **Alcance:**
  - `ui/styles/_tokens.scss` con todo el catálogo de [`design.md` §7](../../ux-ui/design.md) como variables CSS en `:root`, **con la procedencia anotada por grupo** (§8.1 del diseño).
  - `ui/styles/_base.scss`: `color-scheme: dark`, fondo del `body` con token, reset mínimo.
  - Comentario explícito de que la ausencia de bloque `prefers-color-scheme: light` es **deliberada** (`design.md` §11), no un olvido.
  - Prueba que compara la lista de hex de acentos y gradientes contra los valores verificados de BLK.
  - Verificación de que ningún otro archivo del proyecto contiene hex, `rgb()` o `hsl()`, permitiendo `transparent`, `currentColor` e `inherit`.
- **Fuera de alcance:** aplicar los tokens a cualquier pantalla real; fuentes (T-5).
- **Verificación:** `npx ng test --watch=false --include=src/app/ui/styles` · `grep -rEn '#[0-9a-fA-F]{3,8}|rgb\(|hsl\(' src --include='*.scss' --include='*.ts' --include='*.html' | grep -v '_tokens.scss'` debe salir vacío.
- **Descalificador de la evidencia:** la prueba comprueba que el **valor** del token es correcto. **No puede probar que el token correcto se use en el lugar correcto** — un componente que usara `--vc-danger` para un estado de éxito pasaría. Esa clase de defecto queda para la revisión del diff (riesgo aceptado, declarado en requisitos §8).
- **Entrada que haría fallar la verificación:** cambiar `#e14eca` por `#e14ecb` en `_tokens.scss`.
- **Hecho cuando:**
  - [ ] `_tokens.scss` declara todos los grupos de `design.md` §7
  - [ ] Los acentos y gradientes coinciden con los valores verificados de BLK
  - [ ] Cada grupo de tokens tiene su procedencia anotada
  - [ ] El `grep` de hex sueltos sale vacío
  - [ ] El comentario sobre la ausencia deliberada del modo claro está presente
  - [ ] El `body` pinta su fondo con un token, sin heredar transparente

---

### [ ] T-5 — Fuentes empaquetadas y verificación de orígenes externos

- **Capa:** `ui/styles/`, `tools/`
- **Depende de:** T-4
- **Paralelizable:** sí, con T-6
- **Tamaño:** ~70 LOC
- **Requisitos:** RF-8.1, RF-8.2, RF-8.3
- **Diseño:** [§7.3](design.md), [DD-4](design.md)
- **Skills:** `ui-ux-pro-max`
- **Ejemplar:** ninguno
- **Alcance:**
  - Instalar `@fontsource/poppins` y `@fontsource/jetbrains-mono` (OFL-1.1 verificada).
  - `ui/styles/_fonts.scss` importando **solo** los pesos que los tokens declaran, con `font-display: swap`.
  - `tools/check-external-origins.mjs`: recorre el artefacto de producción buscando `http://` y `https://` literales en JS, CSS y HTML, con lista blanca vacía.
  - Retirar cualquier `<link>` a CDN de fuentes que el CLI haya generado en `index.html`.
- **Fuera de alcance:** optimización de subconjuntos de glifos.
- **Verificación:** `npm run build && node tools/check-external-origins.mjs` termina en `0`.
- **Descalificador de la evidencia:** el script detecta **URLs literales**. Una URL construida por concatenación en tiempo de ejecución se le escapa, así que un `0` **no** prueba ausencia total de peticiones externas. La confirmación real es cargar la app con la red deshabilitada y mirar la pestaña de red — comprobación manual obligatoria de esta tarea.
- **Entrada que haría fallar la verificación:** añadir `<link href="https://fonts.googleapis.com/...">` a `index.html`.
- **Hecho cuando:**
  - [ ] `node tools/check-external-origins.mjs` sale limpio sobre el artefacto de producción
  - [ ] Con la red deshabilitada, la app renderiza con **Poppins**, no con la pila de reserva del sistema — verificado a ojo y registrado en `execution.md`
  - [ ] `font-display: swap` está declarado
  - [ ] Solo se importan los pesos que los tokens usan
  - [ ] `index.html` no contiene ningún `<link>` a una CDN

---

### [ ] T-6 — Tabla de rutas completa y seis páginas placeholder

- **Capa:** `ui/pages/`, `ui/shared/`
- **Depende de:** T-4
- **Paralelizable:** sí, con T-5
- **Tamaño:** ~120 LOC
- **Requisitos:** RF-6.1, RF-6.2, RF-6.3
- **Diseño:** [§8.2](design.md), [DD-5](design.md), [DD-7](design.md)
- **Skills:** `angular-developer`, `ui-ux-pro-max`
- **Ejemplar:** el `nav` y las tarjetas del mock (`mockup/index.html`) para el aspecto del placeholder
- **Alcance:**
  - `ui/shared/placeholder/placeholder.ts`: componente presentacional que recibe el nombre de la página y el spec responsable, y **se ve inequívocamente como placeholder**.
  - Seis componentes en su **ubicación final**: `inicio/`, `laboratorio/`, `conceptos/`, `formulas/`, `cartilla/`, `no-encontrado/`. Nombres según la guía 2025 (sin sufijo de tipo).
  - `app.routes.ts` con las seis rutas, todas con `loadComponent`, y la comodín apuntando a `no-encontrado`.
  - Navbar mínima en el shell con enlaces a las rutas y estado activo.
  - Pruebas con `RouterTestingHarness`: navegar a las seis rutas y verificar que renderizan sin error.
  - Prueba de que una URL desconocida muestra `no-encontrado` y **no** redirige a la raíz.
- **Fuera de alcance:** contenido real de cualquier página; el layout del laboratorio.
- **Verificación:** `npx ng test --watch=false --include=src/app/ui` · `npx ng build` produce un chunk diferido por página.
- **Descalificador de la evidencia:** una prueba que solo afirma "el componente se creó" es una **afirmación de presencia**: no prueba que la ruta renderice ni que el placeholder sea visible. La prueba debe navegar por el router y comprobar contenido renderizado. Si solo instancia el componente, la cobertura de RF-6.2 es **inconcluso**.
- **Entrada que haría fallar la verificación:** cambiar el `path` de una ruta y esperar que la navegación siga funcionando.
- **Hecho cuando:**
  - [ ] Las seis rutas resuelven y renderizan sin error de consola
  - [ ] `ng build` emite un chunk diferido por página (verificado en la salida del build)
  - [ ] Una URL desconocida muestra `no-encontrado`, **sin** redirigir a la raíz
  - [ ] Cada placeholder muestra su nombre y el spec que lo implementará
  - [ ] Cada página está en su ubicación final, de modo que implementarla no exigirá tocar `app.routes.ts`
  - [ ] Cero hex sueltos en los componentes nuevos

---

### [ ] T-7 — `ErrorHandler` global y pantalla de error

- **Capa:** `ui/core/`
- **Depende de:** T-2, T-4
- **Paralelizable:** no *(consume la cadena de T-2 y los tokens de T-4)*
- **Tamaño:** ~70 LOC
- **Requisitos:** RF-9.1, RF-9.2
- **Diseño:** [§8.3](design.md), [§3.1](design.md)
- **Skills:** `angular-developer`, `ui-ux-pro-max`, `error-handling-patterns`
- **Ejemplar:** `ui/shared/placeholder/placeholder.ts` de T-6 para la estructura del componente
- **Alcance:**
  - `ui/core/error-handler.ts`: implementación de `ErrorHandler` que inyecta `SELLAR_EVENTO`, sella el evento y registra en `console.error` con contexto.
  - `ui/core/error-screen.ts`: pantalla dentro de la identidad visual, con mensaje, sello de tiempo y acción de recarga. **Sin trazas técnicas visibles al usuario.**
  - Registrar el `ErrorHandler` en `app.config.ts`.
  - Prueba que lanza una excepción y verifica que aparece la pantalla y **no** una pantalla en blanco.
- **Fuera de alcance:** telemetría remota (TRD §3.6: deliberadamente ausente).
- **Verificación:** `npx ng test --watch=false --include=src/app/ui/core`
- **Descalificador de la evidencia:** si la prueba verifica que `console.error` fue llamado pero **no** que la pantalla se renderizó, no cubre RF-9.2 — el requisito es sobre lo que el usuario ve, no sobre el registro.
- **Entrada que haría fallar la verificación:** quitar el `ErrorHandler` de los proveedores.
- **Hecho cuando:**
  - [ ] Una excepción no controlada muestra la pantalla de error, **no** una pantalla en blanco
  - [ ] La pantalla usa tokens y respeta la identidad visual
  - [ ] El sello de tiempo proviene de la cadena `SELLAR_EVENTO` → `RELOJ`
  - [ ] La traza técnica va a `console.error`, no a la pantalla
  - [ ] La cadena `ui → application → domain ← infrastructure` queda ejercida en tiempo de ejecución

---

### [ ] T-8 — Verificación de que ningún token queda sin proveedor

- **Capa:** pruebas de `infrastructure/di/`
- **Depende de:** T-2, T-6, T-7
- **Paralelizable:** no
- **Tamaño:** ~50 LOC
- **Requisitos:** RF-7.3
- **Diseño:** [§6.3](design.md), [DD-9](design.md)
- **Skills:** `angular-developer`
- **Ejemplar:** las pruebas de T-2
- **Alcance:**
  - Prueba que arranca la configuración **real** de la aplicación (la misma que importa `main.ts`, no una copia) y resuelve **cada** token exportado por `infrastructure/di/tokens.ts`.
  - La lista de tokens se deriva de las exportaciones del módulo, no se escribe a mano: así, un token nuevo sin proveedor rompe la prueba automáticamente.
- **Fuera de alcance:** puertos que aún no existen.
- **Verificación:** `npx ng test --watch=false --include=src/app/infrastructure`
- **Descalificador de la evidencia:** si la prueba construye su propio arreglo de proveedores en lugar de importar el de la aplicación, pasa verde con la configuración real **rota**. Revisar que el import apunte a `app.config.ts`.
- **Entrada que haría fallar la verificación:** borrar la entrada de `SELLAR_EVENTO` de `providers.ts`.
- **Hecho cuando:**
  - [ ] Todos los tokens exportados resuelven contra la configuración **real**
  - [ ] La lista de tokens se deriva de las exportaciones, no está escrita a mano
  - [ ] Borrando un proveedor a mano, la prueba falla — probado, no asumido

---

### [ ] T-9 — Scripts *agent-lean*, presupuesto de bundle y auditoría

- **Capa:** raíz (configuración)
- **Depende de:** T-3, T-5, T-6
- **Paralelizable:** no
- **Tamaño:** ~90 LOC
- **Requisitos:** RF-1.2, RF-1.3, RF-1.4, RF-4.1, RF-4.3, RNF-1, RNF-2, RNF-3
- **Diseño:** [§7.2](design.md), [DD-8](design.md)
- **Skills:** ninguna específica
- **Ejemplar:** la tabla *Verification Commands* de [`AGENTS.md`](../../../AGENTS.md) — los nombres salen de ahí, no se inventan
- **Alcance:**
  - `scripts` en `package.json`: `start`, `build`, `test:agent`, `test:arch`, `lint:agent`, con **exactamente** esos nombres.
  - `test:agent` silencioso en verde y **verbatim completo en rojo**; `lint:agent` con `--quiet`.
  - `build` = compilación de producción **seguida** de `node tools/bundle-budget.mjs`.
  - Presupuestos en `angular.json`: advertencia 1,0 MB y error 1,4 MB sobre el chunk inicial **sin comprimir**.
  - `tools/bundle-budget.mjs`: suma el **gzip real** de los archivos del chunk inicial y falla por encima de 500 KB.
  - Prueba que compara las claves de `scripts` con la tabla de comandos de `AGENTS.md`.
- **Fuera de alcance:** pipeline de CI (fuera de alcance del spec, B4).
- **Verificación:** los cinco comandos terminan en `0` · `npm audit --audit-level=high` sin hallazgos.
- **Descalificador de la evidencia:** **(a)** si el build no produjo los archivos del chunk inicial, `bundle-budget.mjs` no tiene nada que medir: debe reportar **inconcluso** y salir ≠ `0`, nunca aprobar por ausencia de datos. **(b)** el tiempo de RNF-2 medido mientras otro proceso compila **no es evidencia** (regla CC-2 de las guías raíz): repetir la medición con el checkout en reposo.
- **Entrada que haría fallar la verificación:** *(dos)* renombrar `test:agent` a `test` → la prueba de coincidencia con `AGENTS.md` debe fallar; instalar e importar una librería grande desde `ui/` → el presupuesto gzip debe fallar.
- **Hecho cuando:**
  - [ ] Los cinco scripts existen con los nombres exactos del contrato
  - [ ] `npm run test:agent` en verde imprime como máximo una línea de resumen
  - [ ] Una prueba fallida se imprime **completa y verbatim**
  - [ ] `npm run lint:agent` pasa en silencio
  - [ ] `npm run build` falla si el gzip del chunk inicial supera 500 KB — probado con una dependencia grande temporal
  - [ ] `bundle-budget.mjs` reporta **inconcluso** si no encuentra el chunk inicial
  - [ ] `npm audit --audit-level=high` sin hallazgos altos ni críticos
  - [ ] Todas las dependencias de runtime son MIT / Apache-2.0 / BSD / ISC / OFL — listado registrado en `execution.md` (RNF-6)

---

### [ ] T-10 — Sincronizar la constitución con la realidad

- **Capa:** `docs/`, guías raíz
- **Depende de:** T-3, T-4, T-9
- **Paralelizable:** no
- **Tamaño:** ~60 LOC de documentación
- **Requisitos:** RF-4.2, RF-5.4, RF-10.1, RF-10.2, RF-10.3
- **Diseño:** [§10](design.md)
- **Skills:** `cognitive-doc-design`
- **Ejemplar:** los documentos constitucionales existentes
- **Alcance:**
  - `AGENTS.md` y `CLAUDE.md`: tabla de comandos con los scripts reales y **retirada** de la advertencia *"estos scripts aún no existen"*. Ambos archivos, idénticos.
  - `docs/ux-ui/design.md` §7: procedencia por grupo de tokens (§8.1 del diseño), corrección de la afirmación sobre las superficies, y **GQ-1 marcada como resuelta**.
  - `docs/trd/trd.md`: TA-5 resuelto (el runner es Vitest) y TA-6 fijado por `.nvmrc`.
  - **Barrido en dos direcciones** (RF-10.3): buscar el valor anterior en todo `docs/` y en las guías raíz, y actualizar o declarar intencional cada aparición; y buscar quién **cita** las secciones corregidas, para que ningún documento quede afirmando algo falso.
  - Registrar en `execution.md` las dos enmiendas al TRD que este spec **no** aplica (Signal Forms para `002/02`, y zoneless como hecho de plataforma), para que no se pierdan.
- **Fuera de alcance:** cambiar el TRD §8 sobre formularios — pertenece a `002/02`.
- **Verificación:** `grep -rn '#27293d\|estos scripts aún no existen\|GQ-1' docs/ AGENTS.md CLAUDE.md` y revisar cada resultado a mano.
- **Descalificador de la evidencia:** un `grep` vacío del valor viejo **no** cierra la corrección. Falta el barrido **hacia atrás**: si un documento citaba la sección corregida, puede haber quedado afirmando algo que ya no es cierto. Sin ese segundo barrido registrado, la tarea es **inconcluso**.
- **Entrada que haría fallar la verificación:** dejar a propósito una mención de `#2b3553` sin anotar su procedencia en otro documento → el barrido debe encontrarla.
- **Hecho cuando:**
  - [ ] Las guías raíz reflejan los scripts reales, sin advertencia de inexistencia
  - [ ] `AGENTS.md` y `CLAUDE.md` siguen siendo idénticos en las secciones compartidas
  - [ ] `design.md` §7 declara procedencia por grupo y GQ-1 queda resuelta
  - [ ] TRD TA-5 y TA-6 quedan resueltos
  - [ ] Barrido hacia adelante y hacia atrás ejecutado y **registrado en `execution.md`**
  - [ ] Las dos enmiendas no aplicadas quedan registradas para `002/02` y `/akili-archive`

---

## Cobertura de escenarios y cláusulas

**El cierre es por escenario y por cláusula, no por identificador de requisito.** Un requisito "que aparece en una tarea" es la afirmación más débil posible.

| Escenario | Tarea | Escenario | Tarea |
|---|---|---|---|
| RF-1.1 | T-1 | RF-6.1 | T-6 |
| RF-1.2 | T-9 | RF-6.2 | T-6 |
| RF-1.3 | T-9 | RF-6.3 | T-6 |
| RF-1.4 | T-9 | **RF-6.4** | ⚠️ **sin tarea — ver abajo** |
| RF-2.1 | T-2 | RF-7.1 | T-2 |
| RF-2.2 | T-2 *(creación)* + T-3 *(pasada 3)* | RF-7.2 | T-2 |
| RF-2.3 | T-2 + T-3 | RF-7.3 | T-8 |
| RF-3.1 | T-3 | RF-8.1 | T-5 |
| RF-3.2 | T-3 | RF-8.2 | T-5 |
| RF-3.3 | T-3 | RF-8.3 | T-5 |
| RF-3.4 | T-3 | RF-9.1 | T-4 + T-7 |
| RF-4.1 | T-9 | RF-9.2 | T-7 |
| RF-4.2 | T-10 | RF-9.3 | T-4 |
| RF-4.3 | T-9 | RF-10.1 | T-10 |
| RF-5.1 | T-4 | RF-10.2 | T-10 |
| RF-5.2 | T-4 | RF-10.3 | T-10 |
| RF-5.3 | T-4 + T-6 | RNF-1 | T-9 |
| RF-5.4 | T-10 | RNF-2 | T-9 |
| RNF-3 | T-9 | RNF-4 | T-1 |
| RNF-5 | T-1 | RNF-6 | T-9 |

### Cláusulas negativas y estrictas, con dueño explícito

| Cláusula | Requisito | Tarea que la comprueba |
|---|---|---|
| `NO debe` emitir advertencias de presupuesto | RF-1.2 | T-9 |
| `DEBE` imprimir máx. 1 línea en verde | RF-1.3 | T-9 |
| `DEBE` imprimir salida completa en rojo | RF-1.4 | T-9 |
| `NO debe` contener archivos vacíos ni `index.ts` sin exportaciones | RF-2.2 | T-3, pasada 3 |
| `DEBE` nombrar el archivo infractor | RF-3.2 | T-3 |
| `NO debe` marcar `import type` ni relativo intra-capa | RF-3.3 | T-3, fixture `domain-import-type.ts` |
| `DEBE` haberse retirado la advertencia de las guías | RF-4.2 | T-10 |
| Se permite `transparent`, `currentColor`, `inherit` | RF-5.3 | T-4 |
| `DEBE` registrarse la decisión con su motivo | RF-5.4 | T-10 |
| `DEBE` mostrar visiblemente que es placeholder | RF-6.2 | T-6 |
| `NO debe` redirigir silenciosamente a la raíz | RF-6.3 | T-6 |
| `DEBE` existir verificación que falle si un token queda sin proveedor | RF-7.3 | T-8 |
| `NO debe` recurrir a la pila de fuentes de reserva | RF-8.2 | T-5, comprobación manual |
| `DEBE` usar `font-display: swap` | RF-8.3 | T-5 |
| `NO debe` heredar fondo transparente | RF-9.1 | T-4 |
| `NO debe` dejar la pantalla en blanco | RF-9.2 | T-7 |
| `DEBE` existir comentario de ausencia deliberada del modo claro | RF-9.3 | T-4 |
| `DEBE` actualizarse o declararse intencional cada aparición | RF-10.3 | T-10 |

### El único hueco de cobertura, declarado y no despachado

**RF-6.4** — *"implementar una página en un spec posterior no debe requerir modificar el archivo de rutas"* — **no tiene tarea en este spec, y no puede tenerla.** Es una propiedad de código que todavía no existe: ninguna verificación de T-6 puede demostrar lo que hará `002/02` con `app.routes.ts`.

No se despacha citando RF-6.1 ni la decisión DD-5. Lo que DD-5 hace es **crear la condición** para que RF-6.4 se cumpla (páginas en su ubicación final); comprobarlo es otra cosa.

**Cómo se cierra:** durante `/akili-execute` de `002/02`, `03` y `05`, si el diff toca `app.routes.ts`, el Reviewer marca **FAIL** citando RF-6.4 de este spec. Queda registrado como obligación heredada en el `execution.md` de este spec.

---

## Comprobación final

- [ ] Todos los requisitos de `requirements.md` tienen tarea, y cada escenario y cláusula tiene dueño en las tablas de arriba — con la única excepción de RF-6.4, declarada
- [ ] La suite completa pasa: `npm run test:agent`
- [ ] La prueba de arquitectura pasa **y su caso negativo falla**: `npm run test:arch`
- [ ] El lint pasa: `npm run lint:agent`
- [ ] La compilación de producción funciona y respeta el presupuesto gzip: `npm run build`
- [ ] `npm audit --audit-level=high` sin hallazgos
- [ ] Cero peticiones a orígenes externos: `node tools/check-external-origins.mjs`
- [ ] Los tokens usados provienen de `docs/ux-ui/design.md` §7 (cero hex sueltos)
- [ ] Revisión visual humana de las seis páginas placeholder en la pausa de aprobación (D8, sin compuerta automática)
- [ ] Sin `console.log` de depuración en el código entregado
- [ ] `execution.md` registra un PASS del Reviewer por cada tarea marcada `[x]`
- [ ] `execution.md` registra las dos enmiendas al TRD no aplicadas y la obligación heredada de RF-6.4
