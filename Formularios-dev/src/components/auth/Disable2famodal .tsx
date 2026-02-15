// components/Disable2FAModal.tsx - Modal para desactivar 2FA con Material-UI

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
  Alert,
  AlertTitle,
  IconButton,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Disable2FAModal({ open, onClose }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.disable2FA(code);
      router.refresh();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Código inválido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Desactivar 2FA
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Header Icon */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              bgcolor: "error.light",
            }}
          >
            <WarningIcon sx={{ fontSize: 32, color: "error.main" }} />
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            Esto reducirá la seguridad de tu cuenta
          </Typography>
        </Box>

        {/* Warning Alert */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>¿Estás seguro?</AlertTitle>
          Al desactivar 2FA, tu cuenta será más vulnerable a accesos no
          autorizados.
        </Alert>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleDisable}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Box>
            <TextField
              fullWidth
              label="Código de Verificación"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.5rem",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                },
              }}
              placeholder="000000"
              autoFocus
              disabled={loading}
              helperText="Ingresa el código de 6 dígitos desde tu app"
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={loading || code.length !== 6}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Desactivar 2FA"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
