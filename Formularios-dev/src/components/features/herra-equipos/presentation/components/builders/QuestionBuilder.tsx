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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTemplateManagement } from "../../../application/hooks/useTemplateManagement";
import { TemplateEditorView } from "./TemplateEditorView";
import { TemplateCard } from "./TemplateCard";

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
  } = useTemplateManagement();

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
