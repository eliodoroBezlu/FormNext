"use client";

import { use } from "react";
import { Box } from "@mui/material";
import { MatrizDetailView } from "@/components/features/matriz-riesgos/presentation/components/MatrizDetailView";

export default function MatrizDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Box p={3}>
      <MatrizDetailView id={id} />
    </Box>
  );
}
