import { prisma } from "@/lib/prisma";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default async function AttendanceLogsPage() {
    const [attendanceLogs, proxyLogs] = await Promise.all([
        prisma.attendance.findMany({
            take: 50,
            orderBy: { timestamp: "desc" },
            include: {
                student: { include: { user: true } },
                session: { include: { subject: true } },
            },
        }),
        prisma.proxyAttempt.findMany({
            take: 50,
            orderBy: { timestamp: "desc" },
            include: {
                student: { include: { user: true } },
                session: { include: { subject: true } },
            },
        }),
    ]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Security & Attendance Logs</h1>
            </div>

            {/* Proxy Attempts Section */}
            <div className="bg-card rounded-xl border border-destructive/20 overflow-hidden shadow-sm">
                <div className="p-4 bg-destructive/10 border-b border-destructive/10 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h2 className="text-lg font-semibold text-destructive">Recent Proxy Attempts</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Subject</th>
                                <th className="p-4 font-medium">Time</th>
                                <th className="p-4 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {proxyLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-destructive/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{log.student.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{log.student.rollNumber}</div>
                                    </td>
                                    <td className="p-4 text-foreground">{log.session.subject.name}</td>
                                    <td className="p-4 text-muted-foreground">{log.timestamp.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-destructive font-medium">Device Hash Mismatch</td>
                                </tr>
                            ))}
                            {proxyLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No suspicious activity recorded.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Logs Section */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h2 className="text-lg font-semibold text-foreground">Recent Attendance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Subject</th>
                                <th className="p-4 font-medium">Time</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {attendanceLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{log.student.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{log.student.rollNumber}</div>
                                    </td>
                                    <td className="p-4 text-foreground">{log.session.subject.name}</td>
                                    <td className="p-4 text-muted-foreground">{log.timestamp.toLocaleString()}</td>
                                    <td className="p-4 text-sm text-green-500 font-medium">Verified</td>
                                </tr>
                            ))}
                            {attendanceLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
