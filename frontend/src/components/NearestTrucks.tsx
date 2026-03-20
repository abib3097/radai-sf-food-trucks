import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import { getNearestTrucks } from "../api/trucksApi";
import TruckCard from "./TruckCard";
import TruckMap from "./TruckMap";
import type { NearestTruckResult } from "../types/truck";

export default function NearestTrucks() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [results, setResults] = useState<NearestTruckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        setLocating(false);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLocating(false);
      }
    );
  }

  async function handleSearch() {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Please enter valid latitude and longitude values.");
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    setOrigin({ lat: latitude, lng: longitude });
    try {
      const data = await getNearestTrucks(latitude, longitude, approvedOnly);
      setResults(data);
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Stack spacing={2} mb={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 37.7749"
            size="small"
            fullWidth
          />
          <TextField
            label="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g. -122.4194"
            size="small"
            fullWidth
          />
          <Button
            variant="outlined"
            onClick={useMyLocation}
            disabled={locating}
            startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />}
            sx={{ whiteSpace: "nowrap", minWidth: 160 }}
          >
            Use my location
          </Button>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={approvedOnly}
                onChange={(e) => setApprovedOnly(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                Approved permits only
              </Typography>
            }
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !lat || !lng}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{ minWidth: 160 }}
          >
            Find nearest
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {searched && !loading && results.length > 0 && origin && (
        <Box mb={3}>
          <TruckMap origin={origin} trucks={results} />
        </Box>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No food trucks found near this location.
        </Typography>
      )}

      <Stack spacing={2}>
        {results.map((truck, i) => (
          <TruckCard key={truck.location_id ?? i} truck={truck} />
        ))}
      </Stack>
    </Box>
  );
}
