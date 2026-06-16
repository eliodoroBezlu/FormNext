// components/herra_equipos/common/ApprovalSection.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Pending,
  Warning,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from "@mui/icons-material";

interface ApprovalSectionProps {
  status:
    | "draft"
    | "in_progress"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "completed";
  approval?: {
    status: "pending" | "approved" | "rejected";
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    supervisorComments?: string;
  };
  canApprove: boolean;
  onApprove: (comments?: string | null) => void;
  onReject: (reason: string | null) => void;
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
  const [rejectionReasonError, setRejectionReasonError] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionSelection, setActionSelection] = useState<
    "none" | "approve" | "reject"
  >("none");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case "pending_approval":
        return {
          icon: <Pending sx={{ fontSize: 40, color: "warning.main" }} />,
          text: "Pendiente de Aprobación",
          color: "warning" as const,
          description: "Esta inspección está esperando revisión del supervisor",
        };
      case "approved":
        return {
          icon: <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />,
          text: "Aprobado",
          color: "success" as const,
          description: "Esta inspección ha sido aprobada por el supervisor",
        };
      case "rejected":
        return {
          icon: <Cancel sx={{ fontSize: 40, color: "error.main" }} />,
          text: "Rechazado",
          color: "error" as const,
          description: "Esta inspección fue rechazada y requiere correcciones",
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo) return null;

  // ✅ NUEVO: Manejador para el texto de comentarios
  // Si ya está marcado como aprobar, actualizamos al padre en tiempo real
  const handleCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setComments(val);

    if (actionSelection === "approve") {
      // Si ya tiene el check puesto, actualizamos la decisión del padre live
      // para que no se envíe vacío si edita después de marcar.
      onApprove(val || undefined);
    }
  };

  const handleApproveCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setActionSelection("approve");

      if (timerRef.current) clearTimeout(timerRef.current);

      // Pequeño delay para la sensación de UI, pero enviamos el valor ACTUAL de 'comments'
      timerRef.current = setTimeout(() => {
        onApprove(comments || undefined);
        // ❌ ELIMINADO: setComments(""); -> ¡Esto era lo que causaba el error!
      }, 500);
    } else {
      setActionSelection("none");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onApprove(null);
    }
  };

  const handleRejectCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setActionSelection("reject");
      setShowRejectForm(true);
    } else {
      setActionSelection("none");
      setShowRejectForm(false);
      onReject(null);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      setRejectionReasonError("Debe proporcionar una razón para el rechazo");
      return;
    }
    setRejectionReasonError("");
    onReject(rejectionReason);
    setRejectionReason("");
    setShowRejectForm(false);
    setActionSelection("reject"); // mantiene el checkbox marcado como confirmación visual
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectionReason("");
    setRejectionReasonError("");
    setActionSelection("none");
    onReject(null);
  };

  const isFinalized = status === "approved" || status === "rejected";
  const isLocked = readonly || isFinalized;

  return (
    <Paper
      className="approval-section-container"
      elevation={3}
      sx={{
        p: 3,
        bgcolor: "background.paper",
        border: isFinalized ? 2 : 1,
        borderColor: isFinalized
          ? status === "approved"
            ? "success.main"
            : "error.main"
          : "divider",
      }}
    >
      {/* Header con estado */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        {statusInfo.icon}
        <Box sx={{ flexGrow: 1 }}>
          <Chip
            label={statusInfo.text}
            color={statusInfo.color}
            size="medium"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusInfo.description}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* MODO SOLO LECTURA */}
      {isFinalized && approval && (
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={true}
                disabled
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={
                  status === "approved" ? (
                    <CheckBoxIcon sx={{ color: "success.main" }} />
                  ) : (
                    <Cancel sx={{ color: "error.main" }} />
                  )
                }
              />
            }
            label={
              <Typography variant="h6">
                {status === "approved"
                  ? "✅ Inspección Aprobada"
                  : "❌ Inspección Rechazada"}
              </Typography>
            }
          />
          <Box sx={{ ml: 4, mt: 2, p: 2, bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50', borderRadius: 1 }}>
            {approval.approvedBy && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>
                  {status === "approved" ? "Aprobado por:" : "Rechazado por:"}
                </strong>{" "}
                {approval.approvedBy}
              </Typography>
            )}
            {approval.approvedAt && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha:</strong>{" "}
                {new Date(approval.approvedAt).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            )}
            {approval.supervisorComments && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Comentarios del supervisor:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {approval.supervisorComments}
                </Typography>
              </Alert>
            )}
            {approval.rejectionReason && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Motivo del rechazo:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {approval.rejectionReason}
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>
      )}

      {/* MODO ACCIÓN */}
      {canApprove &&
        status === "pending_approval" &&
        !isFinalized &&
        !readonly && (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Esta inspección requiere su revisión y aprobación.
              </Typography>
            </Alert>

            {!showRejectForm ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comentarios del Supervisor (Opcional)"
                  value={comments}
                  onChange={handleCommentsChange} // ✅ USAMOS EL NUEVO HANDLER
                  sx={{ mb: 2 }}
                  disabled={isLocked}
                  placeholder="Ingrese observaciones o comentarios sobre la inspección..."
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 2,
                    pl: 1,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Seleccione una acción:
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={actionSelection === "approve"}
                        onChange={handleApproveCheck}
                        disabled={isLocked || actionSelection === "reject"}
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={
                          <CheckCircle sx={{ color: "success.main" }} />
                        }
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "success.main" }}
                      >
                        Aprobar Inspección
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={actionSelection === "reject"}
                        onChange={handleRejectCheck}
                        disabled={isLocked}
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<Cancel sx={{ color: "error.main" }} />}
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "error.main" }}
                      >
                        Rechazar Inspección
                      </Typography>
                    }
                  />
                </Box>
              </>
            ) : (
              <>
                <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Ha seleccionado rechazar esta inspección. Debe proporcionar
                    una razón clara.
                  </Typography>
                </Alert>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Motivo del Rechazo *"
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (e.target.value.trim()) setRejectionReasonError("");
                  }}
                  sx={{ mb: 2 }}
                  required
                  error={
                    !!rejectionReasonError ||
                    rejectionReason.trim().length === 0
                  }
                  helperText={
                    rejectionReasonError ||
                    (rejectionReason.trim().length === 0
                      ? "Este campo es obligatorio"
                      : `${rejectionReason.length} caracteres`)
                  }
                  inputProps={{ "aria-required": "true" }}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleConfirmReject}
                    fullWidth
                    disabled={rejectionReason.trim().length === 0}
                  >
                    Confirmar Rechazo
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelReject}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        )}

      {/* MODO INFO SIN PERMISOS */}
      {!canApprove && status === "pending_approval" && !isFinalized && (
        <Box>
          <Alert severity="info" icon={<Pending />}>
            <Typography variant="body2">
              <strong>
                Esta inspección está pendiente de aprobación por un supervisor.
              </strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Solo usuarios con permisos de supervisor pueden aprobar o rechazar
              esta inspección.
            </Typography>
          </Alert>
          {approval?.supervisorComments && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Comentarios previos:</strong>{" "}
                {approval.supervisorComments}
              </Typography>
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}
