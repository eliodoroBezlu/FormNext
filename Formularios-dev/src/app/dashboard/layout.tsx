'use client';

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
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Navigation } from "@/components/organisms/Navigation";
import { Typography } from "@/components/atoms/Typography";
import { UserInfo } from "@/components/UserInfo";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lightTheme, darkTheme } from "../../styles/theme";
import { signOut } from "next-auth/react";
import CloseIcon from "@mui/icons-material/Close";


const drawerWidth = 350;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
    }
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleUserMenuClose();
    signOut();
  };


  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ProtectedRoute>
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
                  aria-label="open drawer"
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
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <UserInfo />
                  <Divider />
                  <MenuItem onClick={handleSignOut}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Cerrar Sesión
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
              <Navigation onNavigate={handleDrawerToggle}/>
            </Drawer>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: "100%",
                marginLeft: 0,
                transition: (theme) =>
                  theme.transitions.create(["margin", "width"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                  }),
              }}
            >
              <Toolbar />
              {children}
            </Box>
          </Box>
        </ThemeProvider>
    </ProtectedRoute>
  );
}