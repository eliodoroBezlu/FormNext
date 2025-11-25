"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isProtectedRoute } from "@/lib/routeConfig";

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
  // (Necesario porque los tokens de Client Credentials expiran rápido en Keycloak)
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
        console.log("ℹ️ Esto es necesario porque los tokens de Client Credentials expiran rápido");
        hasInitialized.current = true;
      }

      // Función para actualizar sesión
      const checkAndUpdate = async () => {
        try {
          // Verificar cuánto tiempo queda
          const payload = JSON.parse(atob(session.accessToken!.split(".")[1]));
          const expiresAt = payload.exp * 1000;
          const timeLeft = expiresAt - Date.now();
          
          // Renovar si quedan menos de 2 minutos
          if (timeLeft < 120000) {
            console.log("🔄 Renovando token de inspector (quedan menos de 2 minutos)...");
            await update();
            console.log("✅ Token renovado exitosamente");
          } else {
            console.log(`ℹ️ Token aún válido (${Math.floor(timeLeft / 1000)}s restantes)`);
          }
        } catch (error) {
          console.error("❌ Error renovando sesión:", error);
        }
      };

      // Renovar cada 3 minutos (180000ms)
      // Esto asegura que renovemos antes de que expire el token de 5 minutos
      const RENEWAL_INTERVAL = 3 * 60 * 1000; // 3 minutos
      
      updateIntervalRef.current = setInterval(checkAndUpdate, RENEWAL_INTERVAL);

      console.log(`✅ Intervalo configurado: verificación cada 3 minutos`);
    } else {
      // Reset del flag si no es inspector o hay error
      hasInitialized.current = false;
    }

    // Cleanup al desmontar o cambiar de sesión
    return () => {
      if (updateIntervalRef.current) {
        console.log("🧹 Limpiando intervalo de renovación");
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
        hasInitialized.current = false;
      }
    };
  }, [status, session?.isInspector, session?.error, session?.accessToken, update]);

  // 🔥 3. VALIDACIÓN DE TOKEN EXPIRADO (capa adicional de seguridad)
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
        const now = Date.now();
        const timeLeft = expiresAt - now;

        // Si ya expiró (no debería pasar gracias a la renovación automática)
        if (timeLeft < 0) {
          console.error("❌ Token expirado detectado en cliente");
          signOut({
            callbackUrl: "/?error=token_expired",
            redirect: true,
          });
        }
      } catch (error) {
        console.error("❌ Error decodificando token:", error);
        // No hacer signOut aquí, podría ser un token válido pero no JWT estándar
      }
    }
  }, [status, session?.accessToken, session?.error]);

  // 🔥 4. REDIRECCIÓN EN RUTAS PROTEGIDAS SI HAY ERROR
  useEffect(() => {
    if (session?.error && status === "authenticated") {
      // Verificar si estamos en una ruta protegida usando la función helper
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