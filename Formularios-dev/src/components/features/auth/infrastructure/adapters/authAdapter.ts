import { logoutAction, inspectorLoginAction, cambiarClaveAction } from "@/app/actions/auth";
import type { ActionResult } from "@/app/actions/auth";

/**
 * Adaptador delgado sobre las Server Actions de autenticación.
 * Los componentes de presentation/ y los hooks de application/ nunca
 * deben importar `@/app/actions/auth` directamente — siempre a través
 * de este adaptador.
 */
export const authAdapter = {
  /**
   * Inicia sesión automática como técnico/inspector (sin credenciales).
   */
  async loginInspector(): Promise<ActionResult> {
    return inspectorLoginAction();
  },

  /**
   * Cierra la sesión actual. Server Action que redirige a "/" al finalizar.
   */
  async logout(): Promise<void> {
    await logoutAction();
  },

  /**
   * Cambia la contraseña propia en el IAM. Al salir bien la sesión queda
   * cerrada (el IAM cierra todas): hay que llevar al usuario a iniciar sesión.
   */
  async cambiarClave(currentPassword: string, newPassword: string): Promise<ActionResult> {
    return cambiarClaveAction(currentPassword, newPassword);
  },
};

export type { ActionResult };
