"use client";

import Logo from "@/components/logo";
import MapComponent from "@/components/map/map";
import SearchButton from "@/components/search-modal/search-button";
import SearchModal from "@/components/search-modal/search-modal";
import type { SearchModalType } from "@/types/search-modal-type";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleApplyFilters = (data: SearchModalType) => {
    if (!data.placeDetails?.coords) return;

    const params = new URLSearchParams();
    params.set("lat", String(data.placeDetails.coords.lat));
    params.set("lng", String(data.placeDetails.coords.lng));
    params.set("location", data.location);

    const types: string[] = [];
    if (data.propertyType.pg) types.push("PG");
    if (data.propertyType.flat) types.push("FLAT");
    if (data.propertyType.shared) types.push("SHARED");
    if (types.length) params.set("propertyType", types.join(","));

    const owners: string[] = [];
    if (data.ownerType.owner) owners.push("INDIVIDUAL");
    if (data.ownerType.broker) owners.push("BROKER");
    if (owners.length) params.set("ownerType", owners.join(","));

    params.set("minRent", String(data.budget[0]));
    params.set("maxRent", String(data.budget[1]));

    router.push(`/search?${params.toString()}`);
  };

  return (
    <main>
      <div className="relative h-screen w-screen">
        <div className="absolute inset-0">
          <MapComponent />
        </div>

        <div className="absolute inset-0 bg-black/41 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.88)_0%,_rgba(0,0,0,0.60)_22%,_transparent_80%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center items-center h-full pointer-events-none">
          <div className="pointer-events-none">
            <Logo height={200} width={200} />
          </div>

          <div className="flex flex-col items-center">
            <SearchModal onApplyFilters={handleApplyFilters} />
            <SearchButton />
          </div>
        </div>
      </div>
    </main>
  );
}
