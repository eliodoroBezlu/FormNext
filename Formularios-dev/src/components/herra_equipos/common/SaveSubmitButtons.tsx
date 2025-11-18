"use client";

import { Button, Box } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { CheckCircleOutline, PlaylistAddCheck } from "@mui/icons-material";

interface SaveSubmitButtonsProps {
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onSaveProgress?: () => void;
  isSubmitting: boolean;
  allowDraft: boolean;
  onFinalize?: () => void;
  isScaffoldForm?: boolean; // ✅ NUEVO: Detectar si es andamio
  isInProgress?: boolean; // ✅ NUEVO: Detectar si está en progreso
}

export function SaveSubmitButtons({
  onSaveDraft,
  onSubmit,
  onSaveProgress,
  onFinalize,
  isSubmitting,
  allowDraft,
  isScaffoldForm = false,
  isInProgress = false,
}: SaveSubmitButtonsProps) {
  
  // ============================================
  // CASO 1: FORMULARIO DE ANDAMIO EN PROGRESO
  // ============================================
  if (isScaffoldForm && isInProgress) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        {/* Botón: Guardar progreso rutinarias */}
        <Button
          variant="outlined"
          onClick={onSaveProgress}
          disabled={isSubmitting}
          startIcon={<SaveOutlinedIcon />}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Guardar Progreso
        </Button>

        {/* Botón: Finalizar inspección */}
        <Button
          variant="contained"
          color="success"
          onClick={onFinalize}
          disabled={isSubmitting}
          startIcon={<CheckCircleOutline />}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {isSubmitting ? "Finalizando..." : "Finalizar Inspección"}
        </Button>
      </Box>
    );
  }

  // ============================================
  // CASO 2: FORMULARIO DE ANDAMIO INICIAL
  // ============================================
  if (isScaffoldForm && !isInProgress) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        {/* Botón: Borrador (opcional) */}
        {allowDraft && onSaveDraft && (
          <Button
            variant="outlined"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            startIcon={<SaveOutlinedIcon />}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Guardar Borrador
          </Button>
        )}

        {/* Botón: Guardar y continuar (en progreso) */}
        <Button
          variant="contained"
          color="primary"
          onClick={onSaveProgress}
          disabled={isSubmitting}
          startIcon={<PlaylistAddCheck />}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {isSubmitting ? "Guardando..." : "Guardar y Continuar Después"}
        </Button>

        {/* Botón: Enviar y finalizar (si no habrá rutinarias) */}
        <Button
          variant="contained"
          color="success"
          onClick={onSubmit}
          disabled={isSubmitting}
          startIcon={<CheckCircleOutline />}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {isSubmitting ? "Enviando..." : "Enviar y Finalizar"}
        </Button>
      </Box>
    );
  }

  // ============================================
  // CASO 3: FORMULARIOS NORMALES
  // ============================================
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        justifyContent: "flex-end",
      }}
    >
      {allowDraft && onSaveDraft && (
        <Button
          variant="outlined"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          startIcon={<SaveOutlinedIcon />}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Guardar Borrador
        </Button>
      )}

      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={isSubmitting}
        startIcon={<SendOutlinedIcon />}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        {isSubmitting ? "Enviando..." : "Enviar Inspección"}
      </Button>
    </Box>
  );
}
