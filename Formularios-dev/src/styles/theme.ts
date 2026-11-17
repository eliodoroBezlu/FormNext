import { alpha, createTheme, type ThemeOptions } from "@mui/material/styles";
import { DERIVADOS, MARCA, superficieDeMarca } from "./marca";

// Obtener sombras por defecto de MUI para usarlas de base
const baseTheme = createTheme();
const customShadows = [...baseTheme.shadows];

// Sobrescribir las sombras del 1 al 4 con sombras difusas, suaves y modernas
customShadows[1] = "0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.02)";
customShadows[2] = "0px 4px 6px -1px rgba(0, 0, 0, 0.08), 0px 2px 4px -1px rgba(0, 0, 0, 0.04)";
customShadows[3] = "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)";
customShadows[4] = "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)";

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: "2.5rem",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    "@media (max-width:900px)": {
      fontSize: "2rem",
    },
    "@media (max-width:600px)": {
      fontSize: "1.5rem",
    },
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 600,
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 600,
  },
  h6: {
    fontSize: "1.05rem",
    fontWeight: 600,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.7,
    // En el celular no baja de 14px: se lee en planta, a pleno sol y con guantes.
    "@media (max-width:900px)": {
      fontSize: "0.9rem",
    },
    "@media (max-width:600px)": {
      fontSize: "0.875rem",
    },
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.6,
  },
  button: {
    fontSize: "0.95rem",
    fontWeight: 600,
    textTransform: "none" as const,
    letterSpacing: "0.025em",
  },
};

// ─── Paleta ──────────────────────────────────────────────────────────────────
// Marca de la empresa (petróleo, acero, gris claro, blanco: `marca.ts`) y
// colores de estado oscurecidos para que el texto blanco encima pase AA (4,5:1).
// Contrastes medidos en `docs/SISTEMA_DE_DISENO.md`, sección 1.

const paletaClara: ThemeOptions["palette"] = {
  mode: "light",
  primary: { main: MARCA.petroleo, light: MARCA.acero, dark: DERIVADOS.petroleoOscuro, contrastText: MARCA.blanco },
  secondary: { main: MARCA.acero, light: DERIVADOS.aceroMedio, dark: DERIVADOS.aceroOscuro, contrastText: MARCA.blanco },
  success: { main: "#15803D", light: "#22A35A", dark: "#166534", contrastText: MARCA.blanco },
  warning: { main: "#B45309", light: "#F59E0B", dark: "#92400E", contrastText: MARCA.blanco },
  error: { main: "#B91C1C", light: "#DC2626", dark: "#991B1B", contrastText: MARCA.blanco },
  info: { main: "#0369A1", light: "#0EA5E9", dark: "#075985", contrastText: MARCA.blanco },
  background: { default: MARCA.grisClaro, paper: MARCA.blanco },
  text: { primary: DERIVADOS.tinta, secondary: DERIVADOS.aceroOscuro, disabled: "rgba(15, 30, 41, 0.38)" },
  divider: DERIVADOS.bordeClaro,
  action: { hover: "rgba(24, 54, 74, 0.06)", selected: "rgba(24, 54, 74, 0.10)" },
};

const paletaOscura: ThemeOptions["palette"] = {
  mode: "dark",
  primary: { main: DERIVADOS.hielo, light: DERIVADOS.aceroPalido, dark: DERIVADOS.aceroMedio, contrastText: DERIVADOS.petroleoProfundo },
  secondary: { main: DERIVADOS.aceroMedio, light: DERIVADOS.aceroClaro, dark: MARCA.acero, contrastText: DERIVADOS.petroleoProfundo },
  success: { main: "#4ADE80", light: "#86EFAC", dark: "#15803D", contrastText: DERIVADOS.petroleoProfundo },
  warning: { main: "#FBBF24", light: "#FDE68A", dark: "#B45309", contrastText: DERIVADOS.petroleoProfundo },
  error: { main: "#F87171", light: "#FCA5A5", dark: "#B91C1C", contrastText: DERIVADOS.petroleoProfundo },
  info: { main: "#38BDF8", light: "#7DD3FC", dark: "#0369A1", contrastText: DERIVADOS.petroleoProfundo },
  background: { default: DERIVADOS.petroleoProfundo, paper: DERIVADOS.papelOscuro },
  text: { primary: MARCA.blanco, secondary: DERIVADOS.aceroClaro },
  divider: DERIVADOS.bordeOscuro,
  action: { hover: "rgba(169, 195, 211, 0.08)", selected: "rgba(169, 195, 211, 0.16)" },
};

// ─── Componentes ─────────────────────────────────────────────────────────────
// Los valores que cambian con el modo se leen del tema, no se escriben.
const componentes: ThemeOptions["components"] = {
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 16,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === "dark" ? "0px 1px 3px rgba(0, 0, 0, 0.2)" : customShadows[1],
        transition: "box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out",
        // Solo sube la tarjeta que se puede pulsar: una que no hace nada al clic
        // no debe parecer un botón. Pulsable = con CardActionArea o con la
        // clase `tarjeta-pulsable` (StyledCard tiene su propio efecto).
        "&:has(> .MuiCardActionArea-root):hover, &.tarjeta-pulsable:hover": {
          boxShadow: theme.palette.mode === "dark" ? "0px 10px 15px -3px rgba(0, 0, 0, 0.3)" : customShadows[3],
          transform: "translateY(-2px)",
          cursor: "pointer",
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        textTransform: "none",
        fontWeight: 600,
        padding: "10px 24px",
        transition: "background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease",
        // Respuesta al presionar (también en el celular).
        "&:active": { transform: "scale(0.98)" },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:active": { transform: "none" },
        },
      },
      // Sin degradado: el color sólido del tema (12,6:1 con texto blanco).
      containedPrimary: ({ theme }) => ({
        "&:hover": { backgroundColor: theme.palette.primary.dark },
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { borderRadius: 12 },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .MuiOutlinedInput-root": {
          borderRadius: 10,
          transition: "box-shadow 0.2s ease-in-out",
          "&:hover": {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.06)}`,
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
          },
        },
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 500 },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      // La barra es petróleo en los dos modos (`superficieDeMarca`).
      root: ({ theme }) => ({
        background: superficieDeMarca(theme.palette.mode),
        color: MARCA.blanco,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 1px 0 ${DERIVADOS.bordeOscuro}`
            : "0 4px 20px rgba(24, 54, 74, 0.18)",
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: "none",
        boxShadow: "4px 0 25px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.95rem",
        minHeight: 48,
        transition: "all 0.2s ease",
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: 12 },
    },
  },
};

const base: ThemeOptions = {
  shadows: customShadows as ThemeOptions["shadows"],
  shape: { borderRadius: 12 },
  typography: sharedTypography,
  components: componentes,
};

export const lightTheme = createTheme({ ...base, palette: paletaClara });
export const darkTheme = createTheme({ ...base, palette: paletaOscura });
