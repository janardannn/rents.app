"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import MapComponent from "@/components/map/map";
import SearchSidebar, { type SearchFilters } from "@/components/search-sidebar/search-sidebar";
import ListingDetailPanel from "@/components/listing-detail/listing-detail";
import type { ListingResult } from "@/types/listing";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [listings, setListings] = useState<ListingResult[]>([]);
    const [flyTo, setFlyTo] = useState<{ lng: number; lat: number } | null>(null);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

    const filters: SearchFilters = {
        lat: Number(searchParams.get("lat")) || 0,
        lng: Number(searchParams.get("lng")) || 0,
        location: searchParams.get("location") || "",
        propertyType: searchParams.get("propertyType")?.split(",").filter(Boolean) || [],
        ownerType: searchParams.get("ownerType")?.split(",").filter(Boolean) || ["OWNER", "BROKER"],
        minRent: Number(searchParams.get("minRent")) || 5000,
        maxRent: Number(searchParams.get("maxRent")) || 50000,
    };

    const fetchListings = useCallback(async (f: SearchFilters) => {
        const params = new URLSearchParams();
        params.set("longitude", String(f.lng));
        params.set("latitude", String(f.lat));
        params.set("radius", "10000");

        if (f.propertyType.length === 1) params.set("propertyType", f.propertyType[0]);
        if (f.ownerType.length === 1) params.set("ownerType", f.ownerType[0]);
        params.set("minRent", String(f.minRent));
        params.set("maxRent", String(f.maxRent));

        try {
            const res = await fetch(`/api/listings/search?${params.toString()}`);
            const data = await res.json();
            setListings(data.listings || []);
        } catch {
            setListings([]);
        }
    }, []);

    useEffect(() => {
        if (filters.lat && filters.lng) {
            setFlyTo({ lng: filters.lng, lat: filters.lat });
            fetchListings(filters);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const handleListingClick = (listing: ListingResult) => {
        setSelectedListingId(listing.id);
    };

    const handleMapPinClick = (listingId: string) => {
        setSelectedListingId(listingId);
    };

    const handleFiltersChange = (newFilters: SearchFilters) => {
        const params = new URLSearchParams();
        params.set("lat", String(newFilters.lat));
        params.set("lng", String(newFilters.lng));
        params.set("location", newFilters.location);
        if (newFilters.propertyType.length) params.set("propertyType", newFilters.propertyType.join(","));
        if (newFilters.ownerType.length) params.set("ownerType", newFilters.ownerType.join(","));
        params.set("minRent", String(newFilters.minRent));
        params.set("maxRent", String(newFilters.maxRent));

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="flex h-screen w-screen">
            <div className="w-[340px] shrink-0 border-r border-gray-200 shadow-lg z-10 flex flex-col">
                <SearchSidebar
                    initialFilters={filters}
                    onFiltersChange={handleFiltersChange}
                    listings={listings}
                    onListingClick={handleListingClick}
                />
            </div>
            <div className="flex-1 relative overflow-hidden">
                <MapComponent listings={listings} flyTo={flyTo} onListingClick={handleMapPinClick} showViewToggle />
                <ListingDetailPanel
                    listingId={selectedListingId}
                    onClose={() => setSelectedListingId(null)}
                />
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense>
            <SearchContent />
        </Suspense>
    );
}
