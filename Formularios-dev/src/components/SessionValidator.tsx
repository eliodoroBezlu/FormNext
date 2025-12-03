// "use client";
// import { useSession, signOut } from "next-auth/react";
// import { useEffect, useRef } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { isProtectedRoute } from "@/lib/routeConfig";

// interface SessionValidatorProps {
//   children: React.ReactNode;
// }

// export function SessionValidator({ children }: SessionValidatorProps) {
//   const { data: session, status, update } = useSession();
//   const router = useRouter();
//   const pathname = usePathname();
//   const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const hasInitialized = useRef(false);

//   // 🔥 1. MANEJO DE ERRORES DE SESIÓN
//   useEffect(() => {
//     if (status === "authenticated") {
//       if (session?.error) {
//         console.error("❌ Error en sesión:", session.error);
//         signOut({
//           callbackUrl: "/?error=session_expired",
//           redirect: true,
//         });
//         return;
//       }

//       if (!session?.accessToken) {
//         console.error("❌ No access token");
//         signOut({
//           callbackUrl: "/?error=invalid_token",
//           redirect: true,
//         });
//         return;
//       }
//     }
//   }, [session?.error, session?.accessToken, status]);

//   // 🔥 2. RENOVACIÓN SOLO PARA INSPECTORES
//   // Con tokens de 4h en Keycloak, solo los inspectores necesitan renovación frecuente
//   useEffect(() => {
//     if (updateIntervalRef.current) {
//       clearInterval(updateIntervalRef.current);
//       updateIntervalRef.current = null;
//     }

//     if (
//       status === "authenticated" &&
//       session?.isInspector &&
//       !session?.error &&
//       session?.accessToken
//     ) {
//       if (!hasInitialized.current) {
//         console.log("🔧 Sistema de renovación para inspector activado");
//         hasInitialized.current = true;
//       }

//       const checkAndUpdate = async () => {
//         try {
//           const payload = JSON.parse(atob(session.accessToken!.split(".")[1]));
//           const expiresAt = payload.exp * 1000;
//           const timeLeft = expiresAt - Date.now();
          
//           // Renovar si quedan menos de 10 minutos
//           if (timeLeft < 10 * 60 * 1000) {
//             console.log("🔄 Renovando token de inspector...");
//             await update();
//             console.log("✅ Token renovado");
//           }
//         } catch (error) {
//           console.error("❌ Error renovando:", error);
//         }
//       };

//       // Verificar cada 15 minutos (suficiente con tokens de 4h)
//       updateIntervalRef.current = setInterval(checkAndUpdate, 15 * 60 * 1000);
//       console.log("✅ Verificación configurada: cada 15 minutos");
//     } else {
//       hasInitialized.current = false;
//     }

//     return () => {
//       if (updateIntervalRef.current) {
//         clearInterval(updateIntervalRef.current);
//         updateIntervalRef.current = null;
//         hasInitialized.current = false;
//       }
//     };
//   }, [status, session?.isInspector, session?.error, session?.accessToken, update]);

//   // 🔥 3. VALIDACIÓN DE TOKEN EXPIRADO (capa adicional)
//   useEffect(() => {
//     if (
//       status === "authenticated" &&
//       session?.accessToken &&
//       !session?.error
//     ) {
//       try {
//         const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
//         const expiresAt = payload.exp * 1000;
//         const timeLeft = expiresAt - Date.now();

//         if (timeLeft < 0) {
//           console.error("❌ Token expirado");
//           signOut({
//             callbackUrl: "/?error=token_expired",
//             redirect: true,
//           });
//         }
//       } catch (error) {
//         console.error("❌ Error validando token:", error);
//       }
//     }
//   }, [status, session?.accessToken, session?.error]);

//   // 🔥 4. REDIRECCIÓN EN RUTAS PROTEGIDAS
//   useEffect(() => {
//     if (session?.error && status === "authenticated") {
//       if (isProtectedRoute(pathname)) {
//         console.log("🔄 Redirigiendo por error de sesión...");
//         router.push("/?error=session_expired");
//       }
//     }
//   }, [session?.error, status, pathname, router]);

//   return <>{children}</>;
// }
// 'use client';

// import { useSession, signOut } from "next-auth/react";
// import { useEffect } from "react";

// export function SessionValidator() {
//   const { data: session, status } = useSession();

//   useEffect(() => {
//     if (status === "authenticated" && session?.error) {
//       console.warn("Sesión inválida detectada:", session.error);
      
//       // Opcional: puedes diferenciar errores
//       const errorParam = 
//         session.error === "SessionExpired" ? "session_expired" :
//         session.error === "InspectorRenewFailed" ? "inspector_token_failed" :
//         "session_error";

//       signOut({ 
//         callbackUrl: `/?error=${errorParam}`,
//         redirect: true 
//       });
//     }
//   }, [session?.error, status]);

//   return null;
// }

// "use client";
// import { useSession, signOut } from "next-auth/react";
// import { useEffect, useRef } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { 
//   isProtectedRoute, 
//   RENEWAL_INTERVALS, 
//   SESSION_CONFIG 
// } from "@/lib/routeConfig";

// interface SessionValidatorProps {
//   children: React.ReactNode;
// }

// export function SessionValidator({ children }: SessionValidatorProps) {
//   const { data: session, status, update } = useSession();
//   const router = useRouter();
//   const pathname = usePathname();
//   const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const hasInitialized = useRef(false);

//   // 🔥 1. MANEJO DE ERRORES DE SESIÓN (máxima prioridad)
//   useEffect(() => {
//     if (status === "authenticated") {
//       // Verificar si hay error en la sesión
//       if (session?.error) {
//         console.error("❌ Error en sesión detectado:", session.error);
//         signOut({
//           callbackUrl: "/?error=session_expired",
//           redirect: true,
//         });
//         return;
//       }

//       // Verificar que tenga accessToken
//       if (!session?.accessToken) {
//         console.error("❌ No access token found, cerrando sesión...");
//         signOut({
//           callbackUrl: "/?error=invalid_token",
//           redirect: true,
//         });
//         return;
//       }
//     }
//   }, [session?.error, session?.accessToken, status]);

//   // 🔥 2. RENOVACIÓN AUTOMÁTICA SOLO PARA INSPECTORES
//   // Necesario porque usan Client Credentials sin refresh token
//   useEffect(() => {
//     // Limpiar intervalo previo
//     if (updateIntervalRef.current) {
//       clearInterval(updateIntervalRef.current);
//       updateIntervalRef.current = null;
//     }

//     // Solo para inspectores autenticados sin errores
//     if (
//       status === "authenticated" &&
//       session?.isInspector &&
//       !session?.error &&
//       session?.accessToken
//     ) {
//       // Log inicial (solo una vez)
//       if (!hasInitialized.current) {
//         console.log("🔧 Iniciando sistema de renovación automática para inspector");
//         console.log("ℹ️ Configuración:");
//         console.log(`   - Intervalo de verificación: ${RENEWAL_INTERVALS.INSPECTOR / 60000} minutos`);
//         console.log(`   - Umbral de renovación: ${SESSION_CONFIG.INSPECTOR_RENEWAL_THRESHOLD / 60000} minutos antes de expirar`);
//         hasInitialized.current = true;
//       }

//       // Función para verificar y renovar token
//       const checkAndUpdate = async () => {
//         try {
//           // Decodificar token para verificar expiración
//           const payload = JSON.parse(atob(session.accessToken!.split(".")[1]));
//           const expiresAt = payload.exp * 1000;
//           const timeLeft = expiresAt - Date.now();
//           const timeLeftMinutes = Math.floor(timeLeft / 60000);
//           const timeLeftSeconds = Math.floor(timeLeft / 1000);
          
//           // 🔥 Renovar si quedan menos de 2 minutos (umbral configurado)
//           if (timeLeft < SESSION_CONFIG.INSPECTOR_RENEWAL_THRESHOLD) {
//             console.log(`🔄 Renovando token de inspector (quedan ${timeLeftMinutes}m ${timeLeftSeconds % 60}s)...`);
//             await update();
//             console.log("✅ Token de inspector renovado exitosamente");
//           } else {
//             // Log informativo ocasional (solo 20% de las veces para no saturar)
//             if (Math.random() < 0.2) {
//               console.log(`⏱️ Token de inspector válido (${timeLeftMinutes} minutos restantes)`);
//             }
//           }
//         } catch (error) {
//           console.error("❌ Error en verificación/renovación de token:", error);
//           // Si hay error crítico, cerrar sesión
//           signOut({
//             callbackUrl: "/?error=token_error",
//             redirect: true,
//           });
//         }
//       };

//       // Configurar intervalo según configuración
//       updateIntervalRef.current = setInterval(
//         checkAndUpdate, 
//         RENEWAL_INTERVALS.INSPECTOR
//       );

//       const intervalMinutes = RENEWAL_INTERVALS.INSPECTOR / 60000;
//       console.log(`✅ Intervalo configurado: verificación cada ${intervalMinutes} minutos`);
      
//       // 🔥 Verificación inmediata al montar
//       checkAndUpdate();
//     } else {
//       // Reset del flag si no es inspector o hay error
//       hasInitialized.current = false;
//     }

//     // Cleanup al desmontar o cambiar de sesión
//     return () => {
//       if (updateIntervalRef.current) {
//         clearInterval(updateIntervalRef.current);
//         updateIntervalRef.current = null;
//         hasInitialized.current = false;
//       }
//     };
//   }, [status, session?.isInspector, session?.error, session?.accessToken, update]);

//   // 🔥 3. VALIDACIÓN DE TOKEN EXPIRADO (capa adicional de seguridad)
//   // Aplica a todos los usuarios (normales e inspectores)
//   useEffect(() => {
//     if (
//       status === "authenticated" &&
//       session?.accessToken &&
//       !session?.error
//     ) {
//       try {
//         // Decodificar token para verificar expiración
//         const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
//         const expiresAt = payload.exp * 1000;
//         const timeLeft = expiresAt - Date.now();

//         // Si ya expiró (no debería pasar gracias a la renovación automática)
//         if (timeLeft < 0) {
//           const userType = session.isInspector ? "inspector" : "usuario";
//           console.error(`❌ Token de ${userType} expirado detectado en cliente`);
//           signOut({
//             callbackUrl: "/?error=token_expired",
//             redirect: true,
//           });
//         }
//       } catch (error) {
//         console.error("❌ Error decodificando token:", error);
//         // Solo cerrar sesión si es un error crítico
//         signOut({
//           callbackUrl: "/?error=invalid_token",
//           redirect: true,
//         });
//       }
//     }
//   }, [status, session?.accessToken, session?.error, session?.isInspector]);

//   // 🔥 4. REDIRECCIÓN EN RUTAS PROTEGIDAS SI HAY ERROR
//   useEffect(() => {
//     if (session?.error && status === "authenticated") {
//       // Verificar si estamos en una ruta protegida
//       if (isProtectedRoute(pathname)) {
//         console.log(
//           "🔄 Redirigiendo desde ruta protegida por error de sesión..."
//         );
//         router.push("/?error=session_expired");
//       }
//     }
//   }, [session?.error, status, pathname, router]);

//   return <>{children}</>;
// }

"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  isProtectedRoute, 
  RENEWAL_INTERVALS, 
  SESSION_CONFIG 
} from "@/lib/routeConfig";

interface SessionValidatorProps {
  children: React.ReactNode;
}

export function SessionValidator({ children }: SessionValidatorProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  // 🔥 1. MANEJO DE ERRORES DE SESIÓN (máxima prioridad)
  useEffect(() => {
    if (status === "authenticated") {
      // Verificar si hay error en la sesión
      if (session?.error) {
        console.error("❌ Error en sesión detectado:", session.error);
        signOut({
          callbackUrl: "/?error=session_expired",
          redirect: true,
        });
        return;
      }

      // Verificar que tenga accessToken
      if (!session?.accessToken) {
        console.error("❌ No access token found, cerrando sesión...");
        signOut({
          callbackUrl: "/?error=invalid_token",
          redirect: true,
        });
        return;
      }
    }
  }, [session?.error, session?.accessToken, status]);

  // 🔥 2. RENOVACIÓN AUTOMÁTICA SOLO PARA INSPECTORES
  // Necesario porque usan Client Credentials sin refresh token
  useEffect(() => {
    // Limpiar intervalo previo
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    // Solo para inspectores autenticados sin errores
    if (
      status === "authenticated" &&
      session?.isInspector &&
      !session?.error &&
      session?.accessToken
    ) {
      // Log inicial (solo una vez)
      if (!hasInitialized.current) {
        console.log("🔧 Iniciando sistema de renovación automática para inspector");
        console.log("ℹ️ Configuración:");
        console.log(`   - Intervalo de verificación: ${RENEWAL_INTERVALS.INSPECTOR / 60000} minutos`);
        console.log(`   - Umbral de renovación: ${SESSION_CONFIG.INSPECTOR_RENEWAL_THRESHOLD / 60000} minutos antes de expirar`);
        hasInitialized.current = true;
      }

      // Función para verificar y renovar token
      const checkAndUpdate = async () => {
        try {
          // Decodificar token para verificar expiración
          const payload = JSON.parse(atob(session.accessToken!.split(".")[1]));
          const expiresAt = payload.exp * 1000;
          const now = Date.now();
          const timeLeft = expiresAt - now;
          const timeLeftMinutes = Math.floor(timeLeft / 60000);
          const timeLeftSeconds = Math.floor((timeLeft % 60000) / 1000);
          
          // 🔥 Log detallado del estado del token
          const tokenAge = now - (payload.iat * 1000);
          const tokenAgeMinutes = Math.floor(tokenAge / 60000);
          
          console.group(`🔍 Verificación de token (Inspector)`);
          console.log(`⏱️  Token emitido hace: ${tokenAgeMinutes} minutos`);
          console.log(`⏳ Tiempo restante: ${timeLeftMinutes}m ${timeLeftSeconds}s`);
          console.log(`📊 Próxima verificación: en ${RENEWAL_INTERVALS.INSPECTOR / 60000} minutos`);
          
          // 🔥 Renovar si quedan menos de 2 minutos (umbral configurado)
          if (timeLeft < SESSION_CONFIG.INSPECTOR_RENEWAL_THRESHOLD) {
            console.log(`🔄 RENOVANDO: Quedan solo ${timeLeftMinutes}m ${timeLeftSeconds}s`);
            console.log(`📍 Umbral configurado: ${SESSION_CONFIG.INSPECTOR_RENEWAL_THRESHOLD / 60000} minutos`);
            
            const renovationStart = Date.now();
            await update();
            const renovationTime = Date.now() - renovationStart;
            
            console.log(`✅ Token renovado exitosamente en ${renovationTime}ms`);
            console.groupEnd();
          } else {
            console.log(`✅ Token válido - No requiere renovación`);
            console.groupEnd();
          }
        } catch (error) {
          console.groupEnd();
          console.error("❌ Error en verificación/renovación de token:", error);
          // Si hay error crítico, cerrar sesión
          signOut({
            callbackUrl: "/?error=token_error",
            redirect: true,
          });
        }
      };

      // Configurar intervalo según configuración
      updateIntervalRef.current = setInterval(
        checkAndUpdate, 
        RENEWAL_INTERVALS.INSPECTOR
      );

      const intervalMinutes = RENEWAL_INTERVALS.INSPECTOR / 60000;
      console.log(`✅ Intervalo configurado: verificación cada ${intervalMinutes} minutos`);
      
      // 🔥 Verificación inmediata al montar
      checkAndUpdate();
    } else {
      // Reset del flag si no es inspector o hay error
      hasInitialized.current = false;
    }

    // Cleanup al desmontar o cambiar de sesión
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
        hasInitialized.current = false;
      }
    };
  }, [status, session?.isInspector, session?.error, session?.accessToken, update]);

  // 🔥 3. VALIDACIÓN DE TOKEN EXPIRADO (capa adicional de seguridad)
  // Aplica a todos los usuarios (normales e inspectores)
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.accessToken &&
      !session?.error
    ) {
      try {
        // Decodificar token para verificar expiración
        const payload = JSON.parse(atob(session.accessToken.split(".")[1]));
        const expiresAt = payload.exp * 1000;
        const timeLeft = expiresAt - Date.now();

        // Si ya expiró (no debería pasar gracias a la renovación automática)
        if (timeLeft < 0) {
          const userType = session.isInspector ? "inspector" : "usuario";
          console.error(`❌ Token de ${userType} expirado detectado en cliente`);
          signOut({
            callbackUrl: "/?error=token_expired",
            redirect: true,
          });
        }
      } catch (error) {
        console.error("❌ Error decodificando token:", error);
        // Solo cerrar sesión si es un error crítico
        signOut({
          callbackUrl: "/?error=invalid_token",
          redirect: true,
        });
      }
    }
  }, [status, session?.accessToken, session?.error, session?.isInspector]);

  // 🔥 4. REDIRECCIÓN EN RUTAS PROTEGIDAS SI HAY ERROR
  useEffect(() => {
    if (session?.error && status === "authenticated") {
      // Verificar si estamos en una ruta protegida
      if (isProtectedRoute(pathname)) {
        console.log(
          "🔄 Redirigiendo desde ruta protegida por error de sesión..."
        );
        router.push("/?error=session_expired");
      }
    }
  }, [session?.error, status, pathname, router]);

  return <>{children}</>;
}