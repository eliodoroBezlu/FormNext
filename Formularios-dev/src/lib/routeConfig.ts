// /**
//  * Configuración centralizada de rutas protegidas
//  * Compatible con tokens de Keycloak de 4 horas
//  */
// export const PROTECTED_ROUTES = [
//   "/dashboard",
//   "/profile",
//   "/settings",
//   "/admin",
//   "/api/protected",
// ] as const;

// export const PUBLIC_ROUTES = [
//   "/",
//   "/auth/error",
//   "/auth/signin",
//   "/auth/signout",
//   "/api/auth",
// ] as const;

// export function isProtectedRoute(pathname: string): boolean {
//   return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
// }

// export function isPublicRoute(pathname: string): boolean {
//   return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
// }

// /**
//  * Configuración de sesión
//  * 🔥 Ajustada para tokens de Keycloak de 4 horas
//  */
// export const SESSION_CONFIG = {
//   /**
//    * Tiempo máximo de vida de la sesión (4 horas)
//    * Coincide con la configuración de Keycloak
//    */
//   MAX_AGE: 4 * 60 * 60, // 4 horas
  
//   /**
//    * Intervalo de actualización de sesión (1 hora)
//    * Con tokens de 4h, es más realista renovar cada hora
//    */
//   UPDATE_AGE: 60 * 60, // 1 hora
  
//   /**
//    * Tiempo antes de expiración para renovar token de inspector (10 minutos)
//    */
//   INSPECTOR_RENEWAL_THRESHOLD: 10 * 60 * 1000, // 10 minutos
  
//   /**
//    * Intervalo de verificación para inspectores (15 minutos)
//    * Suficiente con tokens de 4 horas
//    */
//   INSPECTOR_CHECK_INTERVAL: 15 * 60 * 1000, // 15 minutos
// } as const;


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
 * 🔥 Configuración optimizada según tipo de usuario
 */
export const RENEWAL_INTERVALS = {
  /**
   * Inspector: Renovación automática cada 3 minutos
   * Necesaria porque usan Client Credentials (sin refresh token)
   */
  INSPECTOR: 3 * 60 * 1000, // 3 minutos
  
  /**
   * Usuario normal: No necesita renovación automática
   * Los tokens se renuevan con refresh_token solo cuando hay actividad
   */
  REGULAR_USER: 0, // Solo con actividad
} as const;

/**
 * Configuración de sesión y tokens
 * 🔥 Valores sincronizados con Keycloak
 */
export const SESSION_CONFIG = {
  /**
   * Tiempo máximo de vida de la sesión (4 horas)
   * Debe coincidir con Keycloak SSO Session Max
   * Después de este tiempo, la sesión EXPIRA sin importar la actividad
   */
  MAX_AGE: 4 * 60 * 60, // 4 horas en segundos
  
  /**
   * Intervalo de actualización de sesión (5 minutos)
   * La sesión se renueva cada 5 minutos SOLO si hay actividad del usuario
   * Debe ser <= Keycloak Access Token Lifespan para renovar antes de expirar
   */
  UPDATE_AGE: 5 * 60, // 5 minutos en segundos
  
  /**
   * Umbral para renovación de token de inspector (2 minutos antes)
   * Se renueva cuando quedan menos de 2 minutos para expirar
   */
  INSPECTOR_RENEWAL_THRESHOLD: 2 * 60 * 1000, // 2 minutos en milisegundos
  
  /**
   * Tiempo de advertencia antes de expiración (1 minuto)
   * Se usa en SessionValidator para avisar al usuario (opcional)
   */
  TOKEN_EXPIRY_WARNING: 60 * 1000, // 1 minuto en milisegundos
} as const;

/**
 * Configuración recomendada de Keycloak
 * (Para referencia del desarrollador)
 */
export const KEYCLOAK_RECOMMENDED_CONFIG = {
  // Realm Settings → Tokens
  ACCESS_TOKEN_LIFESPAN: "5 minutos", // ⚠️ IMPORTANTE
  SSO_SESSION_IDLE: "45 minutos",
  SSO_SESSION_MAX: "4 horas",
  
  // Client Settings → Advanced (para inspector)
  INSPECTOR_ACCESS_TOKEN: "5 minutos", // Mismo que el realm
} as const;