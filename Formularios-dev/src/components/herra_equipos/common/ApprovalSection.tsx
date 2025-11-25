// components/herra_equipos/common/ApprovalSection.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Pending,
  Warning,
} from "@mui/icons-material";

interface ApprovalSectionProps {
  status: "draft" | "in_progress" | "pending_approval" | "approved" | "rejected" | "completed";
  approval?: {
    status: "pending" | "approved" | "rejected";
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    supervisorComments?: string;
  };
  canApprove: boolean;
  onApprove: (comments?: string) => void;
  onReject: (reason: string) => void;
  readonly?: boolean;
}

export function ApprovalSection({
  status,
  approval,
  canApprove,
  onApprove,
  onReject,
  readonly = false,
}: ApprovalSectionProps) {
  const [comments, setComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const getStatusInfo = () => {
    switch (status) {
      case "pending_approval":
        return {
          icon: <Pending sx={{ fontSize: 40, color: "warning.main" }} />,
          text: "Pendiente de Aprobación",
          color: "warning" as const,
        };
      case "approved":
        return {
          icon: <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />,
          text: "Aprobado",
          color: "success" as const,
        };
      case "rejected":
        return {
          icon: <Cancel sx={{ fontSize: 40, color: "error.main" }} />,
          text: "Rechazado",
          color: "error" as const,
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo) return null;

  const handleApprove = () => {
    onApprove(comments || undefined);
    setComments("");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Debe proporcionar una razón para el rechazo");
      return;
    }
    onReject(rejectionReason);
    setRejectionReason("");
    setShowRejectForm(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, bgcolor: "background.paper" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        {statusInfo.icon}
        <Box>
          <Typography variant="h5" gutterBottom>
            Estado de Aprobación
          </Typography>
          <Chip label={statusInfo.text} color={statusInfo.color} />
        </Box>
      </Box>

      {/* Información de aprobación existente */}
      {approval && (
        <Box sx={{ mb: 3 }}>
          {approval.approvedBy && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Aprobado por:</strong> {approval.approvedBy}
            </Typography>
          )}
          {approval.approvedAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Fecha:</strong>{" "}
              {new Date(approval.approvedAt).toLocaleString("es-ES")}
            </Typography>
          )}
          {approval.supervisorComments && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Comentarios:</strong> {approval.supervisorComments}
              </Typography>
            </Alert>
          )}
          {approval.rejectionReason && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Motivo de rechazo:</strong> {approval.rejectionReason}
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Controles de aprobación (solo si puede aprobar y está pendiente) */}
      {canApprove && status === "pending_approval" && !readonly && (
        <Box>
          {!showRejectForm ? (
            <>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comentarios (Opcional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ingrese observaciones o comentarios sobre la inspección..."
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={handleApprove}
                  fullWidth
                >
                  Aprobar Inspección
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => setShowRejectForm(true)}
                  fullWidth
                >
                  Rechazar
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                Está a punto de rechazar esta inspección. Debe proporcionar una
                razón clara.
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Motivo del Rechazo *"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Especifique claramente por qué se rechaza esta inspección..."
                required
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleReject}
                  fullWidth
                >
                  Confirmar Rechazo
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                  }}
                  fullWidth
                >
                  Cancelar
                </Button>
              </Stack>
            </>
          )}
        </Box>
      )}

      {/* Mensaje informativo */}
      {!canApprove && status === "pending_approval" && (
        <Alert severity="info">
          Esta inspección está pendiente de aprobación por un supervisor.
        </Alert>
      )}
    </Paper>
  );
}