"use client";

import { Box, CircularProgress } from "@mui/material";
import { Suspense } from "react";
import { usePgrConfiguracion } from "@/components/features/pgr/application/hooks/usePgrConfiguracion";
import { PgrConfiguracionView } from "@/components/features/pgr/presentation/components/PgrConfiguracionView";

function PgrConfiguracionContent() {
  const {
    form,
    fields,
    remove,
    agregarActividad,
    estadoPlan,
    comentariosRechazo,
    areasList,
    superintendenciasList,
    isLoadingPlan,
    isPending,
    guardarBorrador,
    enviarAAprobacion,
    snackbar,
    closeSnackbar,
  } = usePgrConfiguracion();

  return (
    <PgrConfiguracionView
      form={form}
      fields={fields}
      removeActividad={remove}
      onAgregarActividad={agregarActividad}
      estadoPlan={estadoPlan}
      comentariosRechazo={comentariosRechazo}
      areasList={areasList}
      superintendenciasList={superintendenciasList}
      isLoadingPlan={isLoadingPlan}
      isPending={isPending}
      onGuardarBorrador={guardarBorrador}
      onEnviarAAprobacion={enviarAAprobacion}
      snackbar={snackbar}
      onCloseSnackbar={closeSnackbar}
    />
  );
}

export default function PgrConfiguration() {
  return (
    <Suspense
      fallback={
        <Box p={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      }
    >
      <PgrConfiguracionContent />
    </Suspense>
  );
}
