# Plantilla — `family.md` (manifiesto de familia de specs)

> **Qué es esto:** el manifiesto que se crea **solo** cuando una propuesta se parte en varios specs hijos. Vive en la carpeta del spec padre.
>
> **Su ausencia significa que el spec es plano** y no añade ninguna obligación. No se crea "por si acaso".

---

## Cuándo se crea

| Situación | ¿`family.md`? |
|---|---|
| `/akili-propose` produce un cambio que cabe en un solo spec | ❌ No |
| Una propuesta se parte en 2+ specs hijos con orden entre ellos | ✅ Sí, en la carpeta padre |
| Un spec plano crece y hay que partirlo | ✅ Sí, al partirlo — el padre pasa a ser contenedor |

---

## Estructura obligatoria

```markdown
# Familia de specs — <Título de la propuesta>

## Control del documento

| Campo | Valor |
|---|---|
| Spec padre | `docs/specs/002-feature-simulador-lazo-termico/` |
| Fecha de creación | YYYY-MM-DD |
| Última actualización | YYYY-MM-DD |
| Estado de la familia | `open` / `complete` |

## Motivo de la partición

<2–4 frases: por qué esta propuesta no cabía en un spec plano.>

## Specs hijos

| # | Ruta del spec | Depende de | Paralelizable | Estado |
|---|---|---|---|---|
| 1 | `002-feature-simulador-lazo-termico/01-motor-simulacion` | ninguno | no | `done` |
| 2 | `002-feature-simulador-lazo-termico/02-grafica-temporal` | `01-motor-simulacion` | sí | `active` |
| 3 | `002-feature-simulador-lazo-termico/03-panel-controles` | `01-motor-simulacion` | sí | `pending` |
| 4 | `002-feature-simulador-lazo-termico/04-linea-eventos` | `02-grafica-temporal` | no | `pending` |

## Regla de conjunto cerrado

Esta tabla es el conjunto **exhaustivo** de specs hijos de esta familia.
Ningún comando AKILI crea una carpeta de spec hijo sin una fila previa en este manifiesto.
Añadir una fila es una edición del manifiesto aprobada por el usuario (HITL).
```

---

## Vocabulario de las columnas

| Columna | Valores | Significado |
|---|---|---|
| `#` | 1..n | Orden de construcción |
| `Ruta del spec` | `<familia>/<hijo>` | Debe corresponder a una carpeta real |
| `Depende de` | ruta(s) \| `ninguno` | Restricción de orden en serie |
| `Paralelizable` | `sí` / `no` | Elegibilidad para ejecución en flota |
| `Estado` | `pending` / `active` / `done` / `blocked` | Vocabulario **cerrado**: cuatro valores y ningún otro |

**Por qué el vocabulario es tan pequeño:** el detalle de fase vive en los documentos de cada hijo (`tasks.md`, `execution.md`). Si este manifiesto empieza a llevar porcentajes, sub-estados o notas de avance, se convierte en un segundo tablero que se desincroniza del primero — y entonces hay dos verdades y ninguna fiable.

---

## Reglas

| # | Regla |
|---|---|
| F1 | La familia está `complete` cuando todos sus hijos están `done`. No antes, aunque el resto esté desplegado |
| F2 | Un hijo `blocked` obliga a anotar el motivo en el `execution.md` de ese hijo, no aquí |
| F3 | Si el orden cambia durante la ejecución, se actualiza este manifiesto en el mismo commit que refleja el cambio |
| F4 | `Paralelizable: sí` exige lo mismo que en `tasks.md`: archivos distintos **y** sin salida de build, servidor, puerto ni dependencias generadas en común |
| F5 | Una familia con un solo hijo es un error de partición: se colapsa a spec plano y se borra el manifiesto |
