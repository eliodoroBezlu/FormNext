"use client";

import { use } from "react";
import { FichaBombaView } from "@/components/features/monitoreo-equipos/presentation/components/FichaBombaView";

export default function FichaBombaPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = use(params);
  return <FichaBombaView tag={decodeURIComponent(tag).toUpperCase()} />;
}
