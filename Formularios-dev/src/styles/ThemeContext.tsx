"use client";

import React, {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "./theme";

const STORAGE_KEY = "darkMode";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback); // Escucha cambios desde otras pestañas
  window.addEventListener("theme-change", callback); // Escucha cambios en la misma pestaña
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-change", callback);
  };
};

const getSnapshot = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) === "true";
};

const getServerSnapshot = (): boolean => {
  return false; // Asumimos tema claro (false) por defecto en el servidor
};

// Crear contexto para el tema
type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personalizado para usar el contexto del tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useTheme debe ser usado dentro de un ThemeContextProvider",
    );
  }
  return context;
};

// Proveedor de contexto del tema
export function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const darkMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggleDarkMode = useCallback(() => {
    const currentMode = getSnapshot();
    const newMode = !currentMode;

    localStorage.setItem(STORAGE_KEY, String(newMode));

    window.dispatchEvent(new Event("theme-change"));
  }, []);

  // Devuelve un div vacío hasta que el componente esté montado
  // Esto evita inconsistencias durante la hidratación

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
