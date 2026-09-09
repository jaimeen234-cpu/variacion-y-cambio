# Infrastructure — Variación y Cambio

> **Deriva del tier arquitectónico.** [`docs/trd/trd.md`](trd/trd.md) §2.3 y **ADR-001** deciden **LITE**: un único artefacto estático, sin servidor de aplicación, sin base de datos. Esta infraestructura es la consecuencia de esa decisión, no su causa.

| Campo | Valor |
|---|---|
| Estado | Draft v0.1 |
| Tier | **LITE** (TRD ADR-001) |
| Presupuesto objetivo | **0 USD/mes** — restricción dura (PRD C1) |
| Última actualización | 2026-09-08 |

---

## 1. Target Environment

| Entorno | Qué es | Dónde vive |
|---|---|---|
| **Local (DEV)** | Servidor de desarrollo del Angular CLI con recarga en caliente | Portátil del desarrollador |
| **PROD** | Sitio estático servido por HTTPS desde un CDN | **GitHub Pages** (propuesto — ver Open Question Q5 del PRD) |

No hay entorno de *staging*. Con un artefacto estático, sin base de datos y sin estado de servidor, un staging separado no reduce ningún riesgo real: la construcción de producción se puede servir localmente y es byte a byte la misma que se despliega.

**Alternativas equivalentes** si GitHub Pages no encaja: Netlify, Cloudflare Pages o Vercel, todas en capa gratuita. La elección es intercambiable porque el artefacto es un directorio de archivos; ninguna decisión de código depende de ella.

---

## 2. Core Cloud Components

| Componente | Usado | Motivo |
|---|---|---|
| CDN / hosting estático | ✅ | Sirve `dist/` por HTTPS. Es el único componente de infraestructura del sistema |
| Cómputo (Lambda, contenedores, VM) | ❌ | ADR-002: no hay backend. El cómputo ocurre en el navegador del usuario |
| Base de datos | ❌ | ADR-002. Los datos de referencia son JSON empaquetados; el estado de usuario vive en `localStorage` |
| Almacenamiento de objetos | ❌ | Los assets viajan dentro del artefacto |
| Cola / mensajería | ❌ | No hay procesamiento asíncrono entre servicios: no hay servicios |
| Autenticación gestionada | ❌ | No hay usuarios (TRD §10) |
| Observabilidad gestionada | ❌ | Sin backend no hay telemetría (TRD §3.6, PRD O8) |
| DNS / dominio propio | ❌ (v1) | Se usa el subdominio gratuito del proveedor |

**La ausencia es la arquitectura.** Cada ❌ está declarado a propósito para que un lector no asuma que falta por olvido.

---

## 3. Deployment Strategy

| Aspecto | Decisión |
|---|---|
| Artefacto | `dist/` producido por `ng build --configuration production` |
| Método | GitHub Actions: en push a la rama por defecto, construir y publicar en GitHub Pages |
| IaC (Terraform / CDK) | **No.** No hay recursos cloud que provisionar. Un archivo de workflow es toda la infraestructura como código que este sistema tiene |
| Rollback | Volver a desplegar el commit anterior. Al ser estático, es instantáneo y sin migraciones que revertir |
| Versionado | El artefacto se corresponde 1:1 con un commit de la rama por defecto |
| Verificación previa al despliegue | Compilación limpia + suite de pruebas + prueba de arquitectura (TRD §12) + `npm audit` sin severidad alta/crítica (SEC-3) |

**Pendiente:** el pipeline se crea en el spec de bootstrap del proyecto, no antes. Hasta entonces, el despliegue es manual y así se declara.

**Regla de enrutamiento:** la SPA usa rutas de History API, así que el hosting debe hacer *fallback* de rutas desconocidas a `index.html` (en GitHub Pages, copiar `index.html` como `404.html`). Sin eso, recargar `/lazo-termico` devuelve un 404 — y esa es la única sorpresa de infraestructura que este sistema puede dar.

---

## 4. Network & Security Architecture

| Control | Estado |
|---|---|
| HTTPS | Obligatorio, provisto por el hosting (SEC-2 / SEC-D) |
| Orígenes externos en runtime | **Cero.** Librerías y fuentes van empaquetadas; verificable en la pestaña de red del navegador |
| Secretos / variables de entorno sensibles | **Ninguno.** No hay claves porque no hay servicios que autenticar (SEC-F). Cualquier secreto en un bundle de frontend sería público por definición |
| CORS | No aplica: todas las peticiones son al mismo origen |
| Superficie de red | Un único origen sirviendo archivos estáticos. Sin puertos abiertos propios, sin VPC, sin grupos de seguridad |
| Cabeceras de seguridad | Deseable donde el proveedor lo permita (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`). En GitHub Pages no son configurables: se declara la limitación en lugar de fingir el control |
| Datos personales | Ninguno se recoge, se transmite ni se almacena fuera del dispositivo |

---

## 5. Infrastructure Rules & Constraints

| # | Regla |
|---|---|
| IR-1 | **Cero costo.** Cualquier componente que introduzca facturación requiere aprobación explícita del usuario y un ADR. Es una restricción dura (PRD C1) |
| IR-2 | **Cero licencias de pago**, incluidas capas gratuitas que exigen tarjeta |
| IR-3 | El despliegue a PROD es **gobernado**: pasa por el pipeline definido en §3. Ningún agente improvisa un despliegue ni cambia la configuración del hosting por su cuenta |
| IR-4 | El entorno local es **desechable**: cualquier agente puede arrancarlo, sembrarlo y reiniciarlo libremente para verificar su trabajo |
| IR-5 | `node_modules/`, `dist/` y `.angular/` nunca se versionan |
| IR-6 | Ningún secreto entra jamás al repositorio. Hoy no existe ninguno; si algún día se necesita uno, es señal de que ADR-002 cambió y requiere revisar este documento entero |
| IR-7 | Añadir una dependencia de runtime requiere justificarla contra TC-1 (licencia) y PERF-3 (presupuesto de bundle) |

---

## 6. Local Environment

> **La metodología define un contrato, no una herramienta.** Este proyecto no tiene base de datos ni backend, así que Docker no aporta reproducibilidad que `npm` no dé ya: la ruta nativa **es** la ruta principal, y la ruta con contenedor se documenta como paridad opcional.

| Elemento | Valor |
|---|---|
| **Ruta principal (recomendada)** | `npm start` → servidor de desarrollo del Angular CLI en `http://localhost:4200` con recarga en caliente |
| **Ruta alternativa (paridad de build)** | `npm run build && npx http-server dist/<app>/browser -p 4200` — sirve el artefacto de producción tal como quedará en PROD |
| **Ruta con contenedor** | *No provista.* Sin base de datos ni backend, un `docker-compose.yml` solo envolvería `ng serve` en otra capa. Se añade solo si el equipo lo pide, y sería un `Dockerfile` de Node más un servicio |
| **Pre-check** | `node -v` (esperado ≥ 20; entorno actual: **v22.18.0**) y `npm -v` (actual: **11.6.0**). Si `node_modules/` no existe: `npm ci`. Si falla, se reporta el error real — **nunca se continúa en silencio** |
| **Datos de siembra** | No aplica: no hay base de datos. Los datos de referencia son `src/assets/data/*.json`, versionados junto al código. "Reiniciar los datos" es `git checkout -- src/assets/data/` |
| **Reset del entorno** | `rm -rf node_modules .angular dist && npm ci` |
| **Health check** | `curl -sfI http://localhost:4200 \| head -1` devuelve `200 OK`, y la consola del navegador no muestra errores en el arranque |
| **URLs / puertos** | Frontend: `http://localhost:4200` · Backend: *no existe* · Base de datos: *no existe* |

### Frontera: desechable vs. gobernado

| Entorno | Régimen | Qué significa |
|---|---|---|
| **Local** | **Desechable** | Los agentes lo arrancan, lo rompen y lo reinician cuantas veces necesiten para verificar su trabajo. No requiere permiso |
| **PROD** | **Gobernado** | Se despliega por el pipeline de §3, con los componentes y reglas de §§1–5. Ningún agente improvisa un despliegue |

---

## 7. Open Questions

| # | Pregunta | Impacto |
|---|---|---|
| IQ-1 | ¿Se evalúa el despliegue en línea o basta con que corra localmente? (= PRD Q5) | Decide si el pipeline de §3 entra en v1 o se pospone |
| IQ-2 | ¿El repositorio será público? GitHub Pages gratuito lo requiere en cuentas sin plan de pago | Si debe ser privado, cambia el proveedor de hosting (Netlify/Cloudflare sirven repos privados en capa gratuita) |
| IQ-3 | ¿La institución exige alojar el proyecto en su propia infraestructura? | Cambiaría §1 por completo |
