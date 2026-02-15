// app/(auth)/register/page.tsx - Página de Registro con Material-UI

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import { Box, Container, Typography,  Grid, Card, CardContent } from '@mui/material';
import { 
  Lock as LockIcon,
  FlashOn as FlashOnIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { getServerUser } from '@/lib/auth/server';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Registro | Mi Aplicación',
  description: 'Crea una cuenta nueva',
};



export default async function RegisterPage() {
  const user = await getServerUser();

  if (user) {
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
          <Grid size={{ xs: 12, lg: 6 }}sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box sx={{ color: 'white' }}>
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                Únete a nuestra
              </Typography>
              <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ 
                background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                comunidad
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Crea tu cuenta y accede a todas las funcionalidades con la máxima seguridad.
              </Typography>
              
              {/* Features Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card 
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <LockIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
                        Seguridad Avanzada
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Autenticación de dos factores para proteger tu cuenta
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card 
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FlashOnIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
                        Acceso Rápido
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Inicio de sesión simplificado y eficiente
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card 
                  sx={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ShieldIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
                        Privacidad Garantizada
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Tus datos están encriptados y protegidos
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Grid>

          {/* Columna Derecha - Formulario */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <RegisterForm />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}