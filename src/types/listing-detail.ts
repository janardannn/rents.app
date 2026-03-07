export interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  rent: number;
  deposit: number | null;
  maintenance: number | null;
  propertyType: "PG" | "FLAT" | "SHARED";
  furnishing: "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  area: number | null;
  amenities: string[];
  availableFrom: string | null;
  address: string;
  images: string[];
  longitude: number;
  latitude: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  ownerName: string;
  ownerType: "INDIVIDUAL" | "BROKER";
  ownerPhone: string | null;
}
