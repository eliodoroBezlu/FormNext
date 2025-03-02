"use client"

import { useParams } from "next/navigation"
import { EditarInspeccion } from "@/components/organisms/editar-inspeccion/EditarInspeccion"

export default function EditarInspeccionPage() {
  const params = useParams()
  const id = params.id as string

  return <EditarInspeccion inspeccionId={id} />
}