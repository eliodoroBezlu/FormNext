import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  LinearProgress,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Warning, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { AreaStats } from '../types/IProps';
import { chartColors } from '@/styles/chartTheme';

interface LiveCommandCenterProps {
  estadisticasGlobales: AreaStats[];
  alertasCriticasCount: number;
}

export const LiveCommandCenter = ({
  estadisticasGlobales,
  alertasCriticasCount,
}: LiveCommandCenterProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
            >
              🚨 Seguimiento en Tiempo Real
            </Typography>
            <Chip
              label={`${alertasCriticasCount} CRÍTICAS`}
              color="error"
              size="small"
            />
          </Box>
          
          <TableContainer sx={{ 
            maxHeight: 400,
            '& .MuiTableCell-root': {
              py: { xs: 1, sm: 1.5 },
              px: { xs: 0.5, sm: 1, md: 2 }
            }
          }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minWidth: { xs: 80, sm: 120 }
                  }}>
                    ÁREA
                  </TableCell>
                  
                  {!isMobile && (
                    <>
                      <TableCell sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 120
                      }}>
                        SUPERINTENDENCIA
                      </TableCell>
                      
                      <TableCell sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 100
                      }}>
                        RESPONSABLE
                      </TableCell>
                    </>
                  )}
                  
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    ÚLTIMA INSPECCIÓN
                  </TableCell>
                  
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    ESTADO
                  </TableCell>
                  
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    CUMPLIMIENTO
                  </TableCell>
                  
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    EXTINTORES
                  </TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {estadisticasGlobales.slice(0, 10).map((area) => (
                  <TableRow key={area.tag} hover>
                    <TableCell>
                      <Box>
                        <Typography 
                          fontWeight="bold" 
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {area.area}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {area.tag}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    {!isMobile && (
                      <>
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {area.superintendencia.length > 40
                            ? area.superintendencia.substring(0, 40) + '...'
                            : area.superintendencia}
                        </TableCell>
                        
                        <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {area.responsable}
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {area.ultimaInspeccion === 'Nunca'
                        ? 'Nunca'
                        : new Date(area.ultimaInspeccion).toLocaleDateString()}
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={area.estado}
                        size="small"
                        color={
                          area.estado === 'OPTIMO'
                            ? 'success'
                            : area.estado === 'ADVERTENCIA'
                            ? 'warning'
                            : 'error'
                        }
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 24, sm: 32 }
                        }}
                        icon={
                          area.estado === 'OPTIMO' ? (
                            <CheckCircle />
                          ) : area.estado === 'CRITICO' ? (
                            <Warning />
                          ) : (
                            <ErrorIcon />
                          )
                        }
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={area.cumplimiento}
                          sx={{
                            width: { xs: 40, sm: 60 },
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(85, 68, 68, 0.3)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                area.cumplimiento >= 90
                                  ? chartColors.colorExito
                                  : area.cumplimiento >= 60
                                  ? chartColors.estadoWarning
                                  : chartColors.estadoError,
                            },
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            minWidth: { xs: 30, sm: 40 }
                          }}
                        >
                          {area.cumplimiento}%
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          textAlign: 'center',
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {area.extintoresInspeccionados}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Grid>
  );
};