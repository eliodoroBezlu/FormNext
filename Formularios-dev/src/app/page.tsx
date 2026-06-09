// "use client";
// import { useRouter } from "next/navigation";
// import styles from "./page.module.css";
// import { Box, Button, Alert } from "@mui/material";
// import { Typography } from "@/components/atoms/Typography";

// export default function Home() {
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   const handleRedirect = () => {
//     router.push("/dashboard");
//   };

//   const handleSignOut = async () => {
//     // 🔥 Simple: NextAuth maneja todo el logout (incluyendo Keycloak)
//     await signOut({ callbackUrl: "/" });
//   };

//   const handleInspectorLogin = () => {
//     signIn("inspector", { callbackUrl: "/dashboard" });
//   };

//   if (status === "loading") {
//     return (
//       <div className={styles.page}>
//         <Typography variant="h5">Cargando...</Typography>
//       </div>
//     );
//   }

//   // 🔥 Mostrar error si la sesión expiró
//   if (session?.error) {
//     return (
//       <div className={styles.page}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
//         </Alert>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => window.location.reload()}
//         >
//           Recargar Página
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.page}>
//       {session ? (
//         <Box>
//           <Typography variant="h4" gutterBottom>
//             Bienvenido, {session.user?.name || session.user?.email}
//           </Typography>
          
//           {session.isInspector && (
//             <Alert severity="info" sx={{ mb: 2 }}>
//               Sesión de Inspector Técnico activa (renovación automática cada 15 minutos)
//             </Alert>
//           )}

//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleRedirect}
//             sx={{ mr: 2 }}
//           >
//             Ir al Dashboard
//           </Button>
//           <Button variant="outlined" color="secondary" onClick={handleSignOut}>
//             Cerrar Sesión
//           </Button>
//         </Box>
//       ) : (
//         <Box>
//           <Typography variant="h4" gutterBottom>
//             Seleccione su tipo de acceso
//           </Typography>

//           <Button
//             variant="contained"
//             color="success"
//             onClick={handleInspectorLogin}
//             sx={{ mr: 2, mb: 2 }}
//           >
//             🔧 Iniciar Sesión como Inspector
//           </Button>

//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => signIn("keycloak")}
//             sx={{ mr: 2, mb: 2 }}
//           >
//             🔑 Iniciar Sesión 
//           </Button>
//         </Box>
//       )}
//     </div>
//   );
// }
'use client'

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Box, Button, Alert, CircularProgress } from "@mui/material";
import { inspectorLoginAction } from "@/app/actions/auth";

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleInspectorLogin = () => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await inspectorLoginAction();

        if (result?.success) {
          console.log('✅ Inspector autenticado, redirigiendo...');
          router.push('/dashboard');
          router.refresh();
        } else {
          setError(result?.error || 'Error al iniciar sesión como inspector');
        }
      } catch (err) {
        console.error('💥 Error inesperado en login de inspector:', err);
        setError('Error inesperado al iniciar sesión. Intenta de nuevo.');
      }
    });
  };

  const handleAccountLogin = () => {
    // Inicia el flujo OIDC. /api/auth/login redirige a IAM Core /authorize,
    // que a su vez muestra el login de IAM Portal si no hay sesión SSO.
    // Navegación dura (no router.push) porque sigue redirects cross-origin.
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    window.location.href = redirect
      ? `/api/auth/login?redirect=${encodeURIComponent(redirect)}`
      : '/api/auth/login';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box
        sx={{
          background: 'white',
          borderRadius: 4,
          p: 6,
          minWidth: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 32, fontSize: 28 }}>
          Seleccione su tipo de acceso
        </h1>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Botón Inspector */}
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleInspectorLogin}
            disabled={isPending}
            sx={{
              py: 2,
              fontSize: 16,
              fontWeight: 'bold',
              textTransform: 'none',
            }}
            startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <>🔧</>}
          >
            {isPending ? 'Iniciando sesión...' : 'Acceso Inspector Técnico'}
          </Button>

          {/* Botón Keycloak */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleAccountLogin}
            disabled={isPending}
            sx={{
              py: 2,
              fontSize: 16,
              fontWeight: 'bold',
              textTransform: 'none',
            }}
            startIcon={<>🔑</>}
          >
            Iniciar Sesión con Cuenta
          </Button>
        </Box>

        {/* Info */}
        <Box sx={{ mt: 4, p: 2, background: '#f0f0f0', borderRadius: 2 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#666', textAlign: 'center' }}>
            <strong>Inspector:</strong> Acceso directo sin credenciales
            <br />
            <strong>Cuenta:</strong> Usuario y contraseña
          </p>
        </Box>
      </Box>
    </Box>
  );
}