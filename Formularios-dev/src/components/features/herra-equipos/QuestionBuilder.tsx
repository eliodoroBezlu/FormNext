"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  Fab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Divider,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
  Save,
} from "@mui/icons-material";
import {
  createTemplateHerraEquipo,
  deleteTemplateHerraEquipo,
  getTemplatesHerraEquipos,
  updateTemplateHerraEquipo,
} from "@/lib/actions/template-herra-equipos";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormBuilderDataSchema } from "./domain/schemas/builderSchemas";
import { SectionBuilder } from "./presentation/components/builders/SectionBuilder";
import {
  SectionHerraEquipos,
  VerificationFieldType,
  FormBuilderDataHerraEquipos,
  FormTemplateHerraEquipos,
} from "./domain/models/BuilderTypes";

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
    watch,
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
  const formData = watch();

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
                  border: "2px dashed #ddd",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
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

interface TemplateBuilderProps {
  template: FormTemplateHerraEquipos | null;
  onSave: (template: FormTemplateHerraEquipos) => void;
  onCancel: () => void;
  mode: "create" | "edit" | "view";
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  template,
  onSave,
  onCancel,
  mode,
}) => {
  const handleSave = (data: FormBuilderDataHerraEquipos) => {
    const now = new Date();
    onSave({
      _id: template?._id || Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: template?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={onCancel}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          {mode === "view" ? "Ver" : mode === "edit" ? "Editar" : "Crear"}{" "}
          Template
        </Typography>
        {mode === "edit" && template && (
          <Chip
            label={`Editando: ${template.name}`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
      <FormBuilder
        template={template}
        onSave={handleSave}
        onCancel={onCancel}
        mode={mode}
      />
    </Box>
  );
};

interface TemplateCardProps {
  template: FormTemplateHerraEquipos;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  const getTotalQuestions = (): number => {
    let total = 0;
    const countQuestions = (sections: SectionHerraEquipos[]) => {
      sections.forEach((section) => {
        total += section.questions.length;
        if (section.subsections) {
          countQuestions(section.subsections);
        }
      });
    };
    countQuestions(template.sections);
    return total;
  };
  const getAutocompleteFields = (): number =>
    template.verificationFields.filter((f) => f.type === "autocomplete").length;

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" gutterBottom>
            {template.name}
          </Typography>
          <Chip
            label={template.type === "interna" ? "Interna" : "Externa"}
            size="small"
            color={template.type === "interna" ? "primary" : "secondary"}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Código:</strong> {template.code}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Revisión:</strong> {template.revision}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Creado:</strong> {formatDate(template.createdAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Actualizado:</strong> {formatDate(template.updatedAt)}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Chip
            label={`${template.sections.length} secciones`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${getTotalQuestions()} preguntas`}
            size="small"
            variant="outlined"
            color="secondary"
          />
          <Chip
            label={`${template.verificationFields.length} campos`}
            size="small"
            variant="outlined"
            color="info"
          />
          {getAutocompleteFields() > 0 && (
            <Chip
              label={`${getAutocompleteFields()} autocomplete`}
              size="small"
              variant="outlined"
              color="success"
            />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", gap: 1 }}>
        <IconButton size="small" onClick={onView} title="Ver">
          <Visibility />
        </IconButton>
        <IconButton size="small" onClick={onEdit} title="Editar">
          <Edit />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          title="Eliminar"
        >
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};

const TemplateManagementApp: React.FC = () => {
  const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([]);
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [selectedTemplate, setSelectedTemplate] =
    useState<FormTemplateHerraEquipos | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    templateId: string | null;
  }>({ open: false, templateId: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setErrorMessage(null);
      const result = await getTemplatesHerraEquipos();
      if (result.success) {
        const templatesWithDates = result.data.map((template) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
        }));
        setTemplates(templatesWithDates);
      } else {
        setErrorMessage(result.error);
      }
      setLoading(false);
    };

    if (currentView === "list") {
      loadTemplates();
    }
  }, [currentView]);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setCurrentView("create");
  };

  const handleView = (template: FormTemplateHerraEquipos) => {
    setSelectedTemplate(template);
    setCurrentView("view");
  };

  const handleEdit = (template: FormTemplateHerraEquipos) => {
    setSelectedTemplate(template);
    setCurrentView("edit");
  };

  const handleSave = async (template: FormTemplateHerraEquipos) => {
    setErrorMessage(null);

    let result;
    if (currentView === "create") {
      result = await createTemplateHerraEquipo(template);
    } else if (currentView === "edit" && selectedTemplate) {
      result = await updateTemplateHerraEquipo(
        selectedTemplate._id,
        template,
      );
    }

    if (result?.success) {
      setSuccessMessage(
        `Template "${template.name}" ${currentView === "create" ? "creado" : "actualizado"} exitosamente`,
      );
      setCurrentView("list");
      setSelectedTemplate(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(
        result?.error || "Error desconocido al guardar el template",
      );
    }
  };

  const handleDeleteClick = (templateId: string) => {
    setDeleteDialog({ open: true, templateId });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.templateId) {
      const result = await deleteTemplateHerraEquipo(deleteDialog.templateId);

      if (result.success) {
        const deletedTemplate = templates.find(
          (t) => t._id === deleteDialog.templateId,
        );
        setSuccessMessage(
          `Template "${deletedTemplate?.name}" eliminado exitosamente`,
        );
        setTemplates(
          templates.filter((t) => t._id !== deleteDialog.templateId),
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error);
      }
    }
    setDeleteDialog({ open: false, templateId: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, templateId: null });
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedTemplate(null);
  };

  if (currentView !== "list") {
    return (
      <TemplateBuilder
        template={selectedTemplate}
        onSave={handleSave}
        onCancel={handleCancel}
        mode={currentView}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Gestión de Templates
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Crea, edita y gestiona tus plantillas de formularios
        </Typography>
      </Box>
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Cargando templates...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template._id}>
              <TemplateCard
                template={template}
                onView={() => handleView(template)}
                onEdit={() => handleEdit(template)}
                onDelete={() => handleDeleteClick(template._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {templates.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay templates disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu primer template para comenzar
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="crear template"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleCreate}
      >
        <Add />
      </Fab>

      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este template? Esta acción no
            se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleDeleteCancel}>Cancelar</MuiButton>
          <MuiButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Eliminar
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          backgroundColor: "background.paper",
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total Templates: <strong>{templates.length}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

export default TemplateManagementApp;
