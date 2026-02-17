"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { ListingResult } from "@/types/listing";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MapboxMapProps {
    latitude: number | null;
    longitude: number | null;
    listings?: ListingResult[];
    flyTo?: { lng: number; lat: number } | null;
}

export default function MapboxMap({ latitude, longitude, listings = [], flyTo }: MapboxMapProps) {

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

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

    useEffect(() => {
        if (mapInstance.current && latitude && longitude) {
            mapInstance.current.setCenter([longitude, latitude]);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        if (!mapInstance.current) return;

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        listings.forEach(listing => {
            const el = document.createElement("div");
            el.style.width = "12px";
            el.style.height = "12px";
            el.style.borderRadius = "50%";
            el.style.backgroundColor = "#f75c5f";
            el.style.border = "2px solid white";
            el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";

            const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
                `<div style="font-family:sans-serif;font-size:13px;">
                    <strong>${listing.title}</strong><br/>
                    <span style="color:#f75c5f;font-weight:600;">₹${listing.rent}/mo</span><br/>
                    <span style="color:#666;font-size:12px;">${listing.propertyType} · ${listing.ownerName}</span>
                </div>`
            );

            const marker = new mapboxgl.Marker(el)
                .setLngLat([listing.longitude, listing.latitude])
                .setPopup(popup)
                .addTo(mapInstance.current!);

            markersRef.current.push(marker);
        });
    }, [listings]);

    useEffect(() => {
        if (mapInstance.current && flyTo) {
            mapInstance.current.flyTo({
                center: [flyTo.lng, flyTo.lat],
                zoom: 14,
                duration: 1500,
            });
        }
    }, [flyTo]);

    return <div ref={mapContainer} className="w-screen h-screen" />;
}
