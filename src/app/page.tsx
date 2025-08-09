"use client";

import MapComponent from "@/components/map/map";
import { NavBar } from "@/components/nav-bar/nav-bar";

export default function HomePage() {
  return (
    <main>
      <div className="relative h-screen w-screen">
        {/* Layer 1: Map */}
        <div className="absolute inset-0">
          <MapComponent />
        </div>

        {/* Layer 2: Overlay */}
        <div className="absolute inset-0  bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.81)_0%,_rgba(0,0,0,0.60)_20%,_transparent_80%)] pointer-events-none" />

        {/* Layer 3: UI Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full pointer-events-none">

          <div className="pointer-events-auto">
            <NavBar logoHeight={200} logoWidth={200} />
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-xl p-6 max-w-xl w-full pointer-events-auto">
            <input
              className="text-xl text-gray-500 mt-2 w-full border-none focus:outline-none caret-black"
              placeholder="Discover best properties near you matching your needs"
            />
          </div>
          <button className="text-xl mt-4 bg-[#f75c5f] text-white rounded-2xl py-2 px-4">
            Find Properties
          </button>

        </div>
      </div>
    </main>
  );
}
