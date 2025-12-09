"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress, Alert, Chip, Typography } from "@mui/material";
import {  Visibility, Edit } from "@mui/icons-material";

import { InspeccionSistemasEmergencia } from "@/components/form-sistemas-emergencia/InspeccionSistemasEmergencia";
import { 
  obtenerInspeccionEmergenciaPorId, 
  actualizarMesPorTag 
} from "@/app/actions/inspeccion";
import { FormularioInspeccion } from "@/types/formTypes";

export default function EditarInspeccionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = params.id as string;
  const isViewMode = searchParams.get("mode") === "view"; 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<FormularioInspeccion | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Ahora esto es rápido y trae solo un registro
        const data = await obtenerInspeccionEmergenciaPorId(id);
        setInitialData(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la inspección. Puede que no exista o no tengas permisos.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const handleUpdate = async (idInstancia: string, data: FormularioInspeccion) => {
    if (isViewMode) return;

    try {
      // Tu lógica de actualización por TAG
      await actualizarMesPorTag(
        data.tag,
        data.mesActual,
        data.meses[data.mesActual],
        data.area
      );
      // Volver a la lista
      router.push("/dashboard/formularios-de-inspeccion"); 
    } catch (error) {
      console.error("Error actualizando:", error);
      throw error;
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  if (!initialData) return <Box p={3}><Alert severity="warning">No se encontraron datos.</Alert></Box>;

  return (
    <Box p={3}>
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        {isViewMode ? 
            <Chip label="Modo Lectura" icon={<Visibility />} color="default" /> : 
            <Chip label="Modo Edición" icon={<Edit />} color="primary" />
        }
        <Typography variant="body2" color="text.secondary">
            TAG: {initialData.tag} | ID: {id}
        </Typography>
      </Box>

      <InspeccionSistemasEmergencia
        onCancel={() => router.back()}
        initialData={initialData}
        isEditMode={!isViewMode}
        readonly={isViewMode}
        idInstancia={id}
        onSaveUpdate={handleUpdate}
      />
    </Box>
  );
}