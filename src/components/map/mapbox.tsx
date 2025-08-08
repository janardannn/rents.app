"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MapboxMap({ latitude, longitude }: { latitude: number | null, longitude: number | null }) {

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        mapInstance.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: process.env.NEXT_PUBLIC_MAPBOX_STYLE,
            center: [longitude || 77.216721, latitude || 28.644800],
            zoom: 13,
        });

        return () => {
            mapInstance.current?.remove();
        };
    }, []);

    // this effect separately because reinitializing the map on every render is not efficient
    useEffect(() => {
        if (mapInstance.current && latitude && longitude) {
            mapInstance.current.setCenter([longitude, latitude]);
        }
    }, [latitude, longitude]);


    return <div ref={mapContainer} className="w-screen h-screen" />;
}
