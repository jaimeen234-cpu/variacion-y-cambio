# Kaizen Log

Registro de mejora continua del proyecto. El digest `## Active Lessons` de abajo lo refresca **solo** la fase *Apply* de la skill `kaizen`, en la rama por defecto. El resto de comandos AKILI lee **únicamente** esa tabla — manténla en 10 filas o menos. Las retrospectivas por spec viven en `docs/specs/kaizen/`, un archivo por spec.

## Active Lessons

| ID | Lección | Spec de origen | Severidad | Objetivo | Estandarizada en | Estado |
|---|---|---|---|---|---|---|
| KZ-001-setup-bootstrap-angular-1 | Un comando de verificación que apunte a un artefacto que la tarea aún no ha construido se marca provisional y se re-deriva contra el artefacto real | 001-setup-bootstrap-angular | **High** | Product + Methodology | `docs/specs/general-setup/task.md` | Applied |
| KZ-001-setup-bootstrap-angular-2 | Con un agente delegado activo, `git add` va por ruta explícita, nunca `-A`: el área de preparación es estado compartido invisible | 001-setup-bootstrap-angular | Medium | Product | `CLAUDE.md` / `AGENTS.md` — CC-5 | Applied |
| KZ-001-setup-bootstrap-angular-3 | En sincronización documental, cita el valor literal del archivo y barre por concepto, no por frase literal | 001-setup-bootstrap-angular | Medium | Product + Methodology | `docs/specs/general-setup/task.md` | Applied |

## Pendiente de upstream a la metodología AKILI

| ID | Propuesta |
|---|---|
| KZ-001-setup-bootstrap-angular-1 (P2) | `/akili-specify` debería marcar los comandos de verificación de un spec de **bootstrap** como provisionales por defecto: es el único tipo de spec que se escribe sin poder ejecutar nada de lo que especifica |
| KZ-001-setup-bootstrap-angular-3 | El barrido en dos direcciones de `/akili-archive` y `/akili-execute` debería buscarse por concepto, no por cadena literal — con evidencia medida: 27 citantes declarados coherentes y una falsedad viva |
