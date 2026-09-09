# Plantilla — `requirements.md`

> **Qué es esto:** el formato canónico que `/akili-specify` debe seguir al redactar los requisitos de un spec en este proyecto. **No es un spec**: es la plantilla que los produce.

---

## Taxonomía de `docs/specs/`

```
docs/specs/
├── general-setup/            ← estas plantillas (metodología, no producto)
├── kaizen/                   ← una entrada por spec, escrita por la skill `kaizen`
├── audits/                   ← un informe por corrida de /akili-audit
└── NNN-<tipo>-<slug>/        ← un spec
```

| Elemento | Regla |
|---|---|
| `NNN` | Número de tres dígitos, secuencial, que fija el orden de construcción. Nunca se reutiliza |
| `<tipo>` | `setup` · `feature` · `enhancement` · `bugfix` · `refactor` · `docs` |
| `<slug>` | kebab-case, en español, 2–4 palabras, describe el cambio y no la solución |

Ejemplos: `001-setup-bootstrap-proyecto`, `002-feature-simulador-lazo-termico`, `007-bugfix-histeresis-throttling`.

Un spec contiene: `requirements.md`, `design.md`, `tasks.md`, `execution.md` (lo crea `/akili-execute`) y, solo si la propuesta se dividió, un `family.md` en la carpeta padre.

---

## Estructura obligatoria del documento

```markdown
# Requisitos — <Título del spec>

| Campo | Valor |
|---|---|
| Spec | `docs/specs/NNN-tipo-slug/` |
| Estado | Draft / Aprobado / En ejecución / Completado |
| Fecha | YYYY-MM-DD |
| Fuente | PRD §X · US-N.N · AC-N.N |

## 1. Contexto y problema
## 2. Alcance
### En alcance
### Fuera de alcance          ← obligatorio, nunca vacío
## 3. Actores
## 4. Requisitos funcionales
## 5. Requisitos no funcionales
## 6. Trazabilidad
## 7. Supuestos y preguntas abiertas
```

---

## Numeración de requisitos

| Prefijo | Significado | Ejemplo |
|---|---|---|
| `RF-<n>` | Requisito funcional | `RF-3` |
| `RNF-<n>` | Requisito no funcional | `RNF-2` |
| `RF-<n>.<m>` | Escenario de aceptación de `RF-<n>` | `RF-3.2` |

Los números **nunca se reciclan**. Si un requisito se elimina, se marca `~~RF-4~~ (retirado en NNN-…)` y el número queda quemado. Reutilizarlo rompe la trazabilidad de `execution.md`, de las pruebas y de los informes de auditoría.

---

## Formato de un requisito funcional

```markdown
### RF-3 — Marcar el inicio del throttling en la línea de tiempo

**Historia:** Como estudiante, quiero ver cuándo se activó el throttling y por qué,
para conectar el efecto con la causa.

**Fuente:** PRD US-1.4, AC-1.3

**Escenarios**

- **RF-3.1** — DADO un resultado de simulación con al menos un evento `THROTTLE_INICIO`,
  CUANDO se renderiza la línea de eventos,
  ENTONCES aparece un marcador en el instante `t` del evento,
  Y el marcador muestra la causa con la forma `T = <valor> °C > T_límite = <valor> °C`.

- **RF-3.2** — DADO un resultado sin eventos de throttling,
  CUANDO se renderiza la línea de eventos,
  ENTONCES no aparece ningún marcador,
  PERO el componente NO debe ocultarse ni colapsar su altura (evita el salto de layout).

**Fuera de alcance:** el detalle expandible del evento (spec futuro).
```

### Reglas de escritura

| # | Regla | Por qué |
|---|---|---|
| R1 | Un escenario, un comportamiento verificable. Si necesitas "y además", son dos escenarios | Un escenario que falla debe señalar una sola causa |
| R2 | `DADO / CUANDO / ENTONCES` siempre; `Y` para añadir, `PERO … NO debe` para restricciones negativas | `/akili-test` deriva las pruebas de esta estructura |
| R3 | **Las restricciones negativas son obligatorias cuando existen.** `PERO … NO debe` es lo que impide que la implementación "cumpla" rompiendo otra cosa | Es la mitad del requisito que se olvida y la que produce regresiones |
| R4 | Valores concretos, con unidad. `< 100 ms`, no "rápido"; `≤ 500 KB`, no "ligero" | Un requisito sin medida no es verificable |
| R5 | Sin decisiones de implementación. Nada de nombres de clase, librerías o rutas de archivo | Eso vive en `design.md` |
| R6 | Todo escenario debe ser falsable: si no puedes imaginar cómo fallaría, no es un requisito | |
| R7 | Español, presente de indicativo, sujeto explícito | |

---

## Requisitos no funcionales

Formato de escenario de seis partes (el mismo del TRD §3):

```markdown
- **RNF-2** — Estudiante → arrastra el slider de voltaje sobre el simulador
  durante operación normal ⇒ la gráfica se repinta
  **medido por p95 < 100 ms** entre el evento `input` y el repintado.
  *Deriva de:* TRD PERF-1.
```

Un RNF de un spec **hereda o acota** un escenario del TRD; nunca lo contradice. Si el spec necesita una medida distinta de la del TRD, eso es un cambio constitucional: se escala vía el Protocolo de Pivot, no se resuelve escribiéndolo diferente aquí.

---

## Trazabilidad

Tabla obligatoria al cierre del documento:

| Requisito | Origen (PRD / TRD / UX) | Verificado por |
|---|---|---|
| RF-3 | PRD US-1.4, AC-1.3 | `tasks.md` T-5, pruebas `event-timeline.spec` |
| RNF-2 | TRD PERF-1 | `tasks.md` T-7, medición manual documentada |

Un requisito sin origen es un requisito inventado: o se le encuentra la fuente, o se retira, o se eleva al PRD por Pivot.

---

## Antipatrones (rechazar en revisión)

| Antipatrón | Corrección |
|---|---|
| "El sistema debe ser intuitivo" | Sustituir por una medida: pasos hasta la acción, tasa de error, tiempo a la primera simulación |
| "Manejar errores adecuadamente" | Enumerar los errores concretos y el comportamiento esperado de cada uno |
| Un escenario que describe la implementación (`ENTONCES se llama a X.y()`) | Reescribir en términos de lo que el usuario observa |
| Sección "Fuera de alcance" vacía o ausente | Siempre hay algo fuera. Si de verdad no lo hay, el spec es demasiado grande |
| Escenarios solo del camino feliz | Añadir al menos uno de entrada inválida y uno de estado vacío |
