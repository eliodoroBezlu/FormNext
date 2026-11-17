# Sistema de diseño de forms (Sistema de Inspecciones)

Qué hay hoy en el frontend (Next.js 15 + MUI 7), cómo se usa y qué conviene corregir. Lo que
dice aquí sale del código, no de una intención: el tema está en `src/styles/theme.ts`, el cambio
claro/oscuro en `src/styles/ThemeContext.tsx` y los componentes base en `src/components/ui`.

Fecha del relevamiento: 13/11/2026.

## Cómo usar este documento

- **Antes de escribir una pantalla:** los tokens (sección 1) y el patrón que corresponda (sección 3).
- **Antes de crear un componente:** el inventario (sección 2); seguramente ya existe uno.
- **En una revisión de código:** la lista rápida del final.
- **Si una regla no sirve para un caso**, se cambia aquí primero y después en el código.

### Principios

1. **Se usa en planta.** Técnicos y supervisores llenan inspecciones en el celular, con guantes, al
   sol y con poca señal. Legibilidad, botones grandes y contraste antes que decoración.
2. **El tema manda.** Colores, radios, sombras y tipografía salen de `theme.ts`. Un hex escrito a
   mano es una deuda, porque rompe el modo oscuro y no cambia cuando cambia la marca.
3. **Un estado, un color, en todo el sistema.** «Abierto», «Pendiente» o «Riesgo sustancial» se ven
   igual en una tarjeta, una tabla y un reporte.
4. **Clean Architecture también en la UI:** los componentes de `ui/` no saben de negocio; los de
   `features/<módulo>/presentation` sí, pero no hablan con el servidor (ver `CLAUDE.md`).

---

## 1. Tokens

### 1.1 Paleta de la empresa

Vigente desde el 13/11/2026. Los valores están en `src/styles/marca.ts`; el tema se arma con ellos.

| Color | Hex | Rol en el sistema |
|---|---|---|
| **Azul petróleo** | `#18364A` | Color principal: barra superior, botón principal, avance, foco, títulos de marca |
| **Azul acero** | `#52758A` | Secundario: botones secundarios, bordes, íconos, acentos |
| **Gris claro** | `#E8EDF0` | Fondo de la página (tal cual, decisión de la empresa) |
| **Blanco** | `#FFFFFF` | Tarjetas, diálogos, tablas, texto sobre petróleo |

Tonos derivados (mezclas del petróleo y el acero, en `DERIVADOS`): `#3E6175` acero oscuro (texto
secundario), `#122938` petróleo oscuro (hover, barra en modo oscuro), `#0E1E29` fondo oscuro,
`#142B3A` tarjeta oscura, `#A9C3D3` principal en modo oscuro, `#D1D7DB` bordes.

**Superficies de marca** (barra superior, cabeceras, bandas): petróleo **en los dos modos**, con
`superficieDeMarca(theme.palette.mode)`. Todo lo demás usa el tema.

### 1.2 Tokens del tema

En código siempre por nombre: `color="primary"`, `sx={{ color: "error.main" }}`. Sin degradados.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `primary.main` | `#18364A` petróleo | `#A9C3D3` | Acción principal, enlaces, foco, pestaña activa |
| `primary.dark` | `#122938` | `#869EAD` | Hover del botón principal |
| `secondary.main` | `#52758A` acero | `#869EAD` | Acción secundaria destacada, bordes de marca |
| `success.main` | `#15803D` | `#4ADE80` | Cerrado, aprobado, completado, guardado |
| `warning.main` | `#B45309` | `#FBBF24` | En progreso, pendiente, atención, retraso |
| `error.main` | `#B91C1C` | `#F87171` | Error, rechazo, acción destructiva |
| `info.main` | `#0369A1` | `#38BDF8` | Abierto, explicaciones e indicaciones |
| `background.default` | `#E8EDF0` gris claro | `#0E1E29` | Fondo de la página |
| `background.paper` | `#FFFFFF` | `#142B3A` | Tarjetas, diálogos, tablas |
| `divider` | `#D1D7DB` | `#24404F` | Bordes y separadores |
| `text.primary` | `#0F1E29` | `#FFFFFF` | Texto principal |
| `text.secondary` | `#3E6175` | `#A9BAC5` | Metadatos, ayudas |
| `text.disabled` | `rgba(15,30,41,.38)` | MUI | Solo para lo deshabilitado; **no** para texto que se debe leer |
| `action.hover` | petróleo al 6 % | hielo al 8 % | Fondo de fila o bloque resaltado (en vez de `#F5F5F5`) |

Los colores de estado son más oscuros que los de MUI a propósito: con texto blanco encima todos
pasan 4,5:1 (sección 5). En modo oscuro el texto sobre ellos es oscuro (`contrastText`).

> **Grises claros → tokens (13/11/2026).** Ya no se escriben `#F5F5F5`, `#FAFAFA`, `#F9F9F9` y parecidos:
> en modo oscuro eran manchas claras con texto blanco encima. Equivalencias:
>
> | Antes | Token | Dónde |
> |---|---|---|
> | `#F5F5F5` en el encabezado de una tabla | `background.default` | Encabezados, recuadros de imagen, bloques de datos |
> | `#F9F9F9` al pasar el mouse por una fila, `#FAFAFA`, `#F8FAFC` | `action.hover` | Hover, campos de solo lectura, cajas vacías |
> | `#F1F5F9`, `#E0E0E0` | `action.selected` | Franjas un poco más marcadas que `action.hover` |
> | Borde `#DDD` / `#000` | `divider` / `text.primary` | Bordes |
>
> Quedan 7 a propósito: el lienzo que se rasteriza para el PDF en `VehicleDamageSelector` y el de la firma
> (`SignatureField`) son siempre claros, la tinta es negra; los colores de celda que vienen de la plantilla
> (`GroupedQuestionWithGeneralObservation`, ya con su versión oscura). La tabla de estados de
> `InspectionEventCard` pasó a `EstadoChip` el 14/11/2026.

### 1.3 Colores de dominio

Son parte del sistema tanto como la marca. Hoy están repartidos; esta es la tabla de referencia.

**Estado de una inspección** (`herra-equipos/domain/models/estadosVisuales.ts`), la misma tabla para
`InspectionStatusChip` (formulario y reporte) y las tarjetas de actividad y notificaciones del panel
(`InspectionEventCard`, que antes tenía la suya con «Aprobada» en azul):

| Estado | Etiqueta | Color |
|---|---|---|
| `draft` | Borrador | `default` |
| `in_progress` | En progreso | `warning` |
| `pending_approval` | Pendiente de aprobación | `info` |
| `approved` | Aprobada | `success` |
| `rejected` | Rechazada | `error` |
| `completed` | Completada | `success` |

**Estado de un plan de acción y de una tarea** (`planes-de-accion/domain/estadosVisuales.ts`), los
mismos en la tarjeta, la tabla de tareas, el detalle y las pestañas:

| Estado | Color |
|---|---|
| Abierto | `info` (azul): está por empezar, no es un error |
| En progreso | `warning` |
| Cerrado | `success` |
| Aprobado | `success` (+ visto en la tabla) |
| Sin observaciones | `default` (acero) |

**Nivel de riesgo** (`matriz-riesgos/domain/matrizHelpers.ts`), en orden. Son los tonos del semáforo del
Excel oficial y **no pasan a `EstadoChip`**: son cinco niveles y dos son verdes. El texto encima lo elige
`textoLegibleSobre` (`src/lib/color/contraste.ts`) a través de `estiloDeNivel` (`NivelRiesgoChip.tsx`):

| Nivel | Fondo | Texto | Contraste |
|---|---|---|---|
| ACEPTABLE | `#2E7D32` | blanco | 5,13:1 |
| BAJA | `#689F38` | tinta `#0F1E29` | 5,34:1 (con blanco era 3,18:1) |
| ACEPTABLE CON REVISIÓN | `#F9A825` | tinta | 8,61:1 (con blanco era 1,97:1) |
| SUSTANCIAL | `#EF6C00` | tinta | 5,50:1 (con blanco era 3,08:1) |
| INACEPTABLE | `#C62828` | blanco | 5,62:1 |

**Estado de una matriz** (Borrador `default`, En revisión `warning`, Aprobada `success`, Superada
`default`) y **eficacia de un control** (Eficaz `success`, Satisfactorio `warning`, No eficaz `error`,
Sin evaluar `default`): con `EstadoChip`.

**Entrega de linternas** (`linternas/domain/models/Linterna.ts`): Registrada y Aprobada `success`,
Pendiente de aprobación `warning` (en ámbar y no en azul: bloquea registrar otra entrega a esa persona),
Rechazada `error`, Anulada `default`. «Con dotación» `success`, «Sin dotación» `default`.

**Préstamo SPCC** (`prestamos-spcc/domain/models/Prestamo.ts`): Pendiente de entrega `warning`, En préstamo
`info`, Devuelto `success`, Cancelada `default`. Cómo volvió cada equipo: Operativo `success`, Requiere
inspección `warning`, Dar de baja `error`. Los días de atraso siguen como chip rojo lleno: es una alerta, no un
estado.

**Valoración de una pregunta IRO/ISOP:** 0, 1, 2, 3 y N/A (`lib/constants.ts`). Una pregunta
obligatoria pinta su selector en rojo `#E63715` (4 lugares escritos a mano). Puntaje 0, 1 o 2 exige
comentario.

**Gráficas:** `src/styles/chartTheme.ts` tiene una paleta propia, pensada para el tablero de
extintores (púrpura `#6F6BC2`, verde `#69C98D`, naranja `#EA7D29`…). No coincide con la marca; si
se crean gráficas nuevas, conviene derivarlas de los tokens de la sección 1.1.

### 1.4 Tipografía

Fuente **Inter**, cargada con `next/font/google` en `src/app/layout.tsx` (respaldo: Roboto,
Helvetica, Arial).

| Variante | Tamaño | Peso | Notas |
|---|---|---|---|
| `h1` | 2.5rem (40px) | 800 | 2rem bajo 900px, 1.5rem bajo 600px; `letter-spacing: -0.025em` |
| `h2` | 2rem (32px) | 700 | |
| `h3` | 1.75rem (28px) | 600 | |
| `h4` | 1.5rem (24px) | 600 | Título de página |
| `h5` | 1.25rem (20px) | 600 | Título de sección o de tarjeta grande |
| `h6` | 1.05rem (~17px) | 600 | Título de bloque o de diálogo |
| `subtitle2` | MUI (0.875rem, 500) | | Rótulo de grupo de campos |
| `body1` | 1rem (16px), interlineado 1.7 | 400 | 0.9rem bajo 900px y 0.875rem (14px) bajo 600px |
| `body2` | 0.875rem (14px), interlineado 1.6 | 400 | Texto de tablas, tarjetas y diálogos |
| `caption` | MUI (0.75rem) | | Ayudas y pies de figura; no para datos |
| `button` | 0.95rem | 600 | Sin mayúsculas (`textTransform: none`) |

> En el celular `body1` no baja de 14px (antes 12,8px): se lee en planta, a pleno sol.

Reglas: un `h4` por página (su título); los encabezados no saltan niveles; nada de `fontSize` a mano
(hoy hay más de 100 valores sueltos, desde `"0.6rem"` hasta `40`): usar la variante.

### 1.5 Espaciado

Base de MUI: **8px**. En `sx`, `p: 2` = 16px, `gap: 1.5` = 12px.

| Uso | Valor |
|---|---|
| Entre campos de un formulario | `gap: 2` (16px) |
| Entre secciones de una página | `mb: 3` (24px) |
| Relleno de tarjeta o diálogo | `p: { xs: 2, sm: 3 }` |
| Entre botones de una barra | `gap: 2` |
| Página | `Container maxWidth="xl"`, `py: 4` |

### 1.6 Forma (radios)

| Elemento | Radio |
|---|---|
| Base del tema (`shape.borderRadius`) | 12px |
| `Card` | 16px |
| `Paper`, `Alert` | 12px |
| `Button`, `TextField` | 10px |
| `Chip` | 8px |

> **Trampa de MUI:** en `sx`, `borderRadius: 1` **no es 1px**: es 1 × 12 = **12px**, y
> `borderRadius: 2` es **24px**. Hoy hay 65 usos de `borderRadius: 2` y 22 de `borderRadius: 3`
> (36px), que dejan bloques casi redondos. Para un valor fijo, escribir el texto: `borderRadius: "8px"`.

### 1.7 Elevación

`theme.shadows[1..4]` están reemplazadas por sombras suaves:

| Nivel | Uso |
|---|---|
| `1` | Tarjeta en reposo, `Paper` |
| `2` | Barra fija inferior, menú |
| `3` | Tarjeta al pasar el mouse |
| `4` | Diálogo, elemento arrastrado |

Más allá de 4 se usan las de MUI; evitarlas.

### 1.8 Movimiento

- Transición estándar: `all 0.2s ease-in-out`.
- Tarjeta: **solo la que se puede pulsar** sube 2px, gana sombra 3 y muestra la mano al pasar el mouse.
  En el tema, pulsable = `Card` con un `CardActionArea` hijo o con `className="tarjeta-pulsable"`;
  `StyledCard` tiene su propio efecto (sube 4px). Una tarjeta cuya acción es un botón interno (las de
  plantillas de herramientas con «Nueva Inspección») no sube: el botón es lo que se pulsa.
- Botón: se hunde levemente al presionarlo (`scale(0.98)`); el principal se oscurece al pasar el mouse.
- Chip de estado: cambia de color con un fundido de 0,25 s.
- Barras de avance (tarjeta del plan, tasa de cierre): se llenan en 0,6 s.
- Guardar: `BotonGuardar` + `useEstadoDeGuardado` muestran «Guardando…» y después «✓ Guardado» en verde
  0,8 s; un diálogo se cierra solo después de eso. Si falla, el botón vuelve y el diálogo sigue abierto.
- Fila recién cambiada (guardar, corregir, aprobar, agregar, subir planilla): se ilumina con el principal
  al 14 % y se apaga en 2,6 s (`domain/resaltado.ts` decide cuáles).
- Carga: esqueletos con la forma del contenido (`PlanCardList`; `EsqueletoFormulario` en las páginas de
  IRO y de herramientas) en la primera carga; una acción en curso no borra la lista, muestra una barra fina arriba.
- Formularios de inspección: «Guardar avance» y «Terminar IRO» usan `BotonGuardar` (el pulsado muestra
  «Guardando…» y «✓ Avance guardado» / «✓ IRO terminada» hasta la pantalla de «listo»); «Siguiente Sección»
  de herramientas muestra «Guardando…» en el paso 4, que es el que firma y guarda.
- Error al enviar: `irAlPrimerError` (`src/lib/formularios`) lleva a la primera pregunta con error, le da
  el foco sin cortar el desplazamiento y la hace destellar en rojo y vibrar una vez (0,9 s). Reemplaza el
  bloque copiado en los 7 formularios de inspección; quedan copias en el constructor, la matriz de riesgos,
  el PGR y el monitoreo.
- Nada se anima al hacer scroll. Botones, chips, barras y tarjetas respetan `prefers-reduced-motion`.

### 1.9 Modo claro y oscuro

`ThemeContextProvider` guarda la preferencia en `localStorage` (clave `darkMode`) y la comparte entre
pestañas. El botón de la barra superior la cambia. Para que una pantalla funcione en los dos:

- Colores por token (`text.secondary`, `background.paper`, `divider`), nunca hex.
- Si hace falta distinguir: `(theme) => theme.palette.mode === "dark" ? … : …`.
- Probar la pantalla en los dos modos antes de darla por terminada.

---

## 2. Componentes base

### 2.1 Inventario

«Usos» = archivos que lo importan (13/11/2026).

| Componente | Ruta | Para qué | Usos | Estado |
|---|---|---|---|---|
| `Button` | `ui/buttons/Button.tsx` | Botón de MUI con `loading` (se deshabilita mientras carga) | 12 | Vigente. 23 archivos usan el `Button` de MUI directo |
| `BotonGuardar` | `ui/buttons/BotonGuardar.tsx` | Guardar con «Guardando…» → «✓ Guardado» (con `hooks/useEstadoDeGuardado`) | 2 | Nuevo (13/11/2026): tarea y corrección de tarea |
| `EstadoChip` | `ui/feedback/EstadoChip.tsx` | Chip de cualquier estado (sección 2.3) | 4 | Nuevo (13/11/2026) |
| `FormField` | `ui/inputs/FormField.tsx` | Campo conectado a React Hook Form: texto, número, fecha, select, checkbox, autocompletar | 7 | Vigente |
| `Select` | `ui/inputs/Select.tsx` | Select con opciones `{ value, label }` | 2 | Vigente. Había una copia idéntica en `ui/selects/` (la usaba `FormField`); se borró el 13/11/2026 |
| `Input` | `ui/inputs/Input.tsx` | TextField simple | 1 | Vigente |
| `AutocompleteCustom` | `ui/autocomplete/` | Autocompletar con texto libre (patrón 8 de `CLAUDE.md`) | 8 | Vigente |
| `AutocompleteTrabajador` | `ui/autocomplete/` | Elegir trabajador del padrón | 3 | Vigente |
| `SignatureField` / `SignatureCanvas` | `ui/signature/` | Firma dibujada, normalizada | 7 | Vigente |
| `CapturaFotoDialog` | `ui/camera/` | Foto con la cámara del celular, reducida antes de subir | — | Vigente |
| `ListaOrdenable` | `ui/sortable/` | Lista que se reordena arrastrando | — | Vigente |
| `DialogosVersionado` | `ui/versionado/` | Diálogos de versionado de plantillas (ver su `README.md`) | — | Vigente |
| `BaseCard` | `ui/cards/BaseCard.tsx` | Tarjeta con título, subtítulo y acciones | 2 | Vigente |
| `TemplateCard` | `ui/cards/TemplateCard.tsx` | Tarjeta de plantilla de formulario | 2 | Vigente |
| `StyledCard` | `ui/cards/StyledCard.tsx` | Tarjeta pulsable que sube 4px | 2 | Superpuesta con la `Card` del tema |
| `Card` | `ui/cards/Card.tsx` | Base de `BaseCard` | 1 | Vigente (la auditoría lo dio por muerto: lo importa `BaseCard`) |
| `ConfirmacionProvider` / `useConfirmar` | `ui/feedback/Confirmacion.tsx` | Diálogo de confirmación del sistema en lugar de `confirm()` (sección 3.5) | 13 | Nuevo (13/11/2026) |
| `SuccessScreen` | `ui/feedback/SuccessScreen.tsx` | Pantalla de «listo» después de enviar | 2 | Vigente |
| `ColoredAvatar`, `BulletPoint` | `ui/feedback/` | Avatar con iniciales; viñeta | — | Vigentes |
| `PageHeader` | `layout/page-header/` | Título de página + acciones | 3 | Poco adoptado |
| `DynamicBreadcrumbs`, `Navigation` | `layout/navigation/` | Migas y menú lateral | — | Vigentes |
| `Can` | `layout/wrappers/Can.tsx` | Muestra hijos solo con permiso | — | Vigente |
| `StickyBar` | `ui/buttons/StickyBar.tsx` | Barra de acciones fija al pie de un formulario; `className` para el patrón 5 | 1 | Movido desde herra-equipos (13/11/2026). `monitoreo-equipos/BarraAccionesReporte` tiene una copia |
| `InspectionStatusChip` | `features/herra-equipos/common/` | Estado de una inspección (sobre `EstadoChip`) | 2 | Se queda en herra-equipos: depende de su enum `InspectionStatus` |
| `SaveSubmitButtons` | `features/herra-equipos/common/` | Guardar / Enviar / Aprobar una inspección | 1 | Se queda en herra-equipos: textos y reglas de inspección |

### 2.2 `Button`

Botón de MUI con `loading`. El tema le da radio de 10px, peso 600, sin mayúsculas y relleno `10px 24px`.

| Variante | Cuándo |
|---|---|
| `contained` + `primary` | La acción principal de la pantalla o del diálogo. **Una sola** por vista |
| `outlined` | Acciones de apoyo: Descargar, Editar datos, Volver a cargar |
| `text` | Cancelar, Cerrar, Volver |
| `contained` + `error` | Confirmar algo destructivo, dentro de un diálogo de confirmación |

| Estado | Comportamiento |
|---|---|
| Hover | Primario: pasa a `primary.dark` (sólido, sin degradado) |
| Presionado | Se hunde levemente (`scale(0.98)`), también en el celular |
| Deshabilitado | Opaco, sin puntero |
| Cargando | `loading` lo deshabilita; mostrar «Guardando…» o un `CircularProgress size={20}` |

Accesibilidad: **siempre `type="button"`** si está dentro de un `<form>` y no es el envío (regla 4
de `CLAUDE.md`). Un `IconButton` necesita `aria-label` o un `Tooltip` con `title` de texto.

| ✅ Hacer | ❌ Evitar |
|---|---|
| Verbo + objeto: «Guardar corrección», «Subir planilla» | «OK», «Aceptar», «Procesar» |
| Una acción principal por vista | Dos botones `contained` compitiendo |
| Un ícono que ayuda: `startIcon={<Download />}` | Íconos decorativos en todos los botones |

```tsx
<Button type="button" variant="outlined" startIcon={<DownloadIcon />} onClick={descargar} loading={descargando}>
  Descargar Excel
</Button>
```

### 2.3 `EstadoChip`

`ui/feedback/EstadoChip.tsx`. El chip de cualquier estado: fondo teñido del color del estado, borde
y texto en su tono oscuro (claro en modo oscuro), con una transición corta al cambiar. Lo usan la
tarjeta y el detalle del plan, la tabla de tareas, `InspectionStatusChip`, las tarjetas de actividad del
panel y los estados y la eficacia de la matriz de riesgos. El nivel de riesgo no (sección 1.3).

| Propiedad | Tipo | Descripción |
|---|---|---|
| `etiqueta` | `string` | Texto visible |
| `color` | `"default" \| "info" \| "warning" \| "success" \| "error"` | Sale de la tabla de estados del dominio, no se elige en la pantalla |
| `size` | `"small" \| "medium"` | `small` (por defecto) en tablas y tarjetas |
| `icono` | `ReactElement` | Opcional |
| `title` | `string` | Texto al pasar el mouse |

```tsx
const estado = estadoDeTarea(tarea.estado); // { etiqueta, color } del dominio
<EstadoChip etiqueta={estado.etiqueta} color={estado.color} />
```

Reglas: el color nunca es la única señal (va con la etiqueta); los colores son los de la tabla de la
sección 1.3. Dentro de un `Typography`, usar `component="div"`: el chip es un `div`.

### 2.4 `FormField`

Adaptador de React Hook Form. Elegir `type` en vez de armar el `Controller` a mano.

| Propiedad | Descripción |
|---|---|
| `name`, `control` | Del `useForm` |
| `type` | `text`, `number`, `date`, `select`, `checkbox`, `autocomplete` |
| `label` | Rótulo visible; el asterisco de obligatorio lo pone `rules.required` |
| `rules` | Validación de RHF; el mensaje se muestra debajo del campo |
| `options` / `dataSource` | Opciones fijas o un catálogo (`area`, `trabajador`, …) |

Fechas: un `type="date"` guarda «AAAA-MM-DD» y el backend lo guarda como medianoche UTC. **Para
mostrarla o para cargarla en un input, leer el día en UTC** (`toISOString().slice(0, 10)` o
`toLocaleDateString("es-ES", { timeZone: "UTC" })`). Leerla en la hora de Bolivia da el día anterior
(error corregido en planes de acción el 07/11/2026).

---

## 3. Patrones

### 3.1 Página

```
Migas (DynamicBreadcrumbs)
Título h4 + acciones a la derecha (PageHeader)
Resumen (tarjetas de totales), si aplica
Filtros en una fila (Select size="small", minWidth 200–240)
Pestañas con contador (si hay estados)
Contenido: lista de tarjetas o tabla
```

- `Container maxWidth="xl"`, `py: 4`.
- Las acciones de página van arriba a la derecha; en celular pasan debajo del título, a lo ancho.
- Un botón que el rol no puede usar **no se muestra** (con `Can` o `hasRole`), no se deja que falle al
  guardar. Ejemplo corregido: «Crear Plan Manualmente» (07/11/2026).

### 3.2 Formularios

Los patrones técnicos (RHF, scroll al primer error, guardián de salida, aprobación) están en
`CLAUDE.md` y en `docs/HERRA_EQUIPOS_PATTERNS.md`. Lo visual:

- Un campo por fila en celular; dos por fila desde `sm` solo si son cortos (fecha + empresa).
- Rótulo siempre visible (no solo `placeholder`). Obligatorio con `*`.
- El error va debajo de su campo, en una frase que dice qué hacer: «Para pasar a En progreso falta: la
  acción propuesta».
- Un aviso arriba del formulario explica el estado y lo que falta (`Alert severity="info"`).
- Lo bloqueado se ve bloqueado: campo deshabilitado + candado + ayuda «Solo editable en estado Abierto».
- Acciones en una barra fija abajo (`StickyBar` con `SaveSubmitButtons`): Cancelar a la izquierda,
  la acción principal a la derecha.
- **`position: sticky` necesita que ningún contenedor de arriba tenga `overflow` distinto de `visible`.**
  Por eso `globals.css` usa `overflow-x: clip` en `html, body` y no `hidden`: con `hidden` el body se
  volvía un contenedor de desplazamiento que no se desplaza, y ninguna barra ni encabezado fijo se fijaba
  (corregido el 14/11/2026). Para recortar dentro de un componente con algo fijo adentro, usar `clip`.
- Un paso que no valida (`trigger()` en «Siguiente Sección») también llama a `irAlPrimerError`, igual que
  el envío: pintar el campo de rojo sin llevar hasta él no alcanza en un formulario largo.
- Un mensaje de obligatorio nunca muestra la clave interna del campo («signature es obligatorio»): sin
  rótulo, «Este campo es obligatorio», y si hay un paso fácil de olvidar, decirlo («Falta la firma: dibújela y
  pulse «Guardar Firma»»).

### 3.3 Tablas

- `TableContainer` con desplazamiento horizontal; la columna **Acciones** siempre a la derecha.
- Texto `body2`; encabezados en negrita sobre `background.default`.
- Acciones como `IconButton size="small"` con `Tooltip`: Historial, Editar, Corregir, Eliminar, Aprobar,
  en ese orden. La destructiva al final y separada de la principal.
- Estado con chip (sección 2.3). Fechas `dd/mm/aaaa` (día UTC, sección 2.4). Vacío como «—».
- **En celular** una tabla de más de 6 columnas no se lee: pasar a una lista de tarjetas.

### 3.4 Tarjeta de lista

El modelo es `PlanCard`:

```
[código mono]  Título  [chip tipo] [chip estado] [chip aprobación]      [Ver] [🗑]
Organización · · ·
Fechas en su propio renglón
[barra de avance]  N tareas · N completadas · N% avance
▸ Desplegable de detalle (opcional)
```

- Toda la información de una línea en `text.secondary`; el título en `text.primary`.
- Borde izquierdo de color = estado (4px).
- Acciones a la derecha; la destructiva en rojo y pidiendo confirmación.

### 3.5 Diálogos

- Título en forma de acción: «Corregir tarea», «Aprobar Plan de Acción».
- Si cambia datos: un párrafo que dice qué va a pasar y si se puede deshacer.
- Acciones: «Cancelar» (`text`) y la acción (`contained`) a la derecha.
- `maxWidth="sm"` para confirmar, `"md"` para formularios; contenido con scroll propio.
- **Confirmaciones:** con `useConfirmar` (`ui/feedback/Confirmacion.tsx`), nunca con `confirm()` del
  navegador (no sigue el tema ni el modo oscuro y en celular se ve distinto en cada navegador). El
  proveedor está montado en `app/dashboard/layout.tsx`.

  ```tsx
  const confirmar = useConfirmar();
  const darDeBaja = async (id: string) => {
    if (!(await confirmar("¿Está seguro de dar de baja este plan? …"))) return;
    …
  };
  ```

  Con solo el texto, `opcionesConfirmacion.ts` deduce el resto: «eliminar» → botón «Eliminar» rojo;
  «dar de baja» → «Dar de baja» rojo; lo demás → «Continuar» en el principal. Para otro título o botón,
  pasar `{ titulo, mensaje, textoConfirmar, peligro }`. En lo peligroso aparece el ícono de advertencia y el
  foco empieza en «Cancelar», para que un Enter apurado no borre nada; Esc o clic afuera cancelan.

### 3.6 Avisos y respuestas

| Situación | Componente | Severidad |
|---|---|---|
| Explicar cómo funciona algo | `Alert` en la pantalla | `info` |
| Algo pendiente o que pide atención | `Alert` | `warning` |
| Algo que impide seguir | `Alert` junto al lugar del error | `error` |
| Confirmar que algo se guardó | `Snackbar` 4–6 s | `success` |
| Falló una acción | `Snackbar` o `Alert` con el motivo | `error` |

Los mensajes que vienen del servidor deben llegar en español y decir qué hacer. Para mostrar un error
atrapado, usar `mensajeParaUsuario(error, "No se pudo guardar la tarea")` (`src/lib/errores/`), no
`error.message`:

| Error técnico | Se muestra |
|---|---|
| «Failed to fetch», «NetworkError…», «Load failed», «fetch failed», «… aborted», «timeout» | No se pudo conectar con el servidor. Revise su conexión e intente de nuevo; lo que cargó sigue en pantalla. |
| «HTTP 500» y otros 5xx sin texto | El servidor tuvo un problema y no pudo completar la acción. Intente de nuevo en unos minutos. |
| «Path \`x\` is required» (Mongoose) | Falta un dato obligatorio (x). Complételo e intente de nuevo. |
| Cualquier otro mensaje (los del backend ya vienen en español) | Tal cual |
| Un error sin texto | El texto por defecto que se le pasa |

Reemplazó 166 `x instanceof Error ? x.message : …` en 57 archivos (13/11/2026). Para el registro
(`console.error`, `logger`) se sigue guardando el error original.

### 3.7 Carga y vacío

- Carga de una lista: `Skeleton` con la forma del contenido; de una acción: el botón en `loading`.
- Vacío: un texto que explique por qué y qué hacer **según el rol**. Hoy el supervisor ve «Crea un nuevo
  plan o genera uno desde una inspección», que no puede hacer.

### 3.8 Pestañas con contador

Contador como `Badge` sobre la etiqueta; se oculta en cero. El número sale de la misma función que filtra
la lista (`pestanasPlan.ts`), para que nunca digan cosas distintas.

---

## 4. Contenido

- **Idioma:** español de Bolivia. Hoy se mezclan «tú» («Completa», «Puedes») y «usted» («Suba», «Pulse»):
  elegir uno. Se recomienda **usted**, como en las guías de usuario.
- **Mayúsculas:** solo al principio (formato oración): «Agregar tarea», no «Agregar Tarea».
- **Botones:** verbo + objeto. **Errores:** qué pasó y qué hacer.
- **Fechas** `dd/mm/aaaa`; horas `14:30`; números con coma decimal.
- **Códigos** (PA-3F8C41, 1.02.P06.F41) en fuente monoespaciada.

---

## 5. Accesibilidad

### Contraste (WCAG AA: 4,5:1 texto normal, 3:1 texto grande y controles)

| Combinación | Contraste | Resultado |
|---|---|---|
| Blanco sobre petróleo `#18364A` (botón principal, barra superior) | 12,61:1 | ✅ (antes 2,98:1 en el degradado) |
| Petróleo sobre gris claro (texto de marca sobre el fondo) | 10,69:1 | ✅ |
| Blanco sobre acero `#52758A` (botón secundario) | 4,92:1 | ✅ (antes 2,43:1 con el cian) |
| Acero sobre gris claro | 4,17:1 | ⚠️ Solo íconos, bordes y texto grande |
| Texto secundario `#3E6175` sobre blanco | 6,62:1 | ✅ (antes 2,56:1 con el gris) |
| Blanco sobre `success` `#15803D` | 5,02:1 | ✅ |
| Blanco sobre `warning` `#B45309` | 5,02:1 | ✅ |
| Blanco sobre `error` `#B91C1C` | 6,47:1 | ✅ |
| Blanco sobre `info` `#0369A1` | 5,93:1 | ✅ |
| `primary` oscuro `#A9C3D3` sobre tarjeta oscura `#142B3A` | 7,96:1 | ✅ |
| Texto secundario oscuro `#A9BAC5` sobre fondo oscuro | 8,51:1 | ✅ |

### Otras reglas

- Toque mínimo **44 × 44px** en celular (los `IconButton size="small"` de las tablas, con ícono
  `small`, miden unos 30px: 5px de relleno por lado más el ícono de 20px).
- Todo `IconButton` con nombre accesible (`aria-label` o `Tooltip` con texto).
- El foco se ve: el anillo de `TextField` existe, falta revisar botones e íconos.
- El color nunca es la única señal: un estado lleva texto; un campo con error, mensaje.

---

## 6. Auditoría (13/11/2026)

### Resumen

**Componentes revisados:** 24 | **Problemas:** 12 (10 resueltos el 13/11/2026) | **Puntaje:** 58/100 → 84/100

La base es buena: tema completo con modo oscuro, Inter, sombras propias y componentes de formulario
pensados para campo (firma, cámara, trabajador). Pierde puntos porque buena parte del código no la usa.

### Cobertura de tokens

| Categoría | Definido en el tema | Escrito a mano |
|---|---|---|
| Colores | Marca de la empresa, semánticos y neutros (claro y oscuro) | **434 hex en 57 archivos** (eran 579 en 68; ya no queda violeta), incluidos colores de MUI por defecto (`#1976D2`, `#4CAF50`, `#F44336`) y un azul marino `#1E3E66` del tablero (32 usos) |
| Radios | 5 valores | 65 × `borderRadius: 2` (24px) y 22 × `3` (36px) por la trampa de `sx` |
| Tipografía | Escala completa | Más de 100 `fontSize` sueltos |
| Estados de dominio | `EstadoChip` + `estadosVisuales.ts` | Planes, tareas, inspecciones, matriz de riesgos, linternas y préstamos SPCC unificados (14/11/2026). Falta monitoreo (módulo en pausa) |

### Completitud de componentes

| Componente | Estados | Variantes | Docs | Puntaje |
|---|---|---|---|---|
| Button | ✅ (loading) | ✅ | ✅ (este documento) | 8/10 |
| FormField | ✅ | ✅ | ⚠️ | 7/10 |
| Chip de estado | ✅ | ✅ `EstadoChip` | ✅ | 8/10 |
| Card / tarjetas | ✅ solo sube la pulsable | ⚠️ 4 versiones | ⚠️ (sección 1.8) | 6/10 |
| Diálogo de confirmación | ✅ `useConfirmar` | ✅ normal / peligroso | ✅ | 9/10 |
| PageHeader | ✅ | — | ❌ | 5/10 (3 usos) |

### Acciones prioritarias

1. ✅ *Hecho el 13/11/2026 con la paleta de la empresa.* **Contraste de botones y chips:** botón principal en un solo color `primary.dark` (6,29:1) o
   degradado de `dark` a `main`; `secondary` con texto oscuro; chips llenos de success/warning con
   texto oscuro o en variante `outlined`. Afecta a todos los roles, todos los días.
2. ✅ *Hecho el 13/11/2026 para planes, tareas e inspecciones y el 14/11/2026 para la matriz de riesgos y las tarjetas de actividad.* **Un `EstadoChip` y una tabla de colores de estado** (sección 1.3), empezando por planes de acción
   (Abierto azul en la tarjeta, rojo en la tabla).
3. ✅ *Hecho el 13/11/2026: `useConfirmar` reemplaza los 17 `confirm()` de 13 archivos.* **`ConfirmDialog` en `ui/`** para reemplazar los `window.confirm`.
4. ✅ *Hecho el 13/11/2026.* **Quitar la animación de hover de `MuiCard`** del tema y dejarla solo en tarjetas pulsables
   (`CardActionArea`, clase `tarjeta-pulsable` o `StyledCard`).
   - ✅ *Además, 13/11/2026:* los errores técnicos («Failed to fetch», «HTTP 500») se muestran en español con
     `mensajeParaUsuario` (sección 3.6).
5. ✅ *Hecho el 13/11/2026.* **`body1` en celular a 14px** como mínimo.
6. ✅ *Hecho el 13/11/2026: 53 reemplazos en 21 archivos; quedan 7 excepciones con motivo (sección 1.2).* **Barrer hex de fondo claros** (`#F5F5F5`, `#FAFAFA`, `#F9F9F9`) por tokens: arregla el modo oscuro.
7. ✅ *Hecho el 13/11/2026, corregido.* **Borrar lo que no se usa.** `ui/cards/Card.tsx` no estaba muerto (lo usa
   `BaseCard`) y `ui/selects/Select.tsx` lo usaba `FormField`, pero era copia de `ui/inputs/Select.tsx`: se
   borró la copia. Borrados: `FormTextField`; en `features/auth` `LoginForm`, `RegisterForm`, `Setup2faSection`
   y lo que solo ellos usaban (`Setup2faModal`, `Disable2faModal`, `Verify2faForm`, `AuthGuard`, los hooks
   `useLogin`, `useRegister`, `useVerify2FA` y sus tres métodos del adaptador). El inicio de sesión y el
   registro los hace el IAM. Queda limpiar `app/actions/auth.ts` (acciones sin uso y ~270 líneas comentadas).
8. ✅ *Hecho el 13/11/2026, corregido.* **Promover a `ui/`** solo `StickyBar`, que es genérico. `InspectionStatusChip`
   y `SaveSubmitButtons` dependen de herra-equipos (enum de estados, textos de inspección): en `ui/` romperían
   la regla de que `ui` no conoce las features.

---

## Lista rápida para revisar una pantalla

- [ ] Colores por token, ningún hex nuevo.
- [ ] `borderRadius` en `sx` pensado como múltiplo de 12px (o escrito en px).
- [ ] Variantes de tipografía, ningún `fontSize` suelto.
- [ ] Una sola acción `contained` por vista; botones con verbo + objeto; `type="button"` en formularios.
- [ ] Estados con su chip y los colores de la sección 1.3.
- [ ] Fechas mostradas y cargadas como día UTC.
- [ ] Lo que el rol no puede hacer no se muestra.
- [ ] Probada en modo claro y oscuro, y a 390px de ancho.
- [ ] `IconButton` con nombre; nada pulsable por debajo de 44px en celular.
- [ ] Mensajes en español, que digan qué hacer; errores atrapados con `mensajeParaUsuario`.
- [ ] Confirmaciones con `useConfirmar`, nunca `confirm()`.
- [ ] Una `Card` solo sube al pasar el mouse si toda ella se puede pulsar.
