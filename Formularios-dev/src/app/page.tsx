"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { Box, Button } from "@mui/material";
import { Typography } from "@/components/atoms/Typography";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const handleRedirect = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      signIn("keycloak");
    }
  };

  const handleSignOut = async () => {
    // Crear URL de logout de Keycloak
    const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;
    const redirectUri = `${window.location.origin}`;
    
    // Primero cerrar sesión local
    await signOut({
      redirect: false, // No redirigir automáticamente
    });
    
    // Luego redirigir a Keycloak para logout completo
    window.location.href = `${keycloakLogoutUrl}?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  return (
    <div className={styles.page}>
      {session ? (
        <Box>
          <Typography variant="h4" gutterBottom>
            Bienvenido, {session.user?.name || session.user?.email}
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleRedirect}
            sx={{ mr: 2 }}
          >
            Ir al Dashboard
          </Button>
          <Button 
            variant="outlined"
            color="secondary"
            onClick={handleSignOut}
          >
            Cerrar Sesión
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            Haga click para iniciar sesión
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => signIn("keycloak")}
          >
            Iniciar Sesión con Keycloak
          </Button>
        </Box>
      )}
    </div>
  );
}