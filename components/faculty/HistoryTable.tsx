"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Calendar, Search, FileText, ChevronRight } from "lucide-react";
import FormattedTime from "@/components/FormattedTime";

type HistorySession = {
    id: number;
    subjectName: string;
    startTime: Date;
    endTime: Date | null;
    attendanceCount: number;
    proxyCount: number;
};

export default function HistoryTable({ sessions }: { sessions: HistorySession[] }) {
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [dateFilter, setDateFilter] = useState("");
    const dateInputRef = useRef<HTMLInputElement>(null);

    // Get unique subjects
    const subjects = ["All", ...Array.from(new Set(sessions.map(s => s.subjectName)))];

    const filteredSessions = sessions.filter(session => {
        const matchesSubject = selectedSubject === "All" || session.subjectName === selectedSubject;
        // Native date comparison (YYYY-MM-DD)
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        const matchesDate = !dateFilter || sessionDate === dateFilter;
        return matchesSubject && matchesDate;
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-card border border-border text-foreground rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full md:w-auto min-w-[200px]">
                    {/* Main Container - acts as the relative parent for height/layout */}
                    <div
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="relative flex items-center w-full border border-border rounded-lg bg-card text-foreground pl-10 pr-4 py-3 cursor-pointer hover:border-primary transition-colors"
                    >
                        <Calendar className="absolute left-3 w-4 h-4 text-muted-foreground" />

                        {/* Display Text */}
                        {dateFilter ? new Date(dateFilter).toLocaleDateString("en-GB") : <span className="text-muted-foreground">DD/MM/YYYY</span>}

                        {/* Hidden Native Date Input (Overlay) */}
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                            tabIndex={-1}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-muted-foreground text-sm">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-center">Present</th>
                                <th className="p-4 text-center">Proxies</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No history found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-muted/50 transition-colors group">
                                        <td className="p-4 text-foreground font-medium">
                                            <FormattedTime date={session.startTime} dateOnly />
                                        </td>
                                        <td className="p-4 text-foreground/80">
                                            {session.subjectName}
                                        </td>
                                        <td className="p-4 text-muted-foreground text-sm">
                                            {new Date(session.startTime).toLocaleTimeString(undefined, {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                            {' - '}
                                            {session.endTime ? new Date(session.endTime).toLocaleTimeString(undefined, {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            }) : 'Ongoing'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-medium">
                                                {session.attendanceCount}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {session.proxyCount > 0 ? (
                                                <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-xs font-medium">
                                                    {session.proxyCount}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/faculty/history/${session.id}`}
                                                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
                                            >
                                                View Report
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
