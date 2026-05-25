# herra_equipos — Arquitectura, Patrones y Buenas Prácticas

Este documento describe la arquitectura del módulo `herra_equipos` y los patrones establecidos durante su desarrollo. Úsalo como contexto al iniciar nuevas sesiones para aplicar los mismos estándares a otros módulos.

---

## Arquitectura general del módulo

```
src/components/herra_equipos/
├── types/IProps.ts                  → re-exporta todo desde domain/models/
├── domain/
│   ├── models/                      → interfaces TypeScript (Template, Section, Question, etc.)
│   └── schemas/builderSchemas.ts    → esquemas Zod para validación del builder
├── config/
│   └── form-config.helpers.ts       → getFormConfig(code) → config por formulario
├── common/                          → componentes compartidos entre formularios
│   ├── SaveSubmitButtons.tsx
│   ├── ApprovalSection.tsx
│   ├── InspectionStatusChip.tsx
│   ├── AlertSection.tsx
│   ├── VerificationFields (→ renderers/)
│   └── ...firmas, observaciones, etc.
├── presentation/
│   └── components/
│       ├── forms/                   → formularios concretos (Standard, Vehicle, Scaffold, Grouped)
│       ├── renderers/               → SectionRenderer, QuestionRenderer, VerificationsFields
│       ├── builders/                → QuestionEditor, SectionBuilder (para el template builder)
│       ├── selectors/               → DynamicSectionSelector, VehicleDamageSelector
│       └── management/              → InProgressInspectionsList, etc.
├── application/
│   └── hooks/                       → useApprovals, etc.
├── QuestionBuilder.tsx              → TemplateManagementApp (CRUD de templates)
├── FormRenderer.tsx                 → FormFiller (formularios genéricos sin config especial)
└── UnifiedFormRouter.tsx            → enruta al formulario correcto según template.code
```

**Ruta de la app:**
```
/dashboard/form-herra-equipos/                    → listado de templates + tabs
/dashboard/form-herra-equipos/[code]/             → nueva inspección
/dashboard/form-herra-equipos/[code]/[id]/        → editar / aprobar inspección existente
```

---

## Cómo funciona el sistema de formularios

### 1. Templates → Formularios dinámicos

Cada formulario está basado en un **template** almacenado en backend (MongoDB). El template define:
- `verificationFields` — campos de cabecera (fecha, área, inspector, etc.)
- `sections[]` → `questions[]` — las preguntas con su tipo de respuesta

Al abrir un formulario, `UnifiedFormRouter` recibe el template y decide qué componente renderizar según `template.code`. Formularios con lógica especial (vehículos, andamios) tienen su propio componente; el resto usa `FormFiller` (genérico).

### 2. Config por formulario

`getFormConfig(code)` devuelve la configuración estática de cada formulario:
- `approval.enabled` / `approval.requiredRoles` — habilita flujo de aprobación
- `allowDraft` — muestra botón "Guardar Borrador"
- `signatures.inspector` / `signatures.supervisor` — configura firmas
- `sectionSelector` — selector dinámico de secciones
- `vehicle`, `scaffold`, `routineInspection`, etc. — secciones especiales

Si no hay config para un código, el formulario muestra error y no renderiza.

### 3. Estado de una inspección (máquina de estados)

```
DRAFT → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETED
                        ↘ REJECTED (→ vuelve a DRAFT para corrección)
```

El estado se calcula dentro de `handleFormSubmit` de cada formulario y se envía en `data.status`. El backend persiste el estado; el frontend lo usa para decidir qué UI mostrar.

---

## Patrones establecidos

### Patrón 1 — React Hook Form en formularios de inspección

```tsx
const {
  control, register, handleSubmit, getValues,
  setValue, watch, reset,
  formState: { errors, isSubmitting, isDirty },
} = useForm<FormDataHerraEquipos>({
  defaultValues: initialData,
  mode: "onTouched",   // ← errores solo después de que el usuario toca el campo
});
```

**Reglas:**
- Siempre `mode: "onTouched"` — mejor UX que el default.
- Siempre `noValidate` en el `<Box component="form">` — desactiva la validación nativa del browser.
- Un solo `Controller` por campo. Nunca dos `Controller` con el mismo `name` — el último sobreescribe al primero silenciosamente.

### Patrón 2 — Validación al enviar + scroll al primer error

Todos los formularios usan `handleSubmit(onValid, onInvalid)`:

```tsx
const handleInvalidSubmit = (_: FieldErrors<FormDataHerraEquipos>) => {
  setHasSubmitErrors(true);
  // Doble rAF: garantiza que React commiteó y el browser pintó antes de buscar en el DOM
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        '[data-question-error="true"], [aria-invalid="true"]',
      );
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = firstInvalid.querySelector<HTMLElement>(
          "input, textarea, button[aria-pressed]",
        );
        (focusable ?? firstInvalid).focus?.();
      }
    });
  });
};
```

El atributo `data-question-error="true"` se pone en el `Paper` raíz de cada pregunta en `QuestionRenderer` cuando hay error. Esto es necesario porque ciertos controles MUI (como `ToggleButtonGroup`) no propagan `aria-invalid` al DOM.

### Patrón 3 — Guard de cambios sin guardar

```tsx
useEffect(() => {
  if (!isDirty || readonly) return;
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [isDirty, readonly]);
```

### Patrón 4 — Flujo de aprobación (isApprovalReview)

Cuando un supervisor abre una inspección `pending_approval`, no debe re-validar los datos ya enviados por el inspector. Se usa este patrón:

```tsx
// 1. Detectar modo supervisor
const isApprovalReview =
  !isViewMode &&
  initialData?.status === InspectionStatus.PENDING_APPROVAL &&
  canApprove();

// 2. Bypass de validación RHF — usa getValues() directamente
const handleApprovalSubmit = () => {
  handleFormSubmit(getValues());
};

// 3. Campos del inspector: bloqueados para el supervisor
<VerificationFields readonly={readonly || isApprovalReview} ... />
<SectionRenderer readonly={readonly || isApprovalReview} ... />

// 4. Botón: usa el bypass si está en modo aprobación
<SaveSubmitButtons
  onSubmit={
    isApprovalReview
      ? handleApprovalSubmit
      : handleSubmit(handleFormSubmit, handleInvalidSubmit)
  }
  approvalAction={
    initialData?.status === InspectionStatus.PENDING_APPROVAL
      ? approvalDecision.status === "approved" ? "approve"
        : approvalDecision.status === "rejected" ? "reject"
        : null
      : undefined
  }
/>
```

La decisión de aprobación se almacena localmente en el formulario con `useState` y se aplica dentro de `handleFormSubmit` al construir el payload final.

### Patrón 5 — `SaveSubmitButtons` contextual

El componente adapta sus botones según props:

| `isScaffoldForm` | `isInProgress` | `isApprovalMode` | Resultado |
|:---:|:---:|:---:|---|
| false | — | false | Borrador + Enviar |
| false | — | true | Solo acción de aprobación |
| true | false | false | Borrador + Guardar y Continuar + Enviar |
| true | false | true | Solo acción de aprobación |
| true | true | — | Guardar Progreso + Finalizar |

**Regla crítica:** Todos los botones dentro de `<Box component="form">` deben tener `type="button"` explícito. Sin esto, el browser los trata como `type="submit"` y disparan la validación RHF al hacer clic.

**Clases CSS semánticas:** El `StickyBar` wrapper tiene `className="save-submit-buttons"`. El `Paper` de `ApprovalSection` tiene `className="approval-section-container"`. `SupervisorSignature` tiene `className="supervisor-signature-section"`. Estas clases permiten que el CSS contextual del padre (`[inspectionId]/page.tsx`) re-habilite zonas específicas cuando aplica `pointerEvents: none` global en modo lectura.

### Patrón 6 — Template builder: obligatorio en campos de verificación

La configuración `obligatorio: boolean` se define en el template builder y se consume en el formulario de llenado sin estado intermedio:

- **Builder** (`QuestionBuilder.tsx`): `Checkbox` + `FormControlLabel` en la fila de cada `verificationField`.
- **Llenado** (`VerificationFields.tsx`): lee `field.obligatorio` y aplica `rules={{ required: field.obligatorio ? "Este campo es obligatorio" : false }}` + `required={field.obligatorio}` en cada tipo de input.

El mismo principio aplica a las preguntas de sección: `question.obligatorio` se define en `QuestionEditor` y se valida en `QuestionRenderer`.

---

## Reglas para aplicar a otros módulos

1. **Un `Controller` por campo** — nunca registrar el mismo `name` dos veces.
2. **`type="button"` en todos los botones** dentro de formularios MUI.
3. **`mode: "onTouched"` + `noValidate`** en todos los `useForm`.
4. **Doble `requestAnimationFrame`** para cualquier lógica DOM post-render (scroll, focus, mediciones).
5. **No `setTimeout` para esperar el DOM** — es frágil y dependiente de la máquina.
6. **Clases CSS semánticas** cuando un ancestro necesita controlar la interactividad de zonas hijas. Nunca confiar en que el override va a funcionar sin el `className` correspondiente en el hijo.
7. **Separar validación por rol** — si una pantalla puede ser usada por perfiles distintos (inspector vs. supervisor), determinar qué validación aplica a cada uno y usar `getValues()` para bypassear cuando corresponda.
8. **Sin `console.log` en código productivo** — todo debug debe eliminarse antes de hacer merge.
9. **`beforeunload` guard** en cualquier formulario con estado editable.
10. **`obligatorio` en el modelo, no hardcodeado** — si un campo puede ser requerido o no según la configuración del template, ese flag debe viajar desde el modelo hasta el componente de llenado sin duplicar estado.

---

## Tecnologías del módulo

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 App Router, TypeScript |
| Formularios | React Hook Form (`Controller`, `useFieldArray`, `useForm`) |
| Validación de schemas | Zod + `@hookform/resolvers/zod` |
| UI | Material UI 7 (MUI) |
| Pickers | `@mui/x-date-pickers` (DatePicker, TimePicker) |
| Fechas | dayjs |
| Auth | JWT + Keycloak (via `useUserRole`, `hasRole`) |
| Backend | NestJS 11 + MongoDB (accedido vía Server Actions en `src/lib/actions/`) |
