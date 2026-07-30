'use client';

import { useTransition } from 'react';
import { MenuItem, CircularProgress, ListItemIcon, ListItemText } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { authAdapter } from '../../infrastructure/adapters/authAdapter';

interface LogoutButtonProps {
  onClose?: () => void;
}

export function LogoutButton({ onClose }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    onClose?.();
    startTransition(async () => {
      await authAdapter.logout();
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
