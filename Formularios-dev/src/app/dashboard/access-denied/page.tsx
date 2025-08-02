'use client';

import { Box, Alert, Button, Card, CardContent } from "@mui/material";
import { Typography } from "@/components/atoms/Typography";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import LockIcon from "@mui/icons-material/Lock";

export default function AccessDeniedPage() {
  const router = useRouter();
  const { userRole } = useUserRole();

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: "60vh",
        gap: 3 
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="error">
            Acceso Denegado
          </Typography>
          
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            No tienes permisos para acceder a esta página.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Tu rol actual es: <strong>{userRole?.toUpperCase()}</strong>
          </Alert>
          
          <Button 
            variant="contained" 
            onClick={handleGoBack}
            size="large"
          >
            Volver al Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}