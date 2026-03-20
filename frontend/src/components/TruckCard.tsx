import {
  Card,
  CardContent,
  Chip,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import type { FoodTruck, NearestTruckResult } from "../types/truck";

interface TruckCardProps {
  truck: FoodTruck | NearestTruckResult;
}

function isNearest(truck: FoodTruck | NearestTruckResult): truck is NearestTruckResult {
  return "distance_meters" in truck;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m away`;
  return `${(meters / 1000).toFixed(1)}km away`;
}

function statusColor(status: string | null): "success" | "warning" | "error" | "default" {
  switch (status?.toUpperCase()) {
    case "APPROVED": return "success";
    case "REQUESTED": return "warning";
    case "EXPIRED": return "error";
    default: return "default";
  }
}

export default function TruckCard({ truck }: TruckCardProps) {
  const nearest = isNearest(truck) ? truck : null;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.3, flex: 1, mr: 1 }}>
            {truck.applicant || "Unknown Applicant"}
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
            <Chip
              label={truck.status || "Unknown"}
              color={statusColor(truck.status)}
              size="small"
              sx={{ fontWeight: 600, fontSize: "0.7rem" }}
            />
            {nearest?.distance_meters != null && (
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {formatDistance(nearest.distance_meters)}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Details */}
        <Box display="flex" flexDirection="column" gap={0.75}>
          {truck.address && (
            <Box display="flex" alignItems="flex-start" gap={0.75}>
              <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary", mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary">
                {truck.address}
              </Typography>
            </Box>
          )}
          {truck.food_items && (
            <Box display="flex" alignItems="flex-start" gap={0.75}>
              <FastfoodIcon sx={{ fontSize: 16, color: "text.secondary", mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary" sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {truck.food_items}
              </Typography>
            </Box>
          )}
          {truck.days_hours && (
            <Box display="flex" alignItems="flex-start" gap={0.75}>
              <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary", mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary">
                {truck.days_hours}
              </Typography>
            </Box>
          )}
          {nearest && (
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
              Distance via {nearest.distance_method === "google_maps" ? "Google Maps" : "straight-line estimate"}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
