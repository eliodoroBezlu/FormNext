// app/api/auth/validate-session/route.ts
import {  NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // ✅ Obtener sesión del servidor
    const session = await getServerSession(authOptions);
    
    // ✅ Verificar que existe sesión y accessToken
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { 
          valid: false, 
          error: "No valid session found" 
        },
        { status: 401 }
      );
    }

    // ✅ Verificar si la sesión tiene error
    if (session.error) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Session error: ${session.error}` 
        },
        { status: 401 }
      );
    }

    // ✅ Validar el token directamente con Keycloak
    const keycloakResponse = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!keycloakResponse.ok) {
      console.log('Keycloak token validation failed:', keycloakResponse.status);
      return NextResponse.json(
        { 
          valid: false, 
          error: "Token validation failed with Keycloak" 
        },
        { status: 401 }
      );
    }

    const userInfo = await keycloakResponse.json();
    
    // ✅ Todo válido
    return NextResponse.json({
      valid: true,
      user: userInfo,
      session: {
        roles: session.roles || [],
        clientRoles: session.clientRoles || [],
        resourceRoles: session.resourceRoles || []
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: "Internal server error during validation" 
      },
      { status: 500 }
    );
  }
}