"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Box, Typography, Paper, Grid, TextField,
  Checkbox, FormControlLabel, Alert,
} from "@mui/material";
import { FormDataHerraEquipos, FormTemplateHerraEquipos, InspectionStatus } from "./types/IProps";
import { getFormConfig } from "./config/form-config.helpers";
import { AlertSection } from "./common/AlertSection";
import { InspectorSignature } from "./common/InspectorSignature";
import { SupervisorSignature } from "./common/SupervisorSignature";
import { SaveSubmitButtons } from "./common/SaveSubmitButtons";
import { ObservationsSection } from "./common/ObservationsSection";
import { VerificationFields } from "./VerificationsFields";
import { ApprovalSection } from "./common/ApprovalSection";
import VehicleDamageSelector, { VehicleDamageSelectorRef } from "./VehicleDamageSelector";
import { useEffect, useRef, useState } from "react";
import { SectionRenderer } from "./SectionRenderer";
import { useUserRole } from "@/hooks/useUserRole";

interface VehicleInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
  isViewMode?: boolean;
}

export function VehicleInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
  initialData,
  isViewMode = false,
}: VehicleInspectionFormProps) {
  const config = getFormConfig(template.code);
  const { user, hasRole } = useUserRole();

  // ✅ Estado de decisión de aprobación (igual que StandardInspectionForm)
  const [approvalDecision, setApprovalDecision] = useState<{
    status: "approved" | "rejected" | null;
    comments: string;
  }>({ status: null, comments: "" });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormDataHerraEquipos>({
    defaultValues: initialData || {
      verification: {},
      responses: {},
      vehicle: {
        tipoInspeccion: undefined,
        certificacionMSC: undefined,
        damages: [],
        damageObservations: "",
        fechaProximaInspeccion: "",
        responsableProximaInspeccion: "",
        damageImageBase64: "",
      },
      inspectorSignature: {},
      supervisorSignature: {},
    },
  });

  const vehicleDamageRef = useRef<VehicleDamageSelectorRef>(null);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  // ✅ Misma lógica que StandardInspectionForm
  const canApprove = () => {
    if (!config.approval?.enabled) return false;
    if (!config.approval.requiredRoles) return false;

    const hasRequiredRole = config.approval.requiredRoles.some((role) =>
      hasRole(role as "admin" | "supervisor" | "tecnico" | "viewer" | "superintendente")
    );

    if (!hasRequiredRole) return false;

    if (!config.approval.allowSelfApproval) {
      return initialData?.submittedBy !== user?.email;
    }

    return true;
  };

  const shouldShowApprovalSection = () => {
    if (!config?.approval?.enabled) return false;
    if (!initialData) return false;

    const approvalStatuses = [
      InspectionStatus.PENDING_APPROVAL,
      InspectionStatus.APPROVED,
      InspectionStatus.REJECTED,
    ];

    return approvalStatuses.includes(initialData.status as InspectionStatus);
  };

  const showSupervisorSignature = () => {
    if (
      !config.signatures ||
      typeof config.signatures.supervisor !== "object" ||
      !config.signatures.supervisor.enabled
    ) {
      return false;
    }
    if (isViewMode) return true;
    if (!config.approval?.enabled) return true;

    if (initialData) {
      if (initialData.status === "approved") return true;
      if (initialData.status === "pending_approval" && canApprove()) return true;
    }
    return false;
  };

  // ✅ Interceptores locales de aprobación
  const handleLocalApprove = (comments?: string) => {
    setApprovalDecision({ status: "approved", comments: comments || "" });
  };

  const handleLocalReject = (reason: string) => {
    setApprovalDecision({ status: "rejected", comments: reason });
  };

  const handleFormSubmit = async (data: FormDataHerraEquipos) => {
    // Limpiar tempId de damages
    if (data.vehicle?.damages) {
      data.vehicle.damages = data.vehicle.damages.map((damage) => ({
        type: damage.type,
        x: damage.x,
        y: damage.y,
        timestamp: damage.timestamp,
      }));
    }

    // Generar imagen de daños
    if (vehicleDamageRef.current) {
      const damageImage = await vehicleDamageRef.current.generateBase64();
      if (data.vehicle) {
        data.vehicle.damageImageBase64 = damageImage || undefined;
      }
    }

    // ✅ Misma lógica de estado que StandardInspectionForm
    const isNewForm = !initialData || !initialData._id;
    const requiresApproval = config.approval?.enabled === true;

    if (requiresApproval && !isViewMode) {
      if (approvalDecision.status === "approved" && canApprove()) {
        data.status = InspectionStatus.APPROVED;
        data.approval = {
          ...data.approval,
          status: "approved",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          supervisorComments: approvalDecision.comments,
        };
      } else if (approvalDecision.status === "rejected" && canApprove()) {
        data.status = InspectionStatus.REJECTED;
        data.approval = {
          ...data.approval,
          status: "rejected",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          rejectionReason: approvalDecision.comments,
        };
      } else if (isNewForm) {
        data.status = InspectionStatus.PENDING_APPROVAL;
        data.requiresApproval = true;
        data.approval = { status: "pending" };
      } else {
        data.status = initialData?.status || InspectionStatus.COMPLETED;
        data.requiresApproval = initialData?.requiresApproval || false;
        data.approval = initialData?.approval;
      }
    } else {
      data.status = InspectionStatus.COMPLETED;
      data.requiresApproval = false;
    }

    onSubmit(data);
  };

  const handleSaveDraftWithImage = async (data: FormDataHerraEquipos) => {
    if (data.vehicle?.damages) {
      data.vehicle.damages = data.vehicle.damages.map((damage) => ({
        type: damage.type,
        x: damage.x,
        y: damage.y,
        timestamp: damage.timestamp,
      }));
    }

    if (vehicleDamageRef.current) {
      const damageImage = await vehicleDamageRef.current.generateBase64();
      if (damageImage && data.vehicle) {
        data.vehicle.damageImageBase64 = damageImage;
      }
    }

    if (onSaveDraft) {
      onSaveDraft(data);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {/* Header */}
      <Box>
        <Typography variant="h4" gutterBottom>{config.formName}</Typography>
        <Typography variant="body2" color="text.secondary">Código: {config.formCode}</Typography>
      </Box>

      {/* Info aprobación para formularios nuevos */}
      {config.approval?.enabled && !isViewMode && !initialData && (
        <Alert severity="info">
          Esta inspección requiere aprobación de un supervisor antes de ser finalizada.
        </Alert>
      )}

      {config.alert && <AlertSection config={config.alert} />}

      <VerificationFields
        fields={template.verificationFields}
        control={control}
        errors={errors}
        readonly={readonly}
        setValue={setValue}
        isEditMode={!!initialData}
      />

      {/* Tipo de Inspección y Certificación MSC */}
      {config.vehicle?.hasDamageSelector && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, border: "2px solid #1976d2", backgroundColor: "#f8f9fa" }}>
          <Grid container spacing={3}>
            {/* TIPO DE INSPECCIÓN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  📋 INSPECCIÓN:
                </Typography>
                <Controller
                  name="vehicle.tipoInspeccion"
                  control={control}
                  rules={{ required: "Debe seleccionar un tipo de inspección" }}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {["inicial", "periodica"].map((tipo) => (
                        <FormControlLabel
                          key={tipo}
                          control={
                            <Checkbox
                              checked={field.value === tipo}
                              onChange={() => field.onChange(tipo)}
                              disabled={readonly}
                              sx={{ "&.Mui-checked": { color: "#1976d2" } }}
                            />
                          }
                          label={
                            <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                              {tipo === "inicial" ? "INICIAL" : "PERIÓDICA"}
                            </Typography>
                          }
                          sx={{
                            border: field.value === tipo ? "3px solid #1976d2" : "2px solid #000",
                            p: 1.5, m: 0, flex: 1,
                            backgroundColor: field.value === tipo ? "#e3f2fd" : "#fff",
                            transition: "all 0.3s ease",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                />
                {errors?.vehicle?.tipoInspeccion && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                    {errors.vehicle.tipoInspeccion.message}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* CERTIFICACIÓN MSC */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  ✅ CERTIFICACIÓN MSC:
                </Typography>
                <Controller
                  name="vehicle.certificacionMSC"
                  control={control}
                  rules={{ required: "Debe seleccionar una opción" }}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {[
                        { value: "si", label: "SI", color: "#4caf50", bg: "#e8f5e9" },
                        { value: "no", label: "NO", color: "#f44336", bg: "#ffebee" },
                      ].map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          control={
                            <Checkbox
                              checked={field.value === opt.value}
                              onChange={() => field.onChange(opt.value)}
                              disabled={readonly}
                              sx={{ "&.Mui-checked": { color: opt.color } }}
                            />
                          }
                          label={<Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>{opt.label}</Typography>}
                          sx={{
                            border: field.value === opt.value ? `3px solid ${opt.color}` : "2px solid #000",
                            p: 1.5, m: 0, flex: 1,
                            backgroundColor: field.value === opt.value ? opt.bg : "#fff",
                            transition: "all 0.3s ease",
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                />
                {errors?.vehicle?.certificacionMSC && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                    {errors.vehicle.certificacionMSC.message}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Secciones */}
      {template.sections && template.sections.length > 0 && (
        <Box>
          {template.sections.map((section, idx) => (
            <SectionRenderer
              key={section._id || idx}
              section={section}
              sectionPath={`responses.section_${idx}`}
              control={control}
              errors={errors}
              formConfig={config}
              readonly={readonly}
            />
          ))}
        </Box>
      )}

      {/* Selector de daños */}
      {config.vehicle?.hasDamageSelector && (
        <VehicleDamageSelector<FormDataHerraEquipos>
          ref={vehicleDamageRef}
          vehicleImageUrl="/image.png"
          control={control}
          setValue={setValue}
          damageFieldName="vehicle.damages"
          observationsFieldName="vehicle.damageObservations"
          readonly={readonly}
          initialDamages={initialData?.vehicle?.damages}
          initialImage={initialData?.vehicle?.damageImageBase64}
        />
      )}

      {/* Próxima Inspección */}
      {config.vehicle?.hasNextInspectionDate && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, border: "2px solid #757575", backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#424242", mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            📅 Programación de Próxima Inspección
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ backgroundColor: "#e0e0e0", border: "2px solid #000", borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "1rem", mb: 2, textAlign: "center", color: "#000" }}>
                  FECHA PROXIMA INSPECCIÓN
                </Typography>
                <Controller
                  name="vehicle.fechaProximaInspeccion"
                  control={control}
                  rules={{ required: "La fecha de próxima inspección es obligatoria" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field} fullWidth type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={readonly}
                      sx={{
                        "& .MuiOutlinedInput-root": { backgroundColor: "#fff", "& fieldset": { borderColor: "#000", borderWidth: 2 } },
                        "& input": { fontWeight: "bold", fontSize: "1rem", textAlign: "center", color: "#000" },
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ backgroundColor: "#e0e0e0", border: "2px solid #000", borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "1rem", mb: 2, textAlign: "center", color: "#000" }}>
                  RESPONSABLE DE PROX. INSP.
                </Typography>
                <Controller
                  name="vehicle.responsableProximaInspeccion"
                  control={control}
                  rules={{ required: "El responsable de próxima inspección es obligatorio" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field} fullWidth
                      placeholder="Ingrese nombre del responsable"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={readonly}
                      sx={{
                        "& .MuiOutlinedInput-root": { backgroundColor: "#fff", "& fieldset": { borderColor: "#000", borderWidth: 2 } },
                        "& input": { fontWeight: "bold", fontSize: "1rem", color: "#000" },
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>ℹ️ Información:</strong> Estos datos se utilizan para programar la siguiente inspección del vehículo.
            </Typography>
          </Alert>
        </Paper>
      )}

      {/* Conclusión */}
      {config.conclusion?.enabled && (
        <ObservationsSection config={config.conclusion} register={register} errors={errors} />
      )}

      {/* Firma Inspector */}
      {config.signatures?.inspector && (
        <InspectorSignature
          register={register} control={control}
          errors={errors} setValue={setValue}
          config={config.signatures.inspector}
        />
      )}

      {/* ✅ Firma Supervisor — condicional según estado de aprobación */}
      {showSupervisorSignature() && (
        <SupervisorSignature
          register={register} control={control}
          errors={errors} setValue={setValue}
          config={config.signatures?.supervisor}
        />
      )}

      {/* ✅ Sección de Aprobación */}
      {shouldShowApprovalSection() && (
        <ApprovalSection
          status={initialData!.status || InspectionStatus.PENDING_APPROVAL}
          approval={initialData!.approval}
          canApprove={canApprove()}
          onApprove={handleLocalApprove}
          onReject={handleLocalReject}
          readonly={
            readonly ||
            initialData!.status === InspectionStatus.APPROVED ||
            initialData!.status === InspectionStatus.REJECTED
          }
        />
      )}

      {/* Botones */}
      {!isViewMode && (
        <SaveSubmitButtons
          onSaveDraft={onSaveDraft ? () => handleSubmit(handleSaveDraftWithImage)() : undefined}
          onSubmit={handleSubmit(handleFormSubmit)}
          isSubmitting={isSubmitting}
          allowDraft={config.allowDraft ?? true}
        />
      )}
    </Box>
  );
}