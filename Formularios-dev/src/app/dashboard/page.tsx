import { Box } from "@mui/material"
import { Typography } from "../../components/atoms/Typography"

export default function DashboardHome() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the Dashboard
      </Typography>
      <Typography variant="body1">This is the main content area of your dashboard.</Typography>
    </Box>
  )
}