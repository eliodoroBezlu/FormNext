
// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { SessionValidator } from "@/components/SessionValidator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Refrescar la sesión cada 5 minutos
      refetchInterval={0} // Desactivar refetch automático
      refetchOnWindowFocus={true} // No refetch al hacer focus en ventana
      refetchWhenOffline={false}
    >
      <SessionValidator>
        {children}
      </SessionValidator>
    </SessionProvider>
  );
}