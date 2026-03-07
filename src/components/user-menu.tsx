"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface UserMenuProps {
    variant?: "floating" | "inline";
}

export default function UserMenu({ variant = "floating" }: UserMenuProps) {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (status === "loading") {
        return (
            <div className={variant === "floating" ? "fixed top-5 right-5 z-50" : ""}>
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className={variant === "floating" ? "fixed top-5 right-5 z-50" : ""}>
                <Link
                    href="/login"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-full shadow-lg transition-colors flex items-center gap-2 border border-gray-200/50"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Sign In
                </Link>
            </div>
        );
    }

    const initial = (session.user?.name?.[0] || session.user?.email?.[0] || "U").toUpperCase();

    return (
        <div className={`relative ${variant === "floating" ? "fixed top-5 right-5 z-50" : ""}`} ref={menuRef}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center text-sm font-bold text-white cursor-pointer transition-colors ${variant === "floating" ? "shadow-lg" : ""}`}
            >
                {initial}
            </button>

            {open && (
                <div className={`absolute mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 ${variant === "inline" ? "left-0" : "right-0"}`}>
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
