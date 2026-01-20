"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AutoRefreshProps {
    intervalMs?: number;
}

export default function AutoRefresh({ intervalMs = 5000 }: AutoRefreshProps) {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [router, intervalMs]);

    return null;
}
