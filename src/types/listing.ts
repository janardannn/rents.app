export interface ListingResult {
  id: string;
  title: string;
  rent: number;
  deposit?: number;
  propertyType: "PG" | "FLAT" | "SHARED";
  furnishing: "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  address: string;
  images: string[];
  longitude: number;
  latitude: number;
  distance?: number;
  ownerName: string;
  ownerType: "INDIVIDUAL" | "BROKER";
}
