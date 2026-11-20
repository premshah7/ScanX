"use client";

import { useSyncExternalStore } from "react";

type Props = {
    date: Date | string;
    includeSeconds?: boolean;
    dateOnly?: boolean;
    className?: string;
};

const emptySubscribe = () => () => {};

export default function FormattedTime({ date, includeSeconds = false, dateOnly = false, className = "" }: Props) {
    const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!isMounted || !date) {
        return <span className={`opacity-0 ${className}`}>--/--/----</span>;
    }

    const parsedDate = new Date(date);
    const formatted = dateOnly
        ? parsedDate.toLocaleDateString("en-GB")
        : parsedDate.toLocaleString("en-GB", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: includeSeconds ? "numeric" : undefined,
            hour12: true,
        });

    return <span className={className}>{formatted}</span>;
}
