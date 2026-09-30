"use client";

import type React from "react";
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
  Snackbar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTemplateManagement } from "../../../application/hooks/useTemplateManagement";
import { TemplateEditorView } from "./TemplateEditorView";
import { TemplateCard } from "./TemplateCard";
import { versionadoHerraAdapter } from "../../../infrastructure/adapters/versionadoAdapter";
import { useVersionadoPlantilla } from "@/hooks/useVersionadoPlantilla";
import {
  DialogoHistorialRevisiones,
  DialogoPublicarRevision,
  DialogoRevisionBloqueada,
} from "@/components/ui/versionado/DialogosVersionado";
import { estadoDeRevision } from "@/types/versionado";
import { getFormConfig } from "../../../config/form-config.helpers";
import type { FormTemplateHerraEquipos } from "../../../domain/models/BuilderTypes";

/**
 * Opción A del plan de constructores: los formularios con pantalla (y Excel)
 * hechos a mano para su código no se ajustan solos a una revisión nueva.
 * No se bloquea nada: se avisa al publicar.
 */
const advertenciaUiFija = (code: string) =>
  getFormConfig(code)
    ? `El formulario ${code} tiene pantalla y Excel armados a mano para este código. Si en esta revisión se agregaron, quitaron o reordenaron preguntas, esos cambios no se reflejan ahí hasta que se ajusten en el código del sistema.`
    : undefined;

const TemplateManagementApp: React.FC = () => {
  const {
    templates,
    currentView,
    selectedTemplate,
    deleteDialog,
    successMessage,
    errorMessage,
    loading,
    setSuccessMessage,
    setErrorMessage,
    handleCreate,
    handleView,
    handleEdit,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleCancel,
    recargar,
  } = useTemplateManagement();

  const versionado = useVersionadoPlantilla({
    adaptador: versionadoHerraAdapter,
    alCambiar: recargar,
  });

  /** Crea la revisión siguiente y la abre directamente en el editor. */
  const crearYEditarRevision = async (template: FormTemplateHerraEquipos) => {
    const borrador = await versionado.crearRevision(template);
    if (borrador) handleEdit(borrador as unknown as FormTemplateHerraEquipos);
  };

  const tieneBorrador = (code: string) =>
    templates.some((t) => t.code === code && estadoDeRevision(t) === "borrador");

  // Vigente y borrador de cada código, uno al lado del otro.
  const ordenadas = [...templates].sort(
    (a, b) => a.code.localeCompare(b.code) || (estadoDeRevision(a) === "vigente" ? -1 : 1),
  );

  if (currentView !== "list") {
    return (
      <TemplateEditorView
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
          {ordenadas.map((template) => {
            const estado = estadoDeRevision(template);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template._id}>
                <TemplateCard
                  template={template}
                  onView={() => handleView(template)}
                  // Una vigente ya usada no se edita: se ofrece crear revisión.
                  onEdit={() => versionado.pedirEdicion(template, () => handleEdit(template))}
                  onDelete={() => handleDeleteClick(template._id)}
                  onNuevaRevision={
                    estado === "vigente" && !tieneBorrador(template.code)
                      ? () => crearYEditarRevision(template)
                      : undefined
                  }
                  onPublicar={estado === "borrador" ? () => versionado.pedirPublicacion(template) : undefined}
                  onHistorial={() => versionado.verHistorial(template)}
                />
              </Grid>
            );
          })}
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

      <DialogoRevisionBloqueada
        bloqueo={versionado.bloqueo}
        trabajando={versionado.trabajando}
        onCerrar={versionado.cerrarBloqueo}
        onCrearRevision={(p) => crearYEditarRevision(p as unknown as FormTemplateHerraEquipos)}
        onVer={(p) => {
          versionado.cerrarBloqueo();
          handleView(p as unknown as FormTemplateHerraEquipos);
        }}
      />
      <DialogoPublicarRevision
        key={versionado.publicando?._id ?? "cerrado"}
        plantilla={versionado.publicando}
        advertencia={versionado.publicando ? advertenciaUiFija(versionado.publicando.code) : undefined}
        trabajando={versionado.trabajando}
        onCancelar={versionado.cancelarPublicacion}
        onConfirmar={versionado.confirmarPublicacion}
      />
      <DialogoHistorialRevisiones historial={versionado.historial} onCerrar={versionado.cerrarHistorial} />
      <Snackbar open={!!versionado.aviso} autoHideDuration={7000} onClose={versionado.cerrarAviso}>
        <Alert onClose={versionado.cerrarAviso} severity={versionado.aviso?.severidad ?? "info"} sx={{ width: "100%" }}>
          {versionado.aviso?.mensaje}
        </Alert>
      </Snackbar>

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
