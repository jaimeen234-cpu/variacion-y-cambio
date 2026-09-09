# Plantilla — `design.md`

> **Qué es esto:** el formato canónico del documento de diseño técnico de un spec. Responde **cómo** se construye lo que `requirements.md` definió, y por qué así. **No es un spec**: es la plantilla que los produce.

---

## Estructura obligatoria

```markdown
# Diseño — <Título del spec>

| Campo | Valor |
|---|---|
| Spec | `docs/specs/NNN-tipo-slug/` |
| Estado | Draft / Aprobado |
| Fecha | YYYY-MM-DD |
| Requisitos | `requirements.md` |

## 1. Resumen de la solución        ← 3–5 frases: qué se construye y dónde encaja
## 2. Capas tocadas                 ← tabla obligatoria (ver abajo)
## 3. Modelo de dominio             ← solo si el spec añade o cambia dominio
## 4. Puertos y adaptadores         ← solo si el spec cruza la frontera hexagonal
## 5. Casos de uso
## 6. Componentes de UI
## 7. Contratos de datos
## 8. Manejo de errores
## 9. Decisiones de diseño (ADR-lite)
## 10. Estrategia de pruebas
## 11. Riesgos y alternativas descartadas
```

---

## §2 — Capas tocadas *(tabla obligatoria)*

Se declara **antes** de escribir tareas. Es lo que permite al Leader juzgar independencia entre tareas y al Reviewer detectar violaciones de frontera.

| Capa | Archivos nuevos | Archivos modificados | Justificación |
|---|---|---|---|
| `domain/` | `thermal/services/politica-throttling.ts` | — | La histéresis es regla de negocio pura |
| `application/` | — | `thermal/ejecutar-simulacion.ts` | Nuevo parámetro de configuración |
| `infrastructure/` | — | — | Sin cambio de origen de datos |
| `ui/` | `shared/vc-event-timeline/` | `pages/lazo-termico/` | Nuevo componente + su integración |

**Regla dura del proyecto (TRD §4):** si la tabla muestra un archivo nuevo en `domain/` que importa Angular, el diseño está mal y se corrige antes de aprobar — no después, en revisión de código.

---

## §4 — Puertos y adaptadores

Todo spec que lea o escriba datos declara:

```markdown
| Puerto | Firma | Adaptador(es) | Doble de prueba |
|---|---|---|---|
| `RepositorioEscenarios` | `obtenerPorId(id): Promise<EscenarioTermico>` | `JsonRepositorioEscenarios` | `FakeRepositorioEscenarios` |
```

Si un spec introduce un puerto nuevo, incluye también **el token de inyección** y **dónde se registra el proveedor**. Un puerto sin proveedor registrado es un fallo en tiempo de ejecución que ninguna prueba unitaria atrapa.

---

## §9 — Decisiones de diseño (ADR-lite)

Una entrada por decisión que sea **cara de revertir** o **sorprendente para un lector futuro**. Las decisiones obvias no se documentan: inflan el documento y esconden las que importan.

```markdown
### DD-1 — Histéresis fija de 3 °C en lugar de configurable por escenario

- **Problema:** sin histéresis el throttling oscila un paso sí y otro no (TRD BR-4).
- **Decisión:** constante de dominio de 3 °C.
- **Alternativas:** campo por escenario — rechazada: añade una perilla que ningún
  requisito pide y un valor más que validar en la URL.
- **Implicaciones:** si un escenario futuro necesita otro valor, se promueve a
  campo de `EspecificacionCpu` — cambio acotado a un archivo.
- **Revisar si:** aparece un escenario con comportamiento térmico muy distinto.
```

**Ascenso al TRD:** si una decisión afecta a más de un spec o cambia una regla del TRD, no se queda aquí — se eleva al TRD como ADR completo mediante el Protocolo de Pivot.

---

## §10 — Estrategia de pruebas

Tabla obligatoria que asigna cada requisito a su nivel de prueba:

| Requisito | Nivel | Ubicación | Nota |
|---|---|---|---|
| RF-3.1 | Componente | `ui/shared/vc-event-timeline/*.spec.ts` | Con `TestBed` |
| RF-3.2 | Componente | ídem | Caso vacío: verifica que NO colapsa |
| RNF-2 | Manual medido | Documentado en `execution.md` | Sin backend no hay telemetría |

Reglas: el dominio se prueba **sin `TestBed`**; ningún nivel toca red ni `localStorage` real; toda restricción negativa (`PERO … NO debe`) tiene su propia prueba, porque es la que atrapa la regresión.

---

## §11 — Riesgos y alternativas descartadas

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| El portado del SCSS de BLK desborda la tarea | Media | Alto | Plan B de TRD ADR-003: solo tokens, componentes propios |

Una alternativa descartada se registra con su razón. "Se consideró y se descartó porque X" ahorra que el siguiente lector reabra la misma discusión.

---

## Reglas del documento

| # | Regla |
|---|---|
| D1 | **Sin código de implementación.** Firmas, contratos y estructura sí; cuerpos de función no. El código lo escribe el Implementer |
| D2 | Todo diseño respeta la dirección de dependencias del TRD §4. Un diseño que la viola se rechaza en la aprobación |
| D3 | Los diagramas llevan leyenda, siempre |
| D4 | Cada decisión apunta a un requisito o a un escenario de calidad. Sin origen, no entra |
| D5 | Reutilizar antes que crear: si ya existe un componente o servicio que sirve, se cita y se extiende. Un `design.md` que crea un cuarto componente de tarjeta será rechazado |
| D6 | Español para el texto; inglés solo donde el lenguaje o el framework lo imponen |
