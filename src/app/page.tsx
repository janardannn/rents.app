"use client";

import MapComponent from "@/components/map/map";
import { NavBar } from "@/components/nav-bar/nav-bar";

export default function HomePage() {
  return (
    <main>
      <div className="relative h-screen w-screen">
        {/* Map */}
        <div className="absolute inset-0">
          <MapComponent />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        </div>


        <div className="relative z-10 flex justify-center items-center h-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xl w-full">
            <p className="text-gray-500 mt-2">Discover top properties near you</p>
            {/* <SearchBar /> */}
            {/* <FiltersRow /> */}
          </div>
        </div>
      </div>

    </main>
  );
}
