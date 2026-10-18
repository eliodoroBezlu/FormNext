"use client";

import { ListaReportes } from "@/components/features/monitoreo-equipos/presentation/components/ListaReportes";

/** Monitoreo de equipos (2.03.P01.R09). La ruta exige el rol exacto: ver `routePermissions`. */
export default function MonitoreoEquiposPage() {
  return <ListaReportes />;
}
