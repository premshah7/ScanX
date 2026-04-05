"use client";

import { useState } from "react";
import { getSessionAttendance } from "@/actions/attendance";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadAttendanceButtonProps {
    sessionId: number;
    eventName: string;
}

export default function DownloadAttendanceButton({ sessionId, eventName }: DownloadAttendanceButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleDownload() {
        setLoading(true);
        try {
            const res = await getSessionAttendance(sessionId);
            if (res.error) {
                toast.error(res.error);
                return;
            }

            const data = res.attendances || [];
            if (data.length === 0) {
                toast.error("No attendance recorded yet.");
                return;
            }

            // Generate CSV
            const headers = ["Name", "Email", "Username", "Time", "IP Address"];
            const rows = data.map((att: any) => [
                att.student.user.name,
                att.student.user.email,
                att.student.user.username || "N/A",
                new Date(att.timestamp).toLocaleString(),
                att.ipAddress || "N/A"
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map(r => r.join(","))
            ].join("\n");

            // Download file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Attendance_${eventName.replace(/\s+/g, "_")}_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Attendance list downloaded!");
        } catch (error) {
            toast.error("Failed to download attendance");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold border border-zinc-700 transition-all active:scale-95 disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download CSV
        </button>
    );
}
