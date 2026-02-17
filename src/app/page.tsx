"use client";

import Logo from "@/components/logo";
import MapComponent from "@/components/map/map";
import SearchButton from "@/components/search-modal/search-button";
import SearchModal from "@/components/search-modal/search-modal";
import { useListingsSearch } from "@/hooks/use-listings-search";
import type { SearchModalType } from "@/types/search-modal-type";
import { useState } from "react";

export default function HomePage() {
  const { listings, loading, search } = useListingsSearch();
  const [searchCoords, setSearchCoords] = useState<{ lng: number; lat: number } | null>(null);

  const handleApplyFilters = (data: SearchModalType) => {
    if (data.placeDetails?.coords) {
      setSearchCoords(data.placeDetails.coords);
    }
    search(data);
  };

  return (
    <main>
      <div className="relative h-screen w-screen">
        <div className="absolute inset-0">
          <MapComponent listings={listings} flyTo={searchCoords} />
        </div>

        <div className="absolute inset-0 bg-black/41 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.88)_0%,_rgba(0,0,0,0.60)_22%,_transparent_80%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center items-center h-full pointer-events-none">
          <div className="pointer-events-none">
            <Logo height={200} width={200} />
          </div>

          <div className="flex flex-col items-center">
            <SearchModal onApplyFilters={handleApplyFilters} />
            <SearchButton loading={loading} />
          </div>
        </div>
      </div>
    </main>
  );
}
