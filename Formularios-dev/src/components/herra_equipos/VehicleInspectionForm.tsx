"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { FormDataHerraEquipos, FormTemplateHerraEquipos } from "./types/IProps";
import { getFormConfig } from "./config/form-config.helpers";
import { AlertSection } from "./common/AlertSection";
import { InspectorSignature } from "./common/InspectorSignature";
import { SupervisorSignature } from "./common/SupervisorSignature";
import { SaveSubmitButtons } from "./common/SaveSubmitButtons";
import { ObservationsSection } from "./common/ObservationsSection";
import { VerificationFields } from "./VerificationsFields";
import VehicleDamageSelector, {
  VehicleDamageSelectorRef,
} from "./VehicleDamageSelector";
import { useRef } from "react";
import { SectionRenderer } from "./SectionRenderer";

interface VehicleInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
}

export function VehicleInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
}: VehicleInspectionFormProps) {
  const config = getFormConfig(template.code);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormDataHerraEquipos>();

  const vehicleDamageRef = useRef<VehicleDamageSelectorRef>(null);

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  const handleFormSubmit = async (data: FormDataHerraEquipos) => {
    if (vehicleDamageRef.current) {
      const damageImage = await vehicleDamageRef.current.generateBase64();
      if (damageImage && data.vehicle) {
        data.vehicle.damageImageBase64 = damageImage;
      }
    }
    onSubmit(data);
  };

  const handleSaveDraftWithImage = async (data: FormDataHerraEquipos) => {
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
        <Typography variant="h4" gutterBottom>
          {config.formName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Código: {config.formCode}
        </Typography>
      </Box>

      {config.alert && <AlertSection config={config.alert} />}

      {/* Campos de Verificación */}
      <VerificationFields
        fields={template.verificationFields}
        control={control}
        errors={errors}
        readonly={readonly}
        setValue={setValue}
      />

      {/* Tipo de Inspección y Certificación MSC */}
      {config.vehicle?.hasDamageSelector && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            border: "2px solid #1976d2",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Grid container spacing={3}>
            {/* TIPO DE INSPECCIÓN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📋 INSPECCIÓN:
                </Typography>

                <Controller
                  name="vehicle.tipoInspeccion"
                  control={control}
                  rules={{
                    required: "Debe seleccionar un tipo de inspección",
                  }}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value === "inicial"}
                            onChange={() => field.onChange("inicial")}
                            disabled={readonly}
                            sx={{
                              "&.Mui-checked": { color: "#1976d2" },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontWeight: "bold", fontSize: "1rem" }}
                          >
                            INICIAL
                          </Typography>
                        }
                        sx={{
                          border:
                            field.value === "inicial"
                              ? "3px solid #1976d2"
                              : "2px solid #000",
                          p: 1.5,
                          m: 0,
                          flex: 1,
                          backgroundColor:
                            field.value === "inicial" ? "#e3f2fd" : "#fff",
                          transition: "all 0.3s ease",
                          borderRadius: 1,
                        }}
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value === "periodica"}
                            onChange={() => field.onChange("periodica")}
                            disabled={readonly}
                            sx={{
                              "&.Mui-checked": { color: "#1976d2" },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontWeight: "bold", fontSize: "1rem" }}
                          >
                            PERIÓDICA
                          </Typography>
                        }
                        sx={{
                          border:
                            field.value === "periodica"
                              ? "3px solid #1976d2"
                              : "2px solid #000",
                          p: 1.5,
                          m: 0,
                          flex: 1,
                          backgroundColor:
                            field.value === "periodica" ? "#e3f2fd" : "#fff",
                          transition: "all 0.3s ease",
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  )}
                />
                {errors?.vehicle?.tipoInspeccion && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {errors.vehicle.tipoInspeccion.message}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* CERTIFICACIÓN MSC */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  ✅ CERTIFICACIÓN MSC:
                </Typography>

                <Controller
                  name="vehicle.certificacionMSC"
                  control={control}
                  rules={{ required: "Debe seleccionar una opción" }}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value === "si"}
                            onChange={() => field.onChange("si")}
                            disabled={readonly}
                            sx={{
                              "&.Mui-checked": { color: "#4caf50" },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontWeight: "bold", fontSize: "1rem" }}
                          >
                            SI
                          </Typography>
                        }
                        sx={{
                          border:
                            field.value === "si"
                              ? "3px solid #4caf50"
                              : "2px solid #000",
                          p: 1.5,
                          m: 0,
                          flex: 1,
                          backgroundColor:
                            field.value === "si" ? "#e8f5e9" : "#fff",
                          transition: "all 0.3s ease",
                          borderRadius: 1,
                        }}
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            disabled={readonly}
                            sx={{
                              "&.Mui-checked": { color: "#f44336" },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontWeight: "bold", fontSize: "1rem" }}
                          >
                            NO
                          </Typography>
                        }
                        sx={{
                          border:
                            field.value === "no"
                              ? "3px solid #f44336"
                              : "2px solid #000",
                          p: 1.5,
                          m: 0,
                          flex: 1,
                          backgroundColor:
                            field.value === "no" ? "#ffebee" : "#fff",
                          transition: "all 0.3s ease",
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  )}
                />
                {errors?.vehicle?.certificacionMSC && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {errors.vehicle.certificacionMSC.message}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {template.sections && template.sections.length > 0 && (
        <Box>
          {template.sections.map((section, idx) => (
            <SectionRenderer
              key={section._id || idx}
              section={section}
              sectionPath={`sections.${idx}`}
              control={control}
              errors={errors}
              formConfig={config}
            />
          ))}
        </Box>
      )}

      {/* Selector de daños del vehículo */}
      {config.vehicle?.hasDamageSelector && (
        <VehicleDamageSelector<FormDataHerraEquipos>
          ref={vehicleDamageRef}
          vehicleImageUrl="/image.png"
          control={control}
          setValue={setValue}
          damageFieldName="vehicle.damages"
          observationsFieldName="vehicle.damageObservations"
          readonly={readonly}
        />
      )}

      {/* Programación de Próxima Inspección */}
      {config.vehicle?.hasNextInspectionDate && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            border: "2px solid #757575",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#424242",
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            📅 Programación de Próxima Inspección
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  backgroundColor: "#e0e0e0",
                  border: "2px solid #000",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    mb: 2,
                    textAlign: "center",
                    color: "#000",
                  }}
                >
                  FECHA PROXIMA INSPECCIÓN
                </Typography>

                <Controller
                  name="vehicle.fechaProximaInspeccion"
                  control={control}
                  rules={{
                    required: "La fecha de próxima inspección es obligatoria",
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={readonly}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fff",
                          "& fieldset": {
                            borderColor: "#000",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#000",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#1976d2",
                          },
                        },
                        "& input": {
                          fontWeight: "bold",
                          fontSize: "1rem",
                          textAlign: "center",
                          color: "#000",
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  backgroundColor: "#e0e0e0",
                  border: "2px solid #000",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    mb: 2,
                    textAlign: "center",
                    color: "#000",
                  }}
                >
                  RESPONSABLE DE PROX. INSP.
                </Typography>

                <Controller
                  name="vehicle.responsableProximaInspeccion"
                  control={control}
                  rules={{
                    required:
                      "El responsable de próxima inspección es obligatorio",
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Ingrese nombre del responsable"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={readonly}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fff",
                          "& fieldset": {
                            borderColor: "#000",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#000",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#1976d2",
                          },
                        },
                        "& input": {
                          fontWeight: "bold",
                          fontSize: "1rem",
                          color: "#000",
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>ℹ️ Información:</strong> Estos datos se utilizan para
              programar la siguiente inspección del vehículo.
            </Typography>
          </Alert>
        </Paper>
      )}

      {/* Conclusión/Observaciones */}
      {config.conclusion && (
        <ObservationsSection
          config={config.conclusion}
          register={register}
          errors={errors}
        />
      )}

      {/* Firmas */}
      {config.signatures?.inspector && (
        <InspectorSignature
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          config={config.signatures.inspector}
        />
      )}

      {config.signatures?.supervisor && (
        <SupervisorSignature
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          config={config.signatures.supervisor}
        />
      )}

      {/* Botones */}
      <SaveSubmitButtons
        onSaveDraft={
          onSaveDraft
            ? () => handleSubmit(handleSaveDraftWithImage)()
            : undefined
        }
        onSubmit={handleSubmit(handleFormSubmit)}
        isSubmitting={isSubmitting}
        allowDraft={config.allowDraft ?? true}
      />
    </Box>
  );
}
