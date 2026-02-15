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
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography as MuiTypography,
  Chip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";

import { Navigation } from "@/components/organisms/Navigation";
import { Typography } from "@/components/atoms/Typography";
import { lightTheme, darkTheme } from "../../styles/theme";
import { logoutAction } from "@/app/actions/auth";
import { useUserRole } from "@/hooks/useUserRole";

const drawerWidth = 350;

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ Obtener datos del usuario desde el Context
  const { user, userRole } = useUserRole();

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(savedTheme === "true");
    }
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    setLoggingOut(true);
    
    try {
      console.log('🚪 [LAYOUT] Iniciando logout...');
      await logoutAction(); // Server Action
      // El redirect dentro de logoutAction() maneja la redirección
    } catch (error) {
      console.error('💥 [LAYOUT] Error en logout:', error);
      // Intentar redirección manual como fallback
      window.location.href = '/login';
    } finally {
      setLoggingOut(false);
    }
  };

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>

            <IconButton color="inherit" onClick={handleThemeToggle}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              sx={{ ml: 1 }}
              disabled={loggingOut}
            >
              <AccountCircleIcon />
            </IconButton>

            {/* Menu de Usuario */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: { minWidth: 280 }
              }}
            >
              {/* Header con Avatar y Nombre */}
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <MuiTypography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user?.fullName || user?.username || 'Usuario'}
                  </MuiTypography>
                  {userRole && (
                    <Chip 
                      label={userRole.toUpperCase()} 
                      size="small" 
                      color="primary"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Info del Usuario */}
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={user?.username || 'Usuario'} 
                  secondary="Usuario"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </MenuItem>

              {user?.email && (
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <ListItemIcon>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={user.email} 
                    secondary="Email"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </MenuItem>
              )}

              <Divider />

              {/* Cerrar Sesión */}
              <MenuItem 
                onClick={handleLogout}
                disabled={loggingOut}
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.dark',
                  }
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>
                  {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                </ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              height: "100%",
              zIndex: (theme) => theme.zIndex.drawer + 2,
            },
          }}
        >
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Toolbar>

          <Navigation onNavigate={handleDrawerToggle} />
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: "100%",
            marginLeft: 0,
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}