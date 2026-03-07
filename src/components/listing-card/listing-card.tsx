"use client";

import type { ListingResult } from "@/types/listing";

interface ListingCardProps {
    listing: ListingResult;
    onClick: (listing: ListingResult) => void;
}

const propertyTypeLabel: Record<string, string> = {
    PG: "PG",
    FLAT: "Flat",
    SHARED: "Shared Room",
};

export default function ListingCard({ listing, onClick }: ListingCardProps) {
    return (
        <div
            onClick={() => onClick(listing)}
            className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
        >
            {listing.images?.[0] ? (
                <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-20 h-20 rounded-md object-cover shrink-0"
                />
            ) : (
                <div className="w-20 h-20 rounded-md bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 text-xs">
                    No image
                </div>
            )}
            <div className="flex flex-col justify-between min-w-0 flex-1">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{listing.title}</h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{listing.address}</p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#f75c5f]">₹{listing.rent.toLocaleString("en-IN")}/mo</span>
                    <span className="text-xs text-gray-500">
                        {propertyTypeLabel[listing.propertyType] || listing.propertyType} · {listing.ownerName}
                    </span>
                </div>
            </div>
        </div>
    );
}
