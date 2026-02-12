"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshProps {
    intervalMs?: number;
}

export default function AutoRefresh({ intervalMs = 30000 }: AutoRefreshProps) {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [intervalMs, router]);

    return null;
}
