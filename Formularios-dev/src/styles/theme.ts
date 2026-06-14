import { createTheme, type ThemeOptions } from "@mui/material/styles";

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
    "@media (max-width:900px)": {
      fontSize: "0.9rem",
    },
    "@media (max-width:600px)": {
      fontSize: "0.8rem",
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

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1",
      light: "#818CF8",
      dark: "#4F46E5",
    },
    secondary: {
      main: "#06B6D4",
      light: "#22D3EE",
      dark: "#0891B2",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    divider: "#E2E8F0",
  },
  shadows: customShadows as ThemeOptions["shadows"],
  shape: {
    borderRadius: 12,
  },
  typography: sharedTypography,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: customShadows[1],
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: customShadows[3],
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          transition: "all 0.2s ease-in-out",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #6366F1, #818CF8)",
          color: "#FFFFFF",
          "&:hover": {
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.05)",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #6366F1, #4F46E5)",
          boxShadow: "0 4px 20px rgba(99, 102, 241, 0.15)",
        },
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
        root: {
          borderRadius: 12,
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);

export const darkTheme = createTheme({
  ...lightThemeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: "#818CF8",
      light: "#A5B4FC",
      dark: "#6366F1",
    },
    secondary: {
      main: "#22D3EE",
      light: "#67E8F9",
      dark: "#06B6D4",
    },
    success: {
      main: "#34D399",
      light: "#6EE7B7",
      dark: "#059669",
    },
    warning: {
      main: "#FBBF24",
      light: "#FDE68A",
      dark: "#D97706",
    },
    error: {
      main: "#F87171",
      light: "#FCA5A5",
      dark: "#DC2626",
    },
    background: {
      default: "#0F172A",
      paper: "#1E293B",
    },
    divider: "#334155",
  },
  components: {
    ...lightThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #334155",
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.3)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
  },
});
