"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { InspeccionSistemasEmergencia } from "@/components/features/sistemas-emergencia/InspeccionSistemasEmergencia";
import { type ExtintorBackend } from "@/types/formTypes";

export default function SeleccionTagPage() {
  const router = useRouter();

  const handleTagSelected = (tag: string, area: string, extintoresSeleccionados?: ExtintorBackend[]) => {
    const query = new URLSearchParams();
    query.set("area", area);
    if (extintoresSeleccionados && extintoresSeleccionados.length > 0) {
      const codigos = extintoresSeleccionados.map(e => e.CodigoExtintor).join(",");
      query.set("extintores", codigos);
    }
    router.push(
      `/dashboard/formularios-de-inspeccion/sistemas-emergencia/${tag}?${query.toString()}`
    );
  };

  return (
    <InspeccionSistemasEmergencia
      onCancel={() => router.push("/dashboard/formularios-de-inspeccion")}
      onTagSelected={handleTagSelected}
    />
  );
}
