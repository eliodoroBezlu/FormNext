import { createTheme, type ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900, 
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      "@media (max-width:900px)": {
        fontSize: "2rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    body1: {
      fontSize: "1rem",
      "@media (max-width:900px)": {
        fontSize: "0.9rem",
      },
      "@media (max-width:600px)": {
        fontSize: "0.8rem",
      },
    },
  },
  spacing: (factor: number) => `${factor * 8}px`, // Espaciado adaptable
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          "@media (max-width:900px)": {
            fontSize: "0.9rem",
          },
          "@media (max-width:600px)": {
            fontSize: "0.8rem",
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme(themeOptions);

export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    ...themeOptions.palette,
    mode: "dark",
  },
});
