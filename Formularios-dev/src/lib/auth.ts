import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

interface KeycloakJWTPayload {
  realm_access?: {
    roles: string[]
  }
  resource_access?: Record<string, {
    roles: string[]
  }>
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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        if (account.access_token) {
          try {
            // Decodificar el JWT para obtener los roles
            const payload: KeycloakJWTPayload = JSON.parse(
              Buffer.from(account.access_token.split('.')[1], 'base64').toString()
            );
            const clientId = process.env.KEYCLOAK_ID || "next-app-client";
            
            // Keycloak puede almacenar roles en diferentes lugares según la configuración
            token.roles = payload.realm_access?.roles || [];
            token.resourceRoles = payload.resource_access?.[clientId]?.roles || [];
            
            // También podemos obtener roles de cliente específico
            const clientRoles = payload.resource_access?.[process.env.KEYCLOAK_ID!]?.roles || [];
            token.clientRoles = clientRoles;
            
          } catch (error) {
            console.error('Error decoding access token:', error);
            token.roles = [];
            token.clientRoles = [];
            token.resourceRoles = [];
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Usar type assertion más específico o validación
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
  debug: true,
  session: {
    strategy: "jwt"
  }
}
