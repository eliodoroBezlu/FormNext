'use client';
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Badge,
  Stack,
} from '@mui/material';
import { ExpandMore, Folder, FolderOpen } from '@mui/icons-material';
import { InspectionResponse } from '@/lib/actions/inspection-herra-equipos';
import { maxUrgencyOf } from './urgencyUtils';
import { ApprovalCard } from './ApprovalCard';

interface TemplateAccordionProps {
  templateCode: string;
  templateName: string;
  items: InspectionResponse[];
  expanded: boolean;
  onToggle: () => void;
  onView: (i: InspectionResponse) => void;
  indent?: boolean;
}

export function TemplateAccordion({
  templateCode,
  templateName,
  items,
  expanded,
  onToggle,
  onView,
  indent = false,
}: TemplateAccordionProps) {
  const urgency = maxUrgencyOf(items);

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      elevation={indent ? 0 : 2}
      variant={indent ? 'outlined' : 'elevation'}
      sx={{
        borderLeft: '4px solid',
        borderLeftColor:
          urgency === 'error'
            ? 'error.main'
            : urgency === 'warning'
              ? 'warning.main'
              : 'primary.main',
        '&:before': { display: 'none' },
        ...(indent && { ml: 1 }),
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          {expanded ? (
            <FolderOpen color="primary" fontSize="small" />
          ) : (
            <Folder
              color={
                urgency === 'error'
                  ? 'error'
                  : urgency === 'warning'
                    ? 'warning'
                    : 'primary'
              }
              fontSize="small"
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600} variant="body1">
              {templateName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {templateCode}
            </Typography>
          </Box>
          <Badge
            badgeContent={items.length}
            color={urgency === 'default' ? 'primary' : urgency}
            sx={{ mr: 2 }}
          >
            <Chip label="pendientes" size="small" variant="outlined" />
          </Badge>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={1.5}>
          {items.map((insp) => (
            <ApprovalCard key={insp._id} insp={insp} onView={onView} />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
