// ./src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
    roles: string[]
    clientRoles: string[]
    resourceRoles: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    roles: string[]
    clientRoles: string[]
    resourceRoles: string[]
  }
}