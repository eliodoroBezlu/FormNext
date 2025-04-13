"use client"

import { useState, useEffect } from "react"
import { Box, CircularProgress, Typography, Paper } from "@mui/material"
import { useRouter } from "next/navigation"
import type { FormData, FormDataExport } from "@/types/formTypes"
import { InspectionForm } from "@/components/organisms/inspection-form/InspectionForm"
import { useForm } from "react-hook-form"
import { actualizarInspeccion, obtenerInspeccionPorId } from "@/app/actions/inspeccion"

interface EditarInspeccionProps {
  inspeccionId: string
}

export const EditarInspeccion = ({ inspeccionId }: EditarInspeccionProps) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentId, setCurrentId] = useState<string>("")
  const router = useRouter()
  const form = useForm<FormData>()
  useEffect(() => {
    const cargarInspeccion = async () => {
      try {
        // Explícitamente tipamos la respuesta como FormDataExport
        const response = await obtenerInspeccionPorId(inspeccionId)
        const data = response as FormDataExport

        // Ahora TypeScript reconoce _id
        setCurrentId(data._id)

        // Extraemos los datos del formulario omitiendo _id
        const {...formData } = data
        form.reset(formData)
      } catch (error) {
        console.error("Error al cargar la inspección:", error)
        setError("No se pudo cargar la información de la inspección.")
      } finally {
        setLoading(false)
      }
    }

    cargarInspeccion()
  }, [inspeccionId, form])

  const handleSubmit = async (data: FormData) => {
    if (!currentId) return

    setIsSubmitting(true)
    try {
      await actualizarInspeccion(currentId, data)
      router.push("/dashboard/inspecciones")
    } catch (error) {
      console.error("Error al actualizar la inspección:", error)
      setError("No se pudo actualizar la inspección.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Editar Inspección #{inspeccionId}
      </Typography>
      <InspectionForm
        control={form.control}
        onSubmit={form.handleSubmit(handleSubmit)}
        titles={form.getValues("resultados") || []}
        setValue={form.setValue}
        documentCode={form.getValues("documentCode")}
        revisionNumber={form.getValues("revisionNumber")}
        isSubmitting={isSubmitting}
        mode="edit"
      />
    </Paper>
  )
}

