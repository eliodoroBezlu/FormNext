// components/UserInfo.tsx - Componente para mostrar info del usuario

import { Box, Chip, Avatar, Typography } from "@mui/material";
import { useUserRole } from "@/hooks/useUserRole";

export function UserInfo() {
  const { user, isLoading: authLoading } = useUserRole()
  const { userRole } = useUserRole();

  if (!user || authLoading) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'supervisor': return 'warning';
      case 'operator': return 'primary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'tecnico': return 'tecnico';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} p={2}>
      <Avatar 
        src={undefined}
        alt={user.username || 'Usuario'}
      >
        {user?.username?.[0] || user.email?.[0] || 'U'}
      </Avatar>
      <Box>
        <Typography variant="subtitle2">
          {user?.username || user.email}
        </Typography>
        {userRole && (
          <Chip 
            label={getRoleLabel(userRole)} 
            size="small" 
            color={getRoleColor(userRole)}
          />
        )}
      </Box>
    </Box>
  );
}