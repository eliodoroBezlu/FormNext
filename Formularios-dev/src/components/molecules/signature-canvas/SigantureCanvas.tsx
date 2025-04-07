"use client";

import { useRef, useState, useEffect, forwardRef } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";

// Interfaz para las opciones del contexto 2D
interface CanvasRenderingContext2DSettings {
  willReadFrequently?: boolean;
}

interface DynamicSignatureCanvasProps {
  onClear: () => void;
  onSave: () => void;
  heightPercentage?: number;
  error?: boolean;
  helperText?: string;
}

const DynamicSignatureCanvas = forwardRef<
  SignatureCanvas, // Usamos el tipo implícito del componente SignatureCanvas
  DynamicSignatureCanvasProps
>(({ onClear, onSave, heightPercentage = 100, error = false, helperText }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Referencia al componente SignatureCanvas
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  // Actualiza las dimensiones del canvas cuando cambia el tamaño de la ventana o el porcentaje de altura
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height: width * (heightPercentage / 100),
        });
      }
    };

    updateDimensions(); // Calcula las dimensiones iniciales
    window.addEventListener("resize", updateDimensions); // Escucha cambios en el tamaño de la ventana
    return () => window.removeEventListener("resize", updateDimensions); // Limpia el listener
  }, [heightPercentage]);

  // Configura willReadFrequently después de que el canvas se haya inicializado
  useEffect(() => {
    if (sigCanvasRef.current) {
      const canvas = sigCanvasRef.current.getCanvas();

      // Guardar una referencia al método original de getContext
      const originalGetContext = canvas.getContext;

      // Sobrescribir getContext para incluir willReadFrequently
      Object.defineProperty(canvas, "getContext", {
        value: (
          contextId: string,
          options?: CanvasRenderingContext2DSettings
        ) => {
          if (contextId === "2d") {
            // Llamar al método original con las opciones modificadas
            return originalGetContext.call(canvas, contextId, {
              ...options,
              willReadFrequently: true,
            });
          }
          // Para otros contextos, simplemente llamamos al método original
          return originalGetContext.call(canvas, contextId, options);
        },
        configurable: true,
      });
    }
  }, [sigCanvasRef]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {/* Contenedor del canvas */}
      <Box
        sx={{
          border: error ? "1px solid #d32f2f" : "1px solid #ccc",
          borderRadius: 2,
          width: "100%",
          height: "25%",
          mb: 2,
        }}
      >
        <SignatureCanvas
          ref={(instance) => {
            sigCanvasRef.current = instance; // Guarda la referencia al canvas
            if (typeof ref === "function") {
              ref(instance);
            } else if (ref) {
              ref.current = instance;
            }
          }}
          canvasProps={{
            width: dimensions.width,
            height: dimensions.height,
            className: "sigCanvas",
          }}
        />
      </Box>

      {/* Mensaje de error */}
      {error && helperText && (
        <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Botones para limpiar y guardar la firma */}
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Button
            onClick={onClear}
            variant="outlined"
            color="secondary"
            fullWidth
          >
            Limpiar Firma
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            onClick={onSave}
            variant="contained"
            color="primary"
            fullWidth
          >
            Guardar Firma
          </Button>
        </Grid>
      </Grid>
    </div>
  );
});

DynamicSignatureCanvas.displayName = "DynamicSignatureCanvas";
export default DynamicSignatureCanvas;