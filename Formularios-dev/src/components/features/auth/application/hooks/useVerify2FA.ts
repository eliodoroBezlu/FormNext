"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authAdapter } from "../../infrastructure/adapters/authAdapter";

/**
 * Orquesta la verificación del código 2FA: llamada al adaptador,
 * redirección post-éxito y mapeo de errores. La UI de los 6 dígitos
 * permanece en el componente por ser puramente de presentación.
 */
export function useVerify2FA(tempToken: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function verify(code: string, onInvalidCode: () => void) {
    startTransition(async () => {
      const result = await authAdapter.verify2FA(tempToken, code);

      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Código inválido");
        onInvalidCode();
      }
    });
  }

  return { isPending, error, setError, verify };
}
