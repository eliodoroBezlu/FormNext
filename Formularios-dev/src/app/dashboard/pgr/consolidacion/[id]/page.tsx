"use client";

import { use } from "react";
import { Box } from "@mui/material";
import { PgrConsolidacionView } from "@/components/features/pgr/presentation/components/PgrConsolidacionView";

export default function PgrConsolidacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <PgrConsolidacionView pgrId={id} />
    </Box>
  );
}
