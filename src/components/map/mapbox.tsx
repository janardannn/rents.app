"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { ListingResult } from "@/types/listing";

const LS_KEY = "rents-map-view";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const SOURCE_ID = "listings-source";
const LAYER_ID = "listings-layer";

function toGeoJSON(items: ListingResult[]): GeoJSON.FeatureCollection {
    return {
        type: "FeatureCollection",
        features: items.map(l => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [l.longitude, l.latitude] },
            properties: {
                id: l.id,
                title: l.title,
                rent: l.rent,
                propertyType: l.propertyType,
                ownerName: l.ownerName,
            },
        })),
    };
}

function createTeardropImage(): ImageData {
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Teardrop pin shape
    const cx = size / 2;
    ctx.beginPath();
    ctx.moveTo(cx, size - 4);
    ctx.bezierCurveTo(cx - 4, size - 14, 4, size * 0.45, 4, size * 0.35);
    ctx.arc(cx, size * 0.35, cx - 4, Math.PI, 0, false);
    ctx.bezierCurveTo(size - 4, size * 0.45, cx + 4, size - 14, cx, size - 4);
    ctx.closePath();

    ctx.fillStyle = "#f75c5f";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner white circle
    ctx.beginPath();
    ctx.arc(cx, size * 0.35, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    return ctx.getImageData(0, 0, size, size);
}

interface MapboxMapProps {
    listings?: ListingResult[];
    flyTo?: { lng: number; lat: number } | null;
    onListingClick?: (listingId: string) => void;
    showViewToggle?: boolean;
}

function getInitialView(showToggle: boolean): "3D" | "2D" {
    if (!showToggle) return "2D";
    if (typeof window === "undefined") return "3D";
    return (localStorage.getItem(LS_KEY) as "2D" | "3D") || "3D";
}

export default function MapboxMap({ listings = [], flyTo, onListingClick, showViewToggle = false }: MapboxMapProps) {

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<mapboxgl.Map | null>(null);
    const sourceReady = useRef(false);
    const pendingData = useRef<ListingResult[] | null>(null);
    const onListingClickRef = useRef(onListingClick);
    onListingClickRef.current = onListingClick;
    const [view, setView] = useState<"2D" | "3D">(() => getInitialView(showViewToggle));

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: process.env.NEXT_PUBLIC_MAPBOX_STYLE,
            center: [77.5, 20.5],
            zoom: 4,
            projection: "globe",
        });

        map.on("load", () => {
            // Canvas-drawn teardrop — fully synchronous
            const imageData = createTeardropImage();
            map.addImage("teardrop-marker", imageData, { pixelRatio: 2 });

            map.addSource(SOURCE_ID, {
                type: "geojson",
                data: toGeoJSON([]),
            });

            map.addLayer({
                id: LAYER_ID,
                type: "symbol",
                source: SOURCE_ID,
                layout: {
                    "icon-image": "teardrop-marker",
                    "icon-size": 1,
                    "icon-anchor": "bottom",
                    "icon-allow-overlap": true,
                },
            });

            sourceReady.current = true;

            // Flush any listings that arrived before the source was ready
            if (pendingData.current) {
                (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(toGeoJSON(pendingData.current));
                pendingData.current = null;
            }

            map.on("click", LAYER_ID, (e) => {
                if (!e.features?.[0]) return;
                const props = e.features[0].properties!;
                if (onListingClickRef.current && props.id) {
                    onListingClickRef.current(props.id as string);
                }
            });

            map.on("mouseenter", LAYER_ID, () => {
                map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", LAYER_ID, () => {
                map.getCanvas().style.cursor = "";
            });
        });

        mapInstance.current = map;

        return () => {
            map.remove();
        };
    }, []);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        if (sourceReady.current) {
            const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
            source.setData(toGeoJSON(listings));
        } else {
            pendingData.current = listings;
        }
    }, [listings]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map || !flyTo) return;

        const apply = () => {
            map.flyTo({
                center: [flyTo.lng, flyTo.lat],
                zoom: 12,
                pitch: view === "3D" ? 72 : 0,
                duration: 1500,
            });
        };

        if (map.isStyleLoaded()) {
            apply();
        } else {
            map.once("load", apply);
        }
    }, [flyTo, view]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;
        if (showViewToggle) localStorage.setItem(LS_KEY, view);

        map.easeTo({
            pitch: view === "3D" ? 72 : 0,
            duration: 500,
        });
    }, [view, showViewToggle]);

    const toggleView = () => setView(v => v === "3D" ? "2D" : "3D");

    return (
        <>
            <div ref={mapContainer} className="w-full h-full" />
            {showViewToggle && (
                <button
                    onClick={toggleView}
                    className="fixed bottom-6 right-6 bg-white rounded-md shadow-lg px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 z-50"
                >
                    {view === "3D" ? "2D" : "3D"}
                </button>
            )}
        </>
    );
}
