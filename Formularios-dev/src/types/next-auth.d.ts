// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string; // ✅ AGREGADO
    error?: string;
    roles: string[];
    clientRoles: string[];
    resourceRoles: string[];
  }

  interface User {
    accessToken?: string;
    idToken?: string; // ✅ AGREGADO
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string; // ✅ AGREGADO
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    roles?: string[];
    clientRoles?: string[];
    resourceRoles?: string[];
  }
}