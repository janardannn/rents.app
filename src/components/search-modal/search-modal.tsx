"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useForm, Controller, set } from "react-hook-form";
import * as Slider from "@radix-ui/react-slider";

import { SearchModalType } from "@/types/search-modal-type";

// even with use client, SearchBox internals is causing SSR troubles
// import { SearchBox } from "@mapbox/search-js-react";

import dynamic from "next/dynamic";
const SearchBox = dynamic(
    () => import("@mapbox/search-js-react").then(mod => mod.SearchBox),
    {
        ssr: false,
    }
)

const SearchModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [displayText, setDisplayText] = useState("Discover best properties near you matching your checklist");
    const [applied, setApplied] = useState(false);

    const { register, handleSubmit, control, watch, reset, setValue } = useForm<SearchModalType>({
        defaultValues: {
            location: "",
            placeDetails: null,
            propertyType: {
                pg: false,
                flat: false,
                shared: false,
            },
            ownerType: "any",
            budget: [5000, 50000],
        },
    });

    const budgetValues = watch("budget");

    const onApplyFilters = (data: any) => {
        console.log("Applied Filters:", data);
        setApplied(true);
        setDisplayText(`${Object.keys(data.propertyType).filter(key => data.propertyType[key]).join(", ")} in ${data.location} with budget ₹${data.budget[0]} - ₹${data.budget[1]} `);
        setIsOpen(false);
    };

    const handleClear = () => {
        reset();
    };

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-50"
            >
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    aria-hidden="true"
                />
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <form onSubmit={handleSubmit(onApplyFilters)}>
                            <Dialog.Title className="text-2xl font-bold text-gray-900">
                                Filters
                            </Dialog.Title>
                            <div className="mt-6 space-y-6">
                                {/* --- START OF ADDED SECTION --- */}
                                <div>
                                    <h3 className="font-semibold text-gray-800">Location</h3>
                                    <div className="mt-2">


                                        {/* Mapbox places API/ search API here 
                                        didnt use google places API as 1000rs min mandatory deposit
                                        which will be used as credits after 200$ limit*/}
                                        <SearchBox
                                            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string}
                                            onRetrieve={(result) => {
                                                const selectedFeature = result.features[0];
                                                setValue("location", selectedFeature.properties.full_address);
                                                setValue("placeDetails", {
                                                    name: selectedFeature.properties.name,
                                                    address: selectedFeature.properties.full_address,
                                                    coords: {
                                                        lng: selectedFeature.geometry.coordinates[0],
                                                        lat: selectedFeature.geometry.coordinates[1],
                                                    }
                                                });
                                            }}
                                            options={{
                                                language: "en",
                                                country: "IN",
                                            }}
                                        />

                                    </div>
                                </div>


                                <div>
                                    <h3 className="font-semibold text-gray-800">Property Type</h3>
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register("propertyType.pg")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                                            <span>PG</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register("propertyType.flat")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                                            <span>Flat</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" {...register("propertyType.shared")} className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                                            <span>Shared Room</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Owner Type</h3>
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        <label className="flex items-center space-x-2">
                                            <input {...register("ownerType")} type="radio" value="any" className="h-4 w-4 border-gray-300 text-red-500 focus:ring-red-400" />
                                            <span>Any</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input {...register("ownerType")} type="radio" value="owner" className="h-4 w-4 border-gray-300 text-red-500 focus:ring-red-400" />
                                            <span>Owner</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input {...register("ownerType")} type="radio" value="broker" className="h-4 w-4 border-gray-300 text-red-500 focus:ring-red-400" />
                                            <span>Broker</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-800">Budget Range</h3>
                                        <span className="text-lg font-medium text-gray-900">
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
                            </div>
                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Clear all
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#f75c5f] rounded-lg hover:bg-[#e05558] transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>

            <div
                onClick={handleClick}
                className={`search-modal mt-4 bg-white rounded-xl shadow-xl p-6 max-w-xl w-full pointer-events-auto cursor-pointer text-xl border-none ${applied ? "text-gray-800" : "text-gray-500"}`}
            >
                {displayText}
            </div>
        </>
    );
};

export default SearchModal;