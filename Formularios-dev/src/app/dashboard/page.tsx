
'use client'
import { Box, Grid, Card, CardContent, Alert } from "@mui/material";
import { Typography } from "@/components/atoms/Typography";
import { useUserRole } from "@/hooks/useUserRole";
import { useSession } from "next-auth/react";

export default function DashboardHome() {
  const { data: session } = useSession();
  const { userRole, hasRole } = useUserRole();

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'admin':
        return 'Panel de Administrador - Gestión completa del sistema';
      case 'supervisor':
        return 'Panel de Supervisor ';
      case 'tecnico':
        return 'Panel de Operador - Formularios de inspección y mantenimiento';
      case 'viewer':
        return 'Panel de Visualización - Solo lectura';
      case 'superintendente':
        return 'Panel de Superintendente - Supervisión general del sistema';
      default:
        return 'Bienvenido al Dashboard';
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido, {session?.user?.name || session?.user?.email}
      </Typography>
      
      <Alert severity="info">
        {getWelcomeMessage()}
      </Alert>

      <Grid container spacing={3}>
        {hasRole('tecnico') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Formularios de Inspección
                </Typography>
                <Typography variant="body2">
                  Accede a los formularios de inspección de herramientas, equipos y sistemas de emergencia.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hasRole('supervisor') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reportes y Analytics
                </Typography>
                <Typography variant="body2">
                  Visualiza reportes y análisis de las inspecciones realizadas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hasRole('admin') && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Administración del Sistema
                </Typography>
                <Typography variant="body2">
                  Configuración avanzada y gestión completa del sistema.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Sistema
              </Typography>
              <Typography variant="body2">
                Tu rol actual: <strong>{userRole?.toUpperCase()}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
