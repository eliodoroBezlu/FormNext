"use client";

import { Box } from "@mui/material";
import { MatrizListView } from "@/components/features/matriz-riesgos/presentation/components/MatrizListView";

export default function MatricesDeRiesgoPage() {
  return (
    <Box p={3}>
      <MatrizListView />
    </Box>
  );
}
