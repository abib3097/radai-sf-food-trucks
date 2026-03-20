import { Box, Typography } from "@mui/material";
import type { NearestTruckResult } from "../types/truck";

interface TruckMapProps {
  origin: { lat: number; lng: number };
  trucks: NearestTruckResult[];
}

export default function TruckMap({ origin, trucks }: TruckMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Box
        sx={{
          height: 300,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Map unavailable — set VITE_GOOGLE_MAPS_API_KEY to enable
        </Typography>
      </Box>
    );
  }

  // Build markers: blue pin for origin, red pins for each truck
  const originMarker = `color:blue|label:You|${origin.lat},${origin.lng}`;
  const truckMarkers = trucks
    .filter((t) => t.latitude && t.longitude)
    .map((t, i) => `color:red|label:${i + 1}|${t.latitude},${t.longitude}`)
    .join("&markers=");

  const src =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?size=640x300` +
    `&scale=2` +
    `&markers=${originMarker}` +
    `&markers=${truckMarkers}` +
    `&key=${apiKey}`;

  return (
    <Box
      component="img"
      src={src}
      alt="Map of nearest food trucks"
      sx={{
        width: "100%",
        height: 300,
        objectFit: "cover",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    />
  );
}
