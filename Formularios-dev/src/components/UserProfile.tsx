"use client";

import { useCurrentUser } from '@/hooks/useUser';
import { Box, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';

export function UserProfile() {
  const { user, loading, error } = useCurrentUser();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading user profile: {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No user data available
      </Alert>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          User Profile
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            <strong>Username:</strong> {user.username}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user.email}
          </Typography>
          {user.firstName && (
            <Typography variant="body1">
              <strong>First Name:</strong> {user.firstName}
            </Typography>
          )}
          {user.lastName && (
            <Typography variant="body1">
              <strong>Last Name:</strong> {user.lastName}
            </Typography>
          )}
          <Typography variant="body1">
            <strong>Roles:</strong> {user.roles.join(', ')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}