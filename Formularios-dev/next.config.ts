import type { NextConfig } from "next";


const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: '/api/forms/:path*',
        destination: `${apiUrl}/:path*`, // Proxy al API externo
      },
    ];
  },
  

  async headers() {
    return [
      {
        // Aplica estas cabeceras a todas las rutas
        source: "/:path*",
        headers: [
          // Cabecera CSP (Content Security Policy)
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'  ${apiUrl} http://localhost:8080; frame-ancestors 'self';`
          },
          // Anti-Clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevenir MIME-sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Eliminar X-Powered-By
          {
            key: "X-Powered-By",
            value: "false",
          },
          // Control de caché para contenido sensible
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
          // Prevenir XSS
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Política de referencias
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permisos
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
