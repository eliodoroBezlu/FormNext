"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, Snackbar, Button } from "@mui/material";

export function SessionErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      setOpen(true);

      // Limpiar el parámetro de error de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleReload = () => {
    setOpen(false);
    router.refresh();
  };

  const getErrorMessage = (errorCode: string) => {
    const messages: Record<string, { title: string; description: string }> = {
      session_expired: {
        title: "Sesión Expirada",
        description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      },
      token_expired: {
        title: "Token Expirado",
        description: "Tu token de acceso ha expirado. Por favor, inicia sesión nuevamente.",
      },
      no_session: {
        title: "Sin Sesión",
        description: "Debes iniciar sesión para acceder a esta página.",
      },
      invalid_token: {
        title: "Token Inválido",
        description: "Tu sesión es inválida. Por favor, inicia sesión nuevamente.",
      },
      unauthorized: {
        title: "Acceso Denegado",
        description: "No tienes permisos para acceder a esta página.",
      },
      default: {
        title: "Error de Autenticación",
        description: "Ha ocurrido un error con tu sesión. Por favor, intenta nuevamente.",
      },
    };

    return messages[errorCode] || messages.default;
  };

  if (!error) return null;

  const { title, description } = getErrorMessage(error);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity="error"
        variant="filled"
        sx={{ width: "100%", minWidth: 300 }}
        action={
          error === "session_expired" || error === "token_expired" ? (
            <Button color="inherit" size="small" onClick={handleReload}>
              Recargar
            </Button>
          ) : undefined
        }
      >
        <strong>{title}</strong>
        <br />
        {description}
      </Alert>
    </Snackbar>
  );
}