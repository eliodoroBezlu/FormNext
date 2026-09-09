import type { NextConfig } from "next";

const apiUrl     = process.env.NEXT_PUBLIC_API_URL || '';
const iamCoreUrl = process.env.IAM_CORE_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    /**
     * Las subidas van por Server Actions, y el límite de Next por omisión es
     * **1 MB**. Una foto de tablet o de móvil pesa entre 3 y 6 MB, así que la
     * subida moría antes de salir del navegador con un «An error occurred in
     * the Server Components render» —un mensaje que no menciona el tamaño por
     * ningún lado y manda a buscar el fallo donde no está—.
     *
     * Se pone en 10 MB para que coincida con el tope que ya tenía Express en
     * el backend (`main.ts`). Tenerlos distintos significaba que quien
     * configuró uno creía haber configurado los dos.
     *
     * Las imágenes además se encogen en el cliente antes de subirlas
     * (`reducirImagen`), así que esto es el techo, no lo normal.
     */
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // openid-client (CommonJS) — no empaquetar; cargar como módulo de Node
  serverExternalPackages: ['openid-client'],

  async rewrites() {
    return [
      {
        source: '/api/forms/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/api/iam/:path*',
        destination: `${iamCoreUrl}/api/:path*`,
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
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self'; connect-src 'self'  ${apiUrl} http://localhost:8080 https://res.cloudinary.com; frame-ancestors 'self';`
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
            // `camera=(self)` y no `camera=()`: la lista vacía se lo prohíbe a
            // **todo el mundo, la propia página incluida**, así que la captura
            // de evidencia fallaba con «camera is not allowed in this
            // document» antes de llegar a pedir permiso al usuario. Con
            // `self` puede usarla esta app y siguen sin poder los iframes de
            // terceros. Micrófono y ubicación se quedan cerrados: no se usan.
            value:
              "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
