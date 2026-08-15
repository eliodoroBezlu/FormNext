"use client";

import { Box, Button, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ImportarMatrizView } from "@/components/features/matriz-riesgos/presentation/components/ImportarMatrizView";

export default function ImportarMatrizPage() {
  const router = useRouter();

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push("/dashboard/matriz-riesgos")}
        sx={{ mb: 2 }}
      >
        Volver al listado
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Importar matriz de riesgos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Formulario 1.02.P06.F01. El sistema recalcula la metodología y compara
        sus resultados con los del archivo antes de guardar nada.
      </Typography>

      <ImportarMatrizView />
    </Box>
  );
}
