'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Chip,
  Divider,
  Typography,
  Button,
} from '@mui/material';
import {
  AccessTime,
  Person,
  CalendarToday,
  ArrowForward,
} from '@mui/icons-material';
import { InspectionResponse } from '@/lib/actions/inspection-herra-equipos';
import {
  formatDate,
  getDaysAgo,
  getUrgencyColor,
  getBorderColor,
} from './urgencyUtils';

interface ApprovalCardProps {
  insp: InspectionResponse;
  onView: (i: InspectionResponse) => void;
}

export function ApprovalCard({ insp, onView }: ApprovalCardProps) {
  const urgency = getUrgencyColor(insp.submittedAt);

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: '4px solid',
        borderLeftColor: getBorderColor(urgency),
        transition: 'transform 0.12s, box-shadow 0.12s',
        '&:hover': { transform: 'translateX(3px)', boxShadow: 3 },
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={0.5}>
              <Chip
                label="Pendiente"
                color="warning"
                size="small"
                icon={<AccessTime />}
              />
              {urgency !== 'default' && (
                <Chip
                  label={getDaysAgo(insp.submittedAt)}
                  color={urgency}
                  size="small"
                />
              )}
            </Stack>
            <Divider sx={{ my: 0.75 }} />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              color="text.secondary"
            >
              {insp.submittedBy && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Person fontSize="small" />
                  <Typography variant="body2">{insp.submittedBy}</Typography>
                </Box>
              )}
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarToday fontSize="small" />
                <Typography variant="body2">
                  {formatDate(insp.submittedAt)} · {getDaysAgo(insp.submittedAt)}
                </Typography>
              </Box>
            </Stack>
            {insp.verification && Object.keys(insp.verification).length > 0 && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  DATOS DEL EQUIPO
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.75} mt={0.5}>
                  {Object.entries(insp.verification)
                    .filter(([, v]) => v !== '' && v != null)
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.68rem', height: 22 }}
                      />
                    ))}
                </Stack>
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => onView(insp)}
            sx={{ whiteSpace: 'nowrap', alignSelf: 'center' }}
          >
            Revisar y Aprobar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
