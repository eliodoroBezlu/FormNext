// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

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

// Función para refrescar el token
async function refreshAccessToken(refreshToken: string) {
  try {
    console.log('Attempting to refresh token...');
    
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
      console.error('Token refresh failed:', response.status, response.statusText);
      return null;
    }

    const tokens = await response.json();
    console.log('Token refreshed successfully');
    return tokens;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    })
  ],
  callbacks: {
    async jwt({ token, account, trigger: _ }) {
      // ✅ Configuración inicial del token (primera vez)
      if (account) {
        console.log('Initial token setup');
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

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
            console.error('Error decoding initial access token:', error);
            token.roles = [];
            token.clientRoles = [];
            token.resourceRoles = [];
          }
        }
        return token;
      }

      // ✅ Asegurar que los arrays siempre existan
      if (!token.roles) token.roles = [];
      if (!token.clientRoles) token.clientRoles = [];
      if (!token.resourceRoles) token.resourceRoles = [];

      // ✅ Verificar si el token aún es válido (no expirado)
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        // Token válido, no hacer nada - solo retornar
        return token;
      }

      // ✅ Token expirado → Intentar refresh SOLO si hay refresh_token
      if (token.refreshToken && !token.error) {
        console.log('Token expired, attempting refresh...');
        const refreshedTokens = await refreshAccessToken(token.refreshToken as string);
        
        if (refreshedTokens) {
          // Actualizar con los nuevos tokens
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
            console.error('Error decoding refreshed access token:', error);
          }

          console.log('Token refresh successful');
          return token;
        }
      }

      // ✅ Si llegamos aquí, el refresh falló - marcar como expirado
      console.log('Token refresh failed, marking session as expired');
      token.accessToken = undefined;
      token.refreshToken = undefined;
      token.expiresAt = undefined;
      token.error = 'RefreshTokenExpired';
      return token;
    },
    
    async session({ session, token }) {
      // ✅ Si hay error en el token, marcar sesión como inválida
      if (token.error) {
        console.log('Session marked as invalid due to token error:', token.error);
        session.error = token.error;
        session.accessToken = undefined;
        session.roles = [];
        session.clientRoles = [];
        session.resourceRoles = [];
        return session;
      }

      // ✅ Sesión válida - asignar datos
      if (typeof token.accessToken === 'string') {
        session.accessToken = token.accessToken;
      }
      
      session.roles = Array.isArray(token.roles) ? token.roles : [];
      session.clientRoles = Array.isArray(token.clientRoles) ? token.clientRoles : [];
      session.resourceRoles = Array.isArray(token.resourceRoles) ? token.resourceRoles : [];
      
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
    maxAge: 60 * 60, // 1 hora
    updateAge: 5 * 60, // Re-generar sesión cada 30 minutos de actividad
  },
  events: {
    async signOut({ token }) {
      // ✅ Logout en Keycloak al cerrar sesión
      if (token?.accessToken) {
        try {
          console.log('Performing Keycloak logout...');
          await fetch(
            `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token.accessToken}`,
              },
              body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_ID!,
                client_secret: process.env.KEYCLOAK_SECRET!,
                refresh_token: token.refreshToken as string,
              }),
            }
          );
          console.log('Keycloak logout successful');
        } catch (error) {
          console.error('Error during Keycloak logout:', error);
        }
      }
    },
  },
};