"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export function useSessionValidation() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // ✅ Solo manejar sesión si está autenticado
    if (status === "authenticated") {
      // ✅ Verificar si la sesión tiene error (token expirado, refresh falló)
      if (session?.error) {
        console.log('Session has error:', session.error, 'redirecting to login...');
        
        // Hacer logout automático si hay error en la sesión
        signOut({ 
          callbackUrl: '/',
          redirect: true 
        });
        return;
      }

      // ✅ Verificar si no hay accessToken
      if (!session?.accessToken) {
        console.log('No access token found, redirecting to login...');
        signOut({ 
          callbackUrl: '/',
          redirect: true 
        });
        return;
      }
    }
  }, [session, status]);

  // ✅ Función para validar sesión manualmente (opcional)
  const validateSession = async () => {
    if (!session?.accessToken) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/validate-session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        console.log('Manual session validation failed');
        await signOut({ callbackUrl: '/' });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      await signOut({ callbackUrl: '/' });
      return false;
    }
  };

  return { 
    session, 
    status,
    validateSession, // Función opcional para validar manualmente
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !session?.error && !!session?.accessToken
  };
}