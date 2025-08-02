"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function SessionValidator({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // ✅ Solo manejar errores de sesión - sin validaciones automáticas
  useEffect(() => {
    if (status === "authenticated") {
      // Verificar si hay error en la sesión
      if (session?.error) {
        console.log('Session error detected:', session.error);
        signOut({
          callbackUrl: '/',
          redirect: true
        });
        return;
      }

      // Verificar que tenga accessToken
      if (!session?.accessToken) {
        console.log('No access token found, signing out...');
        signOut({
          callbackUrl: '/',
          redirect: true
        });
        return;
      }
    }
  }, [session, status]);

  return <>{children}</>;
}