"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Box, CircularProgress } from "@mui/material";
import { InspectionFormIroIsop } from "@/components/features/iro-isop/InspectionFormIroIsop";
import { SuccessScreen } from "@/components/ui/feedback/SuccessScreen";
import { Button } from "@/components/ui/buttons/Button";
import { getTemplateByCode } from "@/lib/actions/template-actions";
import type { FormInstance, FormTemplate } from "@/types/formTypes";
import { LISTADO_DE_IRO as LISTADO } from "@/components/features/iro-isop/domain/models/rutas";

/**
 * Un formulario IRO/ISOP con su propia dirección
 * (`…/formularios-de-inspeccion/iro-isop/1.02.P06.F48`).
 *
 * Antes el listado lo abría guardando la plantilla en memoria: al recargar se
 * volvía al listado y la flecha «atrás» del navegador salía de la página.
 * Ahora recargar deja el mismo formulario (vacío: lo que no se guardó se
 * pierde, por eso existe «Guardar avance») y «atrás» vuelve al listado.
 *
 * Abre la revisión vigente del código. Una inspección ya guardada se sigue
 * abriendo por su `templateId` desde «Editar»/«Seguir», nunca por aquí.
 */
export default function FormularioIroIsopPage() {
  const { code } = useParams<{ code: string }>();
  const codigo = decodeURIComponent(code);
  const router = useRouter();

  const [plantilla, setPlantilla] = useState<FormTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardada, setGuardada] = useState<FormInstance | null>(null);

  useEffect(() => {
    let vigente = true;
    getTemplateByCode(codigo)
      .then((resultado) => {
        if (!vigente) return;
        if (resultado.success && resultado.data) setPlantilla(resultado.data);
        else setError(resultado.error || "No se encontró el formulario");
      })
      .catch((err: unknown) => {
        if (vigente) {
          setError(err instanceof Error ? err.message : "No se encontró el formulario");
        }
      });
    return () => {
      vigente = false;
    };
  }, [codigo]);

  if (guardada) {
    const enAvance = guardada.status === "borrador";
    return (
      <SuccessScreen
        title={enAvance ? "Avance guardado" : "¡IRO terminada!"}
        subtitle={
          enAvance
            ? `«${plantilla?.name}» quedó en borrador. Para seguirla: Mis inspecciones → IRO-ISOP → «Seguir».`
            : `Se registró «${plantilla?.name}» y se generó su plan de acción (o su «sin observaciones»).`
        }
        autoRedirect={true}
        redirectDelay={3000}
        onBackToList={() => router.push(LISTADO)}
        onViewDetails={() => router.push(LISTADO)}
        redirectPath={LISTADO}
      />
    );
  }

  if (error) {
    return (
      <Box p={3} display="flex" flexDirection="column" gap={2} alignItems="flex-start">
        <Alert severity="error">
          {error}. Revisa que el código «{codigo}» sea de un formulario vigente.
        </Alert>
        <Button type="button" variant="outlined" onClick={() => router.push(LISTADO)}>
          Volver a los formularios
        </Button>
      </Box>
    );
  }

  if (!plantilla) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <InspectionFormIroIsop
      template={plantilla}
      onSave={setGuardada}
      onCancel={() => router.push(LISTADO)}
    />
  );
}
