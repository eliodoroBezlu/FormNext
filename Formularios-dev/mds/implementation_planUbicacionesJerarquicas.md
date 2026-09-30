# Ubicaciones jerárquicas (árbol de varios niveles)

## Contexto

"Gestión de Ubicaciones" (`src/app/dashboard/config/inventario-equipos/ubicaciones/page.tsx`) es hoy una **lista plana**: cada ubicación es solo un `nombre` único. En planta la realidad es un árbol — *Taller de flotación › Bodega de herramientas 1 › Estante A* — y hoy la única forma de expresarlo es inventar nombres largos o dejar al equipo en la ubicación general.

Estado actual del modelo (`BackendForm/src/modules/ubicacion/`):

- `ubicacion.schema.ts`: `nombre` (`unique`, índice `nombre_1`), `activo`, timestamps, plugin `bajaLogica`. Colección `ubicacions`.
- `ubicacion.service.ts`: alta con chequeo de duplicado case-insensitive por regex, `findByNameOrCreate()` (lo usa el importador), baja lógica y `restaurar`.
- `equipos.ubicacion_id` → ref `Ubicacion`. Es la **única** colección que la referencia.

Datos reales medidos antes de planificar (solo lectura, 2026-09-26):

| Métrica | Valor |
|---|---|
| Ubicaciones | 26 (0 dadas de baja) |
| Equipos | 1.878 |
| Equipos apuntando a una ubicación inexistente | 0 |
| Mayores | Sin Ubicación 417 · TALLER DE SOLDADURA 313 · Taller de flotacion 270 · Oficinas Mantenimiento planta 201 |

Hay casi-duplicados que hoy conviven (`TALLER DE SOLDADURA` / `TALLER SOLDADURA`, `AREA240` / `area 240`, `TALLER DE SOLDADURA MOLIENDA`, `TALLER DE SOLDADURA TALLER G`). No se tocan automáticamente: son justo el material de la fase 2 (reorganizar a mano).

## Decisiones tomadas (con el usuario, 2026-09-26)

| Pregunta | Decisión |
|---|---|
| Modelo de árbol | Lista de adyacencia (`padre`) como fuente de verdad + campos derivados `ancestros`, `ruta`, `nivel` para consultar sin recursión |
| Profundidad máxima | **7 niveles** (`nivel` 0 a 6) |
| Baja de un nodo con hijos o equipos activos | **Se bloquea** con mensaje claro; primero hay que mover/dar de baja los hijos y reubicar los equipos |
| Migración | *Expand/contract*: todas las ubicaciones actuales pasan a ser raíces; los equipos no se tocan. El reordenamiento en árbol lo hace el usuario desde la UI |
| Importador | Hoy **no** acepta rutas. **Pasa a aceptarlas** con separador `>` — y esa es la norma para cargar la columna "Ubicación" del Excel de ahora en adelante (ver sección 4) |
| Dependencias nuevas | Ninguna — `@mui/x-tree-view` no está instalado; se usa una tabla indentada colapsable con MUI existente |

## User Review Required

> [!IMPORTANT]
> **Cambia la regla de unicidad del nombre.** Hoy `nombre` es único en toda la colección. Con el árbol pasa a ser único **entre hermanos**: puede haber un "Estante A" dentro de *Bodega 1* y otro dentro de *Bodega 2*, pero no dos "Estante A" en la misma bodega. Esto implica **borrar el índice `nombre_1`** en Mongo — Mongoose no borra índices viejos al cambiar el esquema, así que lo hace el script de migración de forma explícita.

> [!WARNING]
> **Antes de correr el script con `--apply`, sacar un respaldo** de la colección `ubicacions` (`mongodump --collection ubicacions`). El script es idempotente y no toca `equipos`, pero el drop del índice único no se deshace solo.

## Open Questions

> [!NOTE]
> **Resuelta (2026-09-26): el importador acepta rutas con `>`.** Ejemplo de celda: `Taller de flotación > Bodega 1 > Estante A`. Se eligió `>` porque no aparece en ningún nombre actual, y `/` sí es plausible en nombres futuros (tipo "Taller E/I"). Queda como **norma de carga** del Excel de inventario — ver "Norma para la columna Ubicación" en la sección 4.

## Proposed Changes

### 1. Esquema — `BackendForm/src/modules/ubicacion/schemas/ubicacion.schema.ts`

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | `string` | Pierde `unique` |
| `nombreNormalizado` | `string` | Mayúsculas, sin tildes, espacios colapsados. Lo calcula el servicio; es la base de la unicidad |
| `padre` | `ObjectId \| null` | ref `Ubicacion`, indexado. `null` = raíz |
| `ancestros` | `ObjectId[]` | De la raíz al padre, indexado. Permite "todo lo que cuelga de X" con un `find({ ancestros: X })` |
| `ruta` | `string` | `"Taller de flotación › Bodega 1 › Estante A"` — lo que se muestra en tablas, Excel y autollenado |
| `nivel` | `number` | 0 = raíz, máximo 6 |

Índices: único compuesto `{ padre: 1, nombreNormalizado: 1 }`; `{ ancestros: 1 }`.

`padre`, `ancestros`, `ruta`, `nivel` y `nombreNormalizado` son derivados **que solo escribe el servicio** — el DTO acepta `nombre` y `padre`, nada más.

### 2. Servicio — `ubicacion.service.ts`

- **Alta:** valida que el padre exista y esté activo, que `nivel ≤ 6`, y que no haya hermano con el mismo `nombreNormalizado`. Si el hermano existe pero **está dado de baja**, responde un 409 que lo dice ("existe dado de baja, restaurarlo") en vez del error crudo de índice duplicado — el índice único no distingue activos de inactivos.
- **Editar / mover** (`PATCH` con `nombre` y/o `padre`):
  - Rechaza ciclos: el nuevo padre no puede ser el propio nodo ni ninguno de sus descendientes (`nuevoPadre.ancestros` no puede contener el `_id`).
  - Rechaza si la profundidad del subárbol movido supera el límite (`nivel nuevo + altura del subárbol ≤ 6`).
  - Recalcula `ancestros`, `ruta` y `nivel` de **todo el subárbol**, incluyendo descendientes dados de baja (`setOptions({ incluirDadosDeBaja: true })`: si no, el plugin los excluiría del `updateMany` y al restaurarlos traerían una ruta vieja). Un `bulkWrite` por subárbol, en transacción si el cluster la soporta.
  - Renombrar también es recalcular: cambia la `ruta` de todos los descendientes.
- **Baja:** bloqueada si tiene hijos activos o equipos (`equipos.countDocuments({ ubicacion_id })`). El mensaje dice cuántos de cada uno.
- **Restaurar:** exige que el padre esté activo (no se restaura un nodo bajo un padre dado de baja).
- **Fusionar** (`POST :id/fusionar-en/:destinoId`, fase 2): mueve los equipos y los hijos del origen al destino y da de baja el origen. Pensado para los casi-duplicados (`TALLER SOLDADURA` → `TALLER DE SOLDADURA`). Pide confirmación en la UI con el número de equipos afectados.
- **Listado:** `findAll` devuelve plano ordenado por `ruta`; el árbol lo arma el frontend (26 nodos hoy — no justifica un endpoint de árbol aparte).

### 3. Migración — `BackendForm/scripts/migrar-ubicaciones-jerarquia.cjs` (nuevo)

Sigue la convención de los scripts existentes (`migrar-actividades-matriz.cjs`): dry-run por defecto, `--apply` para escribir, `MONGODB_URI` leído del `.env`, driver `mongodb` directo.

1. **Antes:** cuenta ubicaciones, equipos y equipos por ubicación; aborta si hay equipos apuntando a ubicaciones inexistentes (hoy 0).
2. Calcula `nombreNormalizado` de las 26 y **aborta si dos colisionan** (con normalización nueva dos nombres distintos podrían quedar iguales; hoy no pasa, pero el script lo verifica en vez de suponerlo).
3. A cada ubicación sin `padre`: `padre: null, ancestros: [], nivel: 0, ruta: nombre, nombreNormalizado`. Idempotente: si ya tiene los campos, no hace nada.
4. `dropIndex('nombre_1')` si existe; crea `{ padre, nombreNormalizado }` único y `{ ancestros }`.
5. **Después:** vuelve a contar y verifica que los equipos por ubicación sean **idénticos** a los del paso 1 (1.878 en total). La colección `equipos` no se escribe en ningún momento.

### 4. Cambios colaterales

**Norma para la columna "Ubicación" del Excel de importación:**

| Celda | Resultado |
|---|---|
| `Taller de flotación` | Ubicación raíz — igual que hoy |
| `Taller de flotación > Bodega 1 > Estante A` | Busca o crea cada tramo **bajo el anterior** y asigna el equipo al último |
| `taller de flotacion > bodega 1` | Encuentra las mismas que arriba: la comparación ignora mayúsculas, tildes y espacios repetidos. Si hay que crear un tramo, se crea con el texto tal como vino |
| `Taller > > Estante` o `> Bodega` | Los tramos vacíos se ignoran |
| Más de 7 tramos | La fila se omite y se reporta en el resultado de la migración, no se trunca en silencio |
| Vacía | `Sin Ubicación`, igual que hoy |

Un nombre de ubicación **no puede contener `>`**: la API lo rechaza al crear o renombrar, para que una ubicación creada a mano siempre pueda escribirse como ruta en el Excel.

**Backend:**
- `equipos/migracion.service.ts` — el importador resuelve rutas con `>` (`findOrCreateByRuta()`); un nombre suelto se busca/crea solo entre raíces.
- `equipos/equipos-excel.service.ts` — la columna "Ubicación" pasa a mostrar `ruta` en vez de `nombre`.
- `migracion.service.spec.ts` — ajustar el mock de `UbicacionService`.

**Frontend:**
- `lib/actions/ubicacion-actions.ts` — tipo `UbicacionBackend` gana `padre`, `ancestros`, `ruta`, `nivel`; acciones nuevas mover/fusionar.
- `ubicaciones/page.tsx` — tabla indentada colapsable, selector de "Ubicación padre" en el diálogo de alta/edición, acciones "Mover bajo…" y "Fusionar en…". El archivo ya tiene 389 líneas: la lógica del árbol (armar árbol desde la lista plana, expandir/colapsar) va a un hook aparte, siguiendo la regla de las ~300 líneas del CLAUDE.md.
- `equipos/page.tsx`:
  - **Filtro:** elegir una ubicación incluye todo lo que cuelga de ella (`ubicacion_id._id === f || ubicacion_id.ancestros.includes(f)`). No requiere backend: `populate('ubicacion_id')` ya trae el documento completo.
  - **Tabla:** mostrar `ruta`.
  - **Formulario:** el `Select` pasa a `Autocomplete` que busca por `ruta` (con 7 niveles, un select plano de nombres sueltos sería ambiguo).
- `herra-equipos/domain/models/EquipmentAutofill.ts` — el autollenado de campos "ubicación" en inspecciones usa `ruta` en vez de `nombre`.

### 5. Trazabilidad

El interceptor global de auditoría ya cubre `PATCH`/`POST` del módulo sin cambios. El script de migración corre fuera de la API, así que no queda en auditoría: deja su propio resumen por consola (antes/después).

## Orden de implementación

1. Esquema + servicio + DTOs + pruebas del servicio (ciclos, profundidad, recálculo de subárbol, baja bloqueada, hermano inactivo).
2. Script de migración — dry-run contra la base local, revisar salida, `--apply`.
3. Cambios colaterales del backend (importador, Excel).
4. Frontend: acciones, pantalla de ubicaciones, pantalla de equipos, autollenado.
5. Fase 2 (usuario): reorganizar en árbol y fusionar casi-duplicados desde la UI.

## Verificación

- **Pruebas automáticas:** mover un nodo bajo su propio descendiente → 400; mover un subárbol de altura 3 bajo un nodo de nivel 5 → 400; renombrar una raíz actualiza `ruta` de nietos (incluido uno dado de baja); baja con hijos/equipos → 409 con conteos; alta con hermano inactivo del mismo nombre → 409 que ofrece restaurar; un nombre suelto en el importador no encuentra nodos no-raíz.
- **Script:** dry-run muestra 26 raíces a crear y 0 colisiones; tras `--apply`, conteos de equipos idénticos; segunda corrida no cambia nada.
- **Manual:** crear *Taller de flotación › Bodega 1 › Estante A*, mover un equipo al estante, filtrar equipos por *Taller de flotación* y verlo incluido; exportar Excel y ver la ruta completa; intentar dar de baja *Bodega 1* → bloqueado.
- `yarn build` + `yarn test` (backend), `npx tsc --noEmit` + `yarn lint` (frontend).

---

## Estado

🟡 **Implementado (2026-09-26), migración sin aplicar.** El código está listo y probado; falta correr el script con `--apply` (previo respaldo) y la prueba manual en el navegador.

### Archivos tocados

**Backend (`BackendForm/`):**
- `src/modules/ubicacion/arbol/ubicacion-arbol.ts` (nuevo) — reglas puras del árbol: derivados (`ancestros`/`ruta`/`nivel`/`nombreNormalizado`), `partirRuta` (separador `>`), detección de ciclos, altura de subárbol, recálculo de descendientes. Sin Mongo, para probarlo sin base de datos.
- `src/modules/ubicacion/schemas/ubicacion.schema.ts` — campos nuevos; índice único `{padre, nombreNormalizado}` y `{ancestros}`; `nombre` pierde `unique`.
- `src/modules/ubicacion/ubicacion.service.ts` — reescrito: alta/edición/mover con validación de ciclo, profundidad y hermano (activo o dado de baja); recálculo del subárbol vía `bulkWrite` (alcanza a los descendientes inactivos); baja bloqueada con hijos o equipos; restaurar exige padre activo; `fusionar`; `findOrCreateByRuta` reemplaza a `findByNameOrCreate`.
- `src/modules/ubicacion/ubicacion.controller.ts` — `GET ?incluirBajas=true`, `POST :id/restaurar` (el servicio lo tenía pero no había endpoint), `POST :id/fusionar-en/:destinoId`.
- `src/modules/ubicacion/ubicacion.module.ts` — registra el modelo `Equipo` (para contar equipos y moverlos al fusionar) sin importar `EquiposModule`, que ya importa este.
- `src/modules/ubicacion/dto/*.ts` — `padre` opcional; `nombre` sin `>`; **`activo` fuera del DTO**.
- `src/modules/equipos/migracion.service.ts` (+ spec) — el importador usa `findOrCreateByRuta`.
- `src/modules/equipos/equipos-excel.service.ts` — columna "Ubicación" con la ruta completa.
- `scripts/migrar-ubicaciones-jerarquia.cjs` (nuevo).
- Pruebas nuevas: `ubicacion-arbol.spec.ts` (lógica pura) y `ubicacion.service.spec.ts` (servicio contra un modelo falso en memoria que imita el plugin de baja lógica).

**Frontend (`FormNext/`):**
- `src/components/features/ubicaciones/` (slice nuevo, 4 capas):
  - `domain/models/arbolUbicaciones.ts` — armar filas del árbol, búsqueda con ancestros, `perteneceA`, padres/destinos válidos, hermano dado de baja.
  - `infrastructure/adapters/ubicacionesAdapter.ts` — envuelve las Server Actions.
  - `application/hooks/useGestionUbicaciones.ts` (datos + operaciones) y `useArbolUbicaciones.ts` (expandir, buscar, mostrar bajas).
  - `presentation/components/` — `GestionUbicaciones`, `TablaArbolUbicaciones`, `DialogoUbicacion` (RHF), `DialogoFusion`, `SelectorUbicacion` (autocomplete por ruta, reutilizado por equipos).
- `src/app/dashboard/config/inventario-equipos/ubicaciones/page.tsx` — de 389 líneas a 5: solo monta `GestionUbicaciones`.
- `src/app/dashboard/config/inventario-equipos/equipos/page.tsx` — filtro por subárbol, ruta en la tabla, `SelectorUbicacion` en filtro y formulario.
- `src/lib/actions/ubicacion-actions.ts` — tipos con campos del árbol; acciones `restaurarUbicacion` y `fusionarUbicacion`.
- `src/components/features/herra-equipos/domain/models/EquipmentAutofill.ts` — autollenado con la ruta.

### Desviaciones del plan, y por qué

- **El 409 por hermano dado de baja no trae el id para restaurar.** El filtro global de errores del backend (`common/nucleo/excepciones.filter.ts`) solo reenvía `mensaje`. En su lugar, la pantalla de gestión (que ya carga las dadas de baja) detecta el hermano inactivo **mientras se escribe el nombre** y ofrece "Restaurar" en el mismo diálogo, antes de enviar. El backend sigue devolviendo un 409 explicativo como defensa.
- **Se quitó `activo` del DTO y el checkbox "Ubicación Activa" del diálogo.** Era una trampa preexistente: desmarcarlo hacía un `PATCH { activo: false }` que se saltaba las reglas de baja y dejaba la ubicación invisible, sin forma de restaurarla desde la pantalla. Ahora la baja va solo por `DELETE` y el alta por `restaurar`.
- **"Mover bajo…" no es una acción aparte:** es el campo "Ubicación padre" del diálogo de edición (renombrar y mover a la vez). Avisa cuántas ubicaciones hijas se mueven con ella.
- **Sin transacciones:** el repo no las usa en ningún lado. El recálculo parte siempre del nodo, así que si un `bulkWrite` fallara a mitad, volver a guardar el mismo nodo deja el subárbol bien.
- **Red de seguridad en el adaptador:** si se abre la pantalla antes de correr la migración, el adaptador completa `padre`/`ancestros`/`ruta`/`nivel` con valores de raíz para no romper.

### Verificación hecha

- Backend: `yarn build` limpio; `yarn jest` **829/829** (70 suites), incluidas las nuevas de árbol y servicio.
- Frontend: `yarn tsc --noEmit` y `yarn eslint` limpios en todo lo tocado (el diálogo usa `useWatch` y no `watch`, por el aviso del React Compiler).
- Script: dry-run contra la base local → 26 ubicaciones a convertir en raíz, 0 colisiones, 1.878 equipos, índice `nombre_1` detectado para borrar.

### Pendiente

1. Respaldo (`mongodump --collection ubicacions`) y `node scripts/migrar-ubicaciones-jerarquia.cjs --apply`.
2. Reiniciar el backend (para que Mongoose vea el esquema nuevo) y la prueba manual de la sección Verificación.
3. Fase 2 (usuario): reorganizar en árbol y fusionar casi-duplicados desde la pantalla.
