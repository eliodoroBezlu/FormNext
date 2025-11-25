// /app/inspeccion/login/page.tsx
'use client';

import { Button } from '@mui/material';

export default function InspectorLoginPage() {

  const handleInspectorLogin = async () => {
    // Llama a la API que obtiene el token técnico
    window.location.href = '/api/auth/inspector/login';
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Acceso para Inspectores</h1>
      <p>Presione el botón para iniciar sesión como inspector técnico</p>
      <Button
        variant="contained"
        color="primary"
        onClick={handleInspectorLogin}
        sx={{ mt: 2 }}
      >
        Iniciar Sesión como Inspector
      </Button>
    </div>
  );
}