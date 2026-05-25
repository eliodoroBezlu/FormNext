// src/components/organisms/inspection-form-iro-isop/presentation/components/sections/CriterioValoracionSection.tsx

import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Grid } from "@mui/material";
import { ExpandMore, Info } from "@mui/icons-material";
import { getValoracionMessage } from "@/components/organisms/inspection-form-iro-isop/domain/models/IroIsopDomain";

interface CriterioValoracionSectionProps {
  documentCode: string;
}

export const CriterioValoracionSection = ({ documentCode }: CriterioValoracionSectionProps) => {
  const valMessage = getValoracionMessage(documentCode);

  return (
    <Accordion elevation={2} sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ bgcolor: "info.main", color: "white" }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Info />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {valMessage.title}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Box p={2}>
          {valMessage.items.map((item: { valoracion: number | string; criterio: string; isopMSC?: string; isopEECC?: string }, idx: number) => (
            <Box key={idx} sx={{ borderBottom: "1px solid #eee", py: 2 }}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{ xs: 2, sm: 1 }}>
                  <Typography fontWeight="bold" color="info.main" variant="body1">
                    {item.valoracion}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 10, sm: valMessage.showConformacion ? 5 : 11 }}>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>
                    {item.criterio}
                  </Typography>
                </Grid>

                {valMessage.showConformacion && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          ISOP MSC:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                          {item.isopMSC || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          ISOP EECC:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                          {item.isopEECC || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}
          {valMessage.nota && (
            <Typography variant="caption" display="block" color="error" sx={{ mt: 2, fontStyle: "italic", fontWeight: "medium" }}>
              * Nota: {valMessage.nota}
            </Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
