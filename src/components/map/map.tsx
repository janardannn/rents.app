"use client";

import MapboxMap from "./mapbox";
import { useUserLocation } from "@/hooks/use-user-location";
import type { ListingResult } from "@/types/listing";

interface MapComponentProps {
    listings?: ListingResult[];
    flyTo?: { lng: number; lat: number } | null;
}

const MapComponent = ({ listings = [], flyTo }: MapComponentProps) => {
    const userLocation = useUserLocation();

    return (
        <div>
            <MapboxMap
                latitude={userLocation.latitude}
                longitude={userLocation.longitude}
                listings={listings}
                flyTo={flyTo}
            />
        </div>
    );
}

export default MapComponent;
