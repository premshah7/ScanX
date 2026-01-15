
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="space-y-6">
            <header className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Chart Skeleton */}
                    <div className="h-[350px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                </div>
                <div className="lg:col-span-1">
                    {/* Defaulters Skeleton */}
                    <div className="h-[350px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
}
