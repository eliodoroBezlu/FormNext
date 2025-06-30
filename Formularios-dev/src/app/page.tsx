"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Button } from "@mui/material";

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
    </div>
  );
}