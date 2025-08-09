"use client";

import Logo from "@/components/logo";
import MapComponent from "@/components/map/map";
import SearchButton from "@/components/search-modal/search-button";
import SearchModal from "@/components/search-modal/search-modal";

export default function HomePage() {
  return (
    <main>
      <div className="relative h-screen w-screen">
        {/* Layer 1: Map */}
        <div className="absolute inset-0">
          <MapComponent />
        </div>

        {/* Layer 2: Overlay */}
        <div className="absolute inset-0 bg-black/41 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.88)_0%,_rgba(0,0,0,0.60)_22%,_transparent_80%)] pointer-events-none" />

        {/* Layer 3: UI Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full pointer-events-none">
          <div className="pointer-events-none">
            <Logo height={200} width={200} />
          </div>

          {/* search modal (not yet) + search button */}
          <div className="flex flex-col items-center">
            <SearchModal />
            <SearchButton />
          </div>

        </div>
      </div>
    </main>
  );
}