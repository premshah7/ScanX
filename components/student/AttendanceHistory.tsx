"use client";

import { useState } from "react";
import { CheckCircle, ChevronDown, History } from "lucide-react";
import FormattedTime from "@/components/FormattedTime";

type AttendanceRecord = {
    id: number;
    timestamp: Date;
    session: {
        subject: {
            name: string;
        };
    };
};

const INITIAL_COUNT = 5;

export default function AttendanceHistory({ records }: { records: AttendanceRecord[] }) {
    const [expanded, setExpanded] = useState(false);
    const hasMore = records.length > INITIAL_COUNT;
    const visible = expanded ? records : records.slice(0, INITIAL_COUNT);

    if (records.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-card border-2 border-dashed border-border rounded-2xl">
                <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-base font-medium">No attendance records yet</p>
                <p className="text-xs mt-1.5 text-muted-foreground/70">Start scanning QR codes to build your history!</p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {visible.map((record, index) => (
                <div
                    key={record.id}
                    className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all hover-lift group"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                            {record.session.subject.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            <FormattedTime date={record.timestamp} includeSeconds />
                        </div>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ml-3">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                </div>
            ))}

            {hasMore && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full py-3 text-sm font-semibold text-primary hover:text-primary/80 bg-card border border-border rounded-xl flex items-center justify-center gap-2 hover:bg-muted/50 transition-all"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                    {expanded ? "Show Less" : `View All (${records.length})`}
                </button>
            )}
        </div>
    );
}
