import type { FoodTruck, NearestTruckResult } from "../types/truck";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 404) return [] as unknown as T;
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function searchByApplicant(
  name: string,
  status?: string
): Promise<FoodTruck[]> {
  const params = new URLSearchParams({ name });
  if (status) params.append("status", status);
  const res = await fetch(`${BASE_URL}/trucks/search/applicant?${params}`);
  return handleResponse<FoodTruck[]>(res);
}

export async function searchByStreet(street: string): Promise<FoodTruck[]> {
  const params = new URLSearchParams({ street });
  const res = await fetch(`${BASE_URL}/trucks/search/street?${params}`);
  return handleResponse<FoodTruck[]>(res);
}

export async function getNearestTrucks(
  latitude: number,
  longitude: number,
  approvedOnly: boolean = true
): Promise<NearestTruckResult[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    approved_only: String(approvedOnly),
  });
  const res = await fetch(`${BASE_URL}/trucks/nearest?${params}`);
  return handleResponse<NearestTruckResult[]>(res);
}
