"use client";

import { useForm, Controller } from "react-hook-form";
import * as Slider from "@radix-ui/react-slider";
import Logo from "@/components/logo";
import ListingCard from "@/components/listing-card/listing-card";
import type { ListingResult } from "@/types/listing";

import dynamic from "next/dynamic";
const SearchBox = dynamic(
    () => import("@mapbox/search-js-react").then(mod => mod.SearchBox),
    { ssr: false }
);

export interface SearchFilters {
    location: string;
    lat: number;
    lng: number;
    propertyType: string[];
    ownerType: string[];
    furnishing: string[];
    bedrooms: number | null;
    sortBy: string;
    minRent: number;
    maxRent: number;
}

interface FormValues {
    location: string;
    coords: { lat: number; lng: number } | null;
    pg: boolean;
    flat: boolean;
    shared: boolean;
    ownerOwner: boolean;
    ownerBroker: boolean;
    furnished: boolean;
    semiFurnished: boolean;
    unfurnished: boolean;
    bedrooms: string;
    sortBy: string;
    budget: [number, number];
}

interface SearchSidebarProps {
    initialFilters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    listings?: ListingResult[];
    onListingClick?: (listing: ListingResult) => void;
}

export default function SearchSidebar({ initialFilters, onFiltersChange, listings = [], onListingClick }: SearchSidebarProps) {
    const { register, handleSubmit, control, watch, setValue } = useForm<FormValues>({
        defaultValues: {
            location: initialFilters.location,
            coords: { lat: initialFilters.lat, lng: initialFilters.lng },
            pg: initialFilters.propertyType.includes("PG"),
            flat: initialFilters.propertyType.includes("FLAT"),
            shared: initialFilters.propertyType.includes("SHARED"),
            ownerOwner: initialFilters.ownerType.includes("INDIVIDUAL"),
            ownerBroker: initialFilters.ownerType.includes("BROKER"),
            furnished: initialFilters.furnishing.includes("FURNISHED"),
            semiFurnished: initialFilters.furnishing.includes("SEMI_FURNISHED"),
            unfurnished: initialFilters.furnishing.includes("UNFURNISHED"),
            bedrooms: initialFilters.bedrooms ? String(initialFilters.bedrooms) : "",
            sortBy: initialFilters.sortBy || "distance",
            budget: [initialFilters.minRent, initialFilters.maxRent],
        },
    });

    const budgetValues = watch("budget");

    const onSubmit = (data: FormValues) => {
        if (!data.coords) return;

        const types: string[] = [];
        if (data.pg) types.push("PG");
        if (data.flat) types.push("FLAT");
        if (data.shared) types.push("SHARED");

        const owners: string[] = [];
        if (data.ownerOwner) owners.push("INDIVIDUAL");
        if (data.ownerBroker) owners.push("BROKER");

        const furn: string[] = [];
        if (data.furnished) furn.push("FURNISHED");
        if (data.semiFurnished) furn.push("SEMI_FURNISHED");
        if (data.unfurnished) furn.push("UNFURNISHED");

        onFiltersChange({
            location: data.location,
            lat: data.coords.lat,
            lng: data.coords.lng,
            propertyType: types,
            ownerType: owners,
            furnishing: furn,
            bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
            sortBy: data.sortBy,
            minRent: data.budget[0],
            maxRent: data.budget[1],
        });
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                <Logo height={100} width={100} />
            </div>

            <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Location</h3>
                    <div className="mt-2">
                        <SearchBox
                            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string}
                            value={initialFilters.location}
                            onRetrieve={(result) => {
                                const feature = result.features[0];
                                setValue("location", feature.properties.full_address);
                                setValue("coords", {
                                    lng: feature.geometry.coordinates[0],
                                    lat: feature.geometry.coordinates[1],
                                });
                            }}
                            options={{ language: "en", country: "IN" }}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Property Type</h3>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("pg")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>PG</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("flat")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>Flat</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("shared")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>Shared Room</span>
                        </label>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Furnishing</h3>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("furnished")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>Furnished</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("semiFurnished")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>Semi</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("unfurnished")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>Unfurnished</span>
                        </label>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-800">BHK</h3>
                    <select {...register("bedrooms")} className="mt-2 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent">
                        <option value="">Any</option>
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4 BHK</option>
                        <option value="5">5+ BHK</option>
                    </select>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Owner Type</h3>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("ownerOwner")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>Owner</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" {...register("ownerBroker")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span>Broker</span>
                        </label>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800">Budget Range</h3>
                        <span className="text-sm font-medium text-gray-900">
                            ₹{budgetValues[0]} - ₹{budgetValues[1]}
                        </span>
                    </div>
                    <div className="mt-2">
                        <Controller
                            name="budget"
                            control={control}
                            render={({ field }) => (
                                <Slider.Root
                                    className="relative flex items-center select-none touch-none w-full h-5"
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    min={1000}
                                    max={100000}
                                    step={500}
                                >
                                    <Slider.Track className="bg-gray-400 relative grow rounded-full h-[3px]">
                                        <Slider.Range className="absolute bg-[#f75c5f] rounded-full h-full" />
                                    </Slider.Track>
                                    <Slider.Thumb className="border block w-5 h-5 bg-white shadow-md rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f75c5f]" />
                                    <Slider.Thumb className="border block w-5 h-5 bg-white shadow-md rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f75c5f]" />
                                </Slider.Root>
                            )}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Sort By</h3>
                    <select {...register("sortBy")} className="mt-2 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent">
                        <option value="distance">Nearest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full py-2.5 text-sm font-medium text-white bg-[#f75c5f] rounded-lg hover:bg-[#e05558] transition-colors cursor-pointer"
                >
                    Update Search
                </button>
            </form>

            {listings.length > 0 && (
                <div className="border-t border-gray-100">
                    <div className="p-4 pb-1">
                        <h3 className="text-sm font-semibold text-gray-800">{listings.length} Properties Found</h3>
                    </div>
                    <div className="px-4 pb-4 space-y-2">
                        {listings.map(listing => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onClick={(l) => onListingClick?.(l)}
                            />
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
