"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import MapComponent from "@/components/map/map";
import SearchSidebar, { type SearchFilters } from "@/components/search-sidebar/search-sidebar";
import ListingDetailPanel from "@/components/listing-detail/listing-detail";
import type { ListingResult } from "@/types/listing";
import type { ListingDetail } from "@/types/listing-detail";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [listings, setListings] = useState<ListingResult[]>([]);
    const [flyTo, setFlyTo] = useState<{ lng: number; lat: number; zoom?: number; _t?: number } | null>(null);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(
        searchParams.get("listing")
    );
    const isFirstLoad = useRef(true);

    const filters: SearchFilters = {
        lat: Number(searchParams.get("lat")) || 0,
        lng: Number(searchParams.get("lng")) || 0,
        location: searchParams.get("location") || "",
        propertyType: searchParams.get("propertyType")?.split(",").filter(Boolean) || [],
        ownerType: searchParams.get("ownerType")?.split(",").filter(Boolean) || ["INDIVIDUAL", "BROKER"],
        furnishing: searchParams.get("furnishing")?.split(",").filter(Boolean) || [],
        bedrooms: searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : null,
        sortBy: searchParams.get("sortBy") || "distance",
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
        if (f.furnishing.length === 1) params.set("furnishing", f.furnishing[0]);
        if (f.bedrooms) params.set("bedrooms", String(f.bedrooms));
        if (f.sortBy) params.set("sortBy", f.sortBy);
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
            // Don't override if we're opening a shared listing — onLoaded will handle flyTo
            if (!searchParams.get("listing")) {
                setFlyTo({ lng: filters.lng, lat: filters.lat, zoom: isFirstLoad.current ? 12 : undefined, _t: Date.now() });
            }
            isFirstLoad.current = false;
            fetchListings(filters);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const handleListingClick = (listing: ListingResult) => {
        setSelectedListingId(listing.id);
        setFlyTo({ lng: listing.longitude, lat: listing.latitude, _t: Date.now() });
    };

    const handleMapPinClick = (listingId: string) => {
        setSelectedListingId(listingId);
        const listing = listings.find(l => l.id === listingId);
        if (listing) setFlyTo({ lng: listing.longitude, lat: listing.latitude, _t: Date.now() });
    };

    const handleFiltersChange = (newFilters: SearchFilters) => {
        const params = new URLSearchParams();
        params.set("lat", String(newFilters.lat));
        params.set("lng", String(newFilters.lng));
        params.set("location", newFilters.location);
        if (newFilters.propertyType.length) params.set("propertyType", newFilters.propertyType.join(","));
        if (newFilters.ownerType.length) params.set("ownerType", newFilters.ownerType.join(","));
        if (newFilters.furnishing.length) params.set("furnishing", newFilters.furnishing.join(","));
        if (newFilters.bedrooms) params.set("bedrooms", String(newFilters.bedrooms));
        if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
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
                <MapComponent listings={listings} flyTo={flyTo} onListingClick={handleMapPinClick} selectedListingId={selectedListingId} showViewToggle />
                <ListingDetailPanel
                    listingId={selectedListingId}
                    onClose={() => setSelectedListingId(null)}
                    onLoaded={(detail: ListingDetail) => {
                        // Only fly+zoom for shared URLs (initial load with listing param)
                        if (isFirstLoad.current && detail.longitude && detail.latitude) {
                            setFlyTo({ lng: detail.longitude, lat: detail.latitude, zoom: 15, _t: Date.now() });
                        }
                    }}
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
