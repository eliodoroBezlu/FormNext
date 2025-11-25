import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: { authorized: ({ token }) => !!token && !token?.error },
});
// export default withAuth(
//   async function middleware(req) {
//     const token = req.nextauth.token;
//     const pathname = req.nextUrl.pathname;

//     // ✅ Si no hay token, redirigir a login
//     if (!token) {
//       console.log(`❌ No token found for request to ${pathname}`);
//       return NextResponse.redirect(new URL('/?error=no_session', req.url));
//     }

//     // ✅ Si el token tiene error (expirado, refresh falló), redirigir y limpiar cookies
//     if (token.error) {
//       console.log(`❌ Token has error: ${token.error} for request to ${pathname}`);
//       const response = NextResponse.redirect(new URL('/?error=session_expired', req.url));
      
//       // Limpiar cookies de sesión
//       response.cookies.delete('next-auth.session-token');
//       response.cookies.delete('next-auth.csrf-token');
//       response.cookies.delete('next-auth.callback-url');
//       response.cookies.delete('__Secure-next-auth.session-token');
//       response.cookies.delete('__Secure-next-auth.callback-url');
//       response.cookies.delete('__Host-next-auth.csrf-token');
      
//       return response;
//     }

//     // ✅ Verificar que existe un accessToken válido
//     if (!token.accessToken) {
//       console.log(`❌ No access token found for request to ${pathname}`);
//       const response = NextResponse.redirect(new URL('/?error=invalid_token', req.url));
      
//       // Limpiar cookies
//       response.cookies.delete('next-auth.session-token');
//       response.cookies.delete('__Secure-next-auth.session-token');
      
//       return response;
//     }

//     // 🔥 VALIDACIÓN ADICIONAL: Verificar expiración del token
//     try {
//       const payload = JSON.parse(
//         Buffer.from(token.accessToken.toString().split('.')[1], 'base64').toString()
//       );
//       const expiresAt = payload.exp * 1000;
//       const now = Date.now();
      
//       // Si el token ya expiró
//       if (now >= expiresAt) {
//         console.error(`❌ Token expired for ${pathname}`);
        
//         // 🔥 CAMBIO: Mensaje claro sin promesas falsas
//         if (token.isInspector) {
//           console.error(`❌ Inspector token expired - session must be renewed with activity`);
//         }
        
//         const response = NextResponse.redirect(new URL('/?error=token_expired', req.url));
//         response.cookies.delete('next-auth.session-token');
//         response.cookies.delete('__Secure-next-auth.session-token');
//         return response;
//       }
      
//       // Log de advertencia si el token expira pronto (menos de 5 minutos)
//       const timeLeft = (expiresAt - now) / 1000;
//       if (timeLeft < 300) {
//         console.warn(`⚠️ Token expiring soon (${Math.floor(timeLeft)}s left) for ${pathname}`);
        
//         // 🔥 CAMBIO: Mensaje correcto sobre renovación
//         if (token.isInspector) {
//           console.log(`ℹ️ Inspector token will expire if no activity occurs`);
//         } else {
//           console.log(`ℹ️ User token will be refreshed on next activity`);
//         }
//       }
//     } catch (error) {
//       console.error(`❌ Error decoding token for ${pathname}:`, error);
//       const response = NextResponse.redirect(new URL('/?error=invalid_token', req.url));
//       response.cookies.delete('next-auth.session-token');
//       response.cookies.delete('__Secure-next-auth.session-token');
//       return response;
//     }

//     // ✅ Verificar permisos de ruta
//     const userRoles = (token?.roles as string[]) || [];
//     const clientRoles = (token?.clientRoles as string[]) || [];
//     const allRoles = [...userRoles, ...clientRoles];
    
//     const userRole = getUserRole(allRoles);
//     const routePermission = getRoutePermission(pathname);
    
//     if (routePermission && routePermission.requiredRoles.length > 0) {
//       const hasAccess = hasPermission(userRole, routePermission.requiredRoles);
      
//       if (!hasAccess) {
//         console.log(`🚫 Access denied for user ${token?.email} with role ${userRole} to ${pathname}`);
        
//         const redirectUrl = new URL('/dashboard', req.url);
//         redirectUrl.searchParams.set('error', 'unauthorized');
//         redirectUrl.searchParams.set('attempted', encodeURIComponent(pathname));
        
//         return NextResponse.redirect(redirectUrl);
//       }
//     }

//     // ✅ Log de acceso exitoso (solo en desarrollo)
//     if (process.env.NODE_ENV === 'development') {
//       const userIdentifier = token.isInspector ? 'Inspector' : token?.email;
//       console.log(`✅ Access granted to ${pathname} for ${userIdentifier}`);
//     }

//     // ✅ Todo bien, continuar
//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => {
//         // ✅ Verificar autorización básica
//         if (!token || token.error) {
//           return false;
//         }
        
//         // ✅ Debe tener un accessToken válido
//         return !!token.accessToken;
//       }
//     },
//   }
// );

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
    // Agregar otras rutas protegidas según necesites
  ]
};