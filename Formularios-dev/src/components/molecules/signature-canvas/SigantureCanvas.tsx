"use client"

import { useRef, useState, useEffect, forwardRef } from "react"
import { Box, Button } from "@mui/material"
import SignatureCanvas from "react-signature-canvas"

const DynamicSignatureCanvas = forwardRef<
  SignatureCanvas,
  { onClear: () => void; onSave: () => void; heightPercentage?: number }
>(({ onClear, onSave, heightPercentage = 100 }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height: width * (heightPercentage / 100) })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [heightPercentage])

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 2,
          width: "100%",
          height: "25%",
          mb: 2,
        }}
      >
        <SignatureCanvas
          ref={ref}
          canvasProps={{
            width: dimensions.width,
            height: dimensions.height,
            className: "sigCanvas",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button onClick={onClear} variant="outlined" color="secondary">
          Limpiar Firma
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Guardar Firma
        </Button>
      </Box>
    </div>
  )
})

DynamicSignatureCanvas.displayName = "DynamicSignatureCanvas"
export default DynamicSignatureCanvas