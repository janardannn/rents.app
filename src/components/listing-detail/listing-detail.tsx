"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ListingDetail as ListingDetailType } from "@/types/listing-detail";

interface ListingDetailProps {
    listingId: string | null;
    onClose: () => void;
    onLoaded?: (detail: ListingDetailType) => void;
}

const propertyTypeLabel: Record<string, string> = {
    PG: "PG",
    FLAT: "Flat",
    SHARED: "Shared Room",
};

const furnishingLabel: Record<string, string> = {
    FURNISHED: "Furnished",
    SEMI_FURNISHED: "Semi-Furnished",
    UNFURNISHED: "Unfurnished",
};

const ownerTypeLabel: Record<string, string> = {
    INDIVIDUAL: "Owner",
    BROKER: "Broker",
};

function ChevronLeft({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}

function ChevronRight({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <div className="text-lg font-semibold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}

export default function ListingDetailPanel({ listingId, onClose, onLoaded }: ListingDetailProps) {
    const [detail, setDetail] = useState<ListingDetailType | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        const url = new URL(window.location.href);
        url.searchParams.set("listing", listingId!);
        navigator.clipboard.writeText(url.toString()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    useEffect(() => {
        if (!listingId) {
            setDetail(null);
            return;
        }

        setLoading(true);
        setImageIndex(0);

        fetch(`/api/listings/${listingId}`)
            .then(res => res.json())
            .then(data => { setDetail(data); onLoaded?.(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [listingId]);

    const images = detail?.images || [];
    const isOpen = !!listingId;

    useEffect(() => {
        if (!lightbox) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightbox(false);
            if (e.key === "ArrowLeft") setImageIndex(i => (i - 1 + images.length) % images.length);
            if (e.key === "ArrowRight") setImageIndex(i => (i + 1) % images.length);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lightbox, images.length]);

    return (
        <div
            className={`absolute top-4 right-4 bottom-4 w-[45%] min-w-[480px] max-w-[800px] bg-white/95 backdrop-blur-md rounded-2xl z-40 flex flex-col transition-all duration-300 ${isOpen ? "translate-x-0 opacity-100" : "translate-x-[calc(100%+16px)] opacity-0"}`}
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)" }}
        >
            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#f75c5f] rounded-full animate-spin" />
                </div>
            ) : detail ? (
                <>
                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto rounded-t-2xl">
                        {/* Image with overlay */}
                        <div className="relative shrink-0">
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[imageIndex]}
                                        alt={detail.title}
                                        onClick={() => setLightbox(true)}
                                        className="w-full h-64 object-cover rounded-t-2xl cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl pointer-events-none" />

                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setImageIndex(i => (i + 1) % images.length)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {images.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setImageIndex(i)}
                                                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === imageIndex ? "bg-white scale-110" : "bg-white/50"}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Title + price on image */}
                                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
                                        <div className="flex items-end justify-between gap-3">
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-bold text-white leading-snug drop-shadow-sm truncate">{detail.title}</h2>
                                                <p className="text-sm text-white/80 mt-0.5 truncate">{detail.address}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="text-xl font-bold text-white drop-shadow-sm">
                                                    ₹{detail.rent.toLocaleString("en-IN")}
                                                </div>
                                                <div className="text-xs text-white/70">per month</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-36 bg-gray-100 rounded-t-2xl flex items-center justify-center text-gray-400 text-sm">
                                    No images
                                </div>
                            )}

                            <div className="absolute top-3 right-3 flex gap-2 z-10">
                                <button
                                    onClick={handleShare}
                                    className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white cursor-pointer transition-colors"
                                    title="Copy link"
                                >
                                    {copied ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white text-lg cursor-pointer transition-colors"
                                >
                                    &#x2715;
                                </button>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="px-5 pt-3 flex gap-2">
                            <span className="text-xs font-medium bg-[#f75c5f]/10 text-[#f75c5f] px-2.5 py-1 rounded-full">
                                {propertyTypeLabel[detail.propertyType] || detail.propertyType}
                            </span>
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                {furnishingLabel[detail.furnishing] || detail.furnishing}
                            </span>
                            {detail.availableFrom && (
                                <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                                    Avail. {new Date(detail.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        {(detail.bedrooms || detail.bathrooms || detail.area || detail.floor != null) && (
                            <div className="px-5 pt-4 flex gap-6">
                                {detail.bedrooms && <StatItem value={`${detail.bedrooms}`} label="Bedrooms" />}
                                {detail.bathrooms && <StatItem value={`${detail.bathrooms}`} label="Bathrooms" />}
                                {detail.area && <StatItem value={`${detail.area}`} label="Sq Ft" />}
                                {detail.floor != null && detail.totalFloors && (
                                    <StatItem value={detail.floor === 0 ? `G/${detail.totalFloors}` : `${detail.floor}/${detail.totalFloors}`} label="Floor" />
                                )}
                            </div>
                        )}

                        {/* Cost breakdown */}
                        {(detail.deposit || detail.maintenance) && (
                            <div className="px-5 pt-4">
                                <div className="grid grid-cols-3 gap-px bg-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-white px-3 py-2.5">
                                        <div className="text-xs text-gray-500">Rent</div>
                                        <div className="text-sm font-semibold text-gray-900 mt-0.5">₹{detail.rent.toLocaleString("en-IN")}</div>
                                    </div>
                                    <div className="bg-white px-3 py-2.5">
                                        <div className="text-xs text-gray-500">Deposit</div>
                                        <div className="text-sm font-semibold text-gray-900 mt-0.5">
                                            {detail.deposit ? `₹${detail.deposit.toLocaleString("en-IN")}` : "—"}
                                        </div>
                                    </div>
                                    <div className="bg-white px-3 py-2.5">
                                        <div className="text-xs text-gray-500">Maintenance</div>
                                        <div className="text-sm font-semibold text-gray-900 mt-0.5">
                                            {detail.maintenance ? `₹${detail.maintenance.toLocaleString("en-IN")}` : "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {detail.description && (
                            <div className="px-5 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">About</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{detail.description}</p>
                            </div>
                        )}

                        {/* Amenities */}
                        {detail.amenities?.length > 0 && (
                            <div className="px-5 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Amenities</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {detail.amenities.map(a => (
                                        <span key={a} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                                            <span className="w-1 h-1 rounded-full bg-[#f75c5f]" />
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="h-4" />
                    </div>

                    {/* Sticky contact footer */}
                    <div className="shrink-0 border-t border-gray-100 px-5 py-3 bg-white rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                                    {detail.ownerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{detail.ownerName}</div>
                                    <div className="text-xs text-gray-500">{ownerTypeLabel[detail.ownerType] || detail.ownerType}</div>
                                </div>
                            </div>
                            {detail.ownerPhone && (
                                <a
                                    href={`tel:${detail.ownerPhone}`}
                                    className="bg-[#f75c5f] hover:bg-[#e05558] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Call
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

            {/* Lightbox — portaled to body to escape transform context */}
            {lightbox && images.length > 0 && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
                    <img
                        src={images[imageIndex]}
                        alt=""
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                        onClick={e => e.stopPropagation()}
                    />

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={e => { e.stopPropagation(); setImageIndex(i => (i - 1 + images.length) % images.length); }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <ChevronLeft className="w-7 h-7" />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); setImageIndex(i => (i + 1) % images.length); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <ChevronRight className="w-7 h-7" />
                            </button>
                        </>
                    )}

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        {imageIndex + 1} / {images.length}
                    </div>

                    <button
                        onClick={() => setLightbox(false)}
                        className="absolute top-5 right-5 text-white/70 hover:text-white text-2xl cursor-pointer transition-colors"
                    >
                        &#x2715;
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}
