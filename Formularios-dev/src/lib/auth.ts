import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

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
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
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