"use client";

import { useRef, useState, useEffect, forwardRef } from "react";
import { Box, Button } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";

// Interfaz para las opciones del contexto 2D
interface CanvasRenderingContext2DSettings {
  willReadFrequently?: boolean;
}

interface DynamicSignatureCanvasProps {
  onClear: () => void;
  onSave: () => void;
  heightPercentage?: number;
}

const DynamicSignatureCanvas = forwardRef<
  SignatureCanvas, // Usamos el tipo implícito del componente SignatureCanvas
  DynamicSignatureCanvasProps
>(({ onClear, onSave, heightPercentage = 100 }, ref) => {
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
      const ctx = canvas.getContext("2d");
      if (ctx) {
        Object.defineProperty(canvas, "getContext", {
          value: (
            contextId: string,
            options?: CanvasRenderingContext2DSettings
          ) => {
            if (contextId === "2d") {
              return canvas.getContext(contextId, { ...options, willReadFrequently: true });
            }
            return canvas.getContext(contextId, options);
          },
          configurable: true,
        });
      }
    }
  }, [sigCanvasRef]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {/* Contenedor del canvas */}
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

      {/* Botones para limpiar y guardar la firma */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button onClick={onClear} variant="outlined" color="secondary">
          Limpiar Firma
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Guardar Firma
        </Button>
      </Box>
    </div>
  );
});

DynamicSignatureCanvas.displayName = "DynamicSignatureCanvas";
export default DynamicSignatureCanvas;