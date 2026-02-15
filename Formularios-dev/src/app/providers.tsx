
// // app/providers.tsx
// "use client";

// import { SessionProvider } from "next-auth/react";
// import { SessionValidator } from "@/components/SessionValidator";

// export function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <SessionProvider
//       // Refrescar la sesión cada 5 minutos
//       refetchInterval={4*60} // Desactivar refetch automático
//       refetchOnWindowFocus={true} // No refetch al hacer focus en ventana
//       refetchWhenOffline={false}
//       basePath="/api/auth"
//     >
//       <SessionValidator>
//         {children}
//       </SessionValidator>
//     </SessionProvider>
//   );
// }
import React from 'react'

export default function providers() {
  return (
    <div>providers</div>
  )
}
