"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { endSession, getSessionStats, getSessionAttendance } from "@/actions/session";
import { useRouter } from "next/navigation";
import { Loader2, StopCircle, RefreshCw, Users, ShieldAlert, Download, FileText, Activity, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SessionView({ sessionId, subjectName, subjectId }: { sessionId: number; subjectName: string; subjectId: number }) {


    const router = useRouter();
    const [token, setToken] = useState(`${sessionId}:0`); // Initial static token
    const [mounted, setMounted] = useState(false);
    const [sessionStatistics, setSessionStatistics] = useState<{
        attendanceCount: number;
        proxyCount: number;
        recentAttendance: any[];
        recentProxies: any[];
    }>({ attendanceCount: 0, proxyCount: 0, recentAttendance: [], recentProxies: [] });
    const [loading, setLoading] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);

    // Auto-End session on unmount - REMOVED to prevent sessions ending on refresh
    // Faculty must explicitly click "End Session"
    /*
    useEffect(() => {
        return () => {
            const blob = new Blob([JSON.stringify({ sessionId })], { type: 'application/json' });
            navigator.sendBeacon(`/api/session/${sessionId}/end`, blob);
        };
    }, [sessionId]);
    */

    // Set mounted state to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return; // Only update token after client-side mount

        const updateToken = () => {
            const timestamp = Date.now();
            setToken(`${sessionId}:${timestamp}`);
        };

        updateToken();
        const interval = setInterval(updateToken, 4000);
        return () => clearInterval(interval);
    }, [sessionId, mounted]);

    useEffect(() => {
        // Fetch session stats
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchStats = async () => {
            if (!isMounted) return;

            try {
                // Only fetch if visible to save resources
                if (document.visibilityState === "visible") {
                    const newStats = await getSessionStats(sessionId);
                    if (isMounted) {
                        setSessionStatistics(newStats);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch session stats:", error);
            } finally {
                // Schedule next fetch only after current one completes
                if (isMounted) {
                    timeoutId = setTimeout(fetchStats, 1000);
                }
            }
        };

        // Initial fetch
        fetchStats();

        // Handle visibility changes to restart polling immediately
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                clearTimeout(timeoutId);
                fetchStats();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [sessionId]);

    const handleEndSession = async () => {
        if (loading) return; // Prevent double clicks
        setLoading(true);
        try {
            await endSession(sessionId);
            router.push("/faculty");
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const result = await getSessionAttendance(sessionId);
            if (!result.success || !result.present) {
                alert("Failed to fetch attendance data");
                return;
            }

            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text(`${subjectName} - Attendance`, 14, 22);
            doc.setFontSize(11);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

            // Stats
            doc.text(`Total Present: ${result.present.length}`, 14, 38);
            doc.text(`Total Absent: ${result.absent?.length || 0}`, 14, 44);

            let finalY = 50;

            // --- PRESENT TABLE ---
            if (result.present.length > 0) {
                doc.setFontSize(14);
                doc.setTextColor(22, 163, 74); // Green
                doc.text("Present Students", 14, finalY);

                const tableData = result.present.map((record: any) => [
                    record.student.rollNumber,
                    record.student.user.name,
                    new Date(record.timestamp).toLocaleTimeString(),
                    record.student.deviceHash ? "Verified" : "N/A"
                ]);

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Roll No', 'Name', 'Time', 'Device Status']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [22, 163, 74] }, // Green header
                });

                finalY = (doc as any).lastAutoTable.finalY + 15;
            }

            // --- ABSENT TABLE ---
            if (result.absent && result.absent.length > 0) {
                doc.setFontSize(14);
                doc.setTextColor(220, 38, 38); // Red
                doc.text("Absent Students", 14, finalY);

                const absentData = result.absent.map((student: any) => [
                    student.rollNumber,
                    student.name,
                    "ABSENT",
                    "-"
                ]);

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Roll No', 'Name', 'Status', 'Device']],
                    body: absentData,
                    theme: 'grid',
                    headStyles: { fillColor: [220, 38, 38] }, // Red header
                });
            }

            doc.save(`${subjectName}_Attendance_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF");
        }
    };

    const handleDownloadTXT = async () => {
        try {
            const result = await getSessionAttendance(sessionId);
            if (!result.success || !result.present) {
                alert("Failed to fetch attendance data");
                return;
            }

            let content = `SUBJECT: ${subjectName}\nDATE: ${new Date().toLocaleDateString()}\n\n`;

            content += `--- PRESENT (${result.present.length}) ---\n`;
            content += result.present
                .map((record: any) => record.student.rollNumber)
                .join('\n');

            if (result.absent && result.absent.length > 0) {
                content += `\n\n--- ABSENT (${result.absent.length}) ---\n`;
                content += result.absent
                    .map((student: any) => student.rollNumber)
                    .join('\n');
            }

            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${subjectName}_Attendance_${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("TXT generation failed:", error);
            alert("Failed to generate TXT");
        }
    };

    // Merge and sort logs - only compute after mount to prevent hydration mismatch
    const activityLogs = mounted ? [
        ...sessionStatistics.recentAttendance.map(attendanceRecord => ({ ...attendanceRecord, type: 'attendance' })),
        ...sessionStatistics.recentProxies.map(proxyRecord => ({ ...proxyRecord, type: 'proxy' }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                            {subjectName}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Attendance Session
                        </p>
                    </div>
                    <button
                        onClick={() => setShowEndConfirm(true)}
                        disabled={loading}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Ending...
                            </>
                        ) : (
                            <>
                                <StopCircle className="w-4 h-4" />
                                End Session
                            </>
                        )}
                    </button>
                </div>

                {/* QR Code Section - Prominent at Top */}
                <div className="mb-6 flex justify-center">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden max-w-2xl w-full">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-center text-white">
                            <h2 className="text-xl font-bold mb-1">Scan to Mark Attendance</h2>
                            <p className="text-blue-100 text-sm">Students, scan this QR code with your device</p>
                        </div>

                        <div className="p-10 flex flex-col items-center">
                            <div className="relative group">
                                {/* Glow effect */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

                                {/* QR Code - Extra Large */}
                                <div className="relative bg-white dark:bg-slate-100 p-6 rounded-2xl shadow-2xl">
                                    <QRCode
                                        value={token}
                                        size={350}
                                        className="w-full h-auto"
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    />

                                    {/* Corner decorations */}
                                    <div className="absolute -top-1.5 -left-1.5 w-8 h-8 border-t-[5px] border-l-[5px] border-blue-600 rounded-tl-xl"></div>
                                    <div className="absolute -top-1.5 -right-1.5 w-8 h-8 border-t-[5px] border-r-[5px] border-blue-600 rounded-tr-xl"></div>
                                    <div className="absolute -bottom-1.5 -left-1.5 w-8 h-8 border-b-[5px] border-l-[5px] border-blue-600 rounded-bl-xl"></div>
                                    <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 border-b-[5px] border-r-[5px] border-blue-600 rounded-br-xl"></div>
                                </div>
                            </div>

                            {/* Refresh indicator */}
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 rounded-full">
                                <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                                <span className="font-medium">Refreshes every 4 seconds</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    {/* Present Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-xl p-6 text-white relative overflow-hidden group hover:shadow-2xl transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium mb-0.5">Students Present</p>
                                    <p className="text-3xl font-bold tabular-nums">{sessionStatistics.attendanceCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proxies Card */}
                    <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-xl p-6 text-white relative overflow-hidden group hover:shadow-2xl transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-rose-100 text-sm font-medium mb-0.5">Proxy Attempts</p>
                                    <p className="text-3xl font-bold tabular-nums">{sessionStatistics.proxyCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 mb-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Export Attendance Records</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={sessionStatistics.attendanceCount === 0}
                            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Download PDF Report
                        </button>
                        <button
                            onClick={handleDownloadTXT}
                            disabled={sessionStatistics.attendanceCount === 0}
                            className="px-5 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download TXT File
                        </button>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Activity Feed</h3>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                                </span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">LIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[450px] overflow-y-auto p-5 space-y-2.5">
                        {activityLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
                                    <Clock className="w-12 h-12 opacity-50" />
                                </div>
                                <p className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-1">No activity yet</p>
                                <p className="text-sm text-slate-500 dark:text-slate-500">Attendance records will appear here in real-time</p>
                            </div>
                        ) : (
                            activityLogs.map((log: any) => (
                                <div
                                    key={`${log.type}-${log.id}`}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01] ${log.type === 'proxy'
                                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 hover:shadow-lg hover:border-red-300'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${log.type === 'proxy'
                                                ? 'bg-red-100 dark:bg-red-900/40'
                                                : 'bg-blue-100 dark:bg-blue-900/40'
                                            }`}>
                                            {log.type === 'proxy' ? (
                                                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            ) : (
                                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                {log.student.user.name}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                                {log.student.rollNumber}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1.5">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </p>
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.type === 'proxy'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-emerald-600 text-white'
                                                }`}>
                                                {log.type === 'proxy' ? 'Proxy' : 'Present'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showEndConfirm}
                onClose={() => setShowEndConfirm(false)}
                onConfirm={handleEndSession}
                title="End Session"
                description="Are you sure you want to end this session? Students will no longer be able to mark attendance."
                confirmText="End Session"
                variant="danger"
                loading={loading}
            />
        </div>
    );
}
