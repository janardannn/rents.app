"use client";

import MapboxMap from "./mapbox";
import { useUserLocation } from "@/hooks/use-user-location";

const MapComponent = () => {
    const userLocation = useUserLocation();

    // Map component goes here
    // Map rendering logic, hooks, and state management can be added here
    // This component should be abstracted to handle all providers
    // All other components just see this as a black box and pass expected props
    // MapBox, Leaflet, Google Maps

    return (
        <div>
            <MapboxMap latitude={userLocation.latitude} longitude={userLocation.longitude} />
        </div>
    );
}

export default MapComponent;