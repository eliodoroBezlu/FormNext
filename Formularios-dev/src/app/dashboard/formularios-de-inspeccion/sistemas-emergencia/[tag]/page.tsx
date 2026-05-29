"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { InspeccionSistemasEmergencia } from "@/components/features/sistemas-emergencia/InspeccionSistemasEmergencia";

export default function LlenarInspeccionTagPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tag = params.tag as string;
  const area = searchParams.get("area") || "";

  if (!tag) {
    return null;
  }

  return (
    <InspeccionSistemasEmergencia
      preselectedTag={tag}
      preselectedArea={area}
      onCancel={() => router.push("/dashboard/formularios-de-inspeccion/sistemas-emergencia")}
    />
  );
}
