export interface FoodTruck {
  location_id: string | null;
  applicant: string | null;
  facility_type: string | null;
  location_description: string | null;
  address: string | null;
  status: string | null;
  food_items: string | null;
  latitude: number | null;
  longitude: number | null;
  days_hours: string | null;
}

export interface NearestTruckResult extends FoodTruck {
  distance_meters: number | null;
  distance_method: "haversine" | "google_maps";
}
