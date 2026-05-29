"use client";

import { Button, Box, CircularProgress, Divider } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Cancel, CheckCircleOutline, PlaylistAddCheck } from "@mui/icons-material";
import type { ReactNode } from "react";

interface SaveSubmitButtonsProps {
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onSaveProgress?: () => void;
  isSubmitting: boolean;
  allowDraft: boolean;
  onFinalize?: () => void;
  isScaffoldForm?: boolean;
  isInProgress?: boolean;
  /** When set, we are in pending-approval mode: hides draft and changes the submit label/color */
  approvalAction?: "approve" | "reject" | null;
}

function StickyBar({ children }: { children: ReactNode }) {
  return (
    <Box
      className="save-submit-buttons"
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        bgcolor: "background.paper",
      }}
    >
      <Divider />
      <Box
        sx={{
          px: { xs: 0, sm: 0 },
          py: 2,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
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
  approvalAction,
}: SaveSubmitButtonsProps) {
  const isApprovalMode = approvalAction !== undefined;
  const noActionSelected = isApprovalMode && approvalAction === null;

  const submitLabel = isSubmitting
    ? "Enviando..."
    : approvalAction === "approve"
      ? "Aprobar Inspección"
      : approvalAction === "reject"
        ? "Rechazar Inspección"
        : noActionSelected
          ? "Seleccione una acción"
          : "Enviar Inspección";

  const submitColor =
    approvalAction === "approve"
      ? ("success" as const)
      : approvalAction === "reject"
        ? ("error" as const)
        : ("primary" as const);

  const submitIcon = isSubmitting ? (
    <CircularProgress size={16} color="inherit" />
  ) : approvalAction === "approve" ? (
    <CheckCircleOutline />
  ) : approvalAction === "reject" ? (
    <Cancel />
  ) : (
    <SendOutlinedIcon />
  );

  // ── CASO 1: ANDAMIO EN PROGRESO ──────────────────────────────────────────
  if (isScaffoldForm && isInProgress) {
    return (
      <StickyBar>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onSaveProgress}
            disabled={isSubmitting}
            startIcon={<SaveOutlinedIcon />}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Guardar Progreso
          </Button>
          <Button
            type="button"
            variant="contained"
            color="success"
            onClick={onFinalize}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleOutline />
              )
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isSubmitting ? "Finalizando..." : "Finalizar Inspección"}
          </Button>
        </Box>
      </StickyBar>
    );
  }

  // ── CASO 2: ANDAMIO INICIAL (con soporte para modo aprobación) ────────────
  if (isScaffoldForm && !isInProgress) {
    // En modo aprobación, mostrar solo el botón de acción
    if (isApprovalMode) {
      return (
        <StickyBar>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="button"
              variant="contained"
              color={submitColor}
              onClick={onSubmit}
              disabled={isSubmitting || noActionSelected}
              startIcon={submitIcon}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {submitLabel}
            </Button>
          </Box>
        </StickyBar>
      );
    }

    return (
      <StickyBar>
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
              type="button"
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
            type="button"
            variant="contained"
            color="primary"
            onClick={onSaveProgress}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PlaylistAddCheck />
              )
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isSubmitting ? "Guardando..." : "Guardar y Continuar Después"}
          </Button>
          <Button
            type="button"
            variant="contained"
            color="success"
            onClick={onSubmit}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleOutline />
              )
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isSubmitting ? "Enviando..." : "Enviar y Finalizar"}
          </Button>
        </Box>
      </StickyBar>
    );
  }

  // ── CASO 3: FORMULARIOS NORMALES (incluyendo modo aprobación) ────────────
  return (
    <StickyBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        {allowDraft && onSaveDraft && !isApprovalMode && (
          <Button
            type="button"
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
          type="button"
          variant="contained"
          color={submitColor}
          onClick={onSubmit}
          disabled={isSubmitting || noActionSelected}
          startIcon={submitIcon}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {submitLabel}
        </Button>
      </Box>
    </StickyBar>
  );
}
