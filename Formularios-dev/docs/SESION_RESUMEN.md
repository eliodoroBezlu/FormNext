# Resumen de Sesión — herra_equipos Form System

**Fecha:** 2026-05-12  
**Módulo:** `src/components/herra_equipos/` + rutas `dashboard/form-herra-equipos/`

---

## 1. Contexto inicial — ¿qué estaba fallando?

Al inicio de la sesión el sistema de formularios de herramientas y equipos tenía los siguientes problemas acumulados:

| # | Síntoma | Severidad |
|---|---------|-----------|
| 1 | El formulario se podía enviar sin responder preguntas obligatorias | Alta |
| 2 | `useWatch` en `SectionRenderer` causaba re-renders en cascada | Media |
| 3 | El scroll al primer error no funcionaba (especialmente en preguntas tipo toggle) | Alta |
| 4 | En modo aprobación pendiente, el botón "Aprobar/Rechazar" estaba congelado y no se podía presionar desde el inicio | Alta |
| 5 | Tras confirmar un rechazo, los checkboxes de acción desaparecían quedando la UI vacía | Media |
| 6 | El botón de envío no cambiaba de nombre según la acción de aprobación seleccionada | Baja |
| 7 | "Guardar Borrador" aparecía en modo aprobación cuando no debería | Baja |
| 8 | Los campos de verificación del template builder no tenían configuración de "Obligatorio" | Media |

---

## 2. Análisis de causas raíz

### 2.1 Validación que no bloqueaba el envío — `QuestionRenderer.tsx`

**Causa:** Había **3 `Controller` separados con el mismo `name`** por cada pregunta (uno para `value`, otro para `description`, otro para `observacion`). React Hook Form solo registra el último, por lo que el `validate` del primero (que contenía la regla obligatoria) era sobreescrito por el último (que no tenía `validate`).

**Antes:**
```tsx
<Controller name={path} rules={{ validate: buildValidate() }} ... />
<Controller name={path} rules={{ required: descRequired ? ... : false }} ... />
<Controller name={path} rules={{}} ... />  // ← este ganaba
```

**Después:** Un único `Controller` por pregunta. `buildValidate(type)` cubre `value + description + observacion` en una sola función de validación.

---

### 2.2 `useWatch` en `SectionRenderer` — re-renders innecesarios

**Causa:** `useWatch` suscribía el componente a todos los cambios de cualquier campo dentro de la sección para calcular un contador de progreso. Cada pulsación de tecla re-renderizaba todo el árbol de secciones.

**Fix:** Se eliminó completamente `useWatch`, la importación y el bloque de cálculo de progreso. El chip de errores sigue funcionando porque lee del objeto `errors` que ya llega como prop (no provoca re-renders adicionales).

---

### 2.3 Scroll al primer error no funcionaba

**Causas:**
- `querySelector('[aria-invalid="true"]')` no encontraba nada en preguntas tipo `si_no_na` (toggle buttons), porque MUI `ToggleButton` no propaga `aria-invalid` al elemento DOM.
- El `setTimeout(50ms)` era insuficiente — el DOM no estaba actualizado cuando se ejecutaba la búsqueda.

**Fixes:**
1. Se añadió `data-question-error={error ? "true" : undefined}` en el `Paper` raíz de cada pregunta en `QuestionRenderer`.
2. Se cambió el selector a `'[data-question-error="true"], [aria-invalid="true"]'` — captura cualquier tipo.
3. Se reemplazó `setTimeout(50)` por **doble `requestAnimationFrame`**: el primer frame confirma el commit de React, el segundo confirma el paint del DOM.

```tsx
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const firstInvalid = document.querySelector<HTMLElement>(
      '[data-question-error="true"], [aria-invalid="true"]',
    );
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
```

---

### 2.4 Botón de aprobación congelado desde el inicio

Esta fue la causa más compleja, con dos capas:

**Capa 1 — `type="submit"` implícito:**  
Los `<Button>` de MUI dentro de `<Box component="form">` sin `type="button"` explícito se comportan como `type="submit"` por HTML nativo. Al hacer clic disparaban simultáneamente el `onClick` **y** el `onSubmit` del formulario. El `onSubmit` corría la validación RHF sobre los campos del inspector (que estaban bloqueados/vacíos en modo aprobación) y bloqueaba todo.

**Fix:** Añadir `type="button"` a **todos** los botones en `SaveSubmitButtons.tsx`.

**Capa 2 — CSS `pointerEvents: none` sin override efectivo:**  
En `[code]/[inspectionId]/page.tsx`, cuando `isPendingApproval === true`, se aplicaba CSS global:
```css
"& .MuiButton-root": { pointerEvents: "none", opacity: 0.45 }
```
Y se intentaba re-habilitar zonas específicas por clase:
```css
"& .save-submit-buttons .MuiButton-root": { pointerEvents: "auto", opacity: 1 }
```
Pero el wrapper `StickyBar` en `SaveSubmitButtons.tsx` **nunca tenía** `className="save-submit-buttons"`, así que el override nunca tomaba efecto.

**Fix:** Añadir `className="save-submit-buttons"` al `Box` de `StickyBar`.

> Las otras dos zonas (`supervisor-signature-section` y `approval-section-container`) ya tenían sus clases correctamente aplicadas.

---

### 2.5 Checkboxes de rechazo desaparecían tras confirmar

**Causa:** En `ApprovalSection.tsx`, `handleConfirmReject` hacía `setActionSelection("none")` después de confirmar, lo que visualmente desmarcaba el checkbox y ocultaba la confirmación.

**Fix:** Cambiar a `setActionSelection("reject")` para mantener el checkbox marcado como confirmación visual de que la acción fue ejecutada.

---

## 3. Patrón `isApprovalReview` — bypass de validación para supervisores

Se introdujo un patrón consistente en los 3 formularios que tienen flujo de aprobación:

```tsx
// true cuando un supervisor revisa una inspección pending_approval
const isApprovalReview =
  !isViewMode &&
  initialData?.status === InspectionStatus.PENDING_APPROVAL &&
  canApprove();

// Bypass de validación RHF — los datos del inspector ya fueron validados al enviar
const handleApprovalSubmit = () => {
  handleFormSubmit(getValues());
};
```

- **Los campos de inspector** reciben `readonly={readonly || isApprovalReview}` → bloqueados para el supervisor.
- **El botón** usa `isApprovalReview ? handleApprovalSubmit : handleSubmit(handleFormSubmit, handleInvalidSubmit)` → el supervisor nunca pasa por validación RHF.
- **El botón se deshabilita** cuando `approvalAction === null` (ninguna acción seleccionada), gestionado en `SaveSubmitButtons` con `disabled={isSubmitting || noActionSelected}`.

---

## 4. Mejoras de UX aplicadas

### Modo `onTouched` en React Hook Form
Todos los formularios usan ahora `mode: "onTouched"` en lugar del modo por defecto. Los errores solo se muestran después de que el usuario toca y abandona un campo, evitando errores prematuros.

### Alerta de errores al enviar
Cuando la validación falla al intentar enviar, aparece un `<Alert severity="error">` en la parte superior del formulario además del scroll automático.

### Guard `beforeunload`
Los 4 formularios tienen un `useEffect` que registra el evento `beforeunload` cuando hay cambios sin guardar (`isDirty`), avisando al usuario antes de salir de la página:
```tsx
useEffect(() => {
  if (!isDirty || readonly) return;
  const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [isDirty, readonly]);
```

### `SaveSubmitButtons` — comportamiento contextual
El componente adapta su contenido según el estado:

| Caso | Botones mostrados |
|------|-------------------|
| Formulario nuevo / edición normal | Guardar Borrador + Enviar Inspección |
| Andamio inicial | Guardar Borrador + Guardar y Continuar + Enviar y Finalizar |
| Andamio en progreso | Guardar Progreso + Finalizar Inspección |
| Modo aprobación (sin acción) | "Seleccione una acción" (deshabilitado) |
| Modo aprobación (aprobar) | "Aprobar Inspección" (verde) |
| Modo aprobación (rechazar) | "Rechazar Inspección" (rojo) |

---

## 5. Campos de verificación obligatorios — `QuestionBuilder.tsx`

### Estado anterior
El tipo `VerificationField` ya tenía `obligatorio?: boolean` y `VerificationFields.tsx` ya lo leía para validación, pero el template builder **no tenía UI** para configurarlo. Era imposible marcarlo desde la interfaz.

### Fix
Se añadió un `Checkbox` + `FormControlLabel` ("Obligatorio") en la fila de cada campo de verificación, usando el mismo patrón visual que `QuestionEditor.tsx`:

```
| Etiqueta (4) | Tipo (3) | ☐ Obligatorio (2) | [Origen datos (2)] | 🗑 |
```

Con esto el flujo completo queda cerrado:
1. **Template builder** → el usuario marca `☐ Obligatorio` en un campo de verificación.
2. El dato se guarda en el template como `obligatorio: true`.
3. **Formulario de llenado** → `VerificationFields.tsx` lee `field.obligatorio` y aplica `rules={{ required: "Este campo es obligatorio" }}` + asterisco visual automáticamente.

---

## 6. Limpieza de código

| Archivo | Qué se eliminó |
|---------|----------------|
| `QuestionBuilder.tsx` | 2× `console.log` en `handleSave`, `console.error` en submit handler, destructuring redundante `const { ...data } = template` |
| `[inspectionId]/page.tsx` | 3× `console.log`/`console.error` en `handleFinalSubmit`, if/else reemplazado por ternario |
| `page.tsx` (listado) | Prop `onApprovalChange` comentada sin uso |
| `SectionRenderer.tsx` | `useWatch`, importaciones muertas (`QuestionResponse`, `FieldPath`), chip de progreso |

---

## 7. Archivos modificados en esta sesión

```
src/
├── components/herra_equipos/
│   ├── QuestionBuilder.tsx                          ← obligatorio UI + console.log cleanup
│   ├── common/
│   │   ├── SaveSubmitButtons.tsx                    ← className, type="button", approvalAction, noActionSelected
│   │   └── ApprovalSection.tsx                      ← handleConfirmReject mantiene "reject"
│   └── presentation/components/
│       ├── renderers/
│       │   ├── QuestionRenderer.tsx                 ← 1 Controller, buildValidate, data-question-error
│       │   └── SectionRenderer.tsx                  ← eliminado useWatch
│       └── forms/
│           ├── StandardInspectionForm.tsx            ← isApprovalReview, handleInvalidSubmit, beforeunload
│           ├── VehicleInspectionForm.tsx             ← ídem
│           ├── ScaffoldInspectionForm.tsx            ← ídem + fieldsReadonly guard
│           └── GroupedAccessoriesForm.tsx            ← handleInvalidSubmit, beforeunload
└── app/dashboard/form-herra-equipos/
    ├── page.tsx                                     ← comentario muerto eliminado
    └── [code]/[inspectionId]/page.tsx               ← console.logs, ternario, clase save-submit-buttons
```

---

## 8. Principios / buenas prácticas aplicados

1. **Un solo `Controller` por nombre de campo** — RHF solo registra el último; múltiples con el mismo `name` es un bug silencioso.
2. **`type="button"` explícito** — Dentro de `<form>` o `<Box component="form">`, todo botón que no sea el submit principal debe tener `type="button"`.
3. **No usar `setTimeout` para esperar el DOM** — Usar `requestAnimationFrame` doble para garantizar que React haya commiteado y el browser haya pintado.
4. **Clases semánticas para overrides CSS** — Si se aplica CSS contextual desde un ancestro, los hijos deben tener `className` explícito para que los overrides sean predecibles.
5. **Separar validación de inspector vs. supervisor** — El supervisor nunca debe re-validar datos ya enviados por el inspector. El bypass `isApprovalReview → getValues()` es el patrón correcto.
6. **`mode: "onTouched"`** — Mejor UX que el modo por defecto; los errores aparecen solo cuando el usuario interactuó con el campo.
7. **Sin `console.log` en producción** — Todo `console.log` de debug debe eliminarse antes de mergear.
8. **Sincronización de datos en un solo lugar** — `obligatorio` en el template se lee directamente en el componente de llenado; no hay estado duplicado.
