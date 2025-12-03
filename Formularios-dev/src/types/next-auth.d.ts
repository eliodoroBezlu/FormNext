// import "next-auth";
// import "next-auth/jwt";

// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//     idToken?: string;
//     roles?: string[];
//     clientRoles?: string[];
//     resourceRoles?: string[];
//     error?: string;
//     isInspector?: boolean; // 🔥 NUEVO
//   }

//   interface User {
//     id: string;
//     accessToken?: string;
//     refreshToken?: string;
//     expiresAt?: number;
//     roles?: string[];
//   }

  
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken?: string;
//     refreshToken?: string;
//     idToken?: string;
//     expiresAt?: number;
//     roles?: string[];
//     clientRoles?: string[];
//     resourceRoles?: string[];
//     error?: string;
//     isInspector?: boolean; // 🔥 NUEVO
//   }
// }

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    roles?: string[];
    error?: string;
    isInspector?: boolean;
  }

  interface User {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
    error?: string;
    isInspector?: boolean;
  }
}