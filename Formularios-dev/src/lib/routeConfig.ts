/**
 * Configuración centralizada de rutas protegidas
 * Usada por SessionValidator y Middleware
 */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/api/protected",
] as const;

/**
 * Rutas públicas (no requieren autenticación)
 */
export const PUBLIC_ROUTES = [
  "/",
  "/auth/error",
  "/auth/signin",
  "/auth/signout",
  "/api/auth",
] as const;

/**
 * Verifica si una ruta está protegida
 * @param pathname - Ruta actual del navegador
 * @returns true si la ruta está protegida
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verifica si una ruta es pública
 * @param pathname - Ruta actual del navegador
 * @returns true si la ruta es pública
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Intervalos de tiempo para renovación (en milisegundos)
 * 🔥 Con renovación automática para inspectores (necesaria por tokens cortos de Keycloak)
 */
export const RENEWAL_INTERVALS = {
  INSPECTOR: 3 * 60 * 1000, // 🔥 3 minutos (renovar antes de que expire el token de 5 min)
  REGULAR_USER: 0, // 🔥 Solo con actividad (usan refresh_token)
} as const;

/**
 * Configuración de sesión
 * 🔥 Estas son las configuraciones que controlan el comportamiento de expiración
 */
export const SESSION_CONFIG = {
  /**
   * Tiempo máximo de vida de la sesión (4 horas)
   * Después de este tiempo, la sesión EXPIRA sin importar la actividad
   */
  MAX_AGE: 4 * 60 * 60, // 4 horas en segundos
  
  /**
   * Intervalo de actualización de sesión (5 minutos)
   * La sesión se renueva cada 5 minutos SOLO si hay actividad del usuario
   * Si no hay actividad, NO se renueva y eventualmente expira
   */
  UPDATE_AGE: 5 * 60, // 5 minutos en segundos
  
  /**
   * Tiempo antes de expiración para mostrar advertencia (1 minuto)
   * Se usa en SessionValidator para avisar al usuario
   */
  TOKEN_EXPIRY_WARNING: 60 * 1000, // 1 minuto en milisegundos
  
  /**
   * Umbral para renovación de token (5 minutos antes)
   * Usado en el callback JWT para renovar tokens de inspector si es necesario
   */
  TOKEN_RENEWAL_THRESHOLD: 5 * 60, // 5 minutos en segundos
} as const;