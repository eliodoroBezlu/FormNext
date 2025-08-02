import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 400 }
      );
    }

    // Verificar directamente con Keycloak
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, error: "Token is invalid or expired" },
        { status: 401 }
      );
    }

    const userInfo = await response.json();
    return NextResponse.json({ 
      valid: true, 
      userInfo 
    });

  } catch (error) {
    console.error('Keycloak session check error:', error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate session" },
      { status: 500 }
    );
  }
}