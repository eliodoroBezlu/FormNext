// src/app/dashboard/report-iro-isop/editar/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // 🔥 Agregamos useSearchParams
import { Box, CircularProgress, Typography, Alert, Chip } from "@mui/material";
import { ArrowBack, Visibility } from "@mui/icons-material";
import { Button } from "@/components/atoms/button/Button";

import { InspectionFormIroIsop } from "@/components/organisms/inspection-form-iro-isop/InspectionFormIroIsop";
import {
  getInstanceById,
  updateInstance,
} from "@/lib/actions/instance-actions";
import { getTemplateById } from "@/lib/actions/template-actions";
import { FormInstance, FormTemplate } from "@/types/formTypes";

export default function EditarIroIsopPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // 🔥 Hook para leer ?mode=view
  const router = useRouter();

  const id = params.id as string;
  const isViewMode = searchParams.get("mode") === "view"; // 🔥 Detectar si es solo lectura

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instanceData, setInstanceData] = useState<FormInstance | null>(null);
  const [templateData, setTemplateData] = useState<FormTemplate | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Obtener Instancia
        const instanceRes = await getInstanceById(id);
        if (!instanceRes.success || !instanceRes.data) {
          throw new Error("No se pudo cargar la instancia.");
        }
        const instance = instanceRes.data;
        setInstanceData(instance);

        // 2. Obtener Template
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const templateRef = instance.templateId as any;
        const templateIdString =
          typeof templateRef === "object" &&
          templateRef !== null &&
          "_id" in templateRef
            ? templateRef._id
            : String(templateRef);

        const templateRes = await getTemplateById(templateIdString);
        if (!templateRes.success || !templateRes.data) {
          throw new Error("No se pudo cargar la plantilla.");
        }
        setTemplateData(templateRes.data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const handleUpdate = async (data: FormInstance) => {
    if (isViewMode) return; // Bloqueo de seguridad

    try {
      const result = await updateInstance(id, data);
      if (result.success) {
        router.push("/dashboard/reports/report-iro-isop");
      } else {
        alert("Error al actualizar: " + result.error);
      }
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Ocurrió un error al guardar.");
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!instanceData || !templateData)
    return (
      <Box p={3}>
        <Alert severity="warning">Sin datos.</Alert>
      </Box>
    );

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        mb={3}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="text"
            onClick={() => router.back()}
            startIcon={<ArrowBack />}
          >
            Volver
          </Button>
          <Typography variant="h5">
            {isViewMode ? "Detalle de Inspección" : "Editar Inspección"}
          </Typography>
          {isViewMode && (
            <Chip label="Modo Lectura" icon={<Visibility />} size="small" />
          )}
        </Box>
      </Box>

      {/* Formulario */}
      <InspectionFormIroIsop
        template={templateData}
        initialData={instanceData}
        onSave={handleUpdate}
        onCancel={() => router.back()}
        isEditMode={!isViewMode} // Si es view mode, no es edit mode
        readonly={isViewMode} // 🔥 Pasamos readonly si estamos en modo ver
      />
    </Box>
  );
}
