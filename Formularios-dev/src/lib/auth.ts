// // lib/auth.ts
// import { NextAuthOptions } from "next-auth";
// import KeycloakProvider from "next-auth/providers/keycloak";

// interface KeycloakJWTPayload {
//   realm_access?: {
//     roles: string[]
//   }
//   resource_access?: Record<string, {
//     roles: string[]
//   }>
//   exp?: number;
//   iat?: number;
// }

// // Función para refrescar el token
// async function refreshAccessToken(refreshToken: string) {
//   try {
//     console.log('Attempting to refresh token...');
    
//     const response = await fetch(
//       `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({
//           grant_type: 'refresh_token',
//           client_id: process.env.KEYCLOAK_ID!,
//           client_secret: process.env.KEYCLOAK_SECRET!,
//           refresh_token: refreshToken,
//         }),
//       }
//     );

//     if (!response.ok) {
//       console.error('Token refresh failed:', response.status, response.statusText);
//       return null;
//     }

//     const tokens = await response.json();
//     console.log('Token refreshed successfully');
//     return tokens;
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     return null;
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     KeycloakProvider({
//       clientId: process.env.KEYCLOAK_ID!,
//       clientSecret: process.env.KEYCLOAK_SECRET!,
//       issuer: process.env.KEYCLOAK_ISSUER!,
//     })
//   ],
//   callbacks: {
//     async jwt({ token, account, /* trigger */ }) {
//       // ✅ Configuración inicial del token (primera vez)
//       if (account) {
//         console.log('Initial token setup');
//         token.accessToken = account.access_token;
//         token.refreshToken = account.refresh_token;
//         token.expiresAt = account.expires_at;

//         // Decodificar roles del token inicial
//         if (account.access_token) {
//           try {
//             const payload: KeycloakJWTPayload = JSON.parse(
//               Buffer.from(account.access_token.split('.')[1], 'base64').toString()
//             );
//             const clientId = process.env.KEYCLOAK_ID || "next-app-client";
            
//             token.roles = payload.realm_access?.roles || [];
//             token.resourceRoles = payload.resource_access?.[clientId]?.roles || [];
//             token.clientRoles = payload.resource_access?.[process.env.KEYCLOAK_ID!]?.roles || [];
//           } catch (error) {
//             console.error('Error decoding initial access token:', error);
//             token.roles = [];
//             token.clientRoles = [];
//             token.resourceRoles = [];
//           }
//         }
//         return token;
//       }

//       // ✅ Asegurar que los arrays siempre existan
//       if (!token.roles) token.roles = [];
//       if (!token.clientRoles) token.clientRoles = [];
//       if (!token.resourceRoles) token.resourceRoles = [];

//       // ✅ Verificar si el token aún es válido (no expirado)
//       if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
//         // Token válido, no hacer nada - solo retornar
//         return token;
//       }

//       // ✅ Token expirado → Intentar refresh SOLO si hay refresh_token
//       if (token.refreshToken && !token.error) {
//         console.log('Token expired, attempting refresh...');
//         const refreshedTokens = await refreshAccessToken(token.refreshToken as string);
        
//         if (refreshedTokens) {
//           // Actualizar con los nuevos tokens
//           token.accessToken = refreshedTokens.access_token;
//           token.refreshToken = refreshedTokens.refresh_token;
//           token.expiresAt = Math.floor(Date.now() / 1000) + refreshedTokens.expires_in;
//           delete token.error;

//           // Decodificar el nuevo token para roles actualizados
//           try {
//             const payload: KeycloakJWTPayload = JSON.parse(
//               Buffer.from(refreshedTokens.access_token.split('.')[1], 'base64').toString()
//             );
//             const clientId = process.env.KEYCLOAK_ID || "next-app-client";
            
//             token.roles = payload.realm_access?.roles || [];
//             token.resourceRoles = payload.resource_access?.[clientId]?.roles || [];
//             token.clientRoles = payload.resource_access?.[process.env.KEYCLOAK_ID!]?.roles || [];
//           } catch (error) {
//             console.error('Error decoding refreshed access token:', error);
//           }

//           console.log('Token refresh successful');
//           return token;
//         }
//       }

//       // ✅ Si llegamos aquí, el refresh falló - marcar como expirado
//       console.log('Token refresh failed, marking session as expired');
//       token.accessToken = undefined;
//       token.refreshToken = undefined;
//       token.expiresAt = undefined;
//       token.error = 'RefreshTokenExpired';
//       return token;
//     },
    
//     async session({ session, token }) {
//       // ✅ Si hay error en el token, marcar sesión como inválida
//       if (token.error) {
//         console.log('Session marked as invalid due to token error:', token.error);
//         session.error = token.error;
//         session.accessToken = undefined;
//         session.roles = [];
//         session.clientRoles = [];
//         session.resourceRoles = [];
//         return session;
//       }

//       // ✅ Sesión válida - asignar datos
//       if (typeof token.accessToken === 'string') {
//         session.accessToken = token.accessToken;
//       }
      
//       session.roles = Array.isArray(token.roles) ? token.roles : [];
//       session.clientRoles = Array.isArray(token.clientRoles) ? token.clientRoles : [];
//       session.resourceRoles = Array.isArray(token.resourceRoles) ? token.resourceRoles : [];
      
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/",
//     error: "/auth/error",
//   },
//   debug: process.env.NODE_ENV === 'development',
//   session: {
//     strategy: "jwt",
//     maxAge: 60 * 60, // 1 hora
//     updateAge: 30 * 60, // Re-generar sesión cada 30 minutos de actividad
//   },
//   events: {
//     async signOut({ token }) {
//       // ✅ Logout en Keycloak al cerrar sesión
//       if (token?.accessToken) {
//         try {
//           console.log('Performing Keycloak logout...');
//           await fetch(
//             `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
//             {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 Authorization: `Bearer ${token.accessToken}`,
//               },
//               body: new URLSearchParams({
//                 client_id: process.env.KEYCLOAK_ID!,
//                 client_secret: process.env.KEYCLOAK_SECRET!,
//                 refresh_token: token.refreshToken as string,
//               }),
//             }
//           );
//           console.log('Keycloak logout successful');
//         } catch (error) {
//           console.error('Error during Keycloak logout:', error);
//         }
//       }
//     },
//   },
// };

// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";

interface KeycloakJWTPayload {
  realm_access?: {
    roles: string[]
  }
  resource_access?: Record<string, {
    roles: string[]
  }>
  exp?: number;
  iat?: number;
}

interface InspectorUser {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  roles: string[];
}

// 🔥 Renovar token de Client Credentials (solo para inspectores)
async function renewClientCredentialsToken() {
  try {
    console.log('🔄 Renovando token de Client Credentials...');
    
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.KEYCLOAK_ID!,
          client_secret: process.env.KEYCLOAK_SECRET!,
        }),
      }
    );

    if (!response.ok) {
      console.error('❌ Error renovando token:', response.status);
      return null;
    }

    const tokens = await response.json();
    console.log('✅ Token renovado exitosamente');
    return tokens;
  } catch (error) {
    console.error('❌ Error en renovación de token:', error);
    return null;
  }
}

// Función para refrescar el token (usuarios normales de Keycloak)
async function refreshAccessToken(refreshToken: string) {
  try {
    console.log('🔄 Intentando refrescar token de usuario normal...');
    
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.KEYCLOAK_ID!,
          client_secret: process.env.KEYCLOAK_SECRET!,
          refresh_token: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      console.error('❌ Refresh token falló:', response.status, response.statusText);
      return null;
    }

    const tokens = await response.json();
    console.log('✅ Token refrescado exitosamente');
    return tokens;
  } catch (error) {
    console.error('❌ Error refrescando token:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
    CredentialsProvider({
      id: "inspector",
      name: "Inspector Técnico",
      credentials: {},
      async authorize() {
        try {
          console.log('🔑 Obteniendo token técnico para inspector...');
          
          const response = await fetch(
            `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_ID!,
                client_secret: process.env.KEYCLOAK_SECRET!,
                grant_type: "client_credentials",
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en Client Credentials Flow:', errorText);
            return null;
          }

          const tokens = await response.json();
          const clientId = process.env.KEYCLOAK_ID || "next-app-client";

          console.log('✅ Token técnico obtenido');
          
          // Decodificar el token para obtener roles
          const payload = JSON.parse(
            Buffer.from(tokens.access_token.split(".")[1], "base64").toString()
          );
          
          const roles = 
            payload.resource_access?.[clientId]?.roles || 
            payload.realm_access?.roles || 
            ["tecnico"];

          console.log('✅ Roles del inspector:', roles);

          return {
            id: "inspector",
            name: "Inspector Técnico",
            email: "inspector@tecnico.com",
            accessToken: tokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
            roles,
          } as InspectorUser;
        } catch (error) {
          console.error('❌ Error en authorize de inspector:', error);
          return null;
        }
      },
    }),
  ],
  
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    async jwt({ token, account, user, trigger }) {
      // 🔥 Inspector: Configuración inicial
      if (account?.provider === "inspector" && user) {
        console.log('🔐 Creando JWT para inspector');
        return {
          ...token,
          accessToken: (user as InspectorUser).accessToken,
          expiresAt: (user as InspectorUser).expiresAt,
          roles: (user as InspectorUser).roles,
          clientRoles: (user as InspectorUser).roles,
          resourceRoles: [],
          isInspector: true,
          idToken: undefined,
          refreshToken: undefined,
        };
      }

      // Usuario normal de Keycloak: Configuración inicial
      if (account && account.provider !== "inspector") {
        console.log('🔐 Configuración inicial de token para usuario Keycloak');
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
        token.isInspector = false;

        // Decodificar roles del token inicial
        if (account.access_token) {
          try {
            const payload: KeycloakJWTPayload = JSON.parse(
              Buffer.from(account.access_token.split('.')[1], 'base64').toString()
            );
            const clientId = process.env.KEYCLOAK_ID || "next-app-client";
            
            token.roles = payload.realm_access?.roles || [];
            token.resourceRoles = payload.resource_access?.[clientId]?.roles || [];
            token.clientRoles = payload.resource_access?.[process.env.KEYCLOAK_ID!]?.roles || [];
          } catch (error) {
            console.error('❌ Error decodificando token inicial:', error);
            token.roles = [];
            token.clientRoles = [];
            token.resourceRoles = [];
          }
        }
        return token;
      }

      // Asegurar que los arrays siempre existan
      if (!token.roles) token.roles = [];
      if (!token.clientRoles) token.clientRoles = [];
      if (!token.resourceRoles) token.resourceRoles = [];

      // 🔥 RENOVACIÓN PARA INSPECTORES (solo cuando se solicita explícitamente via update())
      if (token.isInspector && trigger === 'update') {
        console.log('🔄 Solicitud de actualización manual para inspector');
        
        // Verificar si el token necesita renovación (5 minutos antes de expirar)
        const shouldRenew = token.expiresAt && Date.now() > ((token.expiresAt as number) - 300) * 1000;
        
        if (shouldRenew) {
          console.log('🔄 Token de inspector próximo a expirar, renovando...');
          const newTokens = await renewClientCredentialsToken();
          
          if (newTokens) {
            const payload = JSON.parse(
              Buffer.from(newTokens.access_token.split('.')[1], 'base64').toString()
            );
            const clientId = process.env.KEYCLOAK_ID || "next-app-client";
            
            const roles = 
              payload.resource_access?.[clientId]?.roles || 
              payload.realm_access?.roles || 
              ["tecnico"];

            token.accessToken = newTokens.access_token;
            token.expiresAt = Math.floor(Date.now() / 1000) + newTokens.expires_in;
            token.roles = roles;
            token.clientRoles = roles;
            
            console.log('✅ Token de inspector renovado exitosamente');
            return token;
          } else {
            console.error('❌ Falló la renovación del token de inspector');
            token.error = 'InspectorTokenRenewalFailed';
            return token;
          }
        }
        
        console.log('✅ Token de inspector aún válido, no se requiere renovación');
        return token;
      }

      // 🔥 PARA INSPECTORES: Verificar expiración sin renovación automática
      if (token.isInspector) {
        // Si el token ya expiró, marcar error
        if (token.expiresAt && Date.now() >= (token.expiresAt as number) * 1000) {
          console.error('❌ Token de inspector expirado');
          token.error = 'InspectorTokenExpired';
          return token;
        }
        
        // Token aún válido
        return token;
      }

      // 🔥 USUARIOS NORMALES: Renovación con refresh token
      // Verificar si el token aún es válido
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Token expirado → Intentar refresh
      if (token.refreshToken && !token.error) {
        console.log('🔄 Token expirado, intentando refresh...');
        const refreshedTokens = await refreshAccessToken(token.refreshToken as string);
        
        if (refreshedTokens) {
          token.accessToken = refreshedTokens.access_token;
          token.refreshToken = refreshedTokens.refresh_token;
          token.expiresAt = Math.floor(Date.now() / 1000) + refreshedTokens.expires_in;
          delete token.error;

          // Decodificar el nuevo token para roles actualizados
          try {
            const payload: KeycloakJWTPayload = JSON.parse(
              Buffer.from(refreshedTokens.access_token.split('.')[1], 'base64').toString()
            );
            const clientId = process.env.KEYCLOAK_ID || "next-app-client";
            
            token.roles = payload.realm_access?.roles || [];
            token.resourceRoles = payload.resource_access?.[clientId]?.roles || [];
            token.clientRoles = payload.resource_access?.[process.env.KEYCLOAK_ID!]?.roles || [];
          } catch (error) {
            console.error('❌ Error decodificando token refrescado:', error);
          }

          console.log('✅ Token refrescado exitosamente');
          return token;
        }
      }

      // Si llegamos aquí, el refresh falló
      console.error('❌ Refresh falló, sesión expirada');
      token.accessToken = undefined;
      token.refreshToken = undefined;
      token.expiresAt = undefined;
      token.error = 'RefreshTokenExpired';
      return token;
    },
    
    async session({ session, token }) {
      // Si hay error en el token, marcar sesión como inválida
      if (token.error) {
        console.log('⚠️ Sesión marcada como inválida por error:', token.error);
        session.error = token.error;
        session.accessToken = undefined;
        session.roles = [];
        session.clientRoles = [];
        session.resourceRoles = [];
        return session;
      }

      // Sesión válida - asignar datos
      if (typeof token.accessToken === 'string') {
        session.accessToken = token.accessToken;
      }
      
      if (typeof token.idToken === 'string') {
        session.idToken = token.idToken;
      }
      
      session.roles = Array.isArray(token.roles) ? token.roles : [];
      session.clientRoles = Array.isArray(token.clientRoles) ? token.clientRoles : [];
      session.resourceRoles = Array.isArray(token.resourceRoles) ? token.resourceRoles : [];
      session.isInspector = token.isInspector || false;
      
      return session;
    },
  },
  
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 🔥 4 horas - LA SESIÓN EXPIRA DESPUÉS DE ESTE TIEMPO
    updateAge: 5 * 60,   // 🔥 5 minutos - Solo se renueva si hay ACTIVIDAD del usuario
  },
  
  events: {
    async signOut({ token }) {
      // Solo hacer logout en Keycloak si NO es inspector
      if (token?.idToken && !token.isInspector) {
        try {
          console.log('🔓 Realizando logout en Keycloak...');
          const logoutUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;
          const params = new URLSearchParams({
            id_token_hint: token.idToken as string,
          });
          
          await fetch(`${logoutUrl}?${params.toString()}`, {
            method: 'GET',
          });
          console.log('✅ Logout de Keycloak exitoso');
        } catch (error) {
          console.error('❌ Error durante logout de Keycloak:', error);
        }
      } else if (token?.isInspector) {
        console.log('🔓 Logout de inspector - no se requiere logout de Keycloak');
      }
    },
  },
};

// lib/auth.ts
// import { NextAuthOptions } from "next-auth";
// import KeycloakProvider from "next-auth/providers/keycloak";
// import CredentialsProvider from "next-auth/providers/credentials";

// async function renewClientCredentialsToken() {
//   const res = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       grant_type: "client_credentials",
//       client_id: process.env.KEYCLOAK_ID!,
//       client_secret: process.env.KEYCLOAK_SECRET!,
//     }),
//   });
//   return res.ok ? await res.json() : null;
// }

// async function refreshAccessToken(refreshToken: string) {
//   const res = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       grant_type: "refresh_token",
//       client_id: process.env.KEYCLOAK_ID!,
//       client_secret: process.env.KEYCLOAK_SECRET!,
//       refresh_token: refreshToken,
//     }),
//   });
//   return res.ok ? await res.json() : null;
// }

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET!, // OBLIGATORIO con JWT

//   session: {
//     strategy: "jwt" as const,
//     maxAge: 4 * 60 * 60, // 4 horas máximo
//   },

//   providers: [
//     KeycloakProvider({
//       clientId: process.env.KEYCLOAK_ID!,
//       clientSecret: process.env.KEYCLOAK_SECRET!,
//       issuer: process.env.KEYCLOAK_ISSUER!,
//     }),
//     CredentialsProvider({
//       id: "inspector",
//       name: "Inspector Técnico",
//       credentials: {},
//       async authorize() {
//         const tokens = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
//           method: "POST",
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//           body: new URLSearchParams({
//             grant_type: "client_credentials",
//             client_id: process.env.KEYCLOAK_ID!,
//             client_secret: process.env.KEYCLOAK_SECRET!,
//           }),
//         }).then(r => r.ok ? r.json() : null);

//         if (!tokens) return null;

//         const payload = JSON.parse(Buffer.from(tokens.access_token.split(".")[1], "base64").toString());
//         const clientId = process.env.KEYCLOAK_ID || "next-app-client";
//         const roles = payload.resource_access?.[clientId]?.roles || payload.realm_access?.roles || ["tecnico"];

//         return {
//           id: "inspector",
//           name: "Inspector Técnico",
//           email: "inspector@tecnico.com",
//           accessToken: tokens.access_token,
//           expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
//           roles,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user, account }) {
//       // Login inicial
//       if (account && user) {
//         if (account.provider === "inspector") {
//           return {
//             accessToken: (user as any).accessToken,
//             expiresAt: (user as any).expiresAt,
//             roles: (user as any).roles,
//             clientRoles: (user as any).roles,
//             isInspector: true,
//             sessionStartTime: Date.now(),
//           };
//         }

//         const payload = account.access_token
//           ? JSON.parse(Buffer.from(account.access_token.split(".")[1], "base64").toString())
//           : {};
//         const clientId = process.env.KEYCLOAK_ID || "next-app-client";

//         return {
//           accessToken: account.access_token!,
//           refreshToken: account.refresh_token,
//           expiresAt: account.expires_at,
//           roles: payload.realm_access?.roles || [],
//           clientRoles: payload.resource_access?.[clientId]?.roles || [],
//           isInspector: false,
//           sessionStartTime: Date.now(),
//           sub: user.id,
//         };
//       }

//       // Límite de 4 horas
//       if (Date.now() - (token.sessionStartTime as number) > 4 * 60 * 60 * 1000) {
//         return { ...token, error: "SessionExpired" };
//       }

//       // Renovación automática si faltan menos de 2 minutos
//       if (token.expiresAt && Date.now() > (token.expiresAt as number) * 1000 - 120000) {
//         if (token.isInspector) {
//           const newTokens = await renewClientCredentialsToken();
//           if (!newTokens) return { ...token, error: "InspectorRenewFailed" };
//           return { ...token, accessToken: newTokens.access_token, expiresAt: Math.floor(Date.now() / 1000) + newTokens.expires_in };
//         }

//         if (token.refreshToken) {
//           const refreshed = await refreshAccessToken(token.refreshToken as string);
//           if (!refreshed) return { ...token, error: "RefreshFailed" };
//           return {
//             ...token,
//             accessToken: refreshed.access_token,
//             refreshToken: refreshed.refresh_token ?? token.refreshToken,
//             expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
//           };
//         }
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       if (token.error) {
//         session.error = token.error;
//         return session;
//       }

//       session.accessToken = token.accessToken as string;
//       session.roles = (token.roles as string[]) || [];
//       session.clientRoles = (token.clientRoles as string[]) || [];
//       session.isInspector = !!token.isInspector;

//       session.user.id = token.sub || "unknown";
//       session.user.name = token.name || "Usuario";
//       session.user.email = token.email || null;

//       return session;
//     },
//   },
// };