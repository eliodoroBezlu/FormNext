"use client";

import { useEffect, useState } from "react";
import {
  createTemplateHerraEquipo,
  deleteTemplateHerraEquipo,
  getTemplatesHerraEquipos,
  updateTemplateHerraEquipo,
} from "@/lib/actions/template-herra-equipos";
import { FormTemplateHerraEquipos } from "../../domain/models/BuilderTypes";

export type TemplateManagementView = "list" | "create" | "edit" | "view";

/**
 * Orquesta el estado y las operaciones CRUD de la gestión de templates
 * de herra-equipos (listar, crear, editar, ver y eliminar).
 * Usado por QuestionBuilder.tsx (vista principal del builder).
 */
export function useTemplateManagement() {
  const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([]);
  const [currentView, setCurrentView] = useState<TemplateManagementView>("list");
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

  return {
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
  };
}
