"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authAdapter } from "../../infrastructure/adapters/authAdapter";

interface Login2FAData {
  requires2FA: boolean;
  tempToken: string;
}

interface LoginActionResult {
  success: boolean;
  error?: string;
  data?: Login2FAData;
}

/**
 * Orquesta el flujo de login: envío de credenciales, detección de 2FA
 * requerido, redirección post-login y login automático de técnico.
 */
export function useLogin() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPendingTecnico, startTransitionTecnico] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string>("");

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = (await authAdapter.login(formData)) as LoginActionResult;

      if (result.success) {
        if (result.data?.requires2FA) {
          setRequires2FA(true);
          setTempToken(result.data.tempToken);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    });
  }

  function handleTecnicoLogin() {
    setError(null);

    startTransitionTecnico(async () => {
      const result = await authAdapter.loginInspector();

      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Error al iniciar sesión como técnico");
      }
    });
  }

  return {
    isPending,
    isPendingTecnico,
    error,
    requires2FA,
    tempToken,
    handleSubmit,
    handleTecnicoLogin,
  };
}
