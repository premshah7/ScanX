import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QrCode, History, Smartphone, Calendar, TrendingUp, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";
import DeviceStatus from "@/components/student/DeviceStatus";
import AttendanceHistory from "@/components/student/AttendanceHistory";

export default async function StudentDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
        redirect("/auth/login");
    }

    const [student, registrations] = await Promise.all([
        prisma.student.findUnique({
            where: { userId: Number(session.user.id) },
            include: {
                attendances: {
                    include: {
                        session: {
                            include: { subject: true, event: true }
                        }
                    },
                    orderBy: { timestamp: 'desc' },
                    take: 20
                },
                user: true
            }
        }),
        prisma.eventRegistration.findMany({
            where: { userId: Number(session.user.id) },
            include: { event: true },
            orderBy: { registeredAt: 'desc' },
            take: 3
        })
    ]);

    if (!student) {
        return <div className="p-8 text-foreground">Student record not found.</div>;
    }

    const attendanceCount = student.attendances.length;
    const eventCount = registrations.length;

    // Get unique subjects from attendance
    const uniqueSubjects = new Set(student.attendances.map(a => a.session.subject?.name || a.session.event?.name || "Event"));

    return (
        <div className="min-h-screen text-foreground animate-slide-up">

            {/* ─── Profile Header ─── */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-primary truncate">
                            {student.user.name}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {student.enrollmentNo} · Sem {student.semester}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0 ml-4">
                        <span className="font-bold text-white text-lg">
                            {student.user.name[0]}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Stats Row ─── */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Total Sessions */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 hover-lift group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-foreground">{attendanceCount}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Sessions Attended</p>
                    </div>
                </div>

                {/* Events Hub */}
                <Link href="/student/events" className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 hover-lift group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Ticket className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-foreground">{eventCount}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                            My Events <ArrowRight className="w-3 h-3" />
                        </p>
                    </div>
                </Link>
            </div>

            {/* ─── Events Preview Card (New) ─── */}
            {registrations.length > 0 && (
                <div className="mb-6 bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-primary" />
                            Registered Events
                        </h3>
                        <Link href="/student/events" className="text-xs font-bold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {registrations.map((reg) => (
                            <div key={reg.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-all">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="font-bold text-sm text-foreground truncate">{reg.event.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                        {new Date(reg.event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {reg.event.venue || 'TBD'}
                                    </p>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                    reg.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    reg.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    {reg.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Scan QR Hero Card ─── */}
            <div className="relative bg-primary rounded-2xl p-6 md:p-8 mb-6 shadow-lg overflow-hidden group">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-xl md:text-2xl font-extrabold mb-1.5 text-white">Mark Attendance</h2>
                    <p className="text-white/80 text-sm mb-5">Scan the QR code projected in class</p>
                    <Link
                        href="/student/scan"
                        className="inline-flex items-center gap-2.5 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/95 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100"
                    >
                        <QrCode className="w-5 h-5" />
                        Scan Now
                    </Link>
                </div>
                <QrCode className="absolute -bottom-4 -right-4 w-32 h-32 text-white/8 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
            </div>

            {/* ─── Device Status ─── */}
            <div className="mb-6">
                <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5" />
                    Device Status
                </h3>
                <DeviceStatus
                    initialDeviceHash={student.deviceHash}
                    initialDeviceId={student.deviceId}
                    initialIsRequested={student.isDeviceResetRequested}
                />
            </div>

            {/* ─── Attendance History ─── */}
            <div>
                <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    Recent History
                </h3>
                <AttendanceHistory records={student.attendances} />
            </div>
        </div>
    );
}
