"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        // Only trigger if pathname actually changed
        if (prevPathnameRef.current === pathname) {
            return;
        }

        prevPathnameRef.current = pathname;

        // Show loader when pathname changes
        setLoading(true);
        setProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 100);

        // Hide loader after a short delay
        const timer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);
        }, 500);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [pathname]);

    if (!loading) return null;

    return (
        <>
            {/* Full Page Overlay with Spinner */}
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    {/* Animated Logo Spinner */}
                    <div className="relative w-20 h-20">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>

                        {/* Spinning Gradient Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>

                        {/* Inner Pulsing Circle */}
                        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse"></div>

                        {/* Center Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-lg font-semibold text-foreground animate-pulse">
                            Loading
                        </p>
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
