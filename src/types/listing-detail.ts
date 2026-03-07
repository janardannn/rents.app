export interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  rent: number;
  propertyType: "PG" | "FLAT" | "SHARED";
  address: string;
  images: string[];
  longitude: number;
  latitude: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  ownerName: string;
  ownerType: string;
  ownerPhone: string | null;
}
