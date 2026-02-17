export interface ListingResult {
  id: string;
  title: string;
  rent: number;
  propertyType: "PG" | "FLAT" | "SHARED";
  address: string;
  images: string[];
  longitude: number;
  latitude: number;
  distance?: number;
  ownerName: string;
  ownerType: string;
}
