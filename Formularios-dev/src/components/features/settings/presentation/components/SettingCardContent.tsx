import React from "react";
import { CardContent, Box, Chip } from "@mui/material";

interface SettingCardContentProps {
  items: string[];
  color: string;
}

const SettingCardContent: React.FC<SettingCardContentProps> = ({
  items,
  color,
}) => (
  <CardContent sx={{ pt: 1, pb: 2.5 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {items.map((item, index) => (
        <Chip
          key={index}
          label={item}
          size="small"
          sx={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "capitalize",
            bgcolor: `${color}0D`, // 8% opacidad
            color: color,
            border: `1px solid ${color}30`,
            borderRadius: 1.5,
          }}
        />
      ))}
    </Box>
  </CardContent>
);

export default SettingCardContent;
