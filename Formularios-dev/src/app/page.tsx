"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Button } from "@mui/material";
//import LoginButton from "@/components/atoms/login-button/LoginButton";

export default function Home() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/dashboard");
  };
  return (
    <div className={styles.page}>
      <h1>Haga click para ir al dashboard</h1>

      <Button variant="contained" color="primary" onClick={handleRedirect}>
        Dashboard
      </Button>
{/* 
      <h1>Prueba de login </h1>
      <h1>Bienvenido</h1>
      <LoginButton /> */}
    </div>
  );
}
