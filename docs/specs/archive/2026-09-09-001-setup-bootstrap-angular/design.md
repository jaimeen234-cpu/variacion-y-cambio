# Diseño — Bootstrap del proyecto Angular

## 1. Document Control

| Campo | Valor |
|---|---|
| Spec | `docs/specs/001-setup-bootstrap-angular/` |
| Profundidad | **Standard** — confirmada contra el diseño terminado (§12) |
| Estado | **Aprobado** — Fase 2 aprobada por el usuario, 2026-09-08 |
| Fecha | 2026-09-08 |
| Requisitos | [`requirements.md`](requirements.md) |
| Delegación | Ninguna. Todo el diseño se hizo inline; la exploración fueron comprobaciones de entorno, no lectura de código (el repositorio no tiene código) |

### Presupuesto *(tripwire para `/akili-execute`)*

| Métrica | Estimación |
|---|---|
| Tareas | **11** *(10 originales + T-11, enmienda D-2)* |
| LOC escritas a mano | **~980** (excluye el andamiaje que genera el CLI) |
| Rondas de revisión | **~13** (11 tareas + ~2 reworks esperados) |

Si la ejecución excede esto, el Leader **se detiene y escala al usuario** en lugar de continuar. Exceder el presupuesto es información, no fracaso.

> **Revisión del presupuesto, 2026-09-09.** El original decía 10 tareas · ~940 LOC · ~12 rondas. La enmienda D-2 parte T-3 y añade **T-11** (~40 LOC: la pasada de alcanzabilidad). El usuario aprobó la ampliación con la decisión; queda registrada aquí para que el tripwire mida contra la cifra vigente y no dispare por un aumento ya autorizado.

---

## 2. Executive Summary

Se crea el proyecto con **Angular 21 LTS**, que resuelve tres cosas a la vez sin efectos colaterales: trae **Vitest** como runner por defecto (las pruebas de dominio corren en Node, sin navegador, que es exactamente lo que necesita un dominio libre de framework), trae **zoneless** por defecto, y **funciona con el Node ya instalado**.

Las dos piezas con diseño no obvio:

| Pieza | La decisión que la define |
|---|---|
| **Prueba de arquitectura** | Analiza los imports con la API del compilador de TypeScript (ya es dependencia del proyecto: cero dependencias nuevas) y **verifica su propio caso negativo en cada corrida** contra un *fixture* permanente con un import prohibido. Una compuerta que solo se ha visto pasar no es una compuerta |
| **Cadena de demostración hexagonal** | El puerto de ejemplo es un **reloj** — la costura que el [TRD ADR-005](../../trd/trd.md) exige después para que la simulación sea determinista. No es un ejemplo desechable: es infraestructura que se queda |

---

## 3. Architecture Overview

### 3.1 La cadena que atraviesa las cuatro capas

Para satisfacer RF-2.2 (capas habitadas), RF-7.1 y RF-7.3 con una sola pieza coherente:

```
ui/core/error-handler.ts                    ← Angular ErrorHandler global
        │ inyecta SELLAR_EVENTO
        ▼
application/diagnostico/sellar-evento.ts    ← caso de uso, clase plana
        │ recibe Reloj por constructor
        ▼
domain/shared/ports/reloj.ts                ← interfaz (el puerto)
domain/shared/model/sello-de-tiempo.ts      ← value object
        ▲
        │ implementa
infrastructure/tiempo/reloj-sistema.ts      ← adaptador de producción
infrastructure/tiempo/reloj-fijo.ts         ← adaptador determinista (pruebas y simulación)
infrastructure/di/{tokens,providers}.ts     ← InjectionToken + wiring

LEYENDA
  ▼ dependencia de compilación descendente
  ▲ inversión de dependencias: el adaptador conoce el puerto, el dominio no conoce al adaptador
```

**Por qué un reloj y no un repositorio de ejemplo.** Un repositorio de escenarios exigiría inventar modelo de dominio, que está fuera de alcance (B1) y sería trabajo tirado cuando `002/01` lo defina de verdad. El reloj, en cambio, ya está exigido: TRD ADR-005 requiere que el reloj se **inyecte** para que la simulación sea determinista y reproducible. Se construye una vez, aquí, y `002/01` la recibe hecha.

### 3.2 El caso de uso no puede usar `inject()`

`application/` no puede importar `@angular/core` (TRD §4). Así que un caso de uso **no** es un servicio de Angular: es una clase plana que recibe sus dependencias por constructor, y el *wiring* ocurre en `infrastructure/di/providers.ts` con `useFactory`.

Consecuencia práctica, y es la que hace que la demostración valga: probar un caso de uso no necesita `TestBed`, ni Angular, ni DOM. Se instancia con un doble y se llama. Eso es RF-7.2, y es el argumento que la docente puede verificar en diez segundos.

---

## 4. Extended Directory Structure

```
variacion-y-cambio/
├── .nvmrc                              ← fija la versión de Node del proyecto
├── angular.json                        ← presupuestos de bundle (RNF-1)
├── package.json                        ← scripts del contrato + engines
├── tools/
│   ├── arch-test.mjs                   ← RF-3 · API del compilador de TS
│   ├── bundle-budget.mjs               ← RNF-1 · mide gzip real
│   ├── check-external-origins.mjs      ← RF-8.1 · grep sobre el artefacto
│   └── fixtures/arch/                  ← fuera del tsconfig de la app
│       ├── domain-viola-angular.ts     ← import prohibido PERMANENTE
│       ├── application-viola-infra.ts  ← import prohibido PERMANENTE
│       └── domain-import-type.ts       ← caso válido: `import type` no infringe
└── src/
    ├── index.html
    ├── main.ts
    ├── app/
    │   ├── app.ts                      ← shell con <router-outlet>
    │   ├── app.config.ts               ← provideRouter + proveedores de infraestructura
    │   ├── app.routes.ts               ← RF-6 · tabla COMPLETA, no se toca después
    │   ├── domain/
    │   │   └── shared/
    │   │       ├── model/sello-de-tiempo.ts
    │   │       └── ports/reloj.ts
    │   ├── application/
    │   │   └── diagnostico/sellar-evento.ts
    │   ├── infrastructure/
    │   │   ├── tiempo/{reloj-sistema.ts,reloj-fijo.ts}
    │   │   └── di/{tokens.ts,providers.ts}
    │   └── ui/
    │       ├── core/{error-handler.ts,error-screen.ts}
    │       ├── shared/placeholder/placeholder.ts
    │       ├── pages/                  ← ubicación FINAL de cada página
    │       │   ├── inicio/inicio.ts
    │       │   ├── laboratorio/laboratorio.ts
    │       │   ├── conceptos/conceptos.ts
    │       │   ├── formulas/formulas.ts
    │       │   ├── cartilla/cartilla.ts
    │       │   └── no-encontrado/no-encontrado.ts
    │       └── styles/
    │           ├── _tokens.scss        ← ÚNICO archivo con valores de color
    │           ├── _base.scss
    │           └── _fonts.scss
    └── styles.scss
```

### Convención de nombres *(DD-7)*

El CLI de Angular 21 usa `fileNameStyleGuide: '2025'` por defecto: **sin sufijo de tipo** — `laboratorio.ts` exportando `class Laboratorio`, no `laboratorio.component.ts`. Se adopta tal cual en `ui/`, porque pelearse con el generador cuesta en cada componente del proyecto.

En `domain/`, `application/` e `infrastructure/` —territorio que la guía de estilo de Angular no gobierna— el nombre del archivo describe el concepto en kebab-case español y el directorio aporta el rol (`ports/`, `model/`, `di/`). Sin sufijos redundantes: `ports/reloj.ts` ya dice que es un puerto.

---

## 5. Data Model

Mínimo por diseño: este spec no modela dominio (B1).

| Artefacto | Capa | Forma | Invariante |
|---|---|---|---|
| `Reloj` | `domain/shared/ports` | Interfaz con una operación que devuelve los milisegundos actuales | Ninguna implementación en el dominio |
| `SelloDeTiempo` | `domain/shared/model` | Value object construido desde milisegundos, expone su representación ISO | Rechaza valores negativos o no finitos |
| `RelojSistema` | `infrastructure/tiempo` | Adaptador sobre el reloj del sistema | — |
| `RelojFijo` | `infrastructure/tiempo` | Adaptador determinista: devuelve un instante fijo y permite avanzarlo | Nunca retrocede |

`SelloDeTiempo` valida su entrada porque es el patrón que **todo** value object del proyecto va a seguir (`Voltios`, `Celsius`, `Watts` en `002/01`). Aquí se establece la forma con el caso más simple posible.

---

## 6. Contratos

No hay API HTTP (TRD ADR-002). Los contratos de este spec son tres:

### 6.1 Puertos

| Puerto | Operación | Contrato |
|---|---|---|
| `Reloj` | `ahora(): number` | Milisegundos desde epoch. No lanza. Determinista en `RelojFijo` |

### 6.2 Casos de uso

| Caso de uso | Firma | Contrato |
|---|---|---|
| `SellarEvento` | `constructor(reloj: Reloj)` · `ejecutar(descripcion: string): { descripcion, sello: SelloDeTiempo }` | Clase plana. Sin Angular. Sin efectos más allá de leer el reloj |

### 6.3 Tokens de inyección

| Token | Resuelve a | Registrado en |
|---|---|---|
| `RELOJ` | `RelojSistema` | `infrastructure/di/providers.ts` |
| `SELLAR_EVENTO` | `SellarEvento` vía `useFactory` inyectando `RELOJ` | ídem |

**RF-7.3 exige verificar que ningún token quede sin proveedor.** El diseño lo resuelve con una prueba que arranca la configuración **real** de la aplicación (la misma que usa `main.ts`, no una copia) y resuelve cada token exportado. Si alguien añade un token y olvida su proveedor, esa prueba falla. Una copia de la configuración en el archivo de prueba no serviría: pasaría verde mientras la real está rota.

---

## 7. Diseño de las herramientas de verificación

### 7.1 `tools/arch-test.mjs` — RF-3

**Entrada:** todos los `.ts` bajo `src/app/` más los *fixtures* de `tools/fixtures/arch/`.
**Método:** se parsea cada archivo con la API del compilador de TypeScript (`ts.createSourceFile`) y se recorren sus declaraciones de import. Nada de expresiones regulares: un `import` partido en varias líneas, dentro de un comentario o con comillas mezcladas rompe un regex y no rompe al parser.

**Tabla de reglas** — la misma del TRD §4, en un solo lugar:

| Capa | Permite | Prohíbe |
|---|---|---|
| `domain/` | solo `domain/` | `@angular/*`, `rxjs`, `chart.js`, `three`, `application/`, `infrastructure/`, `ui/` |
| `application/` | `domain/`, `application/` | `@angular/*`, `infrastructure/`, `ui/` |
| `infrastructure/` | `domain/`, `application/`, `infrastructure/`, `@angular/*`, `rxjs` | `ui/` |
| `ui/` | todo | — |

**Cómo se lee esta tabla — la columna que manda es `Prohíbe` (enmienda D-1, aprobada 2026-09-09).** Las dos columnas se contradecían para la misma fila: bajo *Permite* (lista blanca), `import { describe } from 'vitest'` en un `.spec.ts` de `domain/` es una infracción; bajo *Prohíbe* (lista negra), es legal. El script implementa **lista negra**: un especificador de paquete npm que no aparece en la columna *Prohíbe* de su fila está **permitido**. La columna *Permite* queda como resumen de intención, no como regla ejecutable.

El motivo no es comodidad: **TRD TEST-2 enumera una lista cerrada de prohibiciones**, no una lista blanca, y la tabla de este spec dice ser "la misma del TRD §4". Una lista blanca haría fallar la pasada 1 por construcción en cuanto exista la primera prueba unitaria de dominio — es decir, inmediatamente. El precio de la lista negra está declarado: un paquete nuevo y nocivo entra sin avisar hasta que alguien lo añade a la fila. Se acepta porque el conjunto de prohibiciones que importan (Angular, RxJS, Chart.js, Three) es estable y está en el TRD.

Fixture obligatorio de esta decisión: `domain-usa-vitest.ts` — importa `vitest`, y la pasada 2 **no** debe marcarlo. Sin ese fixture la decisión es prosa; con él, es una prueba.

**Exclusiones deliberadas** (RF-3.3): las declaraciones `import type` no cuentan, porque desaparecen en compilación y no crean acoplamiento en tiempo de ejecución. Los imports relativos se resuelven a su capa antes de evaluarse, de modo que `../../ui/algo` sí se detecta aunque sea relativo.

**Auto-verificación en cada corrida.** El comando hace dos pasadas:

1. `src/app/` **debe** salir limpio.
2. `tools/fixtures/arch/` **debe** producir exactamente las infracciones esperadas, declaradas en el propio script.

Si la segunda pasada no encuentra las infracciones que el fixture contiene a propósito, el comando falla **aunque el código de la aplicación esté impecable**. Eso es lo que impide que la compuerta se degrade en silencio a un no-op: un script que dejara de analizar archivos aprobaría la pasada 1 y **suspendería** la pasada 2.

**Una tercera pasada llega más tarde, y no por descuido (enmienda D-2, aprobada 2026-09-09).** La comprobación de alcanzabilidad de RF-2.2 — seguir los imports relativos desde `main.ts` y verificar que se alcanza al menos un archivo de **cada** capa — vive en este mismo script, pero **no puede escribirse hasta que exista `src/app/ui/`**, y `ui/` no nace hasta T-6. Escrita antes, falla por construcción y por una razón que no es un defecto de nadie.

Por eso la pasada 3 es su propia tarea (**T-11**), colocada tras T-6. La alternativa —retrasar todo T-3 hasta después de T-6— dejaría cuatro tareas escribiendo código sin la compuerta de arquitectura, que es el entregable central del spec. Una tarea de más es más barata que cuatro tareas sin red.

**Entrada que la haría fallar** (exigida por la §8 de requisitos): añadir `import { signal } from '@angular/core'` a cualquier archivo de `domain/`.

### 7.2 `tools/bundle-budget.mjs` — RNF-1

Los presupuestos nativos del CLI de Angular miden tamaño **sin comprimir**; el TRD PERF-3 habla de **< 500 KB comprimido**. Usar solo el presupuesto del CLI sería una compuerta que no mide lo que la afirmación dice — el defecto exacto que la §8 de requisitos existe para evitar.

Diseño en dos niveles:

| Nivel | Qué mide | Umbral |
|---|---|---|
| Presupuesto del CLI en `angular.json` | Tamaño sin comprimir del chunk inicial | Advertencia 1,0 MB · **Error 1,4 MB** (guarda gruesa) |
| `tools/bundle-budget.mjs`, tras el build | **Suma gzip real** de los archivos del chunk inicial | **Error 500 KB** |

**Entrada que lo haría fallar:** instalar e importar una librería grande desde `ui/`.

### 7.3 `tools/check-external-origins.mjs` — RF-8.1

Recorre el artefacto de producción buscando referencias `http://` y `https://` en JS, CSS y HTML, con una lista blanca vacía. **Entrada que lo haría fallar:** añadir un `<link>` a `fonts.googleapis.com` en `index.html`.

Limitación declarada: detecta URLs **literales**. Una URL construida por concatenación en tiempo de ejecución se le escapa. Se acepta el riesgo — el proyecto no tiene motivo para construir URLs, y el control real es la revisión del diff más la comprobación manual de la pestaña de red (RF-8.2).

---

## 8. Frontend / UX Component Architecture

### 8.1 Tokens — `ui/styles/_tokens.scss`

Único archivo del proyecto con valores de color literales (RF-5.3). Declara todo el catálogo de [`design.md` §7](../../ux-ui/design.md) como variables CSS en `:root`, **con la procedencia anotada por grupo**:

| Grupo | Procedencia | Estado |
|---|---|---|
| Acentos (`primary`, `info`, `success`, `warning`, `danger`) | `blk-design-system@1.0.2` → `custom/_variables.scss` | ✅ **Verificado** |
| Estados de acento (`primary-states` = `#ba54f5`) | ídem | ✅ Verificado |
| Gradiente de tarjeta (`#1e1e2f` → `#1e1e24`) | `blk-design-system@1.0.2` → `custom/_misc.scss` | ✅ Verificado |
| Tipografía (`Poppins`) | ídem, `$font-family-base` | ✅ Verificado |
| **Superficies** (`bg-base`, `bg-surface`, `bg-elevated`) | **Black Dashboard**, no el kit BLK | ⚠️ **Desviación declarada — DD-2** |
| Espaciado, radio, sombra, movimiento, breakpoints | Propios del proyecto | Declarados |

### 8.2 Páginas placeholder

Seis componentes, **cada uno en su ubicación final** (`ui/pages/<pagina>/<pagina>.ts`). Cada uno renderiza el componente compartido `ui/shared/placeholder/placeholder.ts` con su nombre y el spec que lo va a implementar.

**Por qué seis componentes y no uno compartido ruteado.** Si la tabla de rutas apuntara a un único placeholder genérico, implementar una página obligaría a cambiar el `loadComponent` de esa ruta — y eso viola RF-6.4, que es justo lo que hace paralelizables a `02`, `03` y `05`. Con el componente en su ubicación final, el spec posterior **reescribe el contenido de ese archivo** y no toca las rutas.

El placeholder muestra visiblemente que lo es (RF-6.2): nombre de la página, el spec responsable y una marca inequívoca. Nadie debe poder confundirlo con una página terminada, ni en una captura de pantalla.

### 8.3 Pantalla de error

`ui/core/error-screen.ts` — dentro de la identidad visual, con el mensaje, el sello de tiempo del evento (vía `SELLAR_EVENTO`) y una acción de recarga. Sin trazas técnicas visibles al usuario; la traza va a `console.error`.

### 8.4 Estados de UI

Este spec produce placeholders, así que los estados de carga, error, vacío y éxito de las **pantallas reales** pertenecen a los specs de `002`. Lo único con estados propios aquí es la pantalla de error (§8.3) y el estado de carga diferida de las rutas, que Angular cubre con su propio ciclo.

---

## 9. Design Decisions

### DD-1 — Angular 21 LTS, no el CLI global 20 ni el 22 último

- **Problema:** el CLI global instalado es 20.1.5; el último publicado es 22.1.5.
- **Decisión:** crear el proyecto con **Angular 21 LTS** (`npx @angular/cli@v21-lts`), con `--style=scss`.
- **Evidencia verificada en esta fase:**

  | Angular | Node exigido | ¿Node 22.18.0? | Runner por defecto | Zoneless |
  |---|---|---|---|---|
  | 20.3.30 LTS | `^20.19 \|\| ^22.12 \|\| >=24` | ✅ | **Karma (deprecado)** | no |
  | **21.2.22 LTS** | `^20.19 \|\| ^22.12 \|\| >=24` | ✅ | **Vitest** | **sí** |
  | 22.1.5 | `^22.22.3 \|\| ^24.15 \|\| >=26` | ❌ | Vitest | sí |

- **Alternativas:** (a) Angular 20 con el CLI global — rechazada: adoptaría Karma, que está deprecado y ya fue reemplazado, en un proyecto nuevo que será evaluado. (b) Angular 22 subiendo Node a 24 LTS — rechazada por ahora: obliga a cambiar la instalación de Node del usuario a mitad de un proyecto con fecha de entrega, y el beneficio sobre 21 LTS es nulo para este trabajo.
- **Implicaciones:** Vitest corre las pruebas de dominio en Node sin navegador — exactamente lo que un dominio libre de framework necesita, y más rápido. Se fija `.nvmrc` y `engines` para que la restricción quede explícita. Subir a 22 después es `ng update` más un bump de Node.
- **Nota sobre la guía de la skill:** su regla de ejecución dice usar el CLI local si `ng version` responde. Se desvía a propósito: esa regla presupone que el CLI local está al día, y aquí está dos majors atrás.
- **Revisar si:** el usuario sube Node por otra razón, o Angular 21 sale de soporte.

### DD-2 — Paleta híbrida: acentos de BLK, superficies de Black Dashboard

- **Problema:** al verificar `design.md` §7 contra el SCSS real de BLK, los acentos coincidieron exactamente, pero **las superficies no**. El kit BLK usa `$background-black: #171941` y `$card-black-background: #1f2251`; `design.md` §7 declaraba `#1e1e2f` / `#27293d` / `#2b3553`, que provienen de **Black Dashboard**, otro producto de Creative Tim.
- **Decisión:** conservar las superficies de Black Dashboard y adoptar los acentos y gradientes verificados de BLK. Registrar la procedencia **por grupo de tokens** en `design.md` §7 (§8.1 de este documento).
- **Argumento:** dos razones convergentes. (1) Esta aplicación tiene forma de **dashboard** —gráficas, tabla en vivo, tarjetas de métrica—, que es el producto para el que se diseñó esa paleta; el kit BLK es de landing. (2) El mock construido con esas superficies **ya fue validado visualmente por el usuario**, que es la única evidencia disponible sobre apariencia y no debe tirarse.
- **Alternativas:** (a) adoptar `#171941`/`#1f2251` para ser fiel al kit — rechazada: cambia la apariencia ya aprobada sin ganancia funcional. (b) Rehacer §7 entera sobre el kit BLK — rechazada por lo mismo, con más trabajo.
- **Implicaciones:** `design.md` §7 deja de afirmar "portados del SCSS de BLK" en bloque y pasa a declarar procedencia por grupo. La afirmación anterior era imprecisa y esta decisión la corrige.
- **Sobre la licencia:** `blk-design-system@1.0.2` declara MIT en el badge y el enlace de su README, y "Creative Tim License" en el campo `license` de `package.json` — metadatos inconsistentes del propio paquete. Se copian **valores numéricos de tokens**, no código ni assets, y el paquete **no** queda como dependencia. Queda registrado como hecho, sin interpretación jurídica.
- **Revisar si:** el usuario prefiere fidelidad al kit por encima de lo ya validado.

### DD-3 — Prueba de arquitectura con la API del compilador de TypeScript

- **Problema:** hay que detectar imports prohibidos de forma fiable y explicable.
- **Decisión:** script propio con `ts.createSourceFile`. `typescript` ya es dependencia de cualquier proyecto Angular: **cero dependencias nuevas**.
- **Alternativas:** (a) `dependency-cruiser` — potente y MIT, pero suma una dependencia y su configuración para algo que son ~90 líneas. (b) Reglas `no-restricted-imports` de ESLint por directorio — elegante, pero fusionaría `test:arch` con `lint:agent` y RF-4.1 pide comandos separados; además una regla de lint se silencia con un comentario `eslint-disable`, y esta frontera no debe poder silenciarse. (c) Expresiones regulares sobre el texto — rechazada: un import multilínea o dentro de un comentario rompe el regex, y un falso negativo aquí es invisible.
- **Implicaciones:** la restricción C9 (el equipo debe poder explicar cada decisión) se cumple mejor con 90 líneas propias que con un `.dependency-cruiser.json` heredado. Es también el artefacto que se le muestra a la docente cuando pregunte cómo se garantiza la separación de capas.
- **Revisar si:** las reglas crecen hasta necesitar ciclos, huérfanos o métricas de acoplamiento — ahí `dependency-cruiser` gana.

### DD-4 — Fuentes empaquetadas vía `@fontsource`

- **Problema:** PRD C7 prohíbe depender de internet, y las fuentes por CDN son la fuga más común.
- **Decisión:** `@fontsource/poppins` y `@fontsource/jetbrains-mono` (**verificados: OFL-1.1**), importando solo los pesos que los tokens declaran.
- **Alternativas:** descargar los `.woff2` a mano — igual de válido pero sin gestión de versiones ni licencia declarada en el manifiesto.
- **Implicaciones:** OFL-1.1 es permisiva y compatible con PRD C1. Los archivos viajan en el artefacto, así que cuentan contra RNF-1: se limitan los pesos y se usa `font-display: swap`.

### DD-5 — Seis páginas en su ubicación final

Ver §8.2. La decisión es lo que sostiene RF-6.4 y, con ello, el paralelismo declarado en `002/family.md`.

### DD-6 — El puerto de demostración es un reloj

Ver §3.1. No es un ejemplo desechable: TRD ADR-005 lo exige para el determinismo de la simulación.

### DD-7 — Nombres: guía 2025 en `ui/`, explícitos en las demás capas

Ver §4. Se sigue el default del CLI donde el CLI genera, y una convención propia donde no.

### DD-8 — Presupuesto de bundle en dos niveles

Ver §7.2. El presupuesto del CLI mide sin comprimir; la afirmación del TRD es sobre comprimido. Un solo nivel dejaría la compuerta midiendo otra cosa que la que se afirma.

### DD-9 — Verificación de proveedores contra la configuración real

Ver §6.3. Una prueba que copiara la configuración pasaría verde mientras la real está rota.

---

## 10. Impacto constitucional

Cambios que este spec introduce en documentos constitucionales. Todos están nombrados como entregables del spec, lo que activa la excepción de la regla de escritura en archivos compartidos.

| Documento | Cambio | Requisito |
|---|---|---|
| `docs/ux-ui/design.md` §7 | Procedencia por grupo de tokens; GQ-1 marcada como resuelta; corrección de la afirmación sobre las superficies | RF-5.2, RF-5.4, RF-10.2 |
| `AGENTS.md` / `CLAUDE.md` | Tabla de comandos sin la advertencia de inexistencia | RF-4.2, RF-10.1 |
| `docs/trd/trd.md` TA-5 | Supuesto resuelto: el runner es **Vitest** (Angular 21) | — |
| `docs/trd/trd.md` TA-6 | Node fijado por `.nvmrc` y `engines` | — |

### Dos enmiendas al TRD que este spec **no** aplica, y que hay que no perder

| Hallazgo | Por qué no se aplica aquí |
|---|---|
| [TRD §8](../../trd/trd.md) dice **Reactive Forms**. Angular 21 introduce **Signal Forms**, y la skill `angular-developer` las prefiere para formularios nuevos | Este spec no construye ningún formulario. La decisión pertenece a `002/02`, que construye el panel de controles. Aplicarla aquí sería decidir sobre código que no existe |
| TRD §8 no menciona **zoneless**, que en Angular 21 es el default | Es un hecho de la plataforma, no una decisión de este spec. Se registra en `execution.md` y se sincroniza en `/akili-archive` |

---

## 11. Estrategia de pruebas

| Requisito / cláusula | Nivel | Ubicación | Nota |
|---|---|---|---|
| RF-1.1 – RF-1.4 | Manual + CI | Comprobación en `execution.md` | Ejecutar los cuatro comandos y registrar el resultado |
| RF-2.2 (capa habitada) | Automática | `tools/arch-test.mjs` | Verifica alcanzabilidad desde el arranque, no solo existencia |
| RF-2.3, RF-3.1 | Automática | `tools/arch-test.mjs` pasada 1 | `src/app/` limpio |
| **RF-3.2 (caso negativo)** | Automática | `tools/arch-test.mjs` pasada 2 | Fixtures permanentes. **Se verifica en cada corrida** |
| RF-3.3 (`import type` no infringe) | Automática | fixture `domain-import-type.ts` | Caso válido que **no** debe marcarse |
| RF-3.4 (`application/` también) | Automática | fixture `application-viola-infra.ts` | |
| RF-4.1, RF-4.2 | Automática | Prueba que compara `scripts` con la tabla de las guías | |
| RF-4.3 | Manual | `execution.md` | Filtro de un solo archivo |
| RF-5.1, RF-5.2 | Automática | Prueba que diff-ea la lista de hex contra los valores verificados de BLK | No basta con que el token exista |
| RF-5.3 (cero hex sueltos) | Automática | `grep` sobre `src/` excluyendo `_tokens.scss` | |
| RF-6.1 – RF-6.3 | Componente | `RouterTestingHarness` | Navegar a las seis rutas |
| **RF-6.4** | ⚠️ **No verificable automáticamente** | — | Es una propiedad de specs futuros. Se cubre en la revisión del diff de `002/02`, `03` y `05`: si tocan `app.routes.ts`, el Reviewer marca FAIL |
| RF-7.1, RF-7.3 | Automática | Prueba que arranca `app.config.ts` real y resuelve cada token | |
| RF-7.2 | Automática | Prueba de `SellarEvento` con un **doble local del puerto `Reloj`**, **sin `TestBed`** | |
| RF-8.1 | Automática | `tools/check-external-origins.mjs` | Solo URLs literales (limitación declarada) |
| RF-8.2 | Manual | `execution.md` | Cargar con la red deshabilitada y confirmar la tipografía |
| RF-9.1, RF-9.3 | Automática | Prueba de estilos base + `grep` de la ausencia de bloque light | |
| RF-9.2 | Componente | Prueba que lanza una excepción y verifica la pantalla | |
| RF-10.3 (barrido) | Manual | `execution.md` | `grep` del valor anterior en todo `docs/` |
| RNF-1 | Automática | `tools/bundle-budget.mjs` | **Descalificador:** si el build no produjo el chunk inicial, no hay medición — se reporta **inconcluso**, no aprobado |
| RNF-2 | Manual medida | `execution.md` | **Descalificador:** si la corrida se hizo con otro proceso compilando en paralelo, el tiempo no es evidencia (regla CC-2) |
| RNF-3 | Automática | `npm audit --audit-level=high` | |
| RNF-6 | Manual | `execution.md` | Listar licencias de dependencias de runtime |
| **D8 (apariencia)** | ⚠️ **Sin compuerta automática** | Revisión humana en la pausa de aprobación | Declarado en requisitos §8 |

**Dos requisitos no tienen compuerta automática y se declaran en lugar de disimularse:** RF-6.4 (es una propiedad de specs futuros, no de este código) y D8 (apariencia visual). Ambos tienen sustituto humano nombrado.

---

## 12. Riesgos y alternativas descartadas

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| La prueba de arquitectura da falsos positivos con imports relativos o de tipos | Media | Medio | Los tres fixtures cubren los tres casos límite, incluido el que **no** debe marcarse |
| El presupuesto gzip de 500 KB queda muy justo al añadir las fuentes | Media | Bajo | Se limitan los pesos de fuente; si aprieta, se mide y se ajusta el umbral **con la medición registrada**, nunca "porque no cabía" |
| Vitest en Angular 21 con pruebas de dominio en Node podría necesitar configuración de entorno por archivo | Media | Bajo | Las pruebas de dominio no tocan DOM; si el entorno por defecto es `jsdom`, se declara `node` por patrón de archivo |
| `npx @angular/cli@v21-lts` descarga ~100 MB la primera vez | Alta | Nulo | Es una sola vez y no requiere internet en el aula |
| El usuario prefiere fidelidad total al kit BLK sobre lo ya validado | Baja | Medio | DD-2 lo deja explícito y es reversible: es un grupo de tokens en un archivo |

### Resultado del challenge de reversiones *(Paso 2.3)*

**Ejecutado. Sin disparadores.** Ninguna decisión de este diseño elimina, desactiva o invierte comportamiento ya entregado: el repositorio no entrega comportamiento todavía.

El caso más cercano a un disparador es DD-2, que **corrige** una afirmación de `design.md` §7 sobre la procedencia de las superficies. Se examinó y **no es una reversión**: conserva los valores que el mock ya validó y solo corrige lo que el documento afirmaba sobre su origen. Si la decisión hubiera sido la contraria —cambiar las superficies a las del kit BLK— sí habría sido una reversión de apariencia ya aprobada, y habría exigido el challenge completo.

### Confirmación de profundidad *(Paso 2.4)*

10 tareas, ~940 LOC, ~12 rondas — **11 · ~980 · ~13 tras la enmienda D-2 del 2026-09-09**, que no cambia el veredicto. **Coincide con Standard.** No baja a Lite (diez tareas y tres herramientas de verificación no son un cambio cosmético) ni sube a Full (no hay migración, ni API, ni auth, ni despliegue previo que pueda romperse).
