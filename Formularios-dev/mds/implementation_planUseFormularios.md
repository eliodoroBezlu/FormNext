# Refactorización: Lado de Uso del Formulario (Form Consumer)

## Contexto

La refactorización anterior cubrió el **lado de construcción** del módulo (`QuestionBuilder`, `SectionBuilder`, `ImageManager`, `QuestionEditor`). Ahora refactorizamos el **lado de uso** — los componentes que el usuario final ve cuando llena, gestiona y aprueba inspecciones.

El módulo actualmente tiene **~25 archivos en la raíz** de `herra_equipos/`. Muchos son monolíticos, repiten lógica, y mezclan capas. El objetivo es aplicar la misma arquitectura Clean Architecture + FSD.

---

## Diagnóstico por Archivo

| Archivo | Líneas | Problema Principal |
|---|---|---|
| `GestionInspecciones.tsx` | 674 | God component: filtros + tabla + modal + notificaciones todo en uno |
| `PendingApprovalsList.tsx` | ~832 | Lógica de aprobación + UI mezcladas, sin hook dedicado |
| `InProgressInspectionsList.tsx` | ~647 | Duplica patrón de `GestionInspecciones` |
| `QuestionRenderer.tsx` | 592 | Muchos `switch/case` inline, opciones hardcodeadas repetidas |
| `VehicleInspectionForm.tsx` | ~742 | Formulario especializado monolítico |
| `ScaffoldInspectionForm.tsx` | ~630 | Formulario especializado monolítico |
| `StandardInspectionForm.tsx` | ~515 | Formulario generalizado monolítico |
| `GroupedAccessoriesForm.tsx` | ~385 | Formulario especializado |
| `FormHerraEquipos.tsx` | 517 | Dashboard principal, pero bien estructurado — **solo limpieza** |
| `EditarInspeccionPage.tsx` | ~348 | Bueno — **solo limpieza** |
| `FormRenderer.tsx` | 190 | Bien estructurado — **solo limpieza** |
| `VerificationsFields.tsx` | ~245 | Bien — **solo limpieza** |
| `SectionRenderer.tsx` | ~320 | Bien — **solo limpieza** |
| `UnifiedFormRouter.tsx` | 82 | Perfecto, no tocar |
| `alertMessages.ts` | ~89 | Constantes dispersas |
| `formConfig.ts` | ~618 | Archivo config monolítico, ya movido a `config/` |

> **Los archivos de `common/` y `config/` están bien organizados. No se modifican.**

---

## User Review Required

> [!IMPORTANT]
> Los **Form Especializados** (`VehicleInspectionForm`, `ScaffoldInspectionForm`, `StandardInspectionForm`, `GroupedAccessoriesForm`) tienen lógica de negocio compleja. La refactorización los descompondrá pero **sin cambiar la lógica**. Si algún flujo está en revisión activa, confirma antes de aprobar.

> [!WARNING]
> `GestionInspecciones.tsx` usa `confirm()` nativo del browser para confirmar eliminación. Se reemplazará por un `Dialog` de MUI consistente con el resto del sistema. Si prefieres mantener el `confirm()` por simplicidad, indícalo.

---

## Open Questions

> [!NOTE]
> **¿`formConfig.ts` en la raíz ya está obsoleto?** La carpeta `config/form-configs/` parece ser el lugar correcto. Si `formConfig.ts` sigue siendo importado, lo moveremos/eliminaremos en este plan.

> [!NOTE]
> **¿`TemplateBuilder.tsx` (15KB) es diferente al `FormBuilder` en `QuestionBuilder.tsx`?** Parecen solaparse. ¿Se debería consolidar o mantener por separado?

---

## Proposed Changes

### 1. Capa de Aplicación — Nuevos Hooks

Centralizar lógica de negocio que hoy vive dentro de los componentes.

---

#### [NEW] `useInspections.ts`
**Ruta:** `application/hooks/useInspections.ts`

Extraído de `GestionInspecciones.tsx` y `InProgressInspectionsList.tsx`:
- `loadInspections(filters?)` — carga y filtra inspecciones
- `deleteInspection(id)` — elimina con confirmación
- `duplicateInspection(id)` — duplica y redirige
- Manejo de estado: `loading`, `error`, `inspections`

---

#### [NEW] `useApprovals.ts`
**Ruta:** `application/hooks/useApprovals.ts`

Extraído de `PendingApprovalsList.tsx`:
- `loadPendingApprovals(username)`
- `approveInspection(id, data)`
- `rejectInspection(id, reason)`
- Estado: `loading`, `approvals`, `selectedApproval`

---

#### [NEW] `useInspectionForm.ts`
**Ruta:** `application/hooks/useInspectionForm.ts`

Extraído de `StandardInspectionForm`, `ScaffoldInspectionForm`, etc.:
- `initializeForm(template, initialData?)`
- `saveDraft(data)`
- `submitForm(data)`
- Maneja: `useForm`, `reset()`, mensajes de éxito/error

---

### 2. Presentation — Componentes de Gestión (Admin/List Views)

Descomponer `GestionInspecciones.tsx` (674 líneas → ~150 líneas).

---

#### [NEW] `presentation/components/management/InspectionFilters.tsx`
Panel de filtros de búsqueda. Props: `filters`, `onChange`, `onSearch`, `onClear`.

#### [NEW] `presentation/components/management/InspectionTable.tsx`
Tabla paginada de inspecciones. Props: `inspections`, `onView`, `onEdit`, `onDuplicate`, `onDelete`.

#### [NEW] `presentation/components/management/InspectionDetailModal.tsx`
Dialog de vista detallada de una inspección.

#### [MODIFY] `GestionInspecciones.tsx`
Reducir a orquestador usando hook `useInspections` + los 3 nuevos componentes.
**Objetivo: ~120 líneas.**

---

### 3. Presentation — Componentes de Aprobación

Descomponer `PendingApprovalsList.tsx` (~832 líneas → ~120 líneas).

---

#### [NEW] `presentation/components/approval/ApprovalCard.tsx`
Card individual de una inspección pendiente. Muestra datos clave + botones Aprobar/Rechazar.

#### [NEW] `presentation/components/approval/ApprovalDialog.tsx`
Dialog de confirmación de aprobación con campos adicionales (comentarios, firma).

#### [MODIFY] `PendingApprovalsList.tsx`
Reducir a orquestador con `useApprovals` + componentes nuevos.
**Objetivo: ~100 líneas.**

---

### 4. Presentation — Renderer de Preguntas (Limpieza)

#### [MODIFY] `QuestionRenderer.tsx`
Mover las opciones predeterminadas hardcodeadas al dominio y simplificar el `switch/case` con un mapa de componentes.

Antes:
```tsx
// Opciones hardcodeadas dentro del switch
case "si_no_na":
  displayOptions = [{ value: "si", label: "Sí" }, ...]
```

Después:
```tsx
// Opciones vienen del dominio
import { DEFAULT_OPTIONS_MAP } from "../domain/models/Question"
```

---

### 5. Domain — Constantes de Dominio Centralizadas

#### [MODIFY] `domain/models/Question.ts`
Agregar las constantes de opciones predeterminadas que hoy están duplicadas en `QuestionRenderer.tsx` y `QuestionEditor.tsx`:

```ts
export const DEFAULT_OPTIONS_MAP: Record<ResponseType, ResponseOption[]> = {
  si_no_na: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }, ...],
  bien_mal: [...],
  ...
}
```

---

### 6. Limpieza de Archivos Raíz

Los siguientes archivos quedan como **thin wrappers** (solo importan de presentation/):

| Archivo | Acción |
|---|---|
| `FormHerraEquipos.tsx` | Limpiar console.logs, extraer `TabPanel` a `presentation/` |
| `FormRenderer.tsx` | Limpiar console.logs de debug |
| `EditarInspeccionPage.tsx` | Limpiar console.logs |
| `SectionRenderer.tsx` | Mover a `presentation/components/renderers/` |
| `VerificationsFields.tsx` | Mover a `presentation/components/renderers/` |
| `QuestionRenderer.tsx` | Mover a `presentation/components/renderers/` |
| `alertMessages.ts` | Mover constantes al dominio |
| `formConfig.ts` | Verificar si está obsoleto vs. `config/` |

---

### 7. Estructura Final Esperada

```
herra_equipos/
├── domain/
│   ├── models/
│   │   ├── BuilderTypes.ts      ✅ ya limpio
│   │   ├── Inspection.ts        ✅ bien
│   │   ├── Question.ts          → + DEFAULT_OPTIONS_MAP
│   │   └── ...
│   └── schemas/
│       └── builderSchemas.ts    ✅ ya limpio
│
├── application/
│   └── hooks/
│       ├── useImageUpload.ts    ✅ ya existe
│       ├── useInspections.ts    → NUEVO
│       ├── useApprovals.ts      → NUEVO
│       └── useInspectionForm.ts → NUEVO
│
├── infrastructure/
│   └── (sin cambios por ahora)
│
├── presentation/
│   └── components/
│       ├── builders/            ✅ ya refactorizado
│       │   ├── ImageManager.tsx
│       │   ├── QuestionEditor.tsx
│       │   └── SectionBuilder.tsx
│       ├── renderers/           → NUEVO directorio
│       │   ├── QuestionRenderer.tsx
│       │   ├── SectionRenderer.tsx
│       │   └── VerificationsFields.tsx
│       ├── management/          → NUEVO directorio
│       │   ├── InspectionFilters.tsx
│       │   ├── InspectionTable.tsx
│       │   └── InspectionDetailModal.tsx
│       └── approval/            → NUEVO directorio
│           ├── ApprovalCard.tsx
│           └── ApprovalDialog.tsx
│
├── config/                      ✅ ya estructurado
├── common/                      ✅ ya estructurado
├── types/
│   └── IProps.ts                ✅ re-export limpio
│
└── [archivos raíz: thin wrappers]
    ├── QuestionBuilder.tsx      ✅ ya refactorizado
    ├── FormHerraEquipos.tsx     → solo limpieza
    ├── GestionInspecciones.tsx  → orquestador
    ├── PendingApprovalsList.tsx → orquestador
    ├── UnifiedFormRouter.tsx    ✅ perfecto
    └── ...
```

---

## Verification Plan

### Automated Tests
```bash
npx tsc --noEmit  # Sin errores de TypeScript
```

### Manual Verification
1. Navegar a `/dashboard/form-herra-equipos` — templates cargan correctamente
2. Abrir una inspección, llenar campos, guardar borrador → verifica persistencia
3. Completar y enviar inspección → verifica cambio de estado
4. Como supervisor: revisar lista de pendientes y aprobar una inspección
5. Ir a Gestión de Inspecciones, usar filtros y verificar paginación
6. Duplicar una inspección existente

### Prioridad de ejecución
Las fases se ejecutan en este orden para garantizar que cada capa dependa de la anterior:

1. **Fase A** — Domain: centralizar `DEFAULT_OPTIONS_MAP`
2. **Fase B** — Application hooks: `useInspections`, `useApprovals`, `useInspectionForm`
3. **Fase C** — Presentation renderers: mover a `presentation/components/renderers/`
4. **Fase D** — Presentation management: descomponer `GestionInspecciones`
5. **Fase E** — Presentation approval: descomponer `PendingApprovalsList`
6. **Fase F** — Limpieza de archivos raíz
