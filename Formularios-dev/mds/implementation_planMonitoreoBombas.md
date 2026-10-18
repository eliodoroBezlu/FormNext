# Plan: reporte de monitoreo de bombas (formato 2.03.P01.R09)

## Contexto

Confiabilidad llena hoy el formato **2.03.P01.R09 Rev. 6 «MONITOREO Y/O INSPECCIÓN DE
EQUIPOS»** en Excel, un archivo por reporte (`COTEM137 230PP013 06OCT26.xlsx`). El pedido es
**estandarizar la entrada de información**, empezando por las bombas.

Lo que muestran los dos ejemplos (COTEM137 y COTEM009) y el catálogo de termografía:

- **Los antecedentes no son fijos** y cada analista los escribe distinto. Además mezclan datos
  de naturaleza distinta: fijos de la bomba (modelo, TMEF), de una pieza (proveedor y material
  de la voluta o del disco), de un mantenimiento pasado (fechas) y de la medición del día
  (horas, temperatura de referencia).
- **Las listas viven en una hoja oculta** (`Sheet2`): 19 técnicas con su código (COTEM,
  COVIB…), 27 grupos de trabajo, prioridad JDE y severidad.
- **Hay cálculos ocultos**: código interno = código de técnica + correlativo; fecha
  tentativa = fecha + (TMEF − horas) / 24.
- **La tabla de piezas y el gráfico de PI se pegan como imagen.**
- El catálogo de termografía tiene **21 bombas** (tipo B) agrupadas por OT modelo.

## Decisiones tomadas (2026-10-15)

| Tema | Decisión |
|---|---|
| Acceso | **Rol nuevo en el IAM** (`monitoreo_confiabilidad`) para las 13 personas de Confiabilidad y eliodoro. Comparación **exacta**: un admin sin el rol no entra. |
| Salida | **Solo PDF**, desde el backend con PDFKit. |
| Fotos por fila | **Configurable** en la plantilla del tipo de equipo; arranca en 3. |
| Alcance de la v1 | **Termografía en bombas.** El ultrasonido de `Sheet4` queda para la v2. |

## Estado al 2026-10-16: en pausa, F0–F5 hechas

**Código:** F1 a F5 terminadas, **sin commit** en BackendForm, FormNext ni iam-portal.
Pasan 971 pruebas del backend y 17 del dominio del frontend (`yarn test`). El build de los
dos pasa. El detalle de cada fase está en su sección más abajo.

**Hecho en la base local (2026-10-15, a pedido del usuario):**

- Migración de ubicaciones jerárquicas aplicada
  (`scripts/migrar-ubicaciones-jerarquia.cjs --apply`). Respaldo previo en
  `BackendForm/BackendForm/respaldos/2026-10-15_204354/ubicacions.json`. Sin ella, aplicar
  la planilla fallaba con «Ya existe un registro con ese valor en: nombre»: el importador
  no encontraba la ubicación «Sin Ubicación», que estaba en el formato viejo, y chocaba con
  el índice único viejo sobre `nombre`.
- Planilla aplicada, con `registradoPor: carga-inicial` porque se cargó por script y no
  desde la pantalla:
  - 21 bombas en el área Confiabilidad;
  - la 230PP013 con sus 4 piezas;
  - 3 intervenciones.

  Cumple el criterio de salida de F1.
- Listas iniciales sembradas: 71 valores. Ficha «Bomba» creada en `config_formularios`.

**Hecho en el IAM:**

- El rol `monitoreo_confiabilidad` lo creó el usuario.
- El portal solo dejaba elegir **un** rol global y al guardar reemplazaba el anterior. Ahora
  `iam-portal/src/components/dashboard/admin/UsersTab.tsx` permite marcar varios. Sin
  commit y sin probar en navegador.
- Al asignarlo, dejar marcado el rol que la persona ya tenía. Quien lo haya recibido con el
  diálogo viejo perdió su rol anterior y hay que devolvérselo.

### Para retomar: prueba de punta a punta (la hace el usuario)

1. Asignar el rol a las 13 personas de Confiabilidad y a eliodoro, conservando su rol
   anterior, y que vuelvan a iniciar sesión.
2. Crear COTEM137 desde «Nuevo reporte» con la 230PP013, subir sus fotos y enviarlo a
   revisión.
3. Emitirlo con **otro** usuario del rol, y antes fijar el correlativo en Configuración
   (COTEM 2026 = 137) para que salga COTEM-0138.
4. Descargar el PDF y compararlo con el original.
5. Revisar que la 230PP013 en «Bombas» muestre el próximo monitoreo y la fecha tentativa.

### Antes de desplegar a producción

- [ ] Confirmar si en producción se corrió la migración de ubicaciones jerárquicas. Si no,
      respaldar `ubicacions` y correrla, o la planilla fallará igual que en local.
- [ ] Volumen persistente para `archivos-privados/` en el despliegue, igual que
      `uploads/`. Ahí viven las fotos y los gráficos de los reportes.
- [ ] Desplegar el iam-portal con el diálogo de varios roles antes de asignar el rol.
- [ ] Aplicar la planilla en producción desde Configuración y fijar los correlativos del
      año con el último número usado en el Excel.
- [ ] Commits: BackendForm (`monitoreo-equipos/`, rol, `EquiposModule`, `app.module.ts`,
      `tsconfig.build.json`, `.gitignore` y `.dockerignore`, `src/templates/msc-logo.png`),
      FormNext (feature, rutas, `routePermissions.ts`, `Navigation.tsx`, `package.json`,
      `monitoreo-actions.ts`), iam-portal (`UsersTab.tsx`). Separarlos de los cambios ajenos
      sin commitear que había en esos repos.

### Pendiente de Confiabilidad

- Completar la planilla de carga: TMEF, modelos y piezas de las otras 20 bombas. Se vuelve
  a subir sin duplicar.
- Responder las preguntas 1–6 y 8–10. La 6 decide si «revisar» queda en «cualquier otra
  persona con el rol» o pasa a un grupo de revisores con un rol propio.
- Si quieren el PDF de COTEM009 en una sola hoja: hoy sale en dos, porque los antecedentes
  normalizados ocupan más que las dos líneas libres del Excel.

### Lo que no se hizo en esta entrega

- Pantalla para editar las listas: agregar, renombrar o dar de baja valores. Hoy entran las
  iniciales y lo que trae la planilla.
- Registrar intervenciones y cambios de pieza desde la ficha de la bomba. Hoy solo entran
  por la planilla.
- La v2: el ultrasonido de `Sheet4`.

## Modelo de datos: los antecedentes normalizados

Cada dato tiene un dueño. El reporte guarda una **copia del momento** de lo que mostró.

1. **Ficha de la bomba** (inventario `equipos`, tipo «Bomba», datos en `especificaciones`
   definidos en `config_formularios`): fabricante, modelo, servicio/proceso, TMEF (hrs),
   tag de horas en PI, bombas pares, OT modelo, frecuencia (días).
2. **Componentes instalados** (colección nueva, por bomba): pieza (voluta, impulsor, disco
   prensa, disco succión), proveedor, material/código, dureza (HB), condición inicial,
   espesor nominal y de precaución (mm), fecha de instalación, activo.
3. **Intervenciones** (colección nueva, historial por bomba): fecha, tipo, OT, horas al
   intervenir, piezas cambiadas.
4. **Lecturas del reporte**: horas desde la última intervención (con fecha de lectura),
   temperatura de referencia (°C) y dónde se tomó, instrumento y sus ajustes (emisividad, o
   velocidad y sensor).

**Calculado, nunca escrito:** informe anterior (último emitido del mismo TAG), fecha
tentativa, horas restantes hasta el TMEF, horas de trabajo de cada pieza, acción (= resultado
del análisis) y código interno.

## El reporte

| Sección | Contenido |
|---|---|
| Cabecera | TAG (autocompletar entre las bombas), fecha, técnica (lista), N° OT, acción (calculada, con color) |
| Alcance | Texto |
| Antecedentes | Ficha + componentes + última intervención prellenados; lecturas del día escritas |
| Descripción del proceso | Texto (prellenado con el servicio de la bomba) + instrumento |
| Recopilación | Fotos con descripción (distribución automática) + gráfico de ancho completo |
| Análisis y diagnóstico | Texto (propuesto desde las descripciones de las fotos) |
| Recomendaciones | Lista + técnica de apoyo + resultado (severidad) |
| Tareas | 0 a 5: descripción*, grupo de trabajo, N° OT, prioridad JDE, comunicado con*, semana |
| Pie | Elaborado por, revisado por, código interno |

`*` obligatorio si hay recomendaciones (regla escrita en la propia planilla).

### Fotos

- Máximo por fila configurable (arranca en 3); filas repartidas parejo; la última centrada;
  **todas del mismo tamaño** en el reporte.
- Cada foto con su descripción debajo, en la misma página.
- **Se ajusta sin recortar**: recortar una termografía puede cortar la escala y la temperatura
  máxima de la cámara.
- Rol opcional «foto de referencia» (la brida ciega de COTEM009).
- La vista previa en pantalla usa **la misma función de distribución** que el PDF.

### Gráfico

Caja de ancho completo con proporción ≈ 3:1 (21,9 × 7,16 cm). Se encuadra al subirlo; si no,
se ajusta sin recortar.

## Fases

### F0 · Preparación (tareas del usuario, sin código)

- Crear el rol `monitoreo_confiabilidad` en el servicio `forms` del IAM y asignarlo a las
  13 personas de Confiabilidad y a eliodoro.
- Enviar a Confiabilidad la planilla `disenos/monitoreo-bombas/Planilla de carga - bombas.xlsx`
  y las preguntas de abajo.

### F1 · Catálogos y ficha de la bomba

- Backend: `Role.MONITOREO_CONFIABILIDAD`; colecciones de componentes e intervenciones;
  catálogos de técnicas (con código), grupos de trabajo, prioridad JDE, severidad,
  instrumentos, proveedores y materiales (editables, baja lógica).
- Importador idempotente de la planilla de carga (dry-run por defecto, `--apply`).
- `config_formularios` del tipo «Bomba».
- **Listo cuando:** las 21 bombas están en `equipos` con su ficha, y 230PP013 tiene sus
  4 componentes y su intervención del 28-jun-26.

**Estado (2026-10-15): código hecho, sin commit; falta correrlo contra la base.**

- Módulo `BackendForm/src/modules/monitoreo-equipos/`. Todo el controlador exige
  `monitoreo_confiabilidad` y ni admin entra sin él.
- Endpoints:
  - `GET|POST /monitoreo-equipos/catalogos`, `PATCH|DELETE .../catalogos/:id`,
    `PATCH .../catalogos/:id/restaurar` y `POST .../catalogos/sembrar`;
  - `GET .../bombas`, `GET .../bombas/:tag`;
  - `POST .../bombas/planilla` (campo `file`). Sin `?aplicar=true` solo revisa.
- Colecciones nuevas: `catalogos_monitoreo`, `componentes_equipo` e `intervenciones_equipo`,
  las tres con baja lógica.
- El área se resuelve con `ResolucionOrganizacionalService`, que ahora exporta `EquiposModule`.
- Reglas de la carga:
  - una pieza con fecha de instalación más nueva retira la anterior, que se conserva;
  - una pieza con fecha más vieja no se carga y solo da aviso;
  - un TAG que el inventario tiene como otro tipo de equipo es un problema grave;
  - una celda vacía no borra lo cargado desde el panel;
  - sembrar solo llena los catálogos que nunca tuvieron nada.
- Las pruebas cubren el lector, la revisión, la aplicación, la idempotencia, los cambios
  de pieza y los catálogos, sobre la planilla real.
- Para cerrar F1 hace falta, por este orden:
  1. el rol creado en el IAM (F0);
  2. el Mongo de forms levantado;
  3. confirmar que el maestro tiene un área «Confiabilidad». Si no la tiene, la revisión
     lo marca como problema grave.

### F2 · Backend del reporte

- Módulo `monitoreo-equipos`: CRUD con estados borrador → pendiente de revisión → emitido;
  `@Roles(Role.MONITOREO_CONFIABILIDAD)` en todo el controlador.
- Prellenado al elegir el TAG (ficha, componentes, última intervención, informe anterior).
- Correlativo del código interno al **emitir** (por técnica; por año si se confirma).
- Carpeta de subida propia en la lista blanca de `upload`; `sharp` para reducir las fotos.
- **Listo cuando:** un reporte de prueba de 230PP013 se crea, se envía a revisión y se emite
  con su código, y un usuario sin el rol recibe 403 en todas las rutas.

**Estado (2026-10-15): código hecho, sin commit.** Las pruebas cubren el criterio de salida
sobre modelos en memoria. Falta correrlo contra la base, con lo mismo que F1.

- Endpoints, todos bajo `/monitoreo-equipos` y con el rol:
  - `GET|POST reportes`, `GET|PATCH|DELETE reportes/:id`;
  - `POST reportes/:id/enviar|devolver|emitir`;
  - `GET reportes/prellenado/:tag?fecha=&horas=`;
  - `POST archivos?uso=foto|grafico`, `GET archivos/:archivo`;
  - `GET|PUT correlativos`, `GET|PUT plantillas/bomba`.
- Cambio respecto de lo planeado: las imágenes **no** van a la lista blanca de `upload`.
  `/uploads` se sirve como estático público y sin sesión, y el reporte es solo de
  Confiabilidad. Van a `archivos-privados/monitoreo-equipos/` y se entregan por
  `GET archivos/:archivo` con el rol. Esa carpeta necesita volumen persistente en el
  despliegue, igual que `uploads/`.
- Imágenes con `sharp`:
  - se ajustan sin recortar y nunca se agrandan;
  - lado mayor de 1600 px para las fotos y 2600 px para el gráfico;
  - un PNG queda en PNG (capturas de PI con texto) y lo demás pasa a JPEG con calidad 88.
- Reglas:
  - el borrador solo lo modifica quien lo elaboró;
  - lo revisa (devuelve o emite) otra persona con el rol, pendiente de confirmar en la
    pregunta 6;
  - para enviar se exigen técnica, alcance, análisis y resultado, y tareas con descripción
    y «comunicado con» si hay recomendaciones;
  - los valores de lista se guardan como están escritos en el catálogo.
- Antecedentes:
  - se rehacen en cada guardado del borrador y se congelan al enviar;
  - incluyen las horas por pieza, las horas restantes, la fecha tentativa y el informe
    anterior (el último emitido del mismo TAG).
- Código interno:
  - formato `COTEM-0137`, por técnica y año (COTEM139 es de octubre de 2025 y COTEM009 de
    enero de 2026);
  - se asigna al emitir;
  - `PUT correlativos` fija el último número usado en el Excel y solo deja subirlo.
- La fecha tentativa oculta del Excel estaba mal en COTEM137: restaba `F9`, que está
  vacía, en lugar de las horas (`C9`). La de aquí usa las horas.
- La planilla de carga ahora trae el TMEF de 230PP013 (2900 h), que estaba en la celda
  oculta `AO1` de COTEM137.

### F3 · Pantalla

- Feature `monitoreo-equipos` con las 4 capas (domain/infrastructure/application/presentation).
- `domain/`: la función de distribución de fotos (TS puro, con pruebas) y el modelo de
  antecedentes.
- Formulario RHF (`mode: "onTouched"`, `noValidate`, scroll al primer error, guardián de
  salida); vista previa de la distribución de fotos; lista con filtros por TAG, fecha,
  técnica y resultado.
- Menú y ruta con **`tieneRolExacto`**, no con la jerarquía: un admin sin el rol no lo ve.
- **Listo cuando:** COTEM137 y COTEM009 se pueden volver a cargar en la pantalla con el
  modelo nuevo.

**Estado (2026-10-15): código hecho, sin commit; falta el criterio de salida.** Recargar
COTEM137 y COTEM009 necesita el IAM, el backend, Mongo y un usuario con el rol, y ninguno
estaba levantado.

- **Verificado:**
  - `tsc` y `yarn build`, con las 4 rutas nuevas;
  - lint de lo tocado;
  - 15 pruebas del dominio (`yarn test`);
  - la regla de acceso con roles reales: admin y super_admin no entran, y con el rol sí.
- **Rutas** (todas `exacto: true` en `routePermissions`):
  - `/dashboard/monitoreo-equipos`: lista con filtros;
  - `/dashboard/monitoreo-equipos/nuevo`;
  - `/dashboard/monitoreo-equipos/[id]`;
  - `/dashboard/monitoreo-equipos/configuracion`: planilla de carga con revisión y
    aplicación, numeración desde el Excel, fotos por fila, listas iniciales y bombas
    cargadas.
- **Acceso:**
  - `RoutePermission` y los ítems del menú tienen `exacto`: el rol se compara tal cual,
    sin `ROLE_HIERARCHY`;
  - el rol está aislado en la jerarquía y no es «restringido», así que quien lo tiene
    sigue viendo lo demás según sus otros roles.
- **Server Actions** (`lib/actions/monitoreo-actions.ts`): devuelven `{ ok, datos | errores }`
  en vez de lanzar. En producción Next borra el mensaje de un error lanzado, y aquí el
  mensaje es lo que hay que leer («Falta: el alcance»). Por lo mismo, el backend ahora manda
  las listas de faltantes y de valores inválidos en `message`, que es lo único que reenvía
  su filtro de errores.
- **Dominio en TS «borrable»**, probado con `node --experimental-strip-types --test` (nuevo
  script `yarn test`):
  - `distribuirFotos`: filas parejas, la última centrada, mismo tamaño, una sola foto no
    ocupa todo el ancho;
  - la traducción formulario ↔ backend;
  - qué falta para enviar;
  - qué acciones tiene cada usuario según el estado.
- **Pendiente para F4:** copiar `distribuirFotos` al backend con los mismos casos de prueba.
- **Imágenes:** se ven por `/api/forms/monitoreo-equipos/archivos/…` con la cookie de
  sesión. Solo se reducen en el navegador si pasan el límite de 10 MB de las Server Actions.
- **Fuera de F3:** la edición de las listas (alta, cambio y baja de valores). Hoy solo se
  cargan las iniciales y lo que trae la planilla.

### F4 · PDF

- PDFKit, A4 vertical, estructura y colores del 2.03.P01.R09.
- **Listo cuando:** el PDF de COTEM137 recargado muestra los mismos datos que el original,
  con los antecedentes normalizados; con 1 a 9 fotos la distribución coincide con la vista
  previa.

**Estado (2026-10-15): código hecho, sin commit.** Probado con las termografías reales de
COTEM137 y COTEM009 y un gráfico de prueba. El de PI venía en EMF, que PDFKit no lee. Las
muestras están en `forms/disenos/monitoreo-bombas/muestras-pdf/`.

- **Generador:** `pdf/reporte-pdf.ts` es una función pura y `reporte-pdf.service.ts` reúne
  los datos.
  - Los nombres de quien elaboró y revisó salen del padrón (`username` → `nomina`),
    incluidos los dados de baja.
  - El color del resultado sale del catálogo.
  - Una imagen que falta o no se puede leer queda como recuadro con aviso, sin romper el
    PDF.
- **Descarga:** `GET /monitoreo-equipos/reportes/:id/pdf`.
  - El nombre sigue el de Confiabilidad: `COTEM137 230PP013 06OCT26.pdf`, o `BORRADOR …`
    si no está emitido.
  - Se baja en cualquier estado. Sin emitir lleva la marca de agua BORRADOR o EN REVISIÓN
    y el código dice «SIN EMITIR» o «EN REVISIÓN».
  - En la pantalla es el botón «PDF», un enlace por el proxy con la cookie de sesión.
- **Logo:** el oficial azul, sacado del propio Excel, en `src/templates/msc-logo.png`. Sin
  él el PDF sale igual.
- **Fotos:**
  - `distribuirFotos` está copiado en el backend (`domain/distribucion-fotos.ts`) con los
    mismos casos de prueba que el frontend;
  - nueva regla compartida `proporcionDeCaja`: la caja común la marca la foto más alta,
    entre 4:3 apaisada y 3:4 vertical, porque la FLIR se usa de pie (348 × 464) y una caja
    apaisada la achicaba a la mitad;
  - el reporte guarda `ancho` y `alto` de cada imagen (los devuelve la subida) para que la
    vista previa y el PDF calculen igual.
- **Paginación:**
  - COTEM137 entra en 1 página;
  - COTEM009 pasa a 2: los antecedentes normalizados ocupan más que las dos líneas libres
    del Excel;
  - tareas, ANEXOS y firmas van siempre juntas: el pie nunca queda solo en una hoja;
  - no hay segunda página con celdas ocultas, como imprimía el Excel.
- **Verificado:**
  - 961 pruebas del backend, entre ellas: 1 a 9 fotos, 12 fotos y texto largo pasan de
    página, imágenes rotas, nombre del archivo, nombres desde el padrón;
  - 16 del frontend;
  - tsc, lint y build en los dos.
- **Falta:** la comparación con datos reales cargados desde la pantalla, que espera lo
  mismo que F1–F3 (rol, Mongo, IAM y backend levantados).

### F5 · Revisión e historial

- Revisión por quien tenga permiso de revisar; historial de reportes por bomba; fecha
  tentativa a la vista.

**Estado (2026-10-15): código hecho, sin commit.** Pasan las 971 pruebas del backend y las 17
del frontend.

- **Situación por bomba** (`domain/situacion-bomba.ts`, función pura con pruebas):
  - próximo monitoreo = último reporte **emitido** + la frecuencia de su OT modelo;
  - fecha tentativa = la del último emitido (fecha + (TMEF − horas) / 24);
  - alertas: vencida, próxima (7 días antes para monitoreo, 14 para intervención, porque se
    planifica en JDE), al día o sin datos;
  - `GET bombas` entrega las bombas ordenadas por urgencia y `GET bombas/:tag` suma todos
    sus reportes.
- **Pantallas:**
  - `/monitoreo-equipos/bombas`: panel ordenado por urgencia;
  - `/monitoreo-equipos/bombas/[tag]`: fechas, ficha, reportes de cualquier estado, piezas
    montadas y retiradas, e intervenciones, con «Nuevo reporte» que llega con el TAG
    elegido (`/nuevo?tag=`);
  - la lista de reportes tiene bandejas «Todos / Por revisar / Mis borradores», con un
    contador en Por revisar, y un aviso cuando hay bombas vencidas o próximas.
- **Revisión:** sigue siendo «otra persona con el rol», a la espera de la pregunta 6. Si
  Confiabilidad define un grupo de revisores, eso va con un rol propio en el IAM.
- **Por qué no salían los TAG (2026-10-15):** la planilla todavía no estaba aplicada (0
  bombas en `equipos`). Catálogos, ficha «Bomba» y área Confiabilidad ya estaban. La
  planilla actual pasa la revisión sin errores.

### v2 (fuera de esta entrega)

Ultrasonido de `Sheet4` colgado de cada componente: mediciones por punto con desgaste y tasa
en mm/día calculados (hoy esas fórmulas están rotas en el Excel). Después, tuberías, chutes,
molinos y la cinta del catálogo de termografía.

## Preguntas para Confiabilidad

1. **Horas**: ¿son siempre desde la última intervención (el contador de PI que se reinicia)?
2. **Intervenciones**: ¿hay un registro de mantenimientos por bomba (JDE u otra planilla)?
3. **Espesor de precaución**: ¿solo la voluta, o también impulsor y discos?
4. **Modelo**: «WARMAN ASH 550 MMC» y «Warman 18x16 SRH Ash», ¿mismo modelo o distintos?
5. **Listas**: ¿quién agrega modelos, proveedores, materiales e instrumentos?
6. **Revisión**: ¿«Revisado por» es una aprobación en el sistema o solo un nombre?
7. ~~**Correlativo**: ¿se reinicia cada año y es por técnica?~~ Resuelta con los propios
   archivos: COTEM139 es de octubre de 2025 y COTEM009 de enero de 2026. Es por técnica y
   por año.
8. **Fotos**: ¿hay un máximo por reporte? ¿La foto de referencia va aparte?
9. **Gráfico**: ¿es obligatorio y siempre uno solo?
10. **420PP557**: ¿el último mantenimiento fue el 30 o el 31 de marzo de 2025?

## Riesgos

- **Datos incompletos**: si Confiabilidad no completa la planilla, el prellenado no sirve y el
  reporte vuelve a escribirse a mano. Mitigación: se puede emitir un reporte con la ficha
  incompleta, pero se marca.
- **Migración de ubicaciones en producción**: si no se corrió, aplicar la planilla falla.
  Ver «Antes de desplegar a producción».
- **Asignar el rol con el portal viejo** quita el rol anterior de la persona. Desplegar
  antes el diálogo de varios roles.
