// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    error?: string;
    roles: string[];
    clientRoles: string[];
    resourceRoles: string[];
  }

  interface User {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    roles?: string[];
    clientRoles?: string[];
    resourceRoles?: string[];
  }
}