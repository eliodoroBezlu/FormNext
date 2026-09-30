# Despliegue a producción: cambios de base de datos

Qué hay que hacer en la base de **producción** al subir el código de estos planes:

- [implementation_planConstructoresFormularios.md](implementation_planConstructoresFormularios.md): versionado de plantillas (borrador / vigente / obsoleta).
- [implementation_planUbicacionesJerarquicas.md](implementation_planUbicacionesJerarquicas.md): árbol de ubicaciones.

El resto de lo hecho en esas sesiones no toca datos: rendimiento de los constructores, arrastre de preguntas, exportar inventario a Excel y aprobación de inspecciones.

## Qué cambia en la base

| Colección | Cambio en los documentos | Índices |
|---|---|---|
| `templates` (IRO/ISOP) | Se agregan `numeroRevision` y `estadoRevision` (+ fechas). Todas quedan **vigentes** | Se **borra** `code_1` **único**. Se crean `code_1_numeroRevision_1` (único) y `code_vigente_unica` (único parcial) |
| `templateherraequipos` | Igual. Si un código tiene varios documentos, el de número más alto queda vigente y el resto **obsoletas** (en local: F19 Rev 4) | Se crean `code_1_numeroRevision_1` y `code_vigente_unica` |
| `ubicacions` | Se agregan `padre`, `ancestros`, `ruta`, `nivel` y `nombreNormalizado`. Todas quedan como ubicación principal | Se **borra** `nombre_1` **único**. Se crean `padre_1_nombreNormalizado_1` (único) y `ancestros_1` |

**No se tocan** `instances`, `inspections_herra_equipos` ni `equipos`: siguen apuntando por `_id`, que no cambia. Los scripts cuentan esas referencias antes y después, y avisan si difieren.

## Orden (importante)

**1. Respaldo → 2. Subir backend y frontend nuevos → 3. Simulación → 4. Aplicar → 5. Verificar.**

Por qué el código va **antes** que la migración: el backend viejo declara `code` único en `templates` y `nombre` único en `ubicacions`. Si se reinicia después de migrar, Mongoose vuelve a crear esos índices únicos y bloquea "Nueva revisión" y las ubicaciones con el mismo nombre en distintas ramas. El código nuevo funciona igual con la base todavía sin migrar: una plantilla sin estado cuenta como vigente.

Al arrancar, el backend nuevo **crea solo** los índices nuevos. Si alguno no se puede crear todavía (por ejemplo, porque dos plantillas de herramientas comparten código), lo deja en el log y sigue funcionando. La migración los crea después.

## Comandos

Desde `BackendForm/BackendForm`, en PowerShell. Los scripts toman la base de la variable `MONGODB_URI` si está definida; si no, del `.env`. **Cada script muestra `Base: ...` al empezar: confirmar que es la de producción antes de seguir.**

```powershell
$env:MONGODB_URI = "<cadena de conexión de producción>"
```

1. Respaldo (solo lee; guarda en `respaldos/<fecha-hora>/`):
   ```powershell
   node scripts/respaldar-colecciones.cjs templates templateherraequipos ubicacions
   ```
2. Subir el backend y el frontend nuevos.
3. Simulación (no escribe):
   ```powershell
   node scripts/migrar-versionado-plantillas.cjs
   node scripts/migrar-ubicaciones-jerarquia.cjs
   ```
   Revisar la salida. Los datos de producción pueden diferir de los locales:
   - códigos de plantilla repetidos (quién queda vigente y quién obsoleta);
   - `ABORTA` por colisiones: dos plantillas con el mismo número de revisión, o dos ubicaciones con el mismo nombre normalizado. Hay que resolverlas a mano antes de seguir.
4. Aplicar:
   ```powershell
   node scripts/migrar-versionado-plantillas.cjs --apply
   node scripts/migrar-ubicaciones-jerarquia.cjs --apply
   ```
5. Verificar en la salida:
   - plantillas: `Sin estado: 0` y `Códigos con más de una vigente: 0` en las dos colecciones;
   - ubicaciones: `Equipos por ubicación idénticos`;
   - si aparece `ALERTA`, parar y revisar contra el respaldo.

   Después, en la aplicación: la tarjeta de una plantilla muestra «Vigente», "Nueva revisión" crea el borrador con el número siguiente, y la pantalla de ubicaciones muestra el árbol.

Al terminar, borrar la variable para no apuntar a producción por accidente:
```powershell
Remove-Item Env:MONGODB_URI
```

## Alternativa usada (2026-09-30): subir los JSON ya migrados

Producción no se migró con los scripts. El usuario exportó las colecciones desde Compass, se migraron en una base local de copia (`produccion_copia`) con los mismos scripts y se exportaron de nuevo.

- Archivos (en el Escritorio del usuario): `test.templates.30092026.migrado.json` (9), `test.templateherraequipos30092026.migrado.json` (17), `test.ubicacions30092026.migrado.json` (1). Los originales quedan como respaldo.
- Verificado documento por documento contra el original: lo único que cambia son los campos nuevos.
- Resultado: todas las plantillas vigentes, salvo F19 Rev 4 «Arnés y conectores», que queda **obsoleta**. El usuario confirmó que la SPCC (Rev 5) la reemplazó. La ubicación «nueva» queda como raíz.

Para subirlos, con el backend nuevo ya desplegado: en Compass, por cada colección, **Drop collection**, crearla de nuevo con el mismo nombre, **Import JSON**, y después reiniciar el backend para que cree los índices nuevos. Borrar la colección elimina también los índices únicos viejos (`code_1` y `nombre_1`), así que no hay que borrarlos a mano.

## Volver atrás

```powershell
node scripts/respaldar-colecciones.cjs --restaurar respaldos/<carpeta>/templates.json
```

Se repite por cada colección. La restauración deja los documentos como estaban, pero **no recrea los índices borrados** (`code_1` y `nombre_1` únicos). Solo hay que recrearlos si también se vuelve al código viejo.

## Estado

- Local: migraciones **sin aplicar** (al 2026-09-30).
- Producción: ✅ **migrada el 2026-09-30** por la vía de los JSON (ver «Alternativa usada»). El usuario confirmó la subida de los tres `.migrado.json`. La base local de copia `produccion_copia` se borró.
