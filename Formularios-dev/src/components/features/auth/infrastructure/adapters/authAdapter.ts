import {
  loginAction,
  logoutAction,
  registerAction,
  verify2FAAction,
  inspectorLoginAction,
  cambiarClaveAction,
} from "@/app/actions/auth";
import type { ActionResult } from "@/app/actions/auth";

/**
 * Adaptador delgado sobre las Server Actions de autenticación.
 * Los componentes de presentation/ y los hooks de application/ nunca
 * deben importar `@/app/actions/auth` directamente — siempre a través
 * de este adaptador.
 */
export const authAdapter = {
  /**
   * Inicia sesión con usuario/contraseña. Puede devolver `requires2FA`
   * cuando la cuenta tiene 2FA habilitado.
   */
  async login(formData: FormData): Promise<ActionResult> {
    return loginAction(formData);
  },

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
   * Registra un nuevo usuario.
   */
  async register(formData: FormData): Promise<ActionResult> {
    return registerAction(formData);
  },

  /**
   * Verifica el código 2FA asociado a un `tempToken` de login.
   */
  async verify2FA(tempToken: string, code: string): Promise<ActionResult> {
    return verify2FAAction(tempToken, code);
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
