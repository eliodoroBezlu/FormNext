import { createTheme, type ThemeOptions } from "@mui/material/styles"

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
}

export const lightTheme = createTheme(themeOptions)

export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    ...themeOptions.palette,
    mode: "dark",
  },
})

