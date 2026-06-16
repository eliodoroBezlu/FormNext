"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  AppBar,
  IconButton,
  ThemeProvider,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CloseIcon from "@mui/icons-material/Close";
import { Navigation } from "@/components/layout/navigation/Navigation";
import { lightTheme, darkTheme } from "../../styles/theme";
import { LogoutButton } from "@/components/features/auth/presentation/components/LogoutButton";
import { useUserRole } from "@/hooks/useUserRole";
import { DynamicBreadcrumbs } from "@/components/layout/navigation/DynamicBreadcrumbs";

const drawerWidth = 300;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useUserRole();

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) setDarkMode(savedTheme === "true");
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => setOpen(!open);

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
  };

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleUserMenuClose = () => setAnchorEl(null);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  const currentTheme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* AppBar superior con Glassmorphism y botón de menú visible siempre */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 2, // Por encima del drawer para mantenerlo accesible
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.96), rgba(79, 70, 229, 0.96))",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800 }}>
                Sistema de Inspecciones
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton color="inherit" onClick={handleThemeToggle} size="medium">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>

              <Box
                onClick={handleUserMenuOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  p: "5px 12px 5px 5px",
                  borderRadius: "24px",
                  background: "rgba(255, 255, 255, 0.14)",
                  transition: "background 0.15s",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.26)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#4F46E5",
                    width: 34,
                    height: 34,
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {getInitials(user?.fullName || user?.username)}
                </Avatar>
                <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.1 }}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    {user?.fullName || user?.username || "Usuario"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      opacity: 0.8,
                      color: "#ffffff",
                    }}
                  >
                    {user?.roles?.[0] || "Administrador"}
                  </Typography>
                </Box>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 180,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    borderRadius: 3,
                  },
                }}
              >
                <MenuItem disabled sx={{ opacity: 0.8, fontSize: "0.85rem", fontWeight: 600 }}>
                  Sesión: {user?.roles?.[0] || "Ninguno"}
                </MenuItem>
                <Divider />
                <LogoutButton onClose={handleUserMenuClose} />
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Drawer único para todos los dispositivos (temporal) */}
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🛡️
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                San Cristóbal
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <Navigation onNavigate={handleDrawerToggle} />
        </Drawer>

        {/* Contenido principal ocupando todo el ancho */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            bgcolor: "background.default",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Toolbar />
          <Box className="fade-in" sx={{ flexGrow: 1 }}>
            <DynamicBreadcrumbs />
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}