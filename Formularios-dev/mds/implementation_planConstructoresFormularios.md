# Constructores de formularios: rendimiento, orden de preguntas y versionado

Aplica a los **dos** constructores:

| Constructor | Frontend | Backend (colección) | Lo usan |
|---|---|---|---|
| IRO / ISOP | `components/features/form-builder/` | `templates` (`Template`) | `instances` |
| Herramientas y equipos | `components/features/herra-equipos/presentation/components/builders/` | `template-herra-equipos` (`TemplateHerraEquipos`) | `inspections_herra_equipos` |

Tres pedidos del usuario (2026-09-26), en orden de dependencia:

1. **Rendimiento:** escribir una pregunta se vuelve lento a medida que crece el formulario, tanto al crear como al editar.
2. **Orden de preguntas:** poder arrastrar una pregunta a otra posición dentro de su sección.
3. **Versionado:** crear una revisión nueva a partir de la anterior, y que la anterior quede fuera de uso sin borrarse.

---

## 1. Rendimiento — diagnóstico

La causa es la misma en los dos constructores: **cada tecla vuelve a dibujar el formulario entero**. El costo de escribir crece con el número de preguntas (O(n) por tecla), y por eso con 56 preguntas ya se nota.

### IRO / ISOP (`form-builder/presentation/components/`)

| Dónde | Qué pasa en cada tecla |
|---|---|
| `FormBuilder.tsx:80` y `:78` | `mode: "onChange"` más la lectura de `isValid` (que se usa en `:790` para deshabilitar Guardar): React Hook Form **revalida todo el formulario** en cada tecla |
| `FormBuilder.tsx:148-153` | `useWatch` de `sections`, `simpleSections` y `verificationFields` **en la raíz**: cualquier tecla en cualquier pregunta redibuja `FormBuilder` |
| `FormBuilder.tsx:706` | Le pasa a cada sección `watchedSections[i]`, un objeto nuevo en cada render, y `SectionBuilder` no está memoizado: **se redibujan todas las secciones con todas sus preguntas** |
| `SectionBuilder.tsx:97-123` | Cada sección vigila sus preguntas y corre un efecto que recorre todas las preguntas en cada tecla |
| `FormBuilder.tsx:290-300` | **Bug aparte:** el efecto revoca las URL `blob:` de las imágenes cada vez que cambia algo en las secciones con imágenes, no solo al salir. Una imagen que se está procesando puede romperse mientras se escribe |

### Herramientas y equipos (`herra-equipos/presentation/components/builders/`)

| Dónde | Qué pasa en cada tecla |
|---|---|
| `FormBuilder.tsx:114-115` | `useWatch({ control })` **sin nombre** (vigila el formulario completo) más `getValues()`: toda la pantalla funciona como formulario controlado desde la raíz |
| `SectionBuilder.tsx` / `QuestionEditor.tsx` | Los valores bajan como objetos (`section`, `question`) y los cambios suben con `setValue`. Cada tecla redibuja **cada** `QuestionEditor`, con sus selects, su gestor de imágenes y su estado propio |
| `FormBuilder.tsx:80` | `zodResolver`: después del primer intento de guardar, el esquema Zod completo se revalida en cada tecla |
| `SectionBuilder.tsx:241` | Preguntas nuevas con `key` = índice. Es otro problema, pero bloquea el punto 2 (reordenar) |

### Arreglo propuesto

El principio: **cada campo se suscribe solo a su propio valor.**

- Cada pregunta, título y campo se lee con su propio `Controller` / `useWatch({ name: ruta })`, no con un objeto que baja desde la raíz.
- Las filas de pregunta y las secciones pasan a ser componentes memoizados con props estables (índice + callbacks estables). Así, escribir en la pregunta 40 solo redibuja la pregunta 40.
- Los contadores de la cabecera (secciones, preguntas, puntos, imágenes) se mueven a un componente chico y aislado que vigila por su cuenta. Solo ese componente se redibuja con cada tecla, y es barato.
- `mode: "onTouched"` (el estándar del CLAUDE.md) en vez de `onChange`. El botón Guardar deja de depender de `isValid`: al guardar con errores se hace scroll al primero (Patrón 2 del CLAUDE.md).
- IRO: la limpieza de URL `blob:` pasa a correr solo al desmontar.
- Herramientas: se reemplaza el `useWatch({ control })` global. Las preguntas se agregan con `append` del field array (no con `setValue` del array entero) y las keys usan `field.id`.

**Cómo se verifica:** medir con React DevTools Profiler cuánto tarda una tecla en una plantilla real de 56 preguntas (la ISOP), antes y después. El objetivo es que el tiempo por tecla no dependa del número de preguntas.

---

## 2. Reordenar preguntas arrastrando

- **Librería:** `@dnd-kit/core` + `@dnd-kit/sortable`. Es el estándar actual para React: accesible (también se reordena con teclado), liviana y funciona con MUI. **Es una dependencia nueva** — hoy no hay ninguna de drag & drop instalada.
- **Interacción:** un asa (⋮⋮) a la izquierda de cada pregunta. Se toma, se arrastra y se suelta en la posición nueva; el número "Pregunta N" se actualiza solo. Con teclado: foco en el asa, espacio, flechas, espacio.
- **Implementación:** `useFieldArray().move(desde, hasta)` de React Hook Form. Requiere las keys estables del punto 1, por eso va después.
- **Alcance v1:** preguntas dentro de su sección. Mover preguntas entre secciones, o reordenar secciones, se puede agregar después con la misma base.

> [!WARNING]
> **Reordenar una plantilla que ya tiene inspecciones las desordena.** Las inspecciones de herramientas guardan cada respuesta **por posición** (`responses.section_0.q2`) y se muestran —y se imprimen— con la plantilla actual. Si la pregunta 3 pasa a ser la 1, las inspecciones viejas muestran la respuesta de la 3 al lado del texto de la 1, sin ningún error visible. Lo mismo pasa hoy al **insertar o borrar** una pregunta en una plantilla usada: el problema ya existe, reordenar solo lo hace más fácil. Por eso el orden, y cualquier cambio de estructura, tiene que quedar limitado a plantillas que todavía no se usaron. Eso es exactamente lo que resuelve el versionado (punto 3).

---

## 3. Versionado de plantillas

### Por qué no alcanza con el campo "Revisión" actual

Hoy `revision` es texto libre ("Rev. 1", "Revisión: 7") y **editar una plantilla la modifica en el mismo documento**. Todas las inspecciones apuntan a ese documento (`templateId`), así que editar la plantilla cambia retroactivamente cómo se ven las inspecciones ya hechas, en el caso de herramientas incluso con las respuestas desalineadas (ver la advertencia anterior).

### Modelo propuesto: cada revisión es un documento propio

Se usan los estados del control documental de ISO 9001, que es lo que ya indica el código tipo `1.02.P06.F12`:

| Estado | Significado | ¿Se edita? | ¿Aparece para inspecciones nuevas? |
|---|---|---|---|
| **Borrador** | Revisión nueva en preparación | Sí, libremente (incluido reordenar) | No |
| **Vigente** | La revisión en uso. **Una sola por código** | Ver decisión pendiente | Sí |
| **Obsoleta** | Reemplazada por una revisión posterior. Se conserva para las inspecciones hechas con ella | No, solo lectura | No |

Campos nuevos en las dos colecciones de plantillas:

- `numeroRevision` (número entero): reemplaza al texto libre como dato. "Revisión 7" se muestra a partir de él.
- `estadoRevision`: `borrador` | `vigente` | `obsoleta`.
- `revisionAnteriorId`: la revisión de la que se partió.
- `motivoCambio`: obligatorio al publicar ("se agregó la pregunta de arnés doble"). Es lo que pide el control documental.
- `vigenteDesde`, `obsoletaDesde`, `publicadaPor`.

Índices: único `{ code, numeroRevision }`, más un índice único **parcial** `{ code }` solo sobre `estadoRevision: 'vigente'`. Así la base de datos misma garantiza que nunca haya dos vigentes. En IRO eso implica **quitar el `unique` actual de `code`**, que hoy impide tener dos documentos con el mismo código.

### Flujo

1. Sobre la vigente: **"Crear nueva revisión"** → se clona como **borrador** con `numeroRevision + 1`. Solo puede haber un borrador por código.
2. El borrador se edita libremente: preguntas, orden, puntajes.
3. **"Publicar revisión"** (pide motivo del cambio) → en una sola operación, el borrador pasa a **vigente** y la anterior a **obsoleta**.
4. Descartar un borrador es darlo de baja (baja lógica, como el resto del sistema).

### Qué cambia para quien usa las plantillas

- La lista para iniciar una inspección nueva muestra solo las **vigentes**. `findByCode` (herramientas) devuelve la vigente.
- Las inspecciones ya hechas **no se tocan**: siguen apuntando a su revisión, que ahora queda congelada. Así se ven y se imprimen exactamente como se hicieron. Esto arregla de raíz el problema de las respuestas por posición.
- El listado de plantillas agrupa por código: muestra la vigente con su "Rev. N", un indicador si hay borrador en curso, y un historial con las obsoletas (solo lectura, con motivo y fecha de cada cambio).

### Migración

Un script `.cjs` con dry-run por defecto, igual que los anteriores:

- Toda plantilla existente pasa a **vigente**.
- `numeroRevision` se saca del texto actual ("Revisión: 7" → 7; si no se puede leer un número, 1).
- Se crean los índices nuevos (y en IRO se quita el `unique` de `code`).
- Antes de aplicar, el script verifica que no haya dos plantillas activas con el mismo código.

---

## Decisiones tomadas (con el usuario, 2026-09-26)

| Pregunta | Decisión |
|---|---|
| Nombres de los estados | **Borrador / Vigente / Obsoleta** (ISO 9001) |
| Editar una vigente que ya tiene inspecciones | **No se puede.** El constructor la abre en solo lectura con el botón "Crear nueva revisión". Una vigente **sin** inspecciones sí se edita en el lugar |
| Arrastrar preguntas | Se instala **`@dnd-kit`** (core + sortable) |
| Inspecciones en curso al publicar una revisión nueva | **Terminan con la revisión con la que empezaron**; las nuevas usan la vigente |

## Orden de implementación

1. **Rendimiento** en los dos constructores. Es independiente del resto y deja las keys estables que necesita el punto 2.
2. **Reordenar arrastrando.** Queda habilitado solo en borradores y en plantillas sin uso.
3. **Versionado — backend:** esquemas, índices, endpoints (nueva revisión / publicar / historial), consumidores (`findByCode`, listados) y el script de migración.
4. **Versionado — frontend:** estados en el listado, botones, historial y constructor en solo lectura para las obsoletas.

---

## Estado

🟡 **Implementado (2026-09-27), migración sin aplicar.** Los tres puntos están programados y probados. Falta correr `scripts/migrar-versionado-plantillas.cjs --apply` (previo respaldo) y la prueba manual del arrastre con mouse.

### Punto 3 — Versionado ✅ (código; migración pendiente)

**Backend (`BackendForm/`):**
- `src/common/versionado/versionado.ts` (nuevo) — estados, `FILTRO_VIGENTE` (cuenta como vigente a la plantilla sin estado, para que todo funcione también antes de migrar), `numeroDesdeTexto` y `textoDeRevision` («Revisión: 7» → «Revisión: 8», respetando el formato).
- `src/common/versionado/versionado.plugin.ts` (nuevo) — campos (`numeroRevision`, `estadoRevision`, `revisionAnteriorId`, `motivoCambio`, `vigenteDesde`, `obsoletaDesde`, `publicadaPor`, `creadaPor`) e índices: único `{code, numeroRevision}` y único parcial «una sola vigente por código».
- `src/common/versionado/versionado-plantillas.ts` (nuevo) — la lógica compartida por las dos colecciones: `estadoEdicion`, `prepararEdicion`, `crearRevision`, `publicar`, `historial`, `exigirCodigoLibre`. `publicar` marca primero la anterior como obsoleta y después la nueva como vigente (el índice no admite dos vigentes ni por un instante) y revierte si falla.
- `src/common/versionado/publicar-revision.dto.ts` (nuevo) — motivo obligatorio.
- `templates/` y `template-herra-equipos/` — esquemas con el plugin (IRO: `code` deja de ser único); servicios: alta con `exigirCodigoLibre`, listados y `findByCode` solo con la vigente (`?incluirBorradores=true` para administración), edición con `prepararEdicion`; controladores: `GET :id/estado-edicion`, `POST :id/nueva-revision`, `POST :id/publicar`, `GET code/:code/historial`, todos los de escritura con `@Roles(ADMIN, SUPER_ADMIN)`. **De paso, crear y editar plantillas IRO ahora exigen rol de administración** (antes no tenían `@Roles`).
- `scripts/migrar-versionado-plantillas.cjs` (nuevo). Dry-run: 9 IRO y 24 herramientas, todas vigentes salvo F19 Rev 4 (obsoleta, sin uso), 0 colisiones, índice único `code_1` de IRO para borrar.
- Pruebas: `versionado.spec.ts` (26, contra un modelo falso en memoria) y ajuste de las 4 specs de plantillas. Suite completa: **855/855**.

**Frontend (`FormNext/`):**
- `src/types/versionado.ts`, `src/lib/actions/versionado-actions.ts` (nuevos) — tipos y Server Actions para las dos APIs (`recurso` validado contra una lista fija).
- `src/hooks/useVersionadoPlantilla.ts` (nuevo) — estado y operaciones, compartido por IRO y herramientas.
- `src/components/ui/versionado/DialogosVersionado.tsx` (nuevo) — `ChipEstadoRevision`, `DialogoPublicarRevision` (con motivo y advertencia opcional), `DialogoRevisionBloqueada`, `DialogoHistorialRevisiones`.
- Adaptadores: `form-builder/infrastructure/adapters/templateAdapter.ts` (`versionadoTemplatesAdapter`), `herra-equipos/infrastructure/adapters/versionadoAdapter.ts` y `plantillaDeInspeccion.ts` (nuevos).
- Pantallas: `app/dashboard/config/IRO-ISOP/page.tsx` y `herra-equipos/.../builders/QuestionBuilder.tsx` + `TemplateCard.tsx` — estado en cada tarjeta, botones Nueva revisión / Publicar / Historial, «Editar» pregunta al backend y si la revisión ya se usó ofrece crear una nueva. La pestaña «Crear Formularios» de IRO muestra solo vigentes.
- Constructores: en un borrador, código y número de revisión quedan de solo lectura.
- **Opción A:** al publicar una revisión de herramientas cuyo código tiene pantalla especializada (`getFormConfig(code)`), el diálogo avisa que esa pantalla y su Excel no se ajustan solos.
- **Inspecciones ya hechas de herramientas:** `[code]/[inspectionId]/page.tsx` y `EditarInspeccionPage.tsx` cargan la plantilla por `templateId` (`plantillaDeInspeccion`), no por código.
- `ui/cards/BaseCard.tsx` — acciones con `disabled` y que se acomodan en varias líneas.

**Verificado en el navegador (sin migrar):** la tarjeta ISOP muestra «Vigente» y los botones nuevos; «Editar» en la ISOP (23 inspecciones) abre el aviso «Ya tiene 23 inspección(es)…» con «Crear nueva revisión»; el historial lista la Revisión 7 vigente con 23 inspecciones; una inspección aprobada de F19 abre bien con su revisión. Sin errores de consola. No se creó ninguna revisión de prueba para no escribir en la base.

**Antes de migrar:** F19 aparece dos veces como «Vigente» (sus dos documentos no tienen estado todavía) y en IRO «Nueva revisión» falla por el índice único `code_1`. Las dos cosas las resuelve la migración.

### Verificación en el navegador (2026-09-26)

**Rendimiento — medido.** Se midió el tiempo que React tarda en procesar cada tecla (del evento `input` hasta terminar de redibujar), escribiendo letra por letra en una pregunta, en el servidor de desarrollo:

| Plantilla | Preguntas | Mediana por tecla | p90 |
|---|---|---|---|
| IRO — Sustancias peligrosas | 30 | 17,1 ms | 24 ms |
| IRO — Trabajo en altura | 129 | 18,9 ms | 22 ms |

Con 4 veces más preguntas el costo por tecla es prácticamente el mismo: **ya no crece con el tamaño del formulario**, que era el problema. Son números en modo desarrollo; la versión compilada es varias veces más rápida. No hubo errores en consola. No se guardó nada: el texto de prueba se descartó al salir sin guardar.

**Reordenar — parcialmente verificado.** El asa aparece en cada pregunta, toma la pregunta (con teclado y con puntero), los anuncios en español funcionan, y se comprobó por dentro que dnd-kit mide bien las 10 preguntas de la sección y calcula la posición destino. **No se pudo completar un soltado de punta a punta en el panel del navegador de pruebas:** mide 310 px de alto (una pregunta ocupa 227, así que no entran dos), se oculta y reaparece durante la prueba (dnd-kit cancela el arrastre con `visibilitychange`), y los arrastres automatizados son instantáneos. **Pendiente: prueba manual con mouse en un navegador normal.**

### Decisión adicional (2026-09-26)

| Pregunta | Decisión |
|---|---|
| Plantillas de herramientas con Excel o pantalla especial armados a mano por código | **Opción A:** al publicar una revisión nueva, el sistema **avisa** que ese Excel/pantalla es fijo y hay que ajustarlo a mano. No se bloquea nada |

### Punto 1 — Rendimiento ✅

**IRO / ISOP** (`form-builder/`):
- `presentation/components/FormBuilder.tsx` — reescrito: sin `useWatch` en la raíz, `mode: "onTouched"`, Guardar ya no depende de `isValid` (al guardar con errores hace scroll al primero, Patrón 2), limpieza de `blob:` solo al desmontar, callbacks estables para las secciones memoizadas.
- `presentation/components/SectionBuilder.tsx` — memoizado; lee de a un campo (título, descripción, puntaje, si es padre); se abre solo si tiene errores después de intentar guardar; sin el efecto que corría en cada tecla.
- `presentation/components/PreguntaFila.tsx` (nuevo) — fila de pregunta memoizada.
- `presentation/components/SectionBuilderView.tsx` — secciones con imágenes: keys estables (`field.id` en vez del índice), cada pregunta con su propio estado de carga de imagen. De paso, `processImage` libera la URL `blob:` que creaba, que antes se perdía.
- `presentation/components/CamposVerificacion.tsx` y `ResumenPlantilla.tsx` (nuevos) — campos de verificación y contadores aislados.
- `domain/models/estadisticasPlantilla.ts` y `application/hooks/useEstadisticasPlantilla.ts` (nuevos) — cuentas puras y su suscripción. La normalización de `obligatorio` pasa a hacerse una sola vez al cargar.

**Herramientas** (`herra-equipos/presentation/components/builders/`):
- `FormBuilder.tsx` — reescrito sin `useWatch({ control })` + `getValues()`; la información general va con `Controller`.
- `SectionBuilder.tsx` — memoizado; preguntas y subsecciones con los métodos del field array (antes `setValue` del array entero); keys `field.id`.
- `QuestionEditor.tsx` — memoizado; lee solo su pregunta.
- `ImageManager.tsx` — lee sus propias imágenes.
- `CamposVerificacionBuilder.tsx` y `FrecuenciaInspeccionCard.tsx` (nuevos).

### Punto 2 — Reordenar ✅ (código; falta probar en el navegador)

- `@dnd-kit/core` 6.3.1, `@dnd-kit/sortable` 10.0.0, `@dnd-kit/utilities` 3.2.2.
- `src/components/ui/sortable/ListaOrdenable.tsx` (nuevo, genérico): `ListaOrdenable`, `useOrdenable`, `AsaArrastre`. Asa ⋮⋮ a la izquierda de cada pregunta, teclado incluido, anuncios en español para lectores de pantalla.
- Integrado en las preguntas de: secciones IRO, secciones con imágenes IRO y secciones de herramientas (ahí el ícono ⋮⋮ ya existía, pero era decorativo).
- Se verificó que nada ordena por el campo `order`: la posición en el array es el orden real, tanto en el constructor como al llenar.
- **Todavía no se limita a borradores:** eso llega con el punto 3. Hasta entonces, reordenar una plantilla ya usada tiene el riesgo descrito en la advertencia del punto 2 (el mismo que ya existe hoy al insertar o borrar preguntas).

### Punto 3 — Hallazgos antes de implementar

1. **Las inspecciones de herramientas ya hechas buscan su plantilla por código, no por `templateId`.** `form-herra-equipos/[code]/[inspectionId]/page.tsx:119` y `EditarInspeccionPage.tsx:68` hacen `templates.find(t => t.code === code)`. Con versionado, abrir una inspección vieja mostraría la revisión **vigente**, no la suya. Hay que cambiarlas para que carguen por `templateId` (que ya se guarda en cada inspección). Es necesario para que el versionado sirva de algo.
2. **Los Excel de herramientas están armados a mano por código, con celdas fijas.** Cada generador (`inspection-herra-equipos/excel-generator/*.service.ts`) reconoce la plantilla por código y escribe cada respuesta en una celda fija de un `.xlsx` precargado. También las pantallas especializadas (`herra-equipos/config/form-configs/`) están atadas al código. Una revisión nueva que agregue, quite o reordene preguntas **no se refleja en esos Excel ni en esas pantallas**: hay que ajustarlos a mano. Esto pasa también hoy al editar la plantilla; el versionado no lo empeora, pero lo vuelve más visible.
3. De paso: en `templates.controller.ts` (IRO), crear y editar plantillas **no tiene `@Roles`**, así que cualquier usuario autenticado puede hacerlo. Los endpoints nuevos de versionado irían con `@Roles(Role.ADMIN)`.
