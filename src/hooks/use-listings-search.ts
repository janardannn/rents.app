"use client";

import { useState } from "react";
import type { ListingResult } from "@/types/listing";
import type { SearchModalType } from "@/types/search-modal-type";

export function useListingsSearch() {
  const [listings, setListings] = useState<ListingResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(filters: SearchModalType) {
    if (!filters.placeDetails?.coords) return;

    setLoading(true);

    const params = new URLSearchParams();
    params.set("longitude", String(filters.placeDetails.coords.lng));
    params.set("latitude", String(filters.placeDetails.coords.lat));
    params.set("radius", "5000");

    const types: string[] = [];
    if (filters.propertyType.pg) types.push("PG");
    if (filters.propertyType.flat) types.push("FLAT");
    if (filters.propertyType.shared) types.push("SHARED");
    if (types.length === 1) params.set("propertyType", types[0]);

    if (filters.ownerType !== "any") {
      params.set("ownerType", filters.ownerType.toUpperCase());
    }

    params.set("minRent", String(filters.budget[0]));
    params.set("maxRent", String(filters.budget[1]));

    try {
      const res = await fetch(`/api/listings/search?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  return { listings, loading, search };
}
