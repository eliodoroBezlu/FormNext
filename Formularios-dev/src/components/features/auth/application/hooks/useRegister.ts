"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authAdapter } from "../../infrastructure/adapters/authAdapter";

/**
 * Orquesta el flujo de registro: envío del formulario, mensaje de éxito
 * y redirección diferida a /login.
 */
export function useRegister() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await authAdapter.register(formData);

      if (result.success) {
        setSuccess(result.message || "Usuario registrado exitosamente");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Error al registrar usuario");
      }
    });
  }

  return { isPending, error, success, handleSubmit };
}
