"use client";

import { TextField, Typography, Paper, Box } from "@mui/material";
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type FieldErrors,
  type FieldValues,
  type Path,
  Controller,
} from "react-hook-form";
import type {
  FormDataHerraEquipos,
  SignatureConfig,
  SignatureFieldConfig,
} from "../types/IProps";
import dynamic from "next/dynamic";
import { SignatureFieldProps } from "@/components/molecules/team-member-signature/SigantureField";
import { DataSourceType } from "@/lib/actions/dataSourceService";
import dayjs from "dayjs";

const AutocompleteCustom = dynamic(
  () => import("@/components/molecules/autocomplete-custom/AutocompleteCustom"),
  { ssr: false }
);
const SignatureField = dynamic(
  () =>
    import("@/components/molecules/team-member-signature/SigantureField").then(
      (mod) => mod.SignatureField
    ),
  { ssr: false }
) as <T extends FieldValues>(
  props: SignatureFieldProps<T>
) => React.ReactElement;

interface SupervisorSignatureProps {
  register: UseFormRegister<FormDataHerraEquipos>;
  control: Control<FormDataHerraEquipos>;
  setValue: UseFormSetValue<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  config?: SignatureConfig["supervisor"];
  readonly?: boolean;
}

export function SupervisorSignature({
  register,
  control,
  setValue,
  errors,
  config,
  readonly = false,
}: SupervisorSignatureProps) {
  if (config === false || config === undefined) {
    return null;
  }

  if (config === true) {
    config = {
      enabled: true,
      title: "Firma del Supervisor",
      fields: {
        name: {
          enabled: true,
          type: "text",
          label: "Nombre del Supervisor",
          placeholder: "Ingrese nombre completo",
          required: true,
          fieldName: "supervisorSignature.supervisorName",
        },
        signature: {
          enabled: true,
          type: "canvas", // Asegúrate que aquí sea 'canvas' si usas el default
          label: "Firma",
          placeholder: "Firma digital o código",
          required: true,
          fieldName: "supervisorSignature.supervisorSignature",
        },
      },
    };
  }

  if (typeof config === "object" && !config.enabled) {
    return null;
  }

  const fields = config.fields || {};

  const renderField = (key: string, field: SignatureFieldConfig) => {
    if (!field || !field.enabled) return null;

    const fieldName = field.fieldName || `supervisorSignature.${key}`;
    const fieldKey = fieldName.split(".")[1];
    const fieldType = field.type || "text";

    const commonProps = {
      label: field.label || key,
      placeholder: field.placeholder || "",
      required: field.required || false,
      error: !!errors.supervisorSignature?.[
        fieldKey as keyof typeof errors.supervisorSignature
      ],
      helperText: errors.supervisorSignature?.[
        fieldKey as keyof typeof errors.supervisorSignature
      ]?.message as string | undefined,
    };

    switch (fieldType) {
      case "autocomplete":
        return (
          <Controller
            name={fieldName as Path<FormDataHerraEquipos>}
            control={control}
            defaultValue=""
            render={({ field: controllerField }) => (
              <AutocompleteCustom
                {...commonProps}
                value={controllerField.value as string | null}
                onChange={(value: string | null) => {
                  controllerField.onChange(value);
                }}
                dataSource={field.dataSource as DataSourceType | undefined}
              />
            )}
            disabled={readonly}
          />
        );

      case "canvas":
        return (
          <Controller
            name={fieldName as Path<FormDataHerraEquipos>}
            control={control}
            defaultValue=""
            render={({ field: controllerField }) => (
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {field.label || "Firma"}
                  {field.required && <span style={{ color: "red" }}> *</span>}
                </Typography>
                {/* Aseguramos que el contenedor de la firma tenga altura 
                   suficiente en móvil para no colapsar 
                */}
                <Box sx={{ minHeight: "200px", width: "100%" }}>
                    <SignatureField<FormDataHerraEquipos>
                      fieldName={fieldName as Path<FormDataHerraEquipos>}
                      control={control}
                      setValue={setValue}
                      heightPercentage={field.heightPercentage || 60}
                      error={commonProps.error}
                      helperText={commonProps.helperText}
                      value={controllerField.value as string}
                      onChange={controllerField.onChange}
                      disabled={readonly}
                    />
                </Box>
              </Box>
            )}
          />
        );

      case "date":
        return (
          <Controller
            name={fieldName as Path<FormDataHerraEquipos>}
            control={control}
            defaultValue={dayjs().format("YYYY-MM-DD")}
            render={({ field: controllerField }) => {
              if (!controllerField.value) {
                controllerField.onChange(dayjs().format("YYYY-MM-DD"));
              }

              return (
                <TextField
                  {...commonProps}
                  type="date"
                  fullWidth
                  value={controllerField.value || dayjs().format("YYYY-MM-DD")}
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={readonly}
                  sx={{
                    "& .MuiInputBase-input": {
                      cursor: "default",
                    },
                  }}
                />
              );
            }}
          />
        );

      case "text":
      default:
        return (
          <TextField
            key={key}
            fullWidth
            {...commonProps}
            {...register(fieldName as Path<FormDataHerraEquipos>, {
              required: field.required
                ? `${field.label || key} es obligatorio`
                : false,
            })}
          />
        );
    }
  };

  const standardFields = ["name", "signature", "date", "position", "license"];
  const standardFieldsToRender = standardFields
    .map((key) => (fields[key] ? { key, field: fields[key]! } : null))
    .filter((item) => item !== null);

  const customFields = Object.entries(fields)
    .filter(([key]) => !standardFields.includes(key))
    .map(([key, field]) => (field ? { key, field } : null))
    .filter((item) => item !== null);

  const allFields = [...standardFieldsToRender, ...customFields];

  if (allFields.length === 0) {
    return null;
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        // Padding responsivo: menos en móvil (2 = 16px), más en desktop (3 = 24px)
        p: { xs: 2, md: 3 },
        width: "100%",
        overflow: "hidden" // Evita scroll horizontal indeseado
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
        {config.title || ""}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2, // Espacio entre elementos
          // Grid responsivo básico
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
        }}
      >
        {allFields.map((item) => {
          if (!item) return null;
          
          // Detectamos si es firma o si hay un solo campo en total
          const isSignature = item.field.type === "canvas";
          const isSingleField = allFields.length === 1;

          return (
            <Box 
              key={item.key}
              sx={{
                // 🔥 LOGICA RESPONSIVA CLAVE:
                // Si es una firma O si solo hay un campo, ocupa TODAS las columnas disponibles.
                // gridColumn: "1 / -1" hace que ocupe todo el ancho de la fila.
                gridColumn: (isSignature || isSingleField) ? "1 / -1" : "auto",
                
                // Aseguramos que el contenido no se desborde
                width: "100%",
                minWidth: 0 
              }}
            >
              {renderField(item.key, item.field)}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}