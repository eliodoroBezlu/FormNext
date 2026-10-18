"use client";

import { use } from "react";
import { ReporteMonitoreoView } from "@/components/features/monitoreo-equipos/presentation/components/ReporteMonitoreoView";

export default function ReporteMonitoreoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ReporteMonitoreoView id={id} />;
}
