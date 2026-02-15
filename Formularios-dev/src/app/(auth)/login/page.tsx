// app/(auth)/login/page.tsx - Página de Login con Material-UI
''
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { Box, Container,  Grid } from '@mui/material';

import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Mi Aplicación',
  description: 'Accede a tu cuenta',
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');
  const refreshToken = cookieStore.get('refresh_token');

  // Simple check: el middleware ya manejó el refresh
 if (accessToken || refreshToken) {
  // Si tienes CUALQUIERA de los dos → Redirigir a dashboard
  redirect('/dashboard');
}

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Columna Izquierda - Información */}
          

          {/* Columna Derecha - Formulario */}
          <Grid size={{ xs: 12, lg: 12 }}>
            <LoginForm />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}