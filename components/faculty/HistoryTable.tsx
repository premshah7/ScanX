"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Search, FileText, ChevronRight } from "lucide-react";

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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                    >
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full md:w-auto">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full md:w-48 bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/50 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-center">Present</th>
                                <th className="p-4 text-center">Proxies</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No history found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-800/50 transition-colors group">
                                        <td className="p-4 text-white font-medium">
                                            {new Date(session.startTime).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {session.subjectName}
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
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
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/faculty/history/${session.id}`}
                                                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
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
