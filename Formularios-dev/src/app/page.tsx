"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { Box, Button, Alert } from "@mui/material";
import { Typography } from "@/components/atoms/Typography";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // 🔥 La renovación automática ahora se maneja en SessionValidator

  const handleRedirect = () => {
    router.push("/dashboard");
  };

  const handleSignOut = async () => {
    const idToken = session?.idToken;
    const isInspector = session?.isInspector;

    if (isInspector) {
      // Inspector: logout simple sin redirección a Keycloak
      await signOut({ callbackUrl: "/" });
    } else if (idToken) {
      // Usuario normal: logout completo con Keycloak
      const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;
      const redirectUri = window.location.origin;

      await signOut({ redirect: false });
      window.location.href = `${keycloakLogoutUrl}?id_token_hint=${encodeURIComponent(
        idToken
      )}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
    } else {
      await signOut({ callbackUrl: "/" });
    }
  };

  const handleInspectorLogin = () => {
    signIn("inspector", { callbackUrl: "/dashboard" });
  };

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <Typography variant="h5">Cargando...</Typography>
      </div>
    );
  }

  // 🔥 Mostrar error si la sesión expiró
  if (session?.error) {
    return (
      <div className={styles.page}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Recargar Página
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {session ? (
        <Box>
          <Typography variant="h4" gutterBottom>
            Bienvenido, {session.user?.name || session.user?.email}
          </Typography>
          
          {session.isInspector && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Sesión de Inspector Técnico activa (renovación automática cada 5 minutos)
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleRedirect}
            sx={{ mr: 2 }}
          >
            Ir al Dashboard
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            Seleccione su tipo de acceso
          </Typography>

          <Button
            variant="contained"
            color="success"
            onClick={handleInspectorLogin}
            sx={{ mr: 2, mb: 2 }}
          >
            🔧 Iniciar Sesión como Inspector
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => signIn("keycloak")}
            sx={{ mr: 2, mb: 2 }}
          >
            🔑 Iniciar Sesión con Keycloak
          </Button>

          <Button variant="outlined" color="primary" onClick={handleRedirect}>
            Ir al Dashboard (sin autenticación)
          </Button>
        </Box>
      )}
    </div>
  );
}