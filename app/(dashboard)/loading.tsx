"use client";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
            <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-l-blue-500 rounded-full animate-spin"></div>
        </div>
    );
}
