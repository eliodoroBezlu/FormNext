# Plan de Migración — Next.js 15.3.0 → 16.2.12

**Proyecto:** `FormNext/Formularios-dev`
**Fecha de análisis:** 2026-07-27
**Estado:** ✅ **EJECUTADO** el 2026-07-28 — Fases 0 a 6 completas y verificadas

---

## ✅ Resultado de la ejecución

| Verificación | Resultado |
|---|---|
| `yarn tsc --noEmit` | ✅ limpio |
| `yarn lint` (`eslint .`) | ✅ 0 errores (82 warnings, ver nota) |
| `yarn build` (Turbopack) | ✅ exitoso — **57s vs 174s** en Next 15 (~3× más rápido) |
| `next dev` | ✅ listo en 3.0s, sin errores de consola |
| Gate de autenticación | ✅ `/dashboard/pgr` → `/?redirect=...`; los logs muestran `proxy.ts: 5ms` |
| `openid-client` bajo Turbopack | ✅ `/api/auth/login` → 307 tras ejecutar `authorizationUrl()` |

**Versiones finales:** `next@16.2.12` · `react@19.2.8` · `react-dom@19.2.8` · `@types/react@19.2.17` · `eslint-config-next@16.2.12`

### Desviaciones respecto al plan original

1. **`prop-types` NO se eliminó.** El análisis inicial la marcó como sin uso, pero `react-signature-canvas` hace `require("prop-types")` en runtime — es peer dependency real de un paquete que sí se usa (firmas de inspector y supervisor). Se restauró. Eliminadas 6, no 7.
2. **El codemod oficial se aplicó a mano.** `@next/codemod upgrade` es interactivo y no corre en shell no interactivo. Todos sus cambios se hicieron manualmente, que es lo que el plan ya recomendaba.
3. **El bump de `@types/react` se adelantó de Fase 4 a Fase 2.** Al mover `@types/react-signature-canvas` a `devDependencies`, yarn anidó un `@types/react@19.2.17` junto al `19.0.8` del root; dos copias de los tipos de React rompen JSX. Alinear el root a 19.2.17 deduplicó y lo resolvió.
4. **Reglas nuevas de `react-hooks` v6 bajadas a `warn`.** `eslint-config-next@16` trae las reglas de React Compiler, que marcan hallazgos en código preexistente no tocado por la migración. Quedan en `warn` — visibles, no bloqueantes. Ver el plan de lint más abajo.

### Pendiente

- ⚠️ **Rotar los secretos** de `.env.local` y del `.env` de BackendForm (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, credenciales de Mongo). Vercel lo recomienda para toda app que estuvo en línea sin parchear contra React2Shell. **Es una acción manual, no la hice yo.**
- Validación funcional con sesión real (Fase 7): subida de imágenes, firmas, exportación Excel/PDF. Requiere credenciales.
- Fase 8 (mejoras opcionales) — sin empezar, cada una en su propio PR.

---

## Contexto y justificación

Esta migración **no es opcional ni cosmética**: la versión actual (`next@15.3.0`) tiene vulnerabilidades críticas activamente explotadas, incluyendo un RCE de CVSS 10.0. La migración a Next 16 es simultáneamente la vía de remediación de seguridad y una mejora de plataforma.

**Buena noticia:** el trabajo más pesado de una migración a Next 16 —las Async Request APIs— **ya está hecho** en este código. Las 10 rutas dinámicas ya usan `use(params)` / `await params` / `useParams()`, y todos los `cookies()`/`headers()` ya llevan `await`. Lo que queda es mayormente configuración.

**Riesgo global estimado:** bajo-medio.

---

## Vulnerabilidades que se corrigen

| CVE | Severidad | Descripción | Fix |
|---|---|---|---|
| CVE-2025-66478 / CVE-2025-55182 ("React2Shell") | **CVSS 10.0 — RCE** | El protocolo RSC permitía que input no confiable influyera en la ejecución del servidor. Afecta App Router. Explotado en la práctica. | ≥15.3.6 / ≥16.0.7 |
| CVE-2025-55184 + CVE-2025-67779 | Alta — DoS | Request HTTP diseñado cuelga el proceso en bucle infinito | ≥15.3.8 / ≥16.0.10 |
| CVE-2025-55183 | Media — exposición de código | Un request puede hacer que una Server Function devuelva el código compilado de otras Server Functions | ≥15.3.8 |
| CVE-2025-49005 | Media — cache poisoning | Afecta App Router `>=15.3.0 <15.3.3` (versión actual exacta) | ≥15.3.3 |
| CVE-2026-29057 | Alta — HTTP request smuggling **en rewrites** | `DELETE`/`OPTIONS` con `Transfer-Encoding: chunked` permite colar un request a rutas backend no previstas. **Aplica directamente**: `next.config.ts` usa rewrites hacia BackendForm e IAM Core. | ≥15.5.13 / ≥16.1.7 |
| CVE-2026-44574 | Alta — bypass de autorización en middleware | Query params manipulados alteran la ruta dinámica vista por la página sin cambiar el path. No aplica hoy (`>=15.4.0`), **pero sí aplicaría si se migra a un 16.x < 16.2.5**. | ≥15.5.16 / ≥16.2.5 |

> ⚠️ El destino **16.2.12** cubre todas las anteriores. No aterrizar en ninguna versión 16.x inferior a **16.2.5**.

---

## Inventario de dependencias

### A) Actualización obligatoria (Next 16)

| Paquete | Actual | Destino | Motivo |
|---|---|---|---|
| `next` | 15.3.0 | **16.2.12** | Objetivo + todos los CVE |
| `react` | 19.0.0 | **19.2.8** | Next 16 App Router requiere React 19.2 |
| `react-dom` | 19.0.0 | **19.2.8** | Idem |
| `@types/react` | 19.0.8 | 19.2.17 | Alineación de tipos |
| `@types/react-dom` | 19.0.3 | 19.2.3 | Alineación de tipos |
| `eslint-config-next` | 15.1.6 *(pin exacto)* | **16.2.12** | Flat config por defecto; `next lint` eliminado |

Requisitos de entorno — **ya cumplidos**: Node 22.13.1 (mínimo 20.9) ✓ · TypeScript 5.7.3 (mínimo 5.1) ✓

### B) Actualización recomendada (minors seguros)

`@mui/material` y `@mui/icons-material` 7.0.2 → 7.3.11 · `react-hook-form` 7.54.2 → 7.83.0 · `recharts` 3.4.1 → 3.10.1 · `@hookform/resolvers` 5.2.2 → 5.5.7 · `dayjs` 1.11.13 → 1.11.21 · `cloudinary` 2.7.0 → 2.10.0 · `typescript` 5.7.3 → 5.9.3 · `@eslint/eslintrc` 3.2.0 → 3.3.6

### C) 🗑️ Dependencias SIN USO — eliminar

Verificado por búsqueda exhaustiva en todo el repositorio (código, configs, CSS). Las únicas coincidencias están en `yarn.lock` como dependencias transitivas.

| Paquete | Usos en código | Nota |
|---|---|---|
| `@react-pdf/renderer` | **0** | ⚠️ `CLAUDE.md` afirma que se usa para PDF estructurado — **es falso**. Los PDF se generan en el backend (PDFKit). Documentación desactualizada, corregir. |
| `jspdf-autotable` | **0** | Además su peer `jspdf` **ni siquiera está declarado** — si alguien lo importara, rompería. |
| `next-cloudinary` | **0** | Se usa el SDK server-side `cloudinary` directamente en `src/lib/actions/cloudinary.ts`. |
| `react-to-pdf` | **0** | — |
| `qrcode` | **0** | La generación de QR es server-side en el backend. |
| `@fontsource/roboto` | **0** | Se usa `next/font/google` (Inter) en `src/app/layout.tsx`. |
| `prop-types` | **0** directos | Solo transitiva de MUI, que la resuelve sola. Innecesaria como dep directa. |

**Reubicar (no eliminar):** `@types/react-signature-canvas` está en `dependencies` — debe ir a `devDependencies`.

**Mantener aunque no aparezcan importadas:**
- `@emotion/react` y `@emotion/styled` → peer dependencies obligatorias de MUI. **No tocar.**
- `html2canvas` → 1 uso real en `VehicleDamageSelector.tsx:7`.

**Beneficio:** menos superficie de ataque, instalaciones más rápidas, y `package.json` que refleja la realidad.

### D) Explícitamente FUERA de alcance

No mezclar en esta migración (majors independientes, cada uno merece su propio PR):
`@mui/material` 9 · `@mui/x-date-pickers` 9 · `zod` 4 · `jspdf-autotable` 5 · `eslint` 10 · `typescript` 7 · `openid-client` 6

---

## Plan de saneamiento de lint (post-migración)

Estado: **77 warnings, 0 errores** (partiendo de 82). El total baja poco pero la composición cambió mucho: se cerraron 3 categorías completas y afloraron hallazgos que antes estaban ocultos.

> ### Estado de la prueba funcional de la migración de `watch()`
>
> Probado en la app corriendo sobre Next 16 con el código migrado (sesión de inspector técnico):
>
> - ✅ Login, dashboard y listado de plantillas desde el backend
> - ✅ `VehicleInspectionForm` renderiza sin errores de consola
> - ✅ Su validación de paso 2 bloquea correctamente y muestra los mensajes de campo obligatorio
> - ✅ **Avanza de paso 2 → paso 3 al completar los campos** — evidencia directa de que el estado de RHF y los re-renders siguen funcionando con `useWatch`
> - ✅ `GroupedAccessoriesForm` renderiza y sus campos registran valores
> - ✅ Cero errores de consola y de red en toda la sesión
>
> ❌ **No verificado — sigue pendiente:**
>
> | Caso | Por qué no se pudo |
> |---|---|
> | Paso 5 (`Step5ReviewSection`) con datos reales — **la aserción de mayor riesgo** | La BD no tiene ninguna inspección de herramientas/equipos guardada que abrir en modo revisión, y llegar al paso 5 desde cero exige firmar en canvas (paso 4), que además dispara `onSaveDraft` |
> | Borrador en `localStorage` (`subscribe`) de sistemas de emergencia | El `Select` de área/TAG no carga opciones vía automatización |
> | `TareaFormModal`, `RoutineInspectionSection`, contadores de los dos `FormBuilder` | Los `Autocomplete` de MUI no registran la selección de opción de forma fiable por automatización |
>
> **Comprobación manual sugerida (2 min con sesión real):** llenar cualquiera de los tres formularios hasta el paso de Revisión Final y confirmar que el resumen muestra **todos** los datos, no vacíos ni parciales. Si eso pasa, la migración está validada — es el mismo cambio en los tres.

### ✅ Resuelto en esta pasada

| Regla | Qué era realmente | Acción |
|---|---|---|
| `jsx-a11y/alt-text` (4) | **Falso positivo.** `<Image />` es el icono de `@mui/icons-material`, no `next/image` — la regla lo detecta por nombre. Añadirle `alt` habría sido incorrecto. | Import renombrado a `Image as ImageIcon` en `FormBuilder.tsx` y `SectionBuilderView.tsx` (convención habitual para iconos MUI que colisionan con nombres del DOM). |
| `@next/next/no-img-element` (7) | **`<img>` legítimos**, todos ya con `alt`: data-URIs base64 (firmas, esquema de daños, QR, imágenes de pregunta) que `next/image` no puede optimizar. Además `VehicleDamageSelector` necesita un `ref` real sobre el `<img>` para html2canvas y el mapeo de coordenadas del clic — migrarlo sería una regresión. | Excepción documentada por archivo en `eslint.config.mjs`. |
| `react-hooks/incompatible-library` (10) | **Sí tenía arreglo.** El React Compiler tiene un caso especial para RHF y señala `watch` en concreto: *"`useForm()` returns a `watch()` function which cannot be memoized safely"*. No señala `useWatch`, que es justamente la API que RHF provee para esto. | Migrados los 10 sitios a la API correcta (ver abajo). Regla en **`error`** y en cero, para que no reaparezca `watch()`. |

#### Migración de `watch()` — qué se usó en cada caso

RHF subido a **7.83.0** (desde 7.54.2) para disponer de `subscribe`.

| Caso de uso | Antes | Ahora | Por qué |
|---|---|---|---|
| Leer un campo durante el render | `watch("campo")` | `useWatch({ control, name })` | Hook real y rastreable; además acota el re-render al valor suscrito en vez de repintar todo el componente en cada tecla. |
| Leer un valor dentro de un callback | `watch("areas")` en `useCallback` | `getValues("areas")` | Era un mal uso: solo se necesita el valor en el momento del clic, no una suscripción que re-renderice. |
| Suscripción dentro de un efecto | `watch(cb)` (auto-guardado del borrador) | `subscribe({ formState: { values: true }, callback })` | Hace lo mismo **sin re-renderizar** el formulario en cada tecla. |
| Snapshot completo del formulario | `watch()` sin argumentos | `useWatch({ control })` + `getValues()` | Sin `name`, `useWatch` devuelve `DeepPartial<T>` y el paso de revisión necesita el tipo completo. `useWatch` aporta la suscripción, `getValues` el dato bien tipado — sin castear. |

⚠️ **Efecto secundario esperado, importante de entender:** al quitar el bailout, el React Compiler **pasa a analizar de verdad** esos componentes y saca a la luz hallazgos que antes ocultaba el *"Compilation Skipped"*: `set-state-in-effect` 33→39, `immutability` 16→21, `preserve-manual-memoization` 2→4, y 3 nuevos `react-hooks/refs`. No son regresiones: estaban ahí, tapados.

Los 3 `react-hooks/refs` son el patrón canónico `onSubmit={handleSubmit(fn)}`: si `fn` cierra sobre un ref, el compilador asume que podría leerse en render, cuando solo se invoca al enviar. Quedan en `warn` documentados.

### ⏳ Pendiente (77 avisos) — por lotes, en PRs separados

**Lote 1 — `react-hooks/immutability` (21 avisos) + `exhaustive-deps` (9).**
Es un solo patrón, mecánico y de riesgo bajo. Todas las páginas de `dashboard/config/*` hacen:

```tsx
useEffect(() => { cargarDatos() }, [])      // ← usa la función…
const cargarDatos = async () => { … }        // …declarada DESPUÉS
```

Funciona en runtime (el efecto corre tras el render), pero es un riesgo de TDZ que el compilador no puede verificar, y es la causa directa de los `exhaustive-deps` de los mismos archivos. **Receta:** mover la función encima del efecto, envolverla en `useCallback` con sus deps reales, y añadirla al array de deps. **Ojo:** si el `useCallback` no queda estable, se dispara un bucle de fetch — cada página necesita comprobación funcional, no solo `tsc`.

**Lote 2 — `react-hooks/set-state-in-effect` (39).**
⚠️ **No es un fix masivo.** Una parte son el patrón `mounted`-flag legítimo y necesario en Next.js para evitar desajustes de hidratación — p. ej. `ThemeContext.tsx:35` lee `localStorage` (inexistente en el servidor) dentro del efecto justamente por eso. "Corregirlos" en bloque introduciría bugs de hidratación. Requiere criterio caso por caso: separar los que son derivación de estado evitable (se resuelven con lazy initializer de `useState` o calculando durante el render) de los que son sincronización real con un sistema externo, que se dejan y se silencian puntualmente.

**Lote 3 — `preserve-manual-memoization` (4) + `refs` (3) + `static-components` (1).**
Aislados y de bajo impacto. Los 3 de `refs` son el patrón canónico de RHF descrito arriba y probablemente se queden en `warn` de forma permanente. Cerrar al final, cuando los lotes 1 y 2 hayan bajado el ruido.

**Criterio de cierre:** cada regla que llegue a cero se sube de `warn` a `error` en `eslint.config.mjs` para que no reaparezca.

---

## FASE 0 — Parche de seguridad urgente
**Prioridad: ejecutar de inmediato, independiente del resto del plan.**

Bump dentro de la línea 15, sin breaking changes de framework. Permite cerrar la exposición crítica hoy sin esperar a completar la migración.

```bash
yarn add next@15.5.22 react@19.2.8 react-dom@19.2.8
```

> `15.5.22` (no `15.3.9`): la línea 15.3 **no** incluye el fix de CVE-2026-29057 (request smuggling en rewrites), que requiere ≥15.5.13. Dado que este proyecto usa rewrites hacia dos backends, es un fix necesario.

**Acción adicional obligatoria:** rotar todos los secretos de `.env.local` (frontend) y `.env` (BackendForm) — `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, credenciales de MongoDB. El advisory de Vercel lo recomienda explícitamente para cualquier aplicación que haya estado en línea sin parchear.

**Validación:**
- [ ] `npx tsc --noEmit` limpio
- [ ] `yarn build` exitoso
- [ ] Login SSO end-to-end funciona
- [ ] Una inspección se crea y se guarda correctamente

---

## FASE 1 — Preparación y línea base

1. Crear rama: `git checkout -b feat/next16`
2. Registrar línea base — guardar el output de:
   - `npx tsc --noEmit`
   - `yarn build`
   - `yarn lint`
3. Verificar que no hay trabajo sin commitear (`git status`).

> **Nota operativa:** el dev server en el puerto 3001 debe detenerse antes de correr `yarn build` en Next 15 (comparten `.next/`). Este conflicto **desaparece en Next 16**, que separa `next dev` en `.next/dev`.

**Validación:** los tres comandos documentados como referencia para comparar después.

---

## FASE 2 — Limpieza de dependencias sin uso

Se hace **antes** de la migración para reducir la superficie de lo que hay que revalidar bajo Turbopack.

```bash
yarn remove @react-pdf/renderer jspdf-autotable next-cloudinary react-to-pdf qrcode @fontsource/roboto prop-types
yarn remove @types/react-signature-canvas && yarn add -D @types/react-signature-canvas
```

Además: corregir en `CLAUDE.md` la línea que afirma que el PDF del frontend usa `@react-pdf/renderer` + `jspdf-autotable`. La realidad es que el frontend solo usa `html2canvas` (en un único componente) y los PDF se generan en el backend.

**Validación:**
- [ ] `npx tsc --noEmit` limpio
- [ ] `yarn build` exitoso
- [ ] `yarn lint` sin regresiones
- [ ] Commit aislado: `chore: eliminar dependencias sin uso`

---

## FASE 3 — Codemod oficial de Next 16

```bash
npx @next/codemod@canary upgrade latest
```

Automatiza: config de `turbopack`, `next lint` → ESLint CLI, convención `middleware` → `proxy`, eliminación de prefijos `unstable_`, y remoción de `experimental_ppr`.

> ⚠️ **Revisar el diff completo a mano.** Nunca aceptar un codemod a ciegas, especialmente el renombrado de `middleware.ts` → `proxy.ts`, que toca la autenticación de toda la aplicación.

**Validación:** `git diff` revisado archivo por archivo antes de continuar.

---

## FASE 4 — Actualización de versiones

```bash
yarn add next@16.2.12 react@19.2.8 react-dom@19.2.8
yarn add -D @types/react@19.2.17 @types/react-dom@19.2.3 eslint-config-next@16.2.12 typescript@5.9.3
```

Luego, en un commit separado, los minors recomendados del bloque (B).

**Validación:**
- [ ] `npx tsc --noEmit` — aquí es donde aparecerán los errores de tipos si algo quedó pendiente
- [ ] Resolver cualquier error antes de pasar a la Fase 5

---

## FASE 5 — Cambios manuales de código

### 5.1 · `middleware.ts` → `proxy.ts`
**Archivo:** `src/middleware.ts` → `src/proxy.ts`

- Renombrar el archivo.
- Renombrar la función exportada: `export async function middleware(request)` → `export async function proxy(request)`.
- El `export const config = { matcher: [...] }` se mantiene sin cambios.
- **Cambio de runtime:** `proxy` corre siempre en `nodejs` (no configurable, no soporta `edge`). **En este caso es una mejora**: el middleware actual usa `Buffer.from()` para decodificar el JWT y hace `fetch` a IAM Core — el runtime de Node le viene mejor que Edge.
- Verificar que el flujo de refresh silencioso de token sigue funcionando (`refreshFromIamCore` + `applyCookies`).

### 5.2 · Comportamiento de scroll
**Archivo:** `src/app/layout.tsx:29`

`src/app/globals.css:20` declara `scroll-behavior: smooth` globalmente. En Next 15 el framework lo neutralizaba durante las transiciones de ruta; en Next 16 ya no. Sin este cambio, la navegación del dashboard mostrará un scroll-to-top animado y lento en vez de instantáneo.

```tsx
// Antes
<html lang="es" className={inter.variable}>

// Después
<html lang="es" className={inter.variable} data-scroll-behavior="smooth">
```

### 5.3 · Scripts de `package.json`

```jsonc
{
  "scripts": {
    "dev": "next dev -p 3001",   // --turbopack ya es el default, la flag sobra
    "build": "next build",        // ahora usa Turbopack automáticamente
    "start": "next start",
    "lint": "eslint ."            // `next lint` fue eliminado del framework
  }
}
```

### 5.4 · ESLint flat config
**Archivo:** `eslint.config.mjs`

Migrar de `FlatCompat` + `next/core-web-vitals` a la flat config nativa que expone `@next/eslint-plugin-next` v16. Eliminar el shim de compatibilidad y las importaciones de `path`/`url` que ya no harán falta.

**Validación de la fase:**
- [ ] `npx tsc --noEmit` limpio
- [ ] `yarn lint` funciona con el nuevo comando
- [ ] `yarn build` exitoso con Turbopack

---

## FASE 6 — Validación técnica por capas

Ejecutar en este orden; no avanzar si una capa falla.

1. `npx tsc --noEmit` → sin errores
2. `yarn lint` → sin regresiones contra la línea base de la Fase 1
3. `yarn build` → build de producción con Turbopack
4. `yarn start` → arrancar en modo producción y revisar consola del servidor
5. Abrir la app y revisar la consola del navegador y la pestaña de red

**Puntos de atención específicos bajo Turbopack** (bundler distinto al de la línea base):
- `openid-client@5.7.1` — está declarado en `serverExternalPackages`; es CommonJS. **Este es el principal riesgo de bundling del proyecto.** Verificar que se externaliza correctamente y que `src/lib/oidc.ts` sigue funcionando.
- `html2canvas` — usado en `VehicleDamageSelector.tsx`
- `react-signature-canvas` — firmas del inspector y del supervisor

> **Nota:** `next build` en Next 16 ya no reporta las métricas `size` / `First Load JS`. Si se usaban como referencia, sustituir por Chrome Lighthouse.

---

## FASE 7 — Validación funcional en navegador

Priorizada por riesgo real, de mayor a menor:

| # | Flujo | Por qué es prioritario |
|---|---|---|
| 1 | **Login SSO vía IAM Portal + refresh silencioso de token** | Es el código que cambió de runtime (`middleware` → `proxy`). Si algo se rompe, se rompe aquí. |
| 2 | **Rewrites `/api/forms/*` y `/api/iam/*`** | Proxy hacia BackendForm e IAM Core; afectados por el fix de request smuggling. |
| 3 | **Subida de imágenes y firmas** | Cloudinary + `react-signature-canvas` + `next/image` con data-URIs. Nuevos defaults de imágenes. |
| 4 | **Exportación PDF / Excel** | `html2canvas` en frontend; descargas vía proxy desde backend. |
| 5 | **Navegación del dashboard** | Verificar el nuevo comportamiento de scroll (5.2). |
| 6 | **Módulos recientes: PGR, Planes de Acción, gráficos del dashboard** | Código nuevo, menos rodado en producción. |

**Sobre los nuevos defaults de `next/image`:** cambian `minimumCacheTTL` (60s → 4h), `qualities` (ahora solo `[75]`), `imageSizes` (se elimina el 16), `maximumRedirects` (ilimitado → 3) y se bloquea la optimización de IPs locales. El proyecto usa `<Image>` en 3 lugares (`Setup2faModal`, `SectionRenderer`, `SignatureField`) con URLs de Cloudinary y data-URIs, y **no pasa prop `quality` en ningún lado**, así que no se espera impacto — pero verificar visualmente el QR de 2FA y las firmas.

**Sobre el caching:** los Server Components que dependían del cache implícito de v15 corren **sin cache** por defecto en v16. El impacto aquí es acotado porque los adapters ya usan `cache: "no-store"` explícito, pero conviene medir el volumen de requests contra BackendForm tras migrar.

---

## FASE 8 — Mejoras post-migración (opcionales, PRs separados)

Una vez estable en 16.2.12, cada uno en su propio PR:

| Mejora | Qué aporta |
|---|---|
| `cacheComponents: true` | PPR estable — navegación instantánea con contenido dinámico |
| `reactCompiler: true` | Memoización automática, cero cambios de código (⚠️ sube el tiempo de build) |
| `updateTag()` / `refresh()` | Semántica *read-your-writes* en las Server Actions de PGR y Planes de Acción — el usuario ve su cambio de inmediato |
| `turbopackFileSystemCacheForDev` | Cache en disco entre reinicios del dev server |
| `useEffectEvent` (React 19.2) | Extraer lógica no reactiva de los `useEffect` |
| Endurecer CSP | `next.config.ts` tiene hoy `'unsafe-inline' 'unsafe-eval'` en `script-src` |
| `openid-client` v5 → v6 | v5 está en fin de vida. Es una reescritura de API (`Issuer.discover()` → `discovery()`); afecta solo a `src/lib/oidc.ts` |

---

## Rollback

Cada fase es un commit aislado en la rama `feat/next16`. Si una fase falla:

1. `git status` y stash de cualquier trabajo en curso
2. `git reset --hard <commit-de-la-fase-anterior>`
3. `yarn install --frozen-lockfile` para restaurar el árbol de dependencias exacto

La Fase 0 se despliega y verifica de forma independiente, así que **la seguridad no queda bloqueada por el éxito de la migración**. Si la migración a 16 hay que abortarla, el proyecto igual queda parcheado en 15.5.22.

---

## Checklist maestro

- [x] **Fase 0** — Parche de seguridad a 15.5.22 *(rotación de secretos: pendiente, manual)*
- [x] **Fase 1** — Línea base documentada (tsc limpio antes de empezar)
- [x] **Fase 2** — Eliminar 6 dependencias sin uso + corregir `CLAUDE.md`
- [x] **Fase 3** — Cambios del codemod aplicados a mano
- [x] **Fase 4** — Bump a Next 16.2.12 / React 19.2.8
- [x] **Fase 5** — `proxy.ts`, `data-scroll-behavior`, scripts, ESLint flat config
- [x] **Fase 6** — Validación técnica (tsc / lint / build / dev / proxy / openid-client)
- [ ] **Fase 7** — Validación funcional con sesión real (requiere credenciales)
- [ ] **Fase 8** — Mejoras opcionales (PRs separados)

---

## Referencias

- [Upgrading: Version 16 — Next.js](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Security Advisory: CVE-2025-66478 (React2Shell)](https://nextjs.org/blog/CVE-2025-66478)
- [Next.js Security Update: December 11, 2025](https://nextjs.org/blog/security-update-2025-12-11)
- [GHSA-ggv3-7p47-pfv8 — HTTP request smuggling en rewrites](https://github.com/vercel/next.js/security/advisories/GHSA-ggv3-7p47-pfv8)
- [GHSA-492v-c6pp-mqqv — Bypass de middleware por inyección de parámetros de ruta](https://github.com/vercel/next.js/security/advisories/GHSA-492v-c6pp-mqqv)
