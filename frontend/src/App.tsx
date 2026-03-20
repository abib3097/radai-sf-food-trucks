import { useState } from "react";
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Paper,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AddRoadIcon from "@mui/icons-material/AddRoad";
import NearMeIcon from "@mui/icons-material/NearMe";
import SearchByApplicant from "./components/SearchByApplicant";
import SearchByStreet from "./components/SearchByStreet";
import NearestTrucks from "./components/NearestTrucks";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#E8572A" },
    background: { default: "#F7F4EF", paper: "#FFFFFF" },
    text: { primary: "#1A1A1A", secondary: "#6B6560" },
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h4: { fontFamily: "'Fraunces', serif", fontWeight: 700 },
    h6: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.9rem",
          minHeight: 48,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

const TABS = [
  { label: "By Applicant", icon: <PersonSearchIcon fontSize="small" /> },
  { label: "By Street", icon: <AddRoadIcon fontSize="small" /> },
  { label: "Nearest", icon: <NearMeIcon fontSize="small" /> },
];

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #E8572A 0%, #C43E18 100%)",
          py: 5,
          px: 2,
          textAlign: "center",
          color: "white",
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} mb={1}>
          <LocalDiningIcon sx={{ fontSize: 36 }} />
          <Typography variant="h4" sx={{ color: "white", letterSpacing: "-0.5px" }}>
            SF Food Trucks
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 480, mx: "auto" }}>
          Explore Mobile Food Facility permits across San Francisco
        </Typography>
      </Box>

      {/* Main content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="primary"
              indicatorColor="primary"
            >
              {TABS.map(({ label, icon }) => (
                <Tab key={label} label={label} icon={icon} iconPosition="start" />
              ))}
            </Tabs>
          </Box>

          {/* Tab panels */}
          <Box sx={{ p: 3 }}>
            {tab === 0 && <SearchByApplicant />}
            {tab === 1 && <SearchByStreet />}
            {tab === 2 && <NearestTrucks />}
          </Box>
        </Paper>

        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={3}>
          Data sourced from the{" "}
          <a
            href="https://data.sfgov.org/Economy-and-Community/Mobile-Food-Facility-Permit/rqzj-sfat/data"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#E8572A" }}
          >
            SF Open Data portal
          </a>
        </Typography>
      </Container>
    </ThemeProvider>
  );
}
