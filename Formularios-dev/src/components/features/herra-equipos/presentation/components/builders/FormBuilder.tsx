"use client";

import type React from "react";
import { useEffect } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { ROLES_ASIGNABLES_A_PLANTILLA } from "@/lib/routePermissions";
import {
  Box,
  Typography,
  Grid,
  Alert,
  Button as MuiButton,
  Card,
  CardContent,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Switch,
} from "@mui/material";
import { Add, Delete, Save } from "@mui/icons-material";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormBuilderDataSchema } from "../../../domain/schemas/builderSchemas";
import { SectionBuilder } from "./SectionBuilder";
import {
  VerificationFieldType,
  FormBuilderDataHerraEquipos,
  FormTemplateHerraEquipos,
  UnidadFrecuencia,
} from "../../../domain/models/BuilderTypes";

const UNIDADES_FRECUENCIA: Array<{ value: UnidadFrecuencia; label: string }> = [
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
  { value: "personalizada", label: "Personalizada (días)" },
];

const DATA_SOURCES: Array<{ value: string; label: string }> = [
  { value: "area", label: "Área" },
  { value: "superintendencia", label: "Superintendencia" },
  { value: "trabajador", label: "Trabajador" },
  { value: "gerencia", label: "Gerencia" },
  { value: "cargo", label: "Cargo" },
  { value: "equipo", label: "Equipo" },
  { value: "vicepresidencia", label: "Vicepresidencia" },
  { value: "supervisor", label: "Supervisor" },
];

interface FormBuilderProps {
  template: FormTemplateHerraEquipos | null;
  onSave: (data: FormBuilderDataHerraEquipos) => void;
  onCancel: () => void;
  mode?: "create" | "edit" | "view";
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  template,
  onSave,
  onCancel,
  mode = "create",
}) => {
  const isReadOnly = mode === "view";
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormBuilderDataHerraEquipos>({
    resolver: zodResolver(FormBuilderDataSchema),
    defaultValues: template || {
      name: "",
      code: "",
      revision: "Rev. 1",
      type: "interna",
      verificationFields: [
        { label: "Gerencia", type: "text" },
        { label: "Supervisor", type: "text" },
      ],
      sections: [],
    },
  });

  // Cuando se abre en modo edición o vista, carga los datos del template
  useEffect(() => {
    if (template && (mode === "edit" || mode === "view")) {
      reset(template);
    }
  }, [template, mode, reset]);

  const {
    fields: verificationFields,
    append: appendVerificationField,
    remove: removeVerificationField,
  } = useFieldArray({ control, name: "verificationFields" });
  const {
    fields: sections,
    append,
    remove,
  } = useFieldArray({ control, name: "sections" });
  // `useWatch` provee la suscripción (re-render al cambiar cualquier campo) y
  // `getValues` el snapshot completo: sin `name`, `useWatch` devuelve
  // `DeepPartial<T>` y aquí se necesita el tipo completo.
  useWatch({ control });
  const formData = getValues();

  const addVerificationField = () =>
    appendVerificationField({ label: "", type: "text" });

  const addSection = (isParent: boolean) =>
    append({
      title: isParent ? "Nueva Sección Padre" : "Nueva Sección",
      isParent,
      parentId: null,
      questions: [],
      images: [],
      subsections: isParent ? [] : undefined,
    });

  const handleVerificationFieldTypeChange = (
    index: number,
    newType: VerificationFieldType,
  ) => {
    setValue(`verificationFields.${index}.type`, newType);
    if (newType !== "autocomplete")
      setValue(`verificationFields.${index}.dataSource`, undefined);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      {Object.keys(errors || {}).length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Existen errores de validación. Revisa que el formulario tenga nombre,
          código, y al menos una sección con preguntas.
        </Alert>
      )}
      <form
        onSubmit={handleSubmit(onSave)}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre del Formulario"
                  value={formData.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Código"
                  value={formData.code}
                  onChange={(e) => setValue("code", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Número de Revisión"
                  value={formData.revision}
                  onChange={(e) => setValue("revision", e.target.value)}
                  disabled={isReadOnly}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={isReadOnly}>
                  <InputLabel>Tipo de Inspección</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) =>
                      setValue("type", e.target.value as "interna" | "externa")
                    }
                    label="Tipo de Inspección"
                  >
                    <MenuItem value="interna">Interna</MenuItem>
                    <MenuItem value="externa">Externa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={formData.descripcion || ""}
                  onChange={(e) => setValue("descripcion", e.target.value)}
                  disabled={isReadOnly}
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Visibilidad por Rol
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Deje el campo vacío para que la plantilla sea visible para todos.
              Si selecciona roles, solo esos roles —y los de visibilidad total
              (admin, superintendente, supervisor)— podrán verla y llenarla.
            </Typography>

            <Controller
              name="rolesVisibles"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Roles que ven esta plantilla</InputLabel>
                  <Select
                    {...field}
                    multiple
                    value={field.value ?? []}
                    label="Roles que ven esta plantilla"
                    disabled={isReadOnly}
                    renderValue={(sel) =>
                      (sel as string[]).length === 0
                        ? "Todos los roles"
                        : (sel as string[]).join(", ")
                    }
                  >
                    {ROLES_ASIGNABLES_A_PLANTILLA.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Frecuencia de Inspección
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Si se activa, un código de equipo ya inspeccionado con este tipo
              de plantilla dejará de estar disponible hasta que se cumpla la
              frecuencia configurada.
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.frecuencia?.activa ?? false}
                      onChange={(e) =>
                        setValue("frecuencia", e.target.checked
                          ? {
                              unidad: formData.frecuencia?.unidad || "mensual",
                              valorPersonalizado:
                                formData.frecuencia?.valorPersonalizado,
                              activa: true,
                            }
                          : { ...formData.frecuencia, unidad: formData.frecuencia?.unidad || "mensual", activa: false })
                      }
                      disabled={isReadOnly}
                    />
                  }
                  label="Activar control de frecuencia"
                />
              </Grid>
              {formData.frecuencia?.activa && (
                <>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small" disabled={isReadOnly}>
                      <InputLabel>Frecuencia</InputLabel>
                      <Select
                        value={formData.frecuencia?.unidad || "mensual"}
                        label="Frecuencia"
                        onChange={(e) =>
                          setValue(
                            "frecuencia.unidad",
                            e.target.value as UnidadFrecuencia,
                          )
                        }
                      >
                        {UNIDADES_FRECUENCIA.map((u) => (
                          <MenuItem key={u.value} value={u.value}>
                            {u.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {formData.frecuencia?.unidad === "personalizada" && (
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Días"
                        value={formData.frecuencia?.valorPersonalizado ?? ""}
                        onChange={(e) =>
                          setValue(
                            "frecuencia.valorPersonalizado",
                            Number(e.target.value),
                          )
                        }
                        disabled={isReadOnly}
                      />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small" disabled={isReadOnly}>
                      <InputLabel>Campo de código de equipo</InputLabel>
                      <Select
                        value={formData.campoCodigoEquipo || ""}
                        label="Campo de código de equipo"
                        onChange={(e) =>
                          setValue("campoCodigoEquipo", e.target.value)
                        }
                      >
                        {formData.verificationFields.map((f, idx) => (
                          <MenuItem key={idx} value={f.label} disabled={!f.label}>
                            {f.label || "(sin etiqueta)"}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                Campos de Lista de Verificación ({verificationFields.length})
              </Typography>
              {!isReadOnly && (
                <MuiButton
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addVerificationField}
                  size="small"
                >
                  Agregar Campo
                </MuiButton>
              )}
            </Box>
            {verificationFields.map((field, index: number) => (
              <Box key={field.id} mb={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Etiqueta del Campo"
                      value={formData.verificationFields[index]?.label || ""}
                      size="small"
                      onChange={(e) =>
                        setValue(
                          `verificationFields.${index}.label`,
                          e.target.value,
                        )
                      }
                      disabled={isReadOnly}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth size="small" disabled={isReadOnly}>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={
                          formData.verificationFields[index]?.type || "text"
                        }
                        onChange={(e) =>
                          handleVerificationFieldTypeChange(
                            index,
                            e.target.value as VerificationFieldType,
                          )
                        }
                        label="Tipo"
                      >
                        <MenuItem value="text">Texto</MenuItem>
                        <MenuItem value="date">Fecha</MenuItem>
                        <MenuItem value="number">Número</MenuItem>
                        <MenuItem value="select">Selección</MenuItem>
                        <MenuItem value="autocomplete">Autocompletar</MenuItem>
                        <MenuItem value="time">Hora</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.verificationFields[index]?.obligatorio ??
                            false
                          }
                          onChange={(e) =>
                            setValue(
                              `verificationFields.${index}.obligatorio`,
                              e.target.checked,
                            )
                          }
                          disabled={isReadOnly}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">Obligatorio</Typography>
                      }
                    />
                  </Grid>
                  {formData.verificationFields[index]?.type ===
                    "autocomplete" && (
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <FormControl fullWidth size="small" disabled={isReadOnly}>
                        <InputLabel>Origen de Datos</InputLabel>
                        <Select
                          value={
                            formData.verificationFields[index]?.dataSource || ""
                          }
                          onChange={(e) =>
                            setValue(
                              `verificationFields.${index}.dataSource`,
                              e.target.value,
                            )
                          }
                          label="Origen de Datos"
                        >
                          {DATA_SOURCES.map((source) => (
                            <MenuItem key={source.value} value={source.value}>
                              {source.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {!isReadOnly && (
                    <Grid size={{ xs: "auto" }}>
                      <IconButton
                        color="error"
                        onClick={() => removeVerificationField(index)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
            {verificationFields.length === 0 && (
              <Box
                p={3}
                textAlign="center"
                sx={{
                  border: theme => `2px dashed ${theme.palette.mode === 'dark' ? '#334155' : '#ddd'}`,
                  borderRadius: 2,
                  backgroundColor: theme => theme.palette.mode === 'dark' ? 'background.default' : '#fafafa',
                }}
              >
                <Typography color="text.secondary">
                  No hay campos de verificación.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {!isReadOnly && (
          <Box display="flex" gap={2} mb={3}>
            <MuiButton
              variant="contained"
              startIcon={<Add />}
              onClick={() => addSection(false)}
            >
              Sección Simple
            </MuiButton>
            <MuiButton
              variant="outlined"
              startIcon={<Add />}
              onClick={() => addSection(true)}
            >
              Sección con Subsecciones
            </MuiButton>
          </Box>
        )}
        <Box>
          {sections.length === 0 ? (
            <Card>
              <CardContent sx={{ p: 5, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay secciones
                </Typography>
                <Typography color="text.secondary">
                  {isReadOnly
                    ? "Este template no tiene secciones definidas"
                    : "Comienza agregando una sección"}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            sections.map((section, index: number) => (
              <SectionBuilder
                key={section._id || index}
                sectionIndex={index}
                section={formData.sections[index]}
                control={control}
                setValue={setValue}
                getValues={getValues}
                onRemove={() => remove(index)}
                disabled={isReadOnly}
              />
            ))
          )}
        </Box>
        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <MuiButton variant="outlined" onClick={onCancel}>
              Cancelar
            </MuiButton>
            <MuiButton type="submit" variant="contained" startIcon={<Save />}>
              Guardar Template
            </MuiButton>
          </Box>
        )}
      </form>
    </Box>
  );
};
