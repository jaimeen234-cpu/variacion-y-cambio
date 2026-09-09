# Tareas — Dominio y modelo funcional

| Campo | Valor |
|---|---|
| Spec | `docs/specs/002-feature-experiencia-variacion-cpu/01-dominio-modelo-funcional/` |
| Diseño | [`design.md`](design.md) — aprobado 2026-09-08 |
| Requisitos | [`requirements.md`](requirements.md) — aprobado 2026-09-08 |
| Estado | **Pendiente** |
| Presupuesto | 15 tareas · ≈ 4.110 LOC · ≈ 19 rondas de revisión *(cable trampa: si se excede, el Leader escala, no continúa)* |

---

## Notas de verificación que aplican a todas las tareas

**El comando por tarea es seguro, y se comprobó.** `npm run test:agent -- --include='**/<archivo>.spec.ts'` con un patrón que no coincide con nada **sale con código 1**, no en verde con cero pruebas. Verificado en este repositorio el 2026-09-08: el patrón inexistente falla con *«Included: … Please check the 'test' target configuration»*. Así que una tarea que olvide escribir su archivo de pruebas **falla**; no aprueba en silencio. Por eso ningún comando de esta lista va marcado `provisional`.

**Aun así, cada tarea declara su número de pruebas esperado.** El runner imprime `✔ Tests: N passed (N)`. Si el número real es menor que el declarado, la verificación es **inconcluso**, no aprobado: significa que faltan escenarios por cubrir aunque los escritos pasen (convención E4).

**`npm run test:agent` no es puerta de tipos.** Vitest transpila con esbuild y no comprueba tipos. Cualquier requisito que se verifique en compilación usa `npx tsc -p tsconfig.spec.json --noEmit` — verificado: hoy sale limpio y falla con `TS2578` ante un `@ts-expect-error` inútil. Afecta solo a T-1.

**Sobre paralelizar.** Donde se dice *«sí (worktree aparte)»* es por la regla CC-3 de las guías raíz: dos tareas simultáneas exigen archivos distintos **y** ninguna salida de build compartida. Todas estas tareas comparten `node_modules/`, `.angular/cache` y el runner, así que ejecutarlas a la vez en el mismo checkout produce errores absurdos en el agente equivocado. Archivos distintos no basta.

---

## Grafo de dependencias

```
T-1 (magnitudes) ──┬──► T-2 (serie + RCP) ─────────────────────────────┐
                   │                                                    │
                   └──► T-3 (entidades) ──┬──► T-4 (config + resultado) ─┤
                                          ├──► T-5 (potencia) ──┐        │
                                          ├──► T-6 (térmico) ───┤        │
                                          ├──► T-7 (throttling) ┤        │
                                          └──► T-13 (puertos + JSON + DI)│
                                                                 │       │
                          T-4 + T-5 + T-6 + T-7 ──► T-8 (simulador) ──► T-9 (métricas) ──► T-10 (comparador)
                                                                 │       │                      │
T-11 (catálogo) ─────────────────────────────────────────────────┴───────┴──► T-12 (coherencia)  │
                                                                                                 │
                          T-2 + T-8 + T-9 + T-10 + T-13 ─────────────────────────► T-14 (casos de uso)

T-15 (anotar deriva) ── independiente de todo
```

*Leyenda:* las flechas son «depende de» · lo apilado en la misma columna es paralelizable entre sí, siempre en worktrees separados.

**Paralelizables:** `{T-2, T-3}` · `{T-5, T-6, T-7}` · `{T-11, T-15}` con cualquiera · `{T-13}` con `{T-5, T-6, T-7, T-8}`
**Serie forzada:** T-8 depende de cuatro tareas y es el único punto donde el modelo se integra · T-12 depende de que existan **todas** las fórmulas implementadas, por eso va casi al final

---

## Tareas

### [ ] T-1 — Magnitudes físicas con marca nominal y errores de dominio

- **Capa:** `domain/shared/model/`, `domain/shared/errors/`
- **Depende de:** ninguna
- **Paralelizable:** no *(es la base de todo lo demás)*
- **Requisitos:** RF-1.1, RF-1.2, RF-1.3, **RF-1.4**, RNF-7
- **Diseño:** §3.1, §8, **DD-2**, **DD-3**, **DD-4**
- **Skills:** `tdd` *(lógica pura con valores esperados conocidos)*, `error-handling-patterns` *(taxonomía tipada)*
- **Ejemplar:** `src/app/domain/shared/model/sello-de-tiempo.ts` — imitar su estructura, su JSDoc en español, `public readonly`, y el estilo de `sello-de-tiempo.spec.ts`
- **Alcance:**
  - `errores-de-dominio.ts`: base abstracta `ErrorDeDominio` + `RangoInvalidoError` con el valor recibido y los dos extremos del rango en el mensaje.
  - Seis magnitudes — `Voltios`, `Watts`, `Celsius`, `Hertz`, `Segundos`, `Adimensional` — cada una con su rango de §3.1 y **un miembro `private readonly` distinto** que la haga nominalmente incompatible con las demás (DD-3).
  - `Hertz` expone además su lectura en GHz. El factor `1e9` se escribe **una sola vez en todo el proyecto**, aquí.
  - `unidades-incompatibles.spec.ts`: un `@ts-expect-error` por cada par incompatible que el código real vaya a cruzar (V↔W, °C↔s, Hz↔W como mínimo).
- **Fuera de alcance:** `UnidadDerivada` y `Serie` (son T-2). Las cinco clases de error restantes de §8 (las crea la tarea que las lanza).
- **Verificación:**
  1. `npm run test:agent -- --include='**/domain/shared/**/*.spec.ts'` → **≥ 24 pruebas** (4 por magnitud como mínimo: válido, fuera de rango, tres no finitos, símbolo).
  2. `npx tsc -p tsconfig.spec.json --noEmit` → exit 0.
- **Qué invalida la evidencia:** si el conteo de pruebas baja de 24, faltan escenarios: **inconcluso**. Y el punto 1 en verde **no dice nada** sobre RF-1.4 — sin el punto 2, ese requisito está sin verificar.
- **Entrada que la haría fallar:** quitar el `private readonly` de una magnitud ⇒ la asignación pasa a ser legal, el `@ts-expect-error` queda sin usar y `tsc` falla con `TS2578`. Recortar al extremo en lugar de lanzar ⇒ falla RF-1.2.
- **Hecho cuando:**
  - [ ] Las seis magnitudes rechazan fuera de rango y los tres valores no finitos, **sin** construir el objeto (RF-1.2, RF-1.3)
  - [ ] El mensaje de `RangoInvalidoError` contiene el valor recibido **y** los dos extremos
  - [ ] `npx tsc -p tsconfig.spec.json --noEmit` sale limpio y hay al menos tres pares con `@ts-expect-error`
  - [ ] Cero imports de `@angular/*` en los archivos nuevos
  - [ ] Las dos verificaciones pasan en verde

---

### [ ] T-2 — `Serie`, `UnidadDerivada` y razón de cambio promedio

- **Capa:** `domain/shared/model/`, `domain/shared/services/`
- **Depende de:** T-1
- **Paralelizable:** sí, con T-3 *(worktree aparte)*
- **Requisitos:** RF-5.1, RF-5.2, RF-5.3, RF-5.4, RF-5.5, RF-5.6
- **Diseño:** §3.2, **DD-7**, **DD-8**
- **Skills:** `tdd`
- **Ejemplar:** las magnitudes de T-1, ya escritas
- **Alcance:**
  - `UnidadDerivada`: par (numerador, denominador) con símbolo compuesto.
  - `Serie`: value object inmutable con sus puntos y **sus dos símbolos de unidad**.
  - `RazonDeCambioPromedio` (servicio sin estado): `entre(serie, a, b)`, `entreConsecutivos(serie)`, `compararIntervalos(serie, i1, i2)`.
  - Tolerancia de `compararIntervalos`: **1 % del mayor de los dos valores absolutos** (decisión del usuario, `requirements.md` Q4).
- **Fuera de alcance:** construir series a partir de un `ResultadoSimulacion` (es T-9/T-14); dibujar la secante (hija `02`).
- **Verificación:** `npm run test:agent -- --include='**/razon-de-cambio-promedio.spec.ts'` → **≥ 12 pruebas**
- **Qué invalida la evidencia:** una prueba que solo compruebe la ausencia del valor en el caso inexistente **no cubre RF-5.3**: el requisito exige que `0`, `NaN` e `Infinity` también sean rechazados, así que hacen falta aserciones explícitas contra los tres. Si no están, inconcluso.
- **Entrada que la haría fallar:** devolver `0` cuando no hay punto anterior ⇒ falla RF-5.3 y RF-5.4. Omitir el primer elemento de `entreConsecutivos` en lugar de dejarlo inexistente ⇒ falla RF-5.4 por longitud de lista.
- **Hecho cuando:**
  - [ ] Con `a = b` el resultado es inexistente, y la prueba falla ante `0`, `NaN` e `Infinity` (RF-5.3)
  - [ ] `entreConsecutivos` devuelve `n` elementos con el primero inexistente, y con serie de un punto devuelve un elemento (RF-5.4, RF-5.6)
  - [ ] Las tres unidades derivadas salen como `°C/s`, `W/V` y `GHz/s` (RF-5.2)
  - [ ] `compararIntervalos` **no** afirma que difieren dentro del 1 % (RF-5.5)
  - [ ] La verificación pasa en verde

---

### [ ] T-3 — Entidades del escenario

- **Capa:** `domain/thermal/model/`
- **Depende de:** T-1
- **Paralelizable:** sí, con T-2 *(worktree aparte)*
- **Requisitos:** RF-1.1 *(uso de las magnitudes)*, RF-10.1 *(forma de la entidad)*
- **Diseño:** §3.3, **DD-2**
- **Skills:** `tdd`
- **Alcance:** `EspecificacionCpu`, `EspecificacionDisipador`, `EscenarioTermico` con las invariantes de §3.3 verificadas en el constructor. `EscenarioTermico` lleva `disipadorPorDefectoId`, **no** un disipador embebido (deriva DR-10).
- **Fuera de alcance:** `ConfiguracionSimulacion` (es T-4); leer los datos del JSON (es T-13).
- **Verificación:** `npm run test:agent -- --include='**/domain/thermal/model/especificacion-*.spec.ts' --include='**/escenario-termico.spec.ts'` → **≥ 10 pruebas**
- **Qué invalida la evidencia:** probar solo el camino feliz. Cada invariante de §3.3 necesita su caso que la viola; si el conteo es menor que el número de invariantes más los casos válidos, inconcluso.
- **Entrada que la haría fallar:** una `EspecificacionCpu` con `tempThrottle ≥ tempCritica`, o un disipador con `R = 0`, deben lanzar.
- **Hecho cuando:**
  - [ ] Cada invariante de §3.3 tiene una prueba que la viola y espera el error
  - [ ] Las entidades son inmutables (`readonly` en todos los campos)
  - [ ] `EscenarioTermico` referencia el disipador por identificador, no por objeto
  - [ ] Cero imports de `@angular/*`
  - [ ] La verificación pasa en verde

---

### [ ] T-4 — Configuración y tipos del resultado

- **Capa:** `domain/thermal/model/`
- **Depende de:** T-1, T-3
- **Paralelizable:** no *(T-5…T-8 lo consumen)*
- **Requisitos:** **RF-6.6**, **RF-6.7**
- **Diseño:** §3.3, §3.4, §8
- **Skills:** `tdd`, `error-handling-patterns`
- **Alcance:**
  - `ConfiguracionSimulacion` con las invariantes de §3.3, lanzando `ConfiguracionInvalidaError` **antes** de que nadie itere.
  - `PasoSimulacion`, `EventoSimulacion`, `ResultadoSimulacion`, `MetricasResumen` como tipos inmutables de §3.4.
- **Fuera de alcance:** calcular las métricas (es T-9). **Nada de `trabajoAcumulado`, `trabajoUtilTotal` ni `eficiencia`** (derivas DR-2, DR-3 — es acumulación, prohibida por PRD C12).
- **Verificación:** `npm run test:agent -- --include='**/configuracion-simulacion.spec.ts' --include='**/resultado-simulacion.spec.ts'` → **≥ 8 pruebas**
- **Qué invalida la evidencia:** que la prueba de RF-6.6 compruebe que la corrida se trunca en lugar de que lanza. Truncar en silencio es exactamente lo que el requisito prohíbe.
- **Entrada que la haría fallar:** `paso = 0` y `paso = −1` deben lanzar (RF-6.7); `horizonte/paso = 601` debe lanzar (RF-6.6).
- **Hecho cuando:**
  - [ ] `paso ≤ 0` lanza error tipado (RF-6.7)
  - [ ] Más de 600 pasos lanza error tipado, sin truncar (RF-6.6)
  - [ ] Ningún tipo de §3.4 contiene un campo de acumulación
  - [ ] La verificación pasa en verde

---

### [ ] T-5 — `ModeloPotencia` (F1, F2, F3)

- **Capa:** `domain/thermal/services/`
- **Depende de:** T-1, T-3
- **Paralelizable:** sí, con T-6 y T-7 *(worktree aparte)*
- **Requisitos:** RF-2.1, RF-2.2, RF-2.3, RF-2.4, RF-2.5
- **Diseño:** §3.1, §7 *(calibración)*
- **Skills:** `tdd` — **effort `max`**: es fundamentación matemática, criterio 1 de la rúbrica
- **Alcance:** potencia dinámica `P_din = α·C·V²·f`, estática `P_est = P_est₀·(V/V_nom)` y total. Declarar los identificadores de fórmula que implementa, para el registro de T-12.
- **Fuera de alcance:** el catálogo de fórmulas (es T-11).
- **Verificación:** `npm run test:agent -- --include='**/modelo-potencia.spec.ts'` → **≥ 8 pruebas**
- **Qué invalida la evidencia:** **un valor esperado obtenido ejecutando el código es una tautología y no cubre nada** (RNF-3). Los valores de este spec están calculados de forma independiente y aparecen literales en `requirements.md`: **88,128 W**, **12 W**, **100,128 W**. Cualquier otro valor esperado necesita su cálculo a mano documentado en `execution.md`, o la evidencia no vale.
- **Entrada que la haría fallar:** cambiar `V*V` por `V` ⇒ 88,128 W pasa a 73,44 W. Fijar el exponente en 1,9 ⇒ RF-2.1 seguiría cerca pero RF-2.2 daría 3,73 en vez de 4.
- **Hecho cuando:**
  - [ ] `P_din = 88,128 W` con los valores de RF-2.1 y `P = 100,128 W` con los de RF-2.4
  - [ ] Duplicar `V` cuadruplica `P_din`, probado como **propiedad sobre tres pares** de voltajes (RF-2.2)
  - [ ] Con `α = 0` la potencia total es igual a la estática y **no** es 0 W (RF-2.5)
  - [ ] Cero imports de `@angular/*`
  - [ ] La verificación pasa en verde

---

### [ ] T-6 — `ModeloTermico` (F4, F5)

- **Capa:** `domain/thermal/services/`
- **Depende de:** T-1, T-3
- **Paralelizable:** sí, con T-5 y T-7 *(worktree aparte)*
- **Requisitos:** RF-3.1, RF-3.2, RF-3.3, RF-3.4, RF-3.5
- **Diseño:** §7 *(tabla de disipadores con sus `T_∞`)*
- **Skills:** `tdd` — **effort `max`**: mismo motivo que T-5
- **Ejemplar:** `modelo-potencia.ts` de T-5, si ya está
- **Alcance:** temperatura del paso por la **solución exponencial exacta** `T(t+Δt) = T_∞ + (T(t) − T_∞)·e^(−Δt/(R·C))` y temperatura de equilibrio `T_∞ = T_amb + P·R`.
- **Fuera de alcance:** Euler explícito y cualquier solver genérico — descartados en `proposal.md` §Approach Options, no reabrir.
- **Verificación:** `npm run test:agent -- --include='**/modelo-termico.spec.ts'` → **≥ 9 pruebas**
- **Qué invalida la evidencia:** probar el 63,21 % con **un solo** escenario no distingue una propiedad de la exponencial de una coincidencia numérica. RF-3.3 exige que sea independiente de `T_amb`, `P` y `R`, así que hacen falta **tres** escenarios distintos o la evidencia es inconcluso.
- **Entrada que la haría fallar:** usar Euler (`T += (T_∞ − T)·Δt/(R·C)`) ⇒ falla RF-3.2 por valor y RF-3.5 por estabilidad con `Δt = 10·R·C`. Invertir el signo del exponente ⇒ divergencia inmediata.
- **Hecho cuando:**
  - [ ] `T_∞ = 80,0704 °C` (RF-3.1) y `T(1 s) = 26,643769 °C` con tolerancia 1e−6 (RF-3.2)
  - [ ] El 63,21 % en `t = R·C` se prueba con **tres** escenarios distintos (RF-3.3)
  - [ ] La temperatura **nunca** supera el equilibrio en ningún paso (RF-3.4)
  - [ ] Con `Δt = 10·R·C` sigue acotada y no oscila (RF-3.5)
  - [ ] La verificación pasa en verde

---

### [ ] T-7 — `PoliticaThrottling` (F6) con escalera entera e histéresis

- **Capa:** `domain/thermal/services/`
- **Depende de:** T-1, T-3
- **Paralelizable:** sí, con T-5 y T-6 *(worktree aparte)*
- **Requisitos:** RF-4.1, RF-4.2, RF-4.3, RF-4.4, RF-4.5, **RF-4.6**
- **Diseño:** **DD-1**, **DD-6**
- **Skills:** `tdd` — **effort `max`**: es la política que la rúbrica mira y la que más fácil se rompe
- **Alcance:**
  - Estado = **entero** `n ∈ [0, n_max]`, con `n_max = ⌈(f_obj − f_base)/Δf⌉`. La frecuencia se **deriva**: `f_ef = máx(f_base, f_obj − n·Δf)`.
  - Función por tramos con histéresis: baja un escalón si `T > T_umbral`, sube uno si `T < T_umbral − h`, no cambia en la banda.
  - **Una sola política, sin interfaz de Strategy** (DD-6: es desviación consciente del TRD §4, no descuido).
- **Fuera de alcance:** integrarla en el bucle (es T-8).
- **Verificación:** `npm run test:agent -- --include='**/politica-throttling.spec.ts'` → **≥ 11 pruebas**
- **Qué invalida la evidencia:** comprobar la invariante de RF-4.6 con un puñado de casos sueltos no basta; el requisito habla de *cualquier* secuencia. Hace falta recorrerla sobre una batería de secuencias, incluidas las extremas. Y si la implementación usa resta repetida en lugar de la escalera entera, la prueba de representabilidad exacta es lo único que lo delata.
- **Entrada que la haría fallar:** poner la histéresis en 0 ⇒ alternancia en pasos consecutivos, falla RF-4.5. Quitar el recorte inferior ⇒ frecuencia negativa tras suficientes pasos, falla RF-4.6. Implementar por resta repetida ⇒ con `f_obj = 4,0` y `Δf = 0,2` el valor en `n = 2` sale `3,5999999999999996` en vez de `3,6000000000000001`, falla la exactitud.
- **Hecho cuando:**
  - [ ] `f_ef` permanece en `[f_base, f_obj]` en **toda** una batería de secuencias, incluidas las extremas (RF-4.6)
  - [ ] Con `T` oscilando dentro de la banda durante 20 pasos, `f_ef` cambia **como máximo una vez** (RF-4.5)
  - [ ] La banda de histéresis es zona muerta en **los dos sentidos** (RF-4.4)
  - [ ] El valor devuelto es exactamente `f_obj − n·Δf` recortado, con `n` entero (RF-4.6)
  - [ ] La verificación pasa en verde

---

### [ ] T-8 — `SimuladorLazoTermico` — bucle determinista y eventos

- **Capa:** `domain/thermal/services/`
- **Depende de:** T-4, T-5, T-6, T-7
- **Paralelizable:** no *(es el punto de integración del modelo)*
- **Requisitos:** RF-6.1, RF-6.2, RF-6.3, RF-6.4, RF-6.5, RNF-1
- **Diseño:** §1, §3.4, **DD-9**
- **Skills:** `tdd` — **effort `max`**; `systematic-debugging` si algo no cuadra
- **Alcance:**
  - `simular(escenario, disipador, configuracion) → ResultadoSimulacion`, función pura. Orden del paso según TRD §7 W1: potencia → temperatura → frecuencia.
  - `H/Δt + 1` pasos, incluido `t = 0`.
  - Eventos **en el flanco** (DD-9); un paso puede emitir más de uno. La causa de `THROTTLE_INICIO` lleva los dos valores reales: `T = <valor> °C > T_límite = <valor> °C`.
  - Superar la temperatura crítica emite evento y **no** detiene la corrida (TRD BR-3).
  - Medición de RNF-1 documentada en `execution.md`.
- **Fuera de alcance:** métricas de resumen (T-9); reproducción temporal y cadencia de 1 s (hija `02`).
- **Verificación:**
  1. `npm run test:agent -- --include='**/simulador-lazo-termico.spec.ts'` → **≥ 12 pruebas**
  2. Medición de RNF-1: tres corridas de 300 pasos, tiempos anotados en `execution.md`.
- **Qué invalida la evidencia:** en el punto 2, **si las tres corridas varían más de 10 ms entre sí, el número no es evidencia**: se reporta la dispersión y queda **inconcluso**, no aprobado. Un `exit 0` del punto 1 no dice nada sobre el rendimiento.
- **Entrada que la haría fallar:** meter `Math.random()*0.01` en el paso térmico ⇒ falla la igualdad estructural de RF-6.2. Emitir `TEMP_CRITICA` en cada paso en lugar del flanco ⇒ el conteo de eventos explota y falla DD-9. Devolver `eventos` ausente cuando no hay ninguno ⇒ falla RF-6.4.
- **Hecho cuando:**
  - [ ] `H/Δt + 1` pasos exactos, con `t = 0` incluido (RF-6.1)
  - [ ] Dos corridas idénticas dan resultados estructuralmente idénticos, y **no hay** `Date.now`, `Math.random` ni `performance.now` bajo `domain/` (RF-6.2)
  - [ ] La causa del evento contiene los dos valores reales, no un texto genérico (RF-6.3)
  - [ ] Sin throttling, `eventos` es lista **vacía**, no ausente (RF-6.4)
  - [ ] Superar la crítica emite evento y la corrida continúa (RF-6.5)
  - [ ] Las dos verificaciones pasan, o la nº 2 se reporta inconcluso con su dispersión

---

### [ ] T-9 — `MetricasResumen` y rendimiento relativo (F8)

- **Capa:** `domain/thermal/services/`
- **Depende de:** T-4, T-8
- **Paralelizable:** no
- **Requisitos:** RF-7.1, **RF-7.2**, **RF-7.3**, RF-7.4
- **Diseño:** §3.4, **DD-1** *(por qué RF-7.2 es exacto)*
- **Skills:** `tdd`
- **Alcance:** potencia media, temperatura máxima, frecuencia efectiva media, tiempo en throttling en **segundos**, y rendimiento relativo `f̄_ef / f_obj`. La media de frecuencia se calcula sobre los **escalones enteros** y se convierte al final: es lo que hace que RF-7.2 salga exactamente 1 (DD-1).
- **Fuera de alcance:** comparar dos corridas (T-10). **Nada de `Σ f·Δt`** — es una suma de Riemann, eje de la Guía 6, prohibido por PRD C12.
- **Verificación:** `npm run test:agent -- --include='**/metricas-resumen.spec.ts'` → **≥ 7 pruebas**
- **Qué invalida la evidencia:** una prueba de RF-7.2 escrita con tolerancia (`toBeCloseTo(1)`) **no verifica el requisito**, que dice *exactamente* 1. Debe ser igualdad estricta; si está con tolerancia, inconcluso.
- **Entrada que la haría fallar:** promediar las frecuencias en flotante en lugar de los escalones ⇒ con `f_obj = 4,1` y 301 pasos el rendimiento sale `0,9999999…` y falla la igualdad estricta de RF-7.2. Calcular la media como `Σ f·Δt / H` ⇒ falla RF-7.3. Devolver el tiempo en throttling como número de pasos ⇒ falla RF-7.4.
- **Hecho cuando:**
  - [ ] Sin throttling, el rendimiento relativo es **exactamente** 1, con igualdad estricta (RF-7.2)
  - [ ] El rendimiento nunca supera 1 en ninguna corrida de la batería (RF-7.2)
  - [ ] La frecuencia media es promedio aritmético, y no hay ninguna multiplicación por `Δt` en el archivo (RF-7.3)
  - [ ] El tiempo en throttling se expresa en segundos (RF-7.4)
  - [ ] La verificación pasa en verde

---

### [ ] T-10 — `ComparadorCorridas`

- **Capa:** `domain/thermal/services/`
- **Depende de:** T-9
- **Paralelizable:** no
- **Requisitos:** RF-8.1, RF-8.2, RF-8.3
- **Diseño:** §7 *(par de disipadores que cruza el umbral)*, §8
- **Skills:** `tdd`
- **Alcance:** deltas de cada métrica entre dos corridas. Lanza `CorridasNoComparablesError` si difieren horizonte o paso.
- **Fuera de alcance:** presentar la comparación, escalas compartidas (hija `02`, UX DD-6).
- **Verificación:** `npm run test:agent -- --include='**/comparador-corridas.spec.ts'` → **≥ 6 pruebas**
- **Qué invalida la evidencia:** una prueba de RF-8.1 con dos disipadores que **no** cruzan el umbral no demuestra nada sobre el tiempo en throttling: ambos darían 0 s y el `≤` se cumpliría trivialmente. Debe usarse el par pasivo (`R = 0,95`, `T_∞ = 120,12 °C`) contra torre (`R = 0,28`, `T_∞ = 53,04 °C`).
- **Entrada que la haría fallar:** comparar recortando la corrida más larga en lugar de lanzar ⇒ falla RF-8.3. Devolver un "ganador" ⇒ falla RF-8.2.
- **Hecho cuando:**
  - [ ] Con el par pasivo/torre: menor `T_max`, menor o igual tiempo en throttling, mayor o igual rendimiento (RF-8.1)
  - [ ] Horizonte o paso distintos ⇒ error tipado, **sin** recortar (RF-8.3)
  - [ ] No se devuelve ningún veredicto de "cuál es mejor" (RF-8.2)
  - [ ] La verificación pasa en verde

---

### [ ] T-11 — `CatalogoFormulas` — F1 a F8 como dato

- **Capa:** `domain/formulas/`
- **Depende de:** ninguna *(es dato puro)*
- **Paralelizable:** sí, con cualquiera *(worktree aparte)*
- **Requisitos:** RF-9.1, RF-9.2, RF-9.4
- **Diseño:** §2 *(adición al árbol del TRD)*, §12
- **Skills:** `cognitive-doc-design` *(el texto lo leerá la docente evaluadora)*, `tdd`
- **Ejemplar:** el bloque `FORMULAS` del prototipo, `../mockup/index.html` líneas 1320–1365 — **ya contiene los ocho supuestos y las nueve referencias redactados**; se porta a TypeScript, no se reinventa
- **Alcance:** las ocho entradas F1–F8, cada una con identificador, nombre, expresión, variables, unidades, dominio, **supuesto** y **al menos una referencia en APA 7**. Estructura congelada.
- **Fuera de alcance:** la pantalla de fórmulas y los popovers (hija `03`); la coherencia con la implementación (T-12).
- **Verificación:** `npm run test:agent -- --include='**/catalogo-formulas.spec.ts'` → **≥ 5 pruebas**
- **Qué invalida la evidencia — y esto es lo más importante de la tarea:** las pruebas de esta tarea son **aserciones de presencia**. Comprueban que el campo `supuesto` no está vacío y que hay una referencia; **no pueden comprobar que el supuesto sea honesto ni que la obra citada exista y contenga la fórmula**. Son las clases de defecto D10 y D11 de `requirements.md` §6, y **no tienen puerta automática posible**. El sustituto está declarado: **una persona lee los ocho supuestos y las nueve referencias en la puerta de aprobación de este spec.** Verde aquí no significa rigor; significa que los campos están llenos.
- **Entrada que la haría fallar:** poner `—`, `TODO` o cadena vacía en cualquier `supuesto` o `referencia` ⇒ falla RF-9.2. Meter la palabra *derivada*, *integral* o *suma de Riemann* en cualquier texto ⇒ falla RF-9.4.
- **Hecho cuando:**
  - [ ] Las ocho entradas F1–F8 existen, sin huecos ni sobrantes (RF-9.1)
  - [ ] Ningún campo obligatorio está vacío ni contiene relleno (`—`, `TODO`, cadena vacía) (RF-9.2)
  - [ ] Cero términos del eje de otras guías en todo el catálogo (RF-9.4)
  - [ ] **Revisión humana registrada en `execution.md`**: quién leyó los supuestos y las referencias, y qué concluyó (D10, D11)
  - [ ] La verificación pasa en verde

---

### [ ] T-12 — Coherencia bidireccional catálogo ↔ implementación

- **Capa:** `domain/formulas/`
- **Depende de:** T-2, T-5, T-6, T-7, T-9, T-11
- **Paralelizable:** no *(necesita que existan todas las fórmulas)*
- **Requisitos:** **RF-9.3**
- **Diseño:** **DD-10**
- **Skills:** `tdd`
- **Ejemplar:** `src/app/scripts.spec.ts` — precedente de una prueba que lee el sistema de archivos
- **Alcance:**
  - `registro-de-implementaciones.ts`: mapa de identificador de fórmula → la función que la implementa.
  - Prueba de coherencia con **las tres comprobaciones de DD-10**: todo identificador del catálogo tiene entrada en el registro; llamar a esa función con las entradas de referencia de `requirements.md` da el valor de referencia; y el **número de módulos de servicio en disco** coincide con el número de entradas registradas.
- **Fuera de alcance:** nada más. Es una tarea de una sola cosa a propósito.
- **Verificación:** `npm run test:agent -- --include='**/coherencia-formulas.spec.ts'` → **≥ 3 pruebas** (una por comprobación)
- **Qué invalida la evidencia:** si solo se implementan las dos primeras comprobaciones, la dirección difícil queda abierta — un servicio nuevo que nadie registre pasaría inadvertido. Con dos de tres, **inconcluso**.
- **Entrada que la haría fallar:** añadir `F9` al catálogo sin implementarla ⇒ falla la primera. Cambiar un coeficiente de `ModeloPotencia` ⇒ falla la segunda. Crear un archivo nuevo en `thermal/services/` sin registrarlo ⇒ falla la tercera.
- **Gap residual declarado:** dos servicios que se registren mutuamente como «sin fórmula» burlarían el conteo. Es rebuscado; queda como punto de la lista del Reviewer, no como puerta.
- **Hecho cuando:**
  - [ ] Las tres comprobaciones de DD-10 están implementadas y pasan
  - [ ] El gap residual está anotado en el propio archivo de pruebas
  - [ ] La verificación pasa en verde

---

### [ ] T-13 — Puertos, datos estáticos, adaptadores y registro de inyección

- **Capa:** `domain/thermal/ports/`, `infrastructure/`, `public/data/`
- **Depende de:** T-3
- **Paralelizable:** sí, con T-5, T-6, T-7 y T-8 *(worktree aparte)*
- **Requisitos:** RF-10.1, RF-10.2, RF-10.3, RF-10.4, RF-10.5, RNF-5, RNF-6
- **Diseño:** §4, §7, **DD-5**, **DD-11**, **DD-12**
- **Skills:** `angular-developer` *(tokens de inyección y proveedores)*, `error-handling-patterns` *(agregación de motivos)*, `tdd`
- **Ejemplar:** `src/app/infrastructure/tiempo/reloj-sistema.ts` y `src/app/infrastructure/di/{tokens,providers}.ts` — **se extienden, no se reescriben**
- **Alcance:**
  - Los dos puertos con las firmas de §4.
  - `public/data/escenarios.json` y `disipadores.json` con la calibración de §7 (**dos** escenarios, cuatro disipadores).
  - Adaptadores con `fetch` (DD-5), DTOs y validación registro a registro con agregación de motivos (DD-12).
  - Dobles en memoria para RNF-4.
  - Tokens nuevos + `proveedoresDominioTermico` añadido a `appConfig`. **Un puerto sin proveedor registrado es un fallo en ejecución que ninguna prueba unitaria atrapa**, así que va en esta misma tarea.
- **Fuera de alcance:** consumir los datos desde una pantalla (hija `02`).
- **Verificación:**
  1. `npm run test:agent -- --include='**/infrastructure/**/*.spec.ts'` → **≥ 12 pruebas**
  2. `node tools/check-external-origins.mjs`
  3. `npm run test:arch`
- **Qué invalida la evidencia:** el punto 1 usa un doble de `fetch`, así que **no prueba que la ruta servida sea correcta** — eso solo se ve al arrancar la aplicación. Queda como comprobación manual anotada en `execution.md`: `npm start` y confirmar que `/data/escenarios.json` responde 200.
- **Entrada que la haría fallar:** apuntar el adaptador a `assets/data/` en lugar de `/data/` ⇒ 404 en la comprobación manual. Un JSON con un registro corrupto ⇒ debe cargar el resto (RF-10.3); si tumba la carga, falla. Traer los datos de una URL externa ⇒ falla el punto 2.
- **Hecho cuando:**
  - [ ] Un registro corrupto entre válidos no rompe la carga, y su motivo queda registrado (RF-10.3)
  - [ ] Identificador inexistente ⇒ error tipado, **no** ausencia de valor ni el primero de la lista (RF-10.2)
  - [ ] Existe al menos un par de disipadores que cruza el umbral en uno y no en el otro (RF-10.5)
  - [ ] Los proveedores están registrados en `appConfig` y la aplicación arranca
  - [ ] Comprobación manual de la ruta `/data/…` anotada en `execution.md`
  - [ ] Las tres verificaciones pasan en verde

---

### [ ] T-14 — Casos de uso de aplicación

- **Capa:** `application/thermal/`
- **Depende de:** T-2, T-8, T-9, T-10, T-13
- **Paralelizable:** no *(es el último punto de integración)*
- **Requisitos:** RNF-4, y cierre a nivel de aplicación de RF-6, RF-7, RF-8, RF-10
- **Diseño:** §5
- **Skills:** `tdd`
- **Ejemplar:** `src/app/application/diagnostico/sellar-evento.ts` — clase plana, dependencias por constructor, método `ejecutar()`
- **Alcance:** los cinco casos de uso de §5. `EjecutarSimulacion` implementa el flujo W1 del TRD §7 sin desviación.
- **Fuera de alcance:** signals, componentes, rutas (hija `02`; TRD ADR-006 prohíbe signals fuera de `ui/`).
- **Verificación:**
  1. `npm run test:agent -- --include='**/application/thermal/*.spec.ts'` → **≥ 10 pruebas**
  2. `npm run test:arch`
  3. `npm run lint:agent`
- **Qué invalida la evidencia:** si alguna prueba necesita `TestBed`, el caso de uso ha filtrado dependencia de framework y **RNF-4 no se cumple aunque la prueba pase**.
- **Entrada que la haría fallar:** importar `@angular/core` en cualquier caso de uso ⇒ falla el punto 2. Devolver un `Observable` en lugar de una `Promise` ⇒ rompe el contrato del TRD §6.1.
- **Hecho cuando:**
  - [ ] Los cinco casos de uso funcionan con los dobles en memoria, **sin red, sin DOM y sin `TestBed`** (RNF-4)
  - [ ] `EjecutarSimulacion` devuelve resultado y métricas en una sola llamada
  - [ ] Cero imports de `@angular/*` ni de `infrastructure/` en `application/`
  - [ ] Las tres verificaciones pasan en verde

---

### [ ] T-15 — Registrar la deriva constitucional como pendiente de la rama por defecto

- **Capa:** `docs/`
- **Depende de:** ninguna
- **Paralelizable:** sí, con cualquiera *(no toca código)*
- **Requisitos:** **RF-11.1**, **RF-11.2**
- **Diseño:** §10 *(resultado del desafío de reversión)*
- **Skills:** `cognitive-doc-design`
- **Alcance:**
  - Crear `docs/specs/pendientes-rama-por-defecto.md` con las doce derivas DR-1…DR-12, cada una con su **valor literal** y su número de línea, y la recomendación de resolverlas en un spec `003-docs-sincronizar-trd`.
  - Enumerar una por una las diferencias entre el modelo de este spec y el publicado en TRD §5.3, con el motivo por el que se retira `trabajo útil` (PRD C12) y por el que `eficiencia` se sustituye por rendimiento relativo (RF-11.2).
  - Incluir **DR-12** de forma destacada: la hija `02` lo necesita **antes** de maquetar el layout LP-1.
- **Fuera de alcance:** **editar `docs/trd/trd.md` o `docs/ux-ui/design.md`.** Decisión del usuario (`requirements.md` Q1): una enmienda parcial dejaría §12 del TRD citando criterios que apuntan a un modelo que ya no dice eso.
- **Verificación:** revisión manual, más una comprobación mecánica de que cada línea citada sigue diciendo lo que el documento afirma:
  `for n in 23 256 257 258 307 311 312 314 335 361 401 526 527; do printf '%4d %s\n' "$n" "$(sed -n "${n}p" docs/trd/trd.md)"; done` y `sed -n '144p' docs/ux-ui/design.md`
- **Qué invalida la evidencia:** una afirmación **parafraseada** sobre otro archivo no cuenta como cita; hay que reproducir el valor literal *(KZ-001-setup-bootstrap-angular-3)*. Y el barrido se hace **por concepto, no por frase literal**: la misma falsedad sobrevive con otra redacción.
- **Entrada que la haría fallar:** si alguna línea citada ya no contiene el valor que el documento le atribuye, la cita está podrida y hay que re-derivarla.
- **Hecho cuando:**
  - [ ] Las doce derivas están, cada una con valor literal y número de línea verificado
  - [ ] Las diferencias con TRD §5.3 están enumeradas con su motivo (RF-11.2)
  - [ ] DR-12 aparece marcado como insumo previo de la hija `02`
  - [ ] `docs/trd/trd.md` y `docs/ux-ui/design.md` **no** aparecen en el diff

---

## Cobertura a nivel de escenario

La cobertura no cierra por identificador de requisito: cierra por **escenario y por cláusula**. Un requisito «que aparece en una tarea» es la afirmación más débil posible.

| Requisito | Escenarios | Tarea dueña |
|---|---|---|
| RF-1 | 1.1 · 1.2 · 1.3 | T-1 |
| RF-1 | **1.4** *(compilación)* | T-1 · puerta `tsc`, **no** `test:agent` |
| RF-2 | 2.1 · 2.2 · 2.3 · 2.4 · 2.5 | T-5 |
| RF-3 | 3.1 · 3.2 · 3.3 · 3.4 · 3.5 | T-6 |
| RF-4 | 4.1 · 4.2 · 4.3 · 4.4 · 4.5 · 4.6 | T-7 |
| RF-5 | 5.1 · 5.2 · 5.3 · 5.4 · 5.5 · 5.6 | T-2 |
| RF-6 | 6.1 · 6.2 · 6.3 · 6.4 · 6.5 | T-8 |
| RF-6 | **6.6 · 6.7** | **T-4** — la validación vive en `ConfiguracionSimulacion`, que lanza *antes* de que el simulador itere |
| RF-7 | 7.1 · 7.2 · 7.3 · 7.4 | T-9 |
| RF-8 | 8.1 · 8.2 · 8.3 | T-10 |
| RF-9 | 9.1 · 9.2 · 9.4 | T-11 |
| RF-9 | **9.3** | **T-12** — necesita que existan todas las fórmulas implementadas |
| RF-10 | 10.1 · 10.2 · 10.3 · 10.4 · 10.5 | T-13 |
| RF-11 | 11.1 · 11.2 | T-15 |
| RNF-1 | — | T-8 *(medición, con su regla de inconcluso)* |
| RNF-2 · RNF-5 | — | T-13, T-14 · `npm run test:arch` |
| RNF-3 | — | Lista del Reviewer en cada tarea de fórmula (T-5, T-6, T-7) |
| RNF-4 | — | T-14 |
| RNF-6 | — | T-13 · `tools/check-external-origins.mjs` |
| RNF-7 | — | T-1 *(mitad de dominio; la de presentación es la hija `02`)* |

**Cláusulas negativas y estrictas con dueño explícito** — son las que atrapan la regresión, así que cada una lleva prueba propia:

| Cláusula | Tarea |
|---|---|
| RF-1.2 *no construir ni recortar al extremo* | T-1 |
| RF-1.3 *las seis magnitudes sin excepción* | T-1 |
| RF-1.4 *no apoyarse en comprobación en ejecución* | T-1 |
| RF-2.2 *tres pares, no un ejemplo* | T-5 |
| RF-2.5 *la total no es 0 W* | T-5 |
| RF-3.3 *independiente de `T_amb`, `P` y `R`* | T-6 |
| RF-3.4 *nunca supera el equilibrio* · RF-3.5 *no oscila ni diverge* | T-6 |
| RF-4.2 *no baja de `f_base`* · RF-4.3 *no supera `f_obj`* | T-7 |
| RF-4.4 *en los dos sentidos* · RF-4.5 *no alterna en pasos consecutivos* | T-7 |
| RF-4.6 *exactamente `f_obj − n·Δf`, sin acumulación* | T-7 |
| RF-5.3 *ni `0`, ni `NaN`, ni `Infinity`* · RF-5.4 *ni `0` ni omitido* | T-2 |
| RF-5.5 *no afirmar que difieren dentro de la tolerancia* | T-2 |
| RF-5.6 *ni error ni lista vacía* | T-2 |
| RF-6.2 *sin reloj ni azar, no por semilla* | T-8 |
| RF-6.3 *no una cadena genérica* | T-8 |
| RF-6.4 *lista vacía, no ausente* | T-8 |
| RF-6.5 *no se detiene* | T-8 |
| RF-6.6 *no truncar en silencio* · RF-6.7 *no entrar en el bucle* | T-4 |
| RF-7.2 *no supera 1* · RF-7.3 *no `Σ f·Δt`* | T-9 |
| RF-7.4 *segundos, no pasos* | T-9 |
| RF-8.2 *sin ganador* · RF-8.3 *no recortar* | T-10 |
| RF-9.2 *ni `—`, ni `TODO`, ni cadena vacía* | T-11 |
| RF-9.3 *en ambas direcciones* | T-12 |
| RF-9.4 *cero términos de otras guías* | T-11 |
| RF-10.1 *no lista vacía* · RF-10.2 *ni ausencia ni el primero* | T-13 |
| RF-10.3 *un corrupto no rompe el resto* · RF-10.4 *cero orígenes externos* | T-13 |
| RF-10.5 *un par que cruce el umbral* | T-13 |
| RF-11.1 *no editar el TRD* | T-15 |

---

## Comprobación final

- [ ] Todos los requisitos de `requirements.md` tienen al menos una tarea, **y cada escenario y cláusula tiene dueño** en la tabla de arriba
- [ ] La suite completa pasa: `npm run test:agent`
- [ ] La prueba de arquitectura pasa: `npm run test:arch`
- [ ] El lint pasa: `npm run lint:agent`
- [ ] La compilación de producción funciona: `npm run build`
- [ ] La puerta de tipos pasa: `npx tsc -p tsconfig.spec.json --noEmit`
- [ ] Cero peticiones a orígenes externos: `node tools/check-external-origins.mjs`
- [ ] Cero archivos nuevos o modificados bajo `src/app/ui/` — es alcance F-1
- [ ] Los tokens de diseño no aplican: este spec no produce nada visible
- [ ] Sin `console.log` de depuración en el código entregado
- [ ] **La revisión humana de los ocho supuestos y las nueve referencias del catálogo está registrada en `execution.md`** — clases de defecto D10 y D11, sin puerta automática posible
- [ ] `execution.md` registra un PASS del Reviewer por cada tarea completada y auditada
- [ ] Los reales de tareas, LOC y rondas de revisión se compararon contra el presupuesto; si se excedió, hay una escalada registrada
