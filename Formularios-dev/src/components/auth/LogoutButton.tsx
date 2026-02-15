// components/auth/LogoutButton.tsx
'use client';

import {  useTransition } from 'react';
import { MenuItem, CircularProgress, ListItemIcon, ListItemText } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { logoutAction } from '@/app/actions/auth'; // 'use server' está en auth.ts

interface LogoutButtonProps {
  onClose?: () => void;
}

export function LogoutButton({ onClose }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    onClose?.();
    // 🔥 useTransition maneja correctamente las Server Actions asíncronas
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <MenuItem onClick={handleLogout} disabled={isPending}>
      <ListItemIcon>
        {isPending
          ? <CircularProgress size={20} />
          : <LogoutIcon fontSize="small" />
        }
      </ListItemIcon>
      <ListItemText>
        {isPending ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </ListItemText>
    </MenuItem>
  );
}