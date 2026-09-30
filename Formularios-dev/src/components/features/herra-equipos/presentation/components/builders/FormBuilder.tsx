"use client";

import type React from "react";
import { useCallback, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ROLES_ASIGNABLES_A_PLANTILLA } from "@/lib/routePermissions";
import {
  Alert,
  Box,
  Button as MuiButton,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Save } from "@mui/icons-material";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormBuilderDataSchema } from "../../../domain/schemas/builderSchemas";
import { SectionBuilder } from "./SectionBuilder";
import { CamposVerificacionBuilder } from "./CamposVerificacionBuilder";
import { FrecuenciaInspeccionCard } from "./FrecuenciaInspeccionCard";
import type { FormBuilderDataHerraEquipos, FormTemplateHerraEquipos } from "../../../domain/models/BuilderTypes";

interface FormBuilderProps {
  template: FormTemplateHerraEquipos | null;
  onSave: (data: FormBuilderDataHerraEquipos) => void;
  onCancel: () => void;
  mode?: "create" | "edit" | "view";
}

const VALORES_NUEVA: FormBuilderDataHerraEquipos = {
  name: "",
  code: "",
  revision: "Rev. 1",
  type: "interna",
  verificationFields: [
    { label: "Gerencia", type: "text" },
    { label: "Supervisor", type: "text" },
  ],
  sections: [],
};

/**
 * Constructor de plantillas de herramientas y equipos.
 *
 * **Rendimiento:** esta raíz no vigila los datos. Antes hacía
 * `useWatch({ control })` + `getValues()` y le pasaba a cada sección y
 * pregunta su objeto: cada tecla redibujaba el constructor entero, y la
 * lentitud crecía con el número de preguntas. Ahora cada pieza (campos de
 * verificación, frecuencia, secciones, preguntas) vigila solo lo suyo.
 * Ver mds/implementation_planConstructoresFormularios.md.
 */
export const FormBuilder: React.FC<FormBuilderProps> = ({ template, onSave, onCancel, mode = "create" }) => {
  const isReadOnly = mode === "view";
  // En un borrador el código queda fijo (une a todas las revisiones); el
  // número de revisión sí se puede elegir, siempre mayor que los anteriores.
  const esBorrador = template?.estadoRevision === "borrador";
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormBuilderDataHerraEquipos>({
    resolver: zodResolver(FormBuilderDataSchema),
    mode: "onTouched",
    defaultValues: template || VALORES_NUEVA,
  });

  // Cuando se abre en modo edición o vista, carga los datos del template
  useEffect(() => {
    if (template && (mode === "edit" || mode === "view")) {
      reset(template);
    }
  }, [template, mode, reset]);

  const { fields: sections, append, remove } = useFieldArray({ control, name: "sections" });

  const addSection = (isParent: boolean) =>
    append({
      title: isParent ? "Nueva Sección Padre" : "Nueva Sección",
      isParent,
      parentId: null,
      questions: [],
      images: [],
      subsections: isParent ? [] : undefined,
    });

  const removeSection = useCallback((i: number) => remove(i), [remove]);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      {Object.keys(errors || {}).length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Existen errores de validación. Revisa que el formulario tenga nombre, código, y al menos una sección con
          preguntas.
        </Alert>
      )}
      <Box component="form" noValidate onSubmit={handleSubmit(onSave)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Nombre del Formulario" disabled={isReadOnly} required />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Código" disabled={isReadOnly || esBorrador} required />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="revision"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Número de Revisión"
                      disabled={isReadOnly}
                      required
                      helperText={esBorrador ? "Tiene que ser mayor que el de las revisiones anteriores" : undefined}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={isReadOnly}>
                      <InputLabel>Tipo de Inspección</InputLabel>
                      <Select {...field} label="Tipo de Inspección">
                        <MenuItem value="interna">Interna</MenuItem>
                        <MenuItem value="externa">Externa</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="descripcion"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ""}
                      fullWidth
                      label="Descripción"
                      disabled={isReadOnly}
                      multiline
                      minRows={2}
                    />
                  )}
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
              Deje el campo vacío para que la plantilla sea visible para todos. Si selecciona roles, solo esos roles
              —y los de visibilidad total (admin, superintendente, supervisor)— podrán verla y llenarla.
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
                      (sel as string[]).length === 0 ? "Todos los roles" : (sel as string[]).join(", ")
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

        <FrecuenciaInspeccionCard control={control} setValue={setValue} disabled={isReadOnly} />

        <CamposVerificacionBuilder control={control} setValue={setValue} disabled={isReadOnly} />

        {!isReadOnly && (
          <Box display="flex" gap={2} mb={3}>
            <MuiButton type="button" variant="contained" startIcon={<Add />} onClick={() => addSection(false)}>
              Sección Simple
            </MuiButton>
            <MuiButton type="button" variant="outlined" startIcon={<Add />} onClick={() => addSection(true)}>
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
                  {isReadOnly ? "Este template no tiene secciones definidas" : "Comienza agregando una sección"}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            sections.map((section, index) => (
              <SectionBuilder
                key={section.id}
                sectionIndex={index}
                control={control}
                setValue={setValue}
                onRemove={removeSection}
                disabled={isReadOnly}
              />
            ))
          )}
        </Box>
        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <MuiButton type="button" variant="outlined" onClick={onCancel}>
              Cancelar
            </MuiButton>
            <MuiButton type="submit" variant="contained" startIcon={<Save />}>
              Guardar Template
            </MuiButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};
