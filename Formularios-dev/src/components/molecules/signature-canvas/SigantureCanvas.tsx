"use client";

import { useRef, useState, useEffect, forwardRef } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { CheckCircle } from "@mui/icons-material";

interface DynamicSignatureCanvasProps {
  onClear: () => void;
  onSave: () => void;
  heightPercentage?: number;
  error?: boolean;
  helperText?: string;
}

const DynamicSignatureCanvas = forwardRef<
  SignatureCanvas,
  DynamicSignatureCanvasProps
>(({ onClear, onSave, heightPercentage = 100, error = false, helperText }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

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

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [heightPercentage]);

  const handleClear = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setIsSaved(false); 
    setShowWarning(false);
    onClear();
  };

  const handleSave = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      onSave();
      setShowWarning(false);
      setIsSaved(true); 
    } else {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 2500);
    }
  };

  const handleBeginStroke = () => {
    if (isSaved) {
      setIsSaved(false); 
    }
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
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
            sigCanvasRef.current = instance;
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
            style: { 
              touchAction: 'none',
              userSelect: 'none'
            }
          }}
          throttle={16}
          minWidth={0.5}
          maxWidth={2.5}
          onBegin={handleBeginStroke} 
        />
      </Box>

      {showWarning && (
        <Typography 
          variant="caption" 
          color="warning.main" 
          sx={{ mb: 2, display: 'block', textAlign: 'center', fontWeight: 'bold' }}
        >
          ⚠️ Por favor, dibuje una firma antes de guardar
        </Typography>
      )}

      {error && helperText && (
        <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      <Grid container spacing={2} justifyContent="center">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Button
            onClick={handleClear}
            variant="outlined"
            color="secondary"
            fullWidth
          >
            Limpiar Firma
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Button
            onClick={handleSave}
            variant="contained"
            fullWidth
            // ✅ Cambiar color y texto según estado
            color={isSaved ? "success" : showWarning ? "warning" : "primary"}
            startIcon={isSaved ? <CheckCircle /> : undefined}
            sx={{
              transition: 'all 0.3s ease',
              boxShadow: isSaved ? '0 0 10px rgba(46, 125, 50, 0.5)' : undefined,
            }}
          >
            {isSaved ? "✓ Firma Guardada" : "Guardar Firma"}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
});

DynamicSignatureCanvas.displayName = "DynamicSignatureCanvas";
export default DynamicSignatureCanvas;