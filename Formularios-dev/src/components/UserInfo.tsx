// components/UserInfo.tsx - Componente para mostrar info del usuario
import { useSession } from "next-auth/react";
import { Box, Chip, Avatar, Typography } from "@mui/material";
import { useUserRole } from "@/hooks/useUserRole";

export function UserInfo() {
  const { data: session } = useSession();
  const { userRole } = useUserRole();

  if (!session) return null;

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
      case 'operator': return 'Operador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} p={2}>
      <Avatar 
        src={session.user?.image || undefined}
        alt={session.user?.name || 'Usuario'}
      >
        {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
      </Avatar>
      <Box>
        <Typography variant="subtitle2">
          {session.user?.name || session.user?.email}
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