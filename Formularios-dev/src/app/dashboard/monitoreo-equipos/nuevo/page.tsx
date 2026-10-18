"use client";

import { use } from "react";
import { ReporteMonitoreoView } from "@/components/features/monitoreo-equipos/presentation/components/ReporteMonitoreoView";

/** `?tag=230PP013` llega desde la ficha de la bomba: el reporte nace con ella elegida. */
export default function NuevoReporteMonitoreoPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = use(searchParams);
  return <ReporteMonitoreoView tagInicial={tag?.toUpperCase()} />;
}
