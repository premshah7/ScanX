import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QrCode, History, Smartphone, Sparkles, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import DeviceStatus from "@/components/student/DeviceStatus";
import AttendanceHistory from "@/components/student/AttendanceHistory";

export default async function StudentDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
        redirect("/auth/login");
    }

    const [student, batches] = await Promise.all([
        prisma.student.findUnique({
            where: { userId: Number(session.user.id) },
            include: {
                attendances: {
                    include: {
                        session: {
                            include: { subject: true }
                        }
                    },
                    orderBy: { timestamp: 'desc' },
                    take: 20
                },
                user: true
            }
        }),
        prisma.batch.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    if (!student) {
        return <div className="p-8 text-foreground">Student record not found.</div>;
    }

    const attendanceCount = student.attendances.length;

    // Get unique subjects from attendance
    const uniqueSubjects = new Set(student.attendances.map(a => a.session.subject.name));

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
                            {student.rollNumber} · Sem {student.semester}
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

                {/* Subjects Covered */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 hover-lift group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-foreground">{uniqueSubjects.size}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Subjects Covered</p>
                    </div>
                </div>
            </div>

            {/* ─── Scan QR Hero Card ─── */}
            <div className="relative bg-primary rounded-2xl p-6 md:p-8 mb-6 shadow-lg overflow-hidden group">
                {/* Decorative blurs */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
                </div>

                <div className="relative z-10">
                    {/* <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-white/80" />
                        <span className="text-white/70 text-xs font-bold uppercase tracking-wider">Quick Action</span>
                    </div> */}
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

                {/* Floating QR icon */}
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
