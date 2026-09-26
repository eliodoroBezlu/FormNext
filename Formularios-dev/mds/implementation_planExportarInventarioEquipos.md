# Exportación de inventario de herramientas y equipos (Excel)

## Contexto

`GestionEquipos` (`src/app/dashboard/config/inventario-equipos/equipos/page.tsx`) es el CRUD del inventario. Hoy solo tiene **importación** de Excel (`migrarExcel`, botón "Subir Inventario Excel") — no existe ningún export, ni Excel ni PDF, en todo el módulo.

Ningún export existente en el repo sirve de plantilla directa: `inspecciones-emergencia-excel.service.ts` escribe sobre celdas fijas de una plantilla `.xlsx` precargada (`worksheet.getCell('E4').value = ...`), no arma filas dinámicas desde un array. Esta feature es la primera del repo con el patrón "columnas dinámicas + una fila por registro" (más cercano a `worksheet.columns = [...]` + `worksheet.addRow()` de ExcelJS).

El problema de fondo que definió el diseño: `especificaciones` (los campos extra del equipo) varía por `tipo_equipo`, según lo que se configuró en `config-formulario`. Una hoja con equipos de tipos mezclados tendría columnas incompatibles entre filas.

> [!NOTE]
> **Revisión (2026-09-25, tras la primera implementación).** La primera versión resolvía esto exigiendo elegir un `tipo_equipo` antes de exportar — sin tipo filtrado, el botón no hacía nada más que mostrar un aviso, y al probarlo el usuario esperaba que "sin nada seleccionado" exportara todo. Se cambió el diseño: **si hay un tipo filtrado, sale una sola hoja** (igual que antes); **si no hay tipo filtrado, `EquiposExcelService` agrupa los equipos por `tipo_equipo` y arma una hoja por grupo dentro del mismo archivo**. Nunca se mezclan columnas de tipos distintos en una sola hoja — solo cambió qué pasa cuando no se elige un tipo: antes bloqueaba, ahora arma varias hojas.

## Decisiones ya tomadas (con el usuario, 2026-09-25)

| Pregunta | Decisión |
|---|---|
| Formato | Solo Excel. PDF queda fuera de esta iteración. |
| Fotos | Miniatura incrustada (como ya se hace con firmas en `linternas-pdf.service.ts`/Excel de inspecciones-emergencia, vía `image-resize.util.ts`) |
| Alcance | Respeta los filtros activos en pantalla (área, ubicación, búsqueda) — exporta lo que el usuario está viendo, no todo el tipo a ciegas |
| Permisos | Mismo nivel que gestión: `ADMIN` + permiso `MANAGE_SETTINGS` (igual que crear/editar/borrar equipos hoy) |
| QR por equipo | Fuera de alcance — no hay ninguna integración QR↔equipo hoy, se evalúa como iteración aparte si surge la necesidad |

## User Review Required

> [!IMPORTANT]
> **El export queda acotado a un solo `tipo_equipo` por acción.** Si el usuario no tiene un tipo de equipo filtrado en pantalla, el botón de exportar debe pedir que elija uno antes de generar el archivo — no se puede exportar "todos los tipos" en una sola hoja sin volver al problema de columnas mezcladas. Confirmá que este comportamiento (pedir el tipo si no está filtrado) es el esperado, o si preferís otra señal en la UI.

> [!WARNING]
> **Las fotos incrustadas tienen costo de rendimiento real.** Cada foto requiere una descarga server-side (desde donde sea que viva `fotos[].url` — falta confirmar si es Cloudinary o el `upload/` propio del backend) antes de incrustarla en la celda. Con un tipo de equipo que tenga muchos registros, esto puede volverse lento. Propongo un tope (a definir, ej. 150-200 filas) por encima del cual el export sigue generándose pero sin incrustar fotos (con aviso al usuario), en vez de fallar o tardar minutos. Necesito que confirmes un número, o que decidamos el tope una vez que midamos con datos reales.

## Open Questions

> [!NOTE]
> **¿De dónde salen las URLs de `fotos[].url`?** Hay que confirmar si son URLs de Cloudinary (públicas, fetch directo) o rutas del `upload/` module del propio backend (que podrían requerir la misma cookie/auth que el resto de la API). Esto define si el fetch de cada imagen para incrustarla es un `fetch()` simple o necesita reenviar credenciales. Se resuelve al empezar la implementación, leyendo `upload.controller.ts` y cómo se guardan las fotos al crear un equipo.

> [!NOTE]
> **Nombre del archivo.** Los exports existentes usan `buildContentDispositionHeader`/`buildInspectionFilename` (`src/common/utils/download-filename.util.ts` en el backend). Propongo `inventario_<tipo_equipo>_<fecha>.xlsx`, saneado con el mismo helper. Sin objeción, se usa este patrón.

## Proposed Changes

### 1. Backend — `BackendForm/src/modules/equipos/`

- **Endpoint nuevo:** `POST /equipos/exportar-excel`, guardado igual que create/update/delete (`@Roles(Role.ADMIN)` + `@RequirePermissions(Permission.MANAGE_SETTINGS)`).
- **Body:** `{ ids: string[] }` — el frontend manda los `_id` de los equipos ya filtrados en pantalla (mismo criterio "WYSIWYG" que ya usa el resto del repo para exports de un solo registro, extendido a un lote). Evita duplicar la lógica de filtros (área/ubicación/búsqueda) en el backend, que hoy solo existe del lado del cliente.
- **Servicio nuevo:** `equipos-excel.service.ts` (separado de `equipos.service.ts`, siguiendo el mismo patrón de separación que `inspecciones-emergencia-excel.service.ts`).
  - Recibe los equipos ya poblados (`area_id`, `ubicacion_id`, `clasificacion_id` resueltos a texto legible, igual que `findAll()`).
  - Valida que todos los `ids` recibidos compartan el mismo `tipo_equipo` — si no, rechaza con un mensaje claro (defensa en el backend, no solo en el frontend).
  - Columnas fijas: código, descripción, marca, modelo, núm. serie, cantidad, costo, área/superintendencia/gerencia (resuelto según `ambito`), ubicación, clasificación, responsable, estado, frecuencia de uso, observaciones — mismo set que `camposComunesExcel` en `migracion.service.ts`, en el sentido inverso.
  - Columnas dinámicas: unión de las claves de `especificaciones` presentes en el lote (deberían ser las mismas para todos, al ser un solo `tipo_equipo`).
  - Columna de foto: miniatura incrustada de `fotos[0]` (portada), vía el helper existente `image-resize.util.ts`.
  - Nombre de archivo: `inventario_<tipo_equipo>_<fecha>.xlsx`, vía `buildContentDispositionHeader`.

### 2. Frontend — `src/app/dashboard/config/inventario-equipos/equipos/`

- **Botón "Exportar Excel"** junto a los botones de migración existentes en `equipos/page.tsx`, gateado con `<Can perform={Permission.MANAGE_SETTINGS}>` (mismo permiso que ya gatea editar/borrar en esta misma pantalla — se reutiliza el check existente, no uno nuevo).
- Deshabilitado (o pide elegir tipo) si no hay un `tipo_equipo` activo en el filtro.
- Al hacer click: toma los `_id` de los equipos actualmente visibles (después de aplicar los filtros de área/ubicación/búsqueda ya existentes), y llama a un adaptador nuevo en `src/lib/actions/client.ts` (mismo patrón que `descargarExcelInspeccionesEmergenciaCliente`), que hace `POST` con el body `{ ids }` a través del proxy genérico `/api/download/[...path]` — **sin cambios al proxy**, porque ya reenvía body en POST (confirmado en la auditoría de seguridad de este mismo repo).

### 3. Trazabilidad

No requiere cambio explícito — el interceptor de auditoría global del backend ya cubre módulos nuevos sin pedirlo (ver `project_auditoria_global` en las notas del proyecto). Se confirma una vez implementado que el nuevo endpoint efectivamente queda registrado, no se da por sentado.

---

## Estado

✅ **Implementado (2026-09-25).**

### Archivos tocados

**Backend:**
- `src/modules/equipos/dto/exportar-equipos.dto.ts` (nuevo) — `{ ids: string[] }` validado con `class-validator`.
- `src/modules/equipos/equipos-excel.service.ts` (nuevo, revisado 2026-09-25) — arma el workbook agrupando por `tipo_equipo`: una hoja por grupo, columnas fijas + unión de `especificaciones` dentro de cada hoja, nombres de hoja desambiguados si dos tipos truncan igual a 31 caracteres, incrusta la foto de portada leyéndola de disco (con el límite de 150 filas, contado sobre el total del lote, no por hoja).
- `src/modules/equipos/equipos.service.ts` — nuevo método `findByIds()`, mismo `populate` que `findAll()`/`findOne()`.
- `src/modules/equipos/equipos.controller.ts` — nuevo `POST /equipos/exportar-excel`, mismo guard que crear/editar/borrar (`Role.ADMIN` + `Permission.MANAGE_SETTINGS`).
- `src/modules/equipos/equipos.module.ts` — registra `EquiposExcelService`.
- `src/common/utils/download-filename.util.ts` — se exportó `sanitizePart()` (antes privada del módulo) para sanear `tipo_equipo` en el nombre del archivo, en vez de reimplementar un sanitizador local (el error que ya se había encontrado en `pgr.controller.ts` durante la auditoría de seguridad).

**Frontend:**
- `src/lib/actions/client.ts` — nueva `exportarInventarioEquiposExcelCliente(ids)`, mismo patrón POST+blob que `descargarZipConAuth`, sin cambios al proxy (`/api/download/[...path]` ya reenvía body en POST).
- `src/app/dashboard/config/inventario-equipos/equipos/page.tsx` — botón "Exportar Excel" en la barra de acciones, handler `handleExportarExcel` (ya no exige `tipoFilter`; confirma con el usuario si supera 150 equipos; usa `filteredEquipos` — respeta los filtros de pantalla tal como se decidió).

### Desviación del plan original, y por qué

El plan proponía gatear el botón con `<Can perform={Permission.MANAGE_SETTINGS}>`, "reutilizando el check existente" en Editar/Borrar de esta misma pantalla. Al implementar se encontró que **ese check no existe**: `GestionEquipos` no importa `<Can>` en ningún lado — los botones de Editar/Borrar/Migrar se muestran siempre, y es el backend el que rechaza con 403 a quien no tenga el rol. Se implementó el botón de exportar de la misma forma (sin gate visual), para no introducir una convención nueva en un archivo que hoy no la tiene. El backend sigue siendo la barrera real en los dos casos.

### Verificación

`npx tsc --noEmit` (frontend) y `yarn build` (backend) limpios. `npx eslint` limpio en los archivos tocados — dos de los archivos de backend (`equipos.service.ts`, `equipos.controller.ts`) tenían fin de línea CRLF preexistente (de antes de este cambio) que `eslint --fix` normalizó a LF como parte del mismo lint, sin tocar el resto del repo.

Pendiente: probar el botón end-to-end en el navegador (el dev server lo tiene corriendo el usuario en su propia terminal).
