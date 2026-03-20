import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { searchByStreet } from "../api/trucksApi";
import TruckCard from "./TruckCard";
import type { FoodTruck } from "../types/truck";

export default function SearchByStreet() {
  const [street, setStreet] = useState("");
  const [results, setResults] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!street.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchByStreet(street.trim());
      setResults(data);
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          label="Street name"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder='e.g. "SAN" matches SANSOME ST'
          fullWidth
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading || !street.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
          sx={{ whiteSpace: "nowrap", minWidth: 120 }}
        >
          Search
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {searched && !loading && results.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No food trucks found on "{street}".
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
