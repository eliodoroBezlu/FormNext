"use client"

import React, { useState, useEffect } from "react"
import { Button, Typography, Box, CircularProgress, Snackbar, LinearProgress } from "@mui/material"

import type { FormData } from "../types/formTypes"
import { InspeccionPdfContent } from "./InspeccionPdfContent"
import { usePDF } from "react-to-pdf"
import { obtenerInspeccionPorId } from "@/app/actions/inspeccion"

interface InspeccionDetalleProps {
  inspeccionId: string
}

export const InspeccionDetalle: React.FC<InspeccionDetalleProps> = ({ inspeccionId }) => {
  const [inspeccion, setInspeccion] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  
  // Modificar la configuración de usePDF
  const { toPDF, targetRef } = usePDF({
    filename: `inspeccion-${inspeccionId}.pdf`,
    method: 'save',
    page: { 
      format: 'a4',
      orientation: 'portrait',
      margin: 10 
    },
    canvas: {
      // Aumentar la calidad del PDF
      //scale: 2,
      logging: true,
      useCORS: true
    }
  })

  useEffect(() => {
    const fetchInspeccion = async () => {
      try {
        const data = await obtenerInspeccionPorId(inspeccionId)
        setInspeccion(data)
      } catch (error) {
        console.error("Error al cargar la inspección:", error)
        setError("No se pudo cargar la información de la inspección.")
      } finally {
        setLoading(false)
      }
    }

    fetchInspeccion()
  }, [inspeccionId])

  const handleGenerarPdf = async () => {
    if (!inspeccion) return

    setGeneratingPdf(true)
    setError(null)
    try {
      // Asegúrate de que el contenido esté renderizado antes de generar el PDF
      await new Promise(resolve => setTimeout(resolve, 1000))
      await toPDF()
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      setError("Hubo un problema al generar el PDF. Por favor, intente nuevamente.")
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return <CircularProgress />
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  if (!inspeccion) {
    return <Typography>No se encontró la inspección</Typography>
  }

  return (
    <Box>
      {/* Contenido visible para el PDF */}
      <Box ref={targetRef} sx={{ position: 'relative', width: '210mm', margin: '0 auto' }}>
        <InspeccionPdfContent inspeccion={inspeccion} />
      </Box>

      {/* Botones y controles */}
      <Box mt={2}>
        <Button 
          onClick={handleGenerarPdf} 
          variant="contained" 
          color="primary" 
          disabled={generatingPdf}
        >
          {generatingPdf ? "Generando PDF..." : "Generar PDF"}
        </Button>
      </Box>

      {generatingPdf && (
        <Box mt={2}>
          <Typography>Generando PDF, por favor espere...</Typography>
          <LinearProgress />
        </Box>
      )}

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)} 
        message={error} 
      />
    </Box>
  )
}