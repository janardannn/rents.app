import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  rent: z.number().int().positive(),
  propertyType: z.enum(["PG", "FLAT", "SHARED"]),
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
  ownerType: z.enum(["OWNER", "BROKER"]).optional(),
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
  ownerType: z.enum(["OWNER", "BROKER"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type BoundingBoxInput = z.infer<typeof boundingBoxSchema>;
