// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getRoutePermission, getUserRole, hasPermission } from "@/lib/routePermissions";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // ✅ Si no hay token, redirigir a login
    if (!token) {
      console.log(`No token found for request to ${pathname}`);
      return NextResponse.redirect(new URL('/', req.url));
    }

    // ✅ Si el token tiene error (expirado, refresh falló), redirigir y limpiar cookies
    if (token.error) {
      console.log(`Token has error: ${token.error} for request to ${pathname}`);
      const response = NextResponse.redirect(new URL('/', req.url));
      
      // Limpiar cookies de sesión
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('next-auth.csrf-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      
      return response;
    }

    // ✅ Verificar que existe un accessToken válido
    if (!token.accessToken) {
      console.log(`No access token found for request to ${pathname}`);
      const response = NextResponse.redirect(new URL('/', req.url));
      
      // Limpiar cookies
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('next-auth.csrf-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      
      return response;
    }

    // ✅ Verificar permisos de ruta
    const userRoles = token?.roles as string[] || [];
    const clientRoles = token?.clientRoles as string[] || [];
    const allRoles = [...userRoles, ...clientRoles];
    
    const userRole = getUserRole(allRoles);
    const routePermission = getRoutePermission(pathname);
    
    if (routePermission && routePermission.requiredRoles.length > 0) {
      const hasAccess = hasPermission(userRole, routePermission.requiredRoles);
      
      if (!hasAccess) {
        console.log(`Access denied for user ${token?.email} with role ${userRole} to ${pathname}`);
        
        const redirectUrl = new URL('/dashboard', req.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        redirectUrl.searchParams.set('attempted', encodeURIComponent(pathname));
        
        return NextResponse.redirect(redirectUrl);
      }
    }

    // ✅ Todo bien, continuar
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // ✅ Verificar autorización básica
        if (!token || token.error) {
          return false;
        }
        
        // ✅ Debe tener un accessToken válido
        return !!token.accessToken;
      }
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
    // Agregar otras rutas protegidas según necesites
  ]
};