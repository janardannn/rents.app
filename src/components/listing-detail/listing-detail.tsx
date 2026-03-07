"use client";

import { useEffect, useState } from "react";
import type { ListingDetail as ListingDetailType } from "@/types/listing-detail";

interface ListingDetailProps {
    listingId: string | null;
    onClose: () => void;
}

const propertyTypeLabel: Record<string, string> = {
    PG: "PG",
    FLAT: "Flat",
    SHARED: "Shared Room",
};

export default function ListingDetailPanel({ listingId, onClose }: ListingDetailProps) {
    const [detail, setDetail] = useState<ListingDetailType | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (!listingId) {
            setDetail(null);
            return;
        }

        setLoading(true);
        setImageIndex(0);

        fetch(`/api/listings/${listingId}`)
            .then(res => res.json())
            .then(data => setDetail(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [listingId]);

    const images = detail?.images || [];
    const isOpen = !!listingId;

    return (
        <div
            className={`absolute top-3 right-3 bottom-3 w-[620px] bg-white rounded-xl shadow-2xl z-40 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-[calc(100%+12px)]"}`}
        >
            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#f75c5f] rounded-full animate-spin" />
                </div>
            ) : detail ? (
                <>
                    {/* Image */}
                    <div className="relative shrink-0">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[imageIndex]}
                                    alt={detail.title}
                                    className="w-full h-64 object-cover rounded-t-xl"
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-gray-700 text-sm"
                                        >
                                            &lt;
                                        </button>
                                        <button
                                            onClick={() => setImageIndex(i => (i + 1) % images.length)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-gray-700 text-sm"
                                        >
                                            &gt;
                                        </button>
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                            {imageIndex + 1}/{images.length}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-36 bg-gray-100 rounded-t-xl flex items-center justify-center text-gray-400 text-sm">
                                No images
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-lg w-9 h-9 flex items-center justify-center shadow-md text-gray-800 text-xl font-semibold z-10 cursor-pointer"
                        >
                            &#x2715;
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div>
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-base font-bold text-gray-900 leading-tight">{detail.title}</h2>
                                <span className="shrink-0 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {propertyTypeLabel[detail.propertyType] || detail.propertyType}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{detail.address}</p>
                        </div>

                        <div className="text-lg font-bold text-[#f75c5f]">
                            ₹{detail.rent.toLocaleString("en-IN")}
                            <span className="text-sm font-normal text-gray-500">/mo</span>
                        </div>

                        {detail.description && (
                            <p className="text-sm text-gray-700 leading-relaxed">{detail.description}</p>
                        )}

                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Contact</h3>
                            <div className="mt-1.5 flex items-center gap-3 text-sm text-gray-600">
                                <span>{detail.ownerName}</span>
                                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">{detail.ownerType}</span>
                            </div>
                            {detail.ownerPhone && (
                                <a href={`tel:${detail.ownerPhone}`} className="mt-1.5 block text-sm text-[#f75c5f] font-medium hover:underline">
                                    {detail.ownerPhone}
                                </a>
                            )}
                        </div>
                    </div>
                </>
            ) : isOpen ? (
                <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
                    Listing not found
                </div>
            ) : null}
        </div>
    );
}
