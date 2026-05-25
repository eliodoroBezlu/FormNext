"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { InspeccionSistemasEmergencia } from "@/components/form-sistemas-emergencia/InspeccionSistemasEmergencia";

export default function SeleccionTagPage() {
  const router = useRouter();

  const handleTagSelected = (tag: string, area: string) => {
    router.push(
      `/dashboard/formularios-de-inspeccion/sistemas-emergencia/${tag}?area=${encodeURIComponent(
        area
      )}`
    );
  };

  return (
    <InspeccionSistemasEmergencia
      onCancel={() => router.push("/dashboard/formularios-de-inspeccion")}
      onTagSelected={handleTagSelected}
    />
  );
}
