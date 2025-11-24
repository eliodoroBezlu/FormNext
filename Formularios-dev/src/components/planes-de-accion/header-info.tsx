'use client';

import { useState } from 'react';
import { Card, CardContent, Grid, TextField, Typography, Box, IconButton } from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { OrganizationalInfo } from './types/IProps';

interface HeaderInfoProps {
  info: OrganizationalInfo;
  isEditable?: boolean;
  onSave?: (info: OrganizationalInfo) => void;
}

export function HeaderInfo({ info, isEditable = false, onSave }: HeaderInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(info);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo(info);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(info);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedInfo);
    }
    setIsEditing(false);
  };

  const handleChange = (field: keyof OrganizationalInfo, value: string) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Planilla de Seguimiento
          </Typography>
          {isEditable && !isEditing && (
            <IconButton onClick={handleEdit} size="small" color="primary">
              <Edit />
            </IconButton>
          )}
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handleSave} size="small" color="success">
                <Save />
              </IconButton>
              <IconButton onClick={handleCancel} size="small" color="error">
                <Cancel />
              </IconButton>
            </Box>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Vicepresidencia / Gerencia:
              </Typography>
              <TextField
                fullWidth
                value={isEditing ? editedInfo.vicepresidencia : info.vicepresidencia}
                onChange={(e) => handleChange('vicepresidencia', e.target.value)}
                disabled={!isEditing}
                variant="standard"
                size="small"
                InputProps={{
                  disableUnderline: !isEditing,
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Superintendencia Sénior:
              </Typography>
              <TextField
                fullWidth
                value={isEditing ? editedInfo.superintendenciaSenior : info.superintendenciaSenior}
                onChange={(e) => handleChange('superintendenciaSenior', e.target.value)}
                disabled={!isEditing}
                variant="standard"
                size="small"
                InputProps={{
                  disableUnderline: !isEditing,
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Superintendencia:
              </Typography>
              <TextField
                fullWidth
                value={isEditing ? editedInfo.superintendencia : info.superintendencia}
                onChange={(e) => handleChange('superintendencia', e.target.value)}
                disabled={!isEditing}
                variant="standard"
                size="small"
                InputProps={{
                  disableUnderline: !isEditing,
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ border: '1px solid #e0e0e0', p: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Área Física:
              </Typography>
              <TextField
                fullWidth
                value={isEditing ? editedInfo.areaFisica : info.areaFisica}
                onChange={(e) => handleChange('areaFisica', e.target.value)}
                disabled={!isEditing}
                variant="standard"
                size="small"
                InputProps={{
                  disableUnderline: !isEditing,
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}