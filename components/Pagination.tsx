
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;
    const { replace } = useRouter();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-2 mt-4">
            <button
                className={`p-2 rounded-lg border border-gray-700 ${currentPage <= 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:bg-gray-800"}`}
                disabled={currentPage <= 1}
                onClick={() => createPageURL(currentPage - 1)}
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
            </span>

            <button
                className={`p-2 rounded-lg border border-gray-700 ${currentPage >= totalPages ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:bg-gray-800"}`}
                disabled={currentPage >= totalPages}
                onClick={() => createPageURL(currentPage + 1)}
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
