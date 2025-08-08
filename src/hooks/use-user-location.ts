"use client";

import { useState, useEffect } from "react";
import { UserLocation } from "@/types/user-location-type";

export function useUserLocation() {
    const [location, setLocation] = useState<UserLocation>({
        latitude: null,
        longitude: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation({
                latitude: null,
                longitude: null,
                loading: false,
                error: "Geolocation is not supported",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    loading: false,
                    error: null,
                });
            },
            (err) => {
                setLocation({
                    latitude: null,
                    longitude: null,
                    loading: false,
                    error: err.message,
                });
            }
        );
    }, []);

    return location;
}
