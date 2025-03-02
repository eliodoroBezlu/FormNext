import { Box, Typography } from "@mui/material"
import { InspectionSection } from "@/components/organisms/inspection-section/InspectionSection"
import type{ IProps} from "./types/IProps.ts"

export const TitleSection = ({ titleIndex, title, control }: IProps) => (
  <Box sx={{ mt: 4, width: "100%" }}>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
      {title.title}
    </Typography>
    {title.items.map((section, sectionIndex) => (
      <InspectionSection
        key={section.id}
        titleIndex={titleIndex}
        sectionIndex={sectionIndex}
        section={section}
        control={control}
      />
    ))}
  </Box>
)

