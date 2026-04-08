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

function daysAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 30) return `${diff}d ago`;
    const months = Math.floor(diff / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
}

function Divider() {
    return <div className="mx-4 my-3 border-t border-gray-100" />;
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

    const totalMonthly = detail ? detail.rent + (detail.maintenance || 0) : 0;

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
                        {/* Image */}
                        <div className="relative">
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[imageIndex]}
                                        alt={detail.title}
                                        onClick={() => setLightbox(true)}
                                        className="w-full h-56 object-cover rounded-t-2xl cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 rounded-t-2xl pointer-events-none" />

                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                                                className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setImageIndex(i => (i + 1) % images.length)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
                                                {images.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setImageIndex(i)}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === imageIndex ? "bg-white w-3.5" : "bg-white/40"}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Title overlay on image bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-2.5">
                                        <h2 className="text-lg font-bold text-white leading-tight drop-shadow-sm truncate">{detail.title}</h2>
                                        <p className="text-sm text-white/75 mt-0.5 truncate">{detail.address}</p>
                                    </div>

                                    {/* Share + Close */}
                                    <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
                                        <button
                                            onClick={handleShare}
                                            className="bg-black/35 hover:bg-black/55 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-white cursor-pointer transition-colors"
                                            title="Copy link"
                                        >
                                            {copied ? (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="bg-black/35 hover:bg-black/55 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-white cursor-pointer transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-28 bg-gray-50 rounded-t-2xl flex items-center justify-center text-gray-300 text-sm relative">
                                    No images
                                    <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                                        <button onClick={handleShare} className="bg-gray-200 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center text-gray-500 cursor-pointer transition-colors" title="Copy link">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                        </button>
                                        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center text-gray-500 cursor-pointer transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price row + badges */}
                        <div className="px-4 pt-3 flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">₹{detail.rent.toLocaleString("en-IN")}</span>
                                <span className="text-sm text-gray-400">/mo</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium bg-[#f75c5f]/10 text-[#f75c5f] px-2 py-0.5 rounded-full">
                                    {propertyTypeLabel[detail.propertyType] || detail.propertyType}
                                </span>
                                <span className="text-xs text-gray-400">{daysAgo(detail.createdAt)}</span>
                            </div>
                        </div>

                        {/* Key specs — compact grid */}
                        <div className="px-4 pt-2.5 grid grid-cols-5 gap-1">
                            {detail.bedrooms && (
                                <div className="bg-gray-50 rounded-lg py-1.5 text-center">
                                    <div className="text-base font-semibold text-gray-900">{detail.bedrooms}</div>
                                    <div className="text-xs text-gray-400">Beds</div>
                                </div>
                            )}
                            {detail.bathrooms && (
                                <div className="bg-gray-50 rounded-lg py-1.5 text-center">
                                    <div className="text-base font-semibold text-gray-900">{detail.bathrooms}</div>
                                    <div className="text-xs text-gray-400">Baths</div>
                                </div>
                            )}
                            {detail.area && (
                                <div className="bg-gray-50 rounded-lg py-1.5 text-center">
                                    <div className="text-base font-semibold text-gray-900">{detail.area}</div>
                                    <div className="text-xs text-gray-400">Sq ft</div>
                                </div>
                            )}
                            {detail.floor != null && detail.totalFloors && (
                                <div className="bg-gray-50 rounded-lg py-1.5 text-center">
                                    <div className="text-base font-semibold text-gray-900">{detail.floor === 0 ? "G" : detail.floor}/{detail.totalFloors}</div>
                                    <div className="text-xs text-gray-400">Floor</div>
                                </div>
                            )}
                            {detail.furnishing && (
                                <div className="bg-gray-50 rounded-lg py-1.5 text-center">
                                    <div className="text-base font-semibold text-gray-900">{detail.furnishing === "SEMI_FURNISHED" ? "Semi" : detail.furnishing === "FURNISHED" ? "Yes" : "No"}</div>
                                    <div className="text-xs text-gray-400">Furnished</div>
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* Pricing breakdown — always show */}
                        <div className="px-4">
                            <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-2">Pricing</h3>
                            <div className="space-y-1.5 text-base">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Rent</span>
                                    <span className="text-gray-900 font-medium">₹{detail.rent.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Security Deposit</span>
                                    <span className="text-gray-900 font-medium">{detail.deposit ? `₹${detail.deposit.toLocaleString("en-IN")}` : "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Maintenance</span>
                                    <span className="text-gray-900 font-medium">{detail.maintenance ? `₹${detail.maintenance.toLocaleString("en-IN")}/mo` : "—"}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200" />
                                <div className="flex justify-between font-semibold">
                                    <span className="text-gray-700">Total Monthly</span>
                                    <span className="text-gray-900">₹{totalMonthly.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Available from */}
                        {detail.availableFrom && (
                            <div className="px-4 mt-2.5 flex items-center gap-1.5 text-sm">
                                <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <span className="text-gray-500">Available</span>
                                <span className="text-gray-900 font-medium">
                                    {new Date(detail.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                        )}

                        <Divider />

                        {/* Rent Analysis — placeholder */}
                        <div className="px-4">
                            <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-2">Rent Analysis</h3>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">Area average for {detail.bedrooms || 1}BHK</span>
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Fair Price</span>
                                </div>
                                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="absolute inset-y-0 left-[15%] right-[15%] bg-gradient-to-r from-green-300 via-green-400 to-yellow-300 rounded-full" />
                                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#f75c5f] rounded-full" style={{ left: "45%" }} />
                                </div>
                                <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                                    <span>₹{Math.round(detail.rent * 0.6).toLocaleString("en-IN")}</span>
                                    <span>₹{Math.round(detail.rent * 1.5).toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Nearby Transit — placeholder */}
                        <div className="px-4">
                            <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-2">Nearby Transit</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center shrink-0">
                                        <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-4 4v4m-4-4h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2zm-4 4h12" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-base text-gray-900 font-medium">Nearest Metro Station</div>
                                        <div className="text-xs text-gray-400">Coming soon</div>
                                    </div>
                                    <span className="text-xs text-gray-300 shrink-0">-- min</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h4m4 6H8a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2zm-8 2h16" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-base text-gray-900 font-medium">Nearest Bus Stop</div>
                                        <div className="text-xs text-gray-400">Coming soon</div>
                                    </div>
                                    <span className="text-xs text-gray-300 shrink-0">-- min</span>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Locality Scores — placeholder */}
                        <div className="px-4">
                            <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-2">Locality Scores</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Safety", score: null, color: "bg-emerald-400" },
                                    { label: "Connectivity", score: null, color: "bg-blue-400" },
                                    { label: "Lifestyle", score: null, color: "bg-amber-400" },
                                ].map(s => (
                                    <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-gray-200">--</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-300 mt-1.5 text-center">Locality intelligence coming soon</p>
                        </div>

                        <Divider />

                        {/* Description */}
                        {detail.description && (
                            <>
                                <div className="px-4">
                                    <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-1.5">About</h3>
                                    <p className="text-base text-gray-600 leading-relaxed">{detail.description}</p>
                                </div>
                                <Divider />
                            </>
                        )}

                        {/* Amenities */}
                        {detail.amenities?.length > 0 && (
                            <>
                                <div className="px-4">
                                    <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-2">Amenities</h3>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                        {detail.amenities.map(a => (
                                            <div key={a} className="flex items-center gap-1.5 text-base text-gray-600">
                                                <svg className="w-3 h-3 text-[#f75c5f] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                {a}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Divider />
                            </>
                        )}

                        {/* Report / Safety — placeholder */}
                        <div className="px-4 pb-3 flex items-center justify-between">
                            <button className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                                Report listing
                            </button>
                            <span className="text-xs text-gray-300">ID: {detail.id.slice(0, 8)}</span>
                        </div>
                    </div>

                    {/* Sticky contact footer */}
                    <div className="shrink-0 border-t border-gray-100 px-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                                    {detail.ownerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-base font-medium text-gray-900 leading-tight">{detail.ownerName}</div>
                                    <div className="text-sm text-gray-400">{ownerTypeLabel[detail.ownerType] || detail.ownerType}</div>
                                </div>
                            </div>
                            {detail.ownerPhone && (
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`https://wa.me/91${detail.ownerPhone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi, I'm interested in your property "${detail.title}" listed on rents.app`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#25D366] hover:bg-[#1fb855] text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp
                                    </a>
                                    <a
                                        href={`tel:${detail.ownerPhone}`}
                                        className="bg-[#f75c5f] hover:bg-[#e05558] text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Call
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : isOpen ? (
                <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
                    Listing not found
                </div>
            ) : null}

            {/* Lightbox */}
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
