import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { searchByApplicant } from "../api/trucksApi";
import TruckCard from "./TruckCard";
import type { FoodTruck } from "../types/truck";

const STATUS_OPTIONS = ["", "APPROVED", "REQUESTED", "EXPIRED", "SUSPEND"];

export default function SearchByApplicant() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchByApplicant(name.trim(), status || undefined);
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
          label="Applicant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. Natan's Catering"
          fullWidth
          size="small"
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 160 }}
          size="small"
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s || "All statuses"}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
          sx={{ whiteSpace: "nowrap", minWidth: 120 }}
        >
          Search
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {searched && !loading && results.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No food trucks found for "{name}"
          {status ? ` with status "${status}"` : ""}.
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
