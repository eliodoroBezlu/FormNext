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

// ✅ Importar solo los componentes necesarios
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
  // Si está deshabilitado, no renderizar
  if (config === false || config === undefined) {
    return null;
  }

  // Si config es boolean true, usar valores por defecto
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
          type: "text",
          label: "Firma",
          placeholder: "Firma digital o código",
          required: true,
          fieldName: "supervisorSignature.supervisorSignature",
        },
      },
    };
  }

  // Si es objeto pero está deshabilitado
  if (typeof config === "object" && !config.enabled) {
    return null;
  }

  const fields = config.fields || {};

  // Helper para renderizar cada campo según su tipo
 const renderField = (key: string, field: SignatureFieldConfig) => {
  if (!field || !field.enabled) return null;

  const fieldName =
    field.fieldName || `supervisorSignature.${key}`;
  const fieldKey = fieldName.split(".")[1];
  const fieldType = field.type || "text";

  const commonProps = {
    label: field.label || key,
    placeholder: field.placeholder || "",
    required: field.required || false,
    error:
      !!errors.supervisorSignature?.[
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
          />
        );

      case "canvas":
        return (
          <Controller
            name={fieldName as Path<FormDataHerraEquipos>}
            control={control}
            defaultValue=""
            render={({ field: controllerField }) => (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {field.label || "Firma"}
                  {field.required && <span style={{ color: "red" }}> *</span>}
                </Typography>
                <SignatureField<FormDataHerraEquipos>
                  fieldName={fieldName as Path<FormDataHerraEquipos>}
                  control={control}
                  setValue={setValue}
                  heightPercentage={field.heightPercentage || 60}
                  error={commonProps.error}
                  helperText={commonProps.helperText}
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                />
              </Box>
            )}
          />
        );

      case "date":
  return (
    <Controller
      name={fieldName as Path<FormDataHerraEquipos>}
      control={control}
      defaultValue={dayjs().format("YYYY-MM-DD")} // ✅ Fecha de hoy por defecto
      render={({ field: controllerField }) => {
        // ✅ Si no hay valor, setear la fecha de hoy automáticamente
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
              readOnly: true, // ✅ No se puede modificar
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiInputBase-input": {
                cursor: "default", // ✅ Cursor normal en lugar de texto
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

  // Preparar los campos estándar
  const standardFields = ["name", "signature", "date", "position", "license"];
  const standardFieldsToRender = standardFields
    .map((key) => (fields[key] ? { key, field: fields[key]! } : null))
    .filter((item) => item !== null);

  // Campos custom
  const customFields = Object.entries(fields)
    .filter(([key]) => !standardFields.includes(key))
    .map(([key, field]) => (field ? { key, field } : null))
    .filter((item) => item !== null);

  const allFields = [...standardFieldsToRender, ...customFields];

  if (allFields.length === 0) {
    return null;
  }

  return (
  <Paper elevation={2} sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>
      {config.title || ""}
    </Typography>

    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          md: allFields.length === 1 ? "1fr" : "repeat(2, 1fr)",
        },
      }}
    >
      {allFields.map((item) => 
        item && (
          <Box key={item.key}>
            {renderField(item.key, item.field)}
          </Box>
        )
      )}
    </Box>
  </Paper>
);




}
