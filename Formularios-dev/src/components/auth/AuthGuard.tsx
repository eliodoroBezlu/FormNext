'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Rutas que no necesitan protección (por si acaso se usa fuera del layout protegido)
  const publicRoutes = ['/login', '/register'];

  useEffect(() => {
    if (publicRoutes.includes(pathname)) {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        // Llamamos a nuestra propia API. El navegador enviará las cookies automáticamente.
        const res = await fetch('/api/auth/session');
        
        if (res.ok) {
          setIsAuthorized(true);
        } else {
          // Si responde 401, el refresh falló o no hay sesión.
          setIsAuthorized(false);
          router.push('/login'); // Redirigir al login
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setIsAuthorized(false);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Verificando sesión...</Typography>
      </Box>
    );
  }

  // Si no está autorizado, no renderizamos nada (el router.push ya se ejecutó)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}