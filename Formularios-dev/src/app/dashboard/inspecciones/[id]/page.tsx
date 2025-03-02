"use client"

import { useParams } from "next/navigation"
import { InspeccionDetalle } from "@/components/InspeccionDetalle"

export default function DetalleInspeccionPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div>
      <InspeccionDetalle inspeccionId={id} />
    </div>
  )
}
