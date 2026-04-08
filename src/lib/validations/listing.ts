import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  rent: z.number().int().positive(),
  deposit: z.number().int().nonnegative().optional(),
  maintenance: z.number().int().nonnegative().optional(),
  propertyType: z.enum(["PG", "FLAT", "SHARED"]),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).default("SEMI_FURNISHED"),
  bedrooms: z.number().int().min(1).max(10).optional(),
  bathrooms: z.number().int().min(1).max(10).optional(),
  floor: z.number().int().min(0).optional(),
  totalFloors: z.number().int().min(1).optional(),
  area: z.number().int().positive().optional(),
  amenities: z.array(z.string()).default([]),
  availableFrom: z.string().datetime().optional(),
  address: z.string().min(5),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  images: z.array(z.string().url()).max(10).default([]),
});

export const searchListingsSchema = z.object({
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
  radius: z.coerce.number().positive().default(5000),
  propertyType: z.enum(["PG", "FLAT", "SHARED"]).optional(),
  minRent: z.coerce.number().int().nonnegative().optional(),
  maxRent: z.coerce.number().int().positive().optional(),
  ownerType: z.enum(["INDIVIDUAL", "BROKER"]).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  bedrooms: z.coerce.number().int().min(1).max(10).optional(),
  sortBy: z.enum(["distance", "price_asc", "price_desc", "newest"]).default("distance"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const boundingBoxSchema = z.object({
  swLng: z.coerce.number().min(-180).max(180),
  swLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
  neLat: z.coerce.number().min(-90).max(90),
  propertyType: z.enum(["PG", "FLAT", "SHARED"]).optional(),
  minRent: z.coerce.number().int().nonnegative().optional(),
  maxRent: z.coerce.number().int().positive().optional(),
  ownerType: z.enum(["INDIVIDUAL", "BROKER"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type BoundingBoxInput = z.infer<typeof boundingBoxSchema>;
