'use client';

import Button from "@mui/material/Button";

export default function LoginButton() {
  const handleLogin = () => {
    // URL a donde debemos regresar después de autenticarnos
    const callbackUrl = "http://localhost:3001/callback";
    
    // Asegurarnos de usar 'redirect' como parámetro para coincidir con lo que espera LoginForm
    const loginUrl = `http://localhost:3003/login?redirect=${encodeURIComponent(callbackUrl)}`;
    
    console.log("Redirigiendo a:", loginUrl);
    window.location.href = loginUrl; // redirección real fuera del dominio
  };
  
  return (
    <Button variant="contained" color="primary" onClick={handleLogin}>
      Iniciar sesión
    </Button>
  );
}