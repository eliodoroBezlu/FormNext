// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al iniciar sesión' },
        { status: response.status }
      );
    }

    // 🔥 Extraer cookies del backend
    const setCookieHeader = response.headers.get('set-cookie');
    
    const nextResponse = NextResponse.json(data);

    // 🔥 Establecer cookies en Next.js
    if (setCookieHeader) {
      const cookiePairs = setCookieHeader.split(',').map(c => c.trim());
      
      for (const cookieStr of cookiePairs) {
        const [nameValue, ...options] = cookieStr.split(';');
        const [name, value] = nameValue.split('=');
        
        // Parsear opciones de cookie\
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cookieOptions: any = {
          httpOnly: true,
          path: '/',
        };

        options.forEach(opt => {
          const [key, val] = opt.trim().split('=');
          if (key.toLowerCase() === 'max-age') {
            cookieOptions.maxAge = parseInt(val);
          }
          if (key.toLowerCase() === 'secure') {
            cookieOptions.secure = true;
          }
          if (key.toLowerCase() === 'samesite') {
            cookieOptions.sameSite = val.toLowerCase();
          }
        });

        (await cookies()).set(name.trim(), value.trim(), cookieOptions);
      }
    }

    return nextResponse;
    
  } catch (error) {
  console.error('💥 [ME] Error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Error de conexión con el servidor' },
      { status: 500 }
    );
  }
}