"use client";

import { Box, Typography, Paper, Alert, Snackbar, Button } from "@mui/material";
import { Path } from "react-hook-form";
import {
  FormDataHerraEquipos,
  InspectionStatus,
  isAreaField,
  autofillEquipmentFields,
  verificationFieldPath,
} from "../../../types/IProps";
import { AlertSection } from "../../../common/AlertSection";
import { ColorCodeSection } from "../../../common/ColorCodeSection";
import { InspectorSignature } from "../../../common/InspectorSignature";
import { SupervisorSignature } from "../../../common/SupervisorSignature";
import { OutOfServiceSection } from "../../../common/OutOfServiceSection";
import { ObservationsSection } from "../../../common/ObservationsSection";
import { ApprovalSection } from "../../../common/ApprovalSection";
import { InspectionStatusChip } from "../../../common/InspectionStatusChip";
import { DynamicSectionSelector } from "../selectors/DynamicSectionSelector";
import { VerificationFields } from "../renderers/VerificationsFields";
import { SectionRenderer } from "../renderers/SectionRenderer";
import { EquipmentSelectionStep } from "../selectors/EquipmentSelectionStep";

// Reusable custom stepper components
import { FormBreadcrumbs } from "../../../common/FormBreadcrumbs";
import { FormStepperHeader } from "../../../common/FormStepperHeader";
import { Step5ReviewSection } from "../../../common/Step5ReviewSection";
import {
  useStandardInspectionForm,
  StandardInspectionFormProps,
} from "../../../application/hooks/useStandardInspectionForm";

export function StandardInspectionForm(props: StandardInspectionFormProps) {
  const {
    template,
    onSaveDraft,
    readonly = false,
    initialData,
    isViewMode = false,
    equipos,
    areas,
  } = props;

  const vm = useStandardInspectionForm(props);

  if (!vm.config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  const {
    config,
    currentViewMode,
    isApprovalReview,
    formSteps,
    activeStep,
    approvalDecision,
    selectedItems,
    validationError,
    setValidationError,
    hasSubmitErrors,
    setHasSubmitErrors,
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    isSubmitting,
    user,
    router,
    canApprove,
    handleSelectionChange,
    visibleSections,
    handleApprovalSubmit,
    handleLocalApprove,
    handleLocalReject,
    handleFormSubmit,
    handleInvalidSubmit,
    handleDraftSave,
    showSupervisorSignature,
    shouldShowApprovalSection,
    step1Fields,
    hasEquipmentSelection,
    handleNextStep,
    handlePrevStep,
    handleStepChange,
  } = vm;

  return (
    <>
      <FormBreadcrumbs formName={config.formName} />

      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        noValidate
      >
        {/* Page header — form identity + live status */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
              sx={{ mb: 0.5 }}
            >
              {config.formName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontFamily="monospace"
            >
              {config.formCode}
            </Typography>
          </Box>
          {initialData?.status && (
            <InspectionStatusChip status={initialData.status} size="medium" />
          )}
        </Box>

        {!currentViewMode && (
          <FormStepperHeader activeStep={activeStep} steps={formSteps} />
        )}

        {hasSubmitErrors && Object.keys(errors).length > 0 && (
          <Alert severity="error" onClose={() => setHasSubmitErrors(false)}>
            Hay campos con errores. Revise el formulario — los campos marcados
            en rojo requieren su atención.
          </Alert>
        )}

        {config.approval?.enabled && !isViewMode && !initialData && (
          <Alert severity="info">
            Esta inspección requiere aprobación de un supervisor antes de ser
            finalizada.
          </Alert>
        )}

        {/* STEP 1: HERRAMIENTA Y ÁREA */}
        {activeStep === 1 &&
          (hasEquipmentSelection ? (
            <EquipmentSelectionStep
              templateCode={template.code}
              templateName={template.name}
              equipos={equipos || []}
              areas={areas || []}
              onSelect={(area, code, equipo) => {
                autofillEquipmentFields(
                  setValue,
                  template.verificationFields,
                  area,
                  code,
                  equipo,
                );
                handleStepChange(2);
              }}
              onSkip={() => {
                // Clear fields first, then set default area from logged in user if available
                template.verificationFields.forEach((field) => {
                  setValue(
                    verificationFieldPath(
                      field.label,
                    ) as Path<FormDataHerraEquipos>,
                    "",
                  );
                });
                if (user?.area) {
                  const areaField = template.verificationFields.find((f) =>
                    isAreaField(f.label),
                  );
                  if (areaField) {
                    setValue(
                      verificationFieldPath(
                        areaField.label,
                      ) as Path<FormDataHerraEquipos>,
                      user.area,
                    );
                  }
                }
                handleStepChange(2);
              }}
            />
          ) : (
            <VerificationFields
              fields={step1Fields}
              control={control}
              errors={errors}
              readonly={readonly || isApprovalReview}
              setValue={setValue}
              isEditMode={!!initialData}
              templateCode={template.code}
            />
          ))}

        {/* STEP 2: DATOS GENERALES — siempre muestra TODOS los campos de verificación */}
        {activeStep === 2 && (
          <VerificationFields
            fields={template.verificationFields}
            control={control}
            errors={errors}
            readonly={readonly || isApprovalReview}
            setValue={setValue}
            isEditMode={!!initialData}
            templateCode={template.code}
          />
        )}

        {/* STEP 3: INSPECCIÓN / CUERPO */}
        {activeStep === 3 && (
          <>
            {config.alert && <AlertSection config={config.alert} />}

            {config.colorCode && (
              <ColorCodeSection
                config={config.colorCode}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            )}

            {config.sectionSelector?.enabled &&
              config.sectionSelector.items &&
              !readonly && (
                <Box>
                  {config.sectionSelector.items.map((itemConfig, idx) => (
                    <DynamicSectionSelector
                      key={idx}
                      sections={template.sections}
                      config={itemConfig}
                      selectedItems={selectedItems}
                      onSelectionChange={handleSelectionChange}
                      readonly={readonly}
                    />
                  ))}
                </Box>
              )}

            {visibleSections.length > 0 && (
              <Box>
                {visibleSections.map((section, idx) => {
                  const originalIndex = template.sections.findIndex(
                    (s) => s._id === section._id || s.title === section.title,
                  );

                  return (
                    <SectionRenderer
                      key={section._id || idx}
                      section={section}
                      sectionPath={`responses.section_${originalIndex}`}
                      control={control}
                      errors={errors}
                      formConfig={config}
                      readonly={readonly || isApprovalReview}
                    />
                  );
                })}
              </Box>
            )}
          </>
        )}

        {/* STEP 4: FIRMAS Y OBSERVACIONES */}
        {activeStep === 4 && (
          <>
            {config.outOfService?.enabled && (
              <Box>
                <OutOfServiceSection
                  config={config.outOfService}
                  register={register}
                  control={control}
                  errors={errors}
                  readonly={readonly}
                  section="header"
                  selectedRootItems={selectedItems["ROOT"]}
                />
              </Box>
            )}

            {config.outOfService?.enabled && (
              <Box>
                <OutOfServiceSection
                  config={config.outOfService}
                  register={register}
                  control={control}
                  errors={errors}
                  readonly={readonly}
                  section="footer"
                  selectedRootItems={selectedItems["ROOT"]}
                />
              </Box>
            )}

            {config.generalObservations?.enabled && (
              <ObservationsSection
                config={config.generalObservations}
                register={register}
                errors={errors}
              />
            )}

            {config.signatures?.inspector && (
              <InspectorSignature
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                config={config.signatures.inspector}
              />
            )}

            {showSupervisorSignature() && !isApprovalReview && (
              <SupervisorSignature
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                config={config.signatures?.supervisor}
              />
            )}

            {shouldShowApprovalSection() && !isApprovalReview && (
              <ApprovalSection
                status={
                  initialData!.status || InspectionStatus.PENDING_APPROVAL
                }
                approval={initialData!.approval}
                canApprove={canApprove()}
                onApprove={handleLocalApprove}
                onReject={handleLocalReject}
                readonly={
                  initialData!.status === InspectionStatus.APPROVED ||
                  initialData!.status === InspectionStatus.REJECTED
                }
              />
            )}
          </>
        )}

        {/* STEP 5: VISTA PREVIA Y PDF */}
        {activeStep === 5 && (
          <Step5ReviewSection
            template={template}
            formData={watch()}
            onPrev={handlePrevStep}
            onFinalSubmit={
              isApprovalReview
                ? handleNextStep
                : handleSubmit(handleFormSubmit, handleInvalidSubmit)
            }
            isSubmitting={isSubmitting}
            inspectionId={initialData?._id}
            formType="standard"
            isApprovalReview={isApprovalReview}
            showApprovalInputs={false}
            isViewMode={currentViewMode}
          />
        )}

        {/* STEP 6: APROBACIÓN */}
        {activeStep === 6 && (
          <Step5ReviewSection
            template={template}
            formData={watch()}
            onPrev={handlePrevStep}
            onFinalSubmit={handleApprovalSubmit}
            isSubmitting={isSubmitting}
            inspectionId={initialData?._id}
            formType="standard"
            isApprovalReview={isApprovalReview}
            showApprovalInputs={true}
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
            onApprove={handleLocalApprove}
            onReject={handleLocalReject}
            isSubmitDisabled={!approvalDecision.status}
          />
        )}

        {/* STEPPER STEP NAVIGATION BUTTONS (STEPS 1-4) */}
        {activeStep < 5 && (
          <Box
            className="save-submit-buttons"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {activeStep === 1 ? (
              <Button
                variant="outlined"
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (window as any).bypassBeforeUnload = true;
                  router.push("/dashboard/form-herra-equipos");
                }}
              >
                Cancelar
              </Button>
            ) : (
              <Button variant="outlined" onClick={handlePrevStep}>
                Anterior
              </Button>
            )}

            <Box sx={{ display: "flex", gap: 1.5 }}>
              {config.allowDraft !== false && onSaveDraft && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleSubmit(handleDraftSave)}
                  disabled={isSubmitting}
                >
                  Guardar Borrador
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNextStep}
                disabled={isSubmitting}
                sx={{
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  },
                }}
              >
                Siguiente Sección
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        open={!!validationError}
        autoHideDuration={6000}
        onClose={() => setValidationError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          onClose={() => setValidationError(null)}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {validationError}
        </Alert>
      </Snackbar>
    </>
  );
}
