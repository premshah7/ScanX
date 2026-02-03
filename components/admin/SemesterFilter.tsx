"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SemesterFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSelect = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("semester", term);
        } else {
            params.delete("semester");
        }
        params.set("page", "1"); // Reset to first page on filter change
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[150px]"
            onChange={(e) => handleSelect(e.target.value)}
            defaultValue={searchParams.get("semester")?.toString()}
        >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                    Semester {sem}
                </option>
            ))}
        </select>
    );
}
