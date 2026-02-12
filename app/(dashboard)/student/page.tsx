import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QrCode, History, CheckCircle, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import RequestResetButton from "@/components/student/RequestResetButton";
import DeviceStatus from "@/components/student/DeviceStatus";
import EditStudentModal from "@/components/admin/EditStudentModal";
import FormattedTime from "@/components/FormattedTime";
import { ThemeToggle } from "@/components/theme-toggle";

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 text-foreground pb-24 animate-slide-up">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gradient mb-1">Welcome, {student.user.name.split(' ')[0]}</h1>
                    <p className="text-muted-foreground">Track your attendance seamlessly</p>
                    <div className="mt-3">
                        <EditStudentModal student={student} batches={batches} />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LogoutButton />
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                        <span className="font-bold text-white text-lg">{student.user.name[0]}</span>
                    </div>
                </div>
            </div>

            {/* Action Card - Enhanced with Gradient */}
            <div className="relative gradient-primary rounded-2xl p-8 mb-8 shadow-2xl overflow-hidden group">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="text-white/80 text-sm font-semibold uppercase tracking-wide">Quick Action</span>
                    </div>
                    <h2 className="text-2xl font-extrabold mb-2 text-white">Mark Attendance</h2>
                    <p className="text-white/90 mb-6">Scan the QR code projected in class</p>
                    <Link
                        href="/student/scan"
                        className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-white/95 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                        <QrCode className="w-6 h-6" />
                        Scan Now
                    </Link>
                </div>
                <QrCode className="absolute -bottom-6 -right-6 w-40 h-40 text-white/10 rotate-12 group-hover:rotate-6 transition-transform" />
            </div>

            {/* Device Status */}
            <div className="mb-8">
                <h3 className="text-muted-foreground text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Device Status
                </h3>
                <DeviceStatus
                    initialDeviceHash={student.deviceHash}
                    initialDeviceId={student.deviceId}
                    initialIsRequested={student.isDeviceResetRequested}
                />
            </div>

            {/* Attendance History */}
            <div>
                <h3 className="text-muted-foreground text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent History
                </h3>
                <div className="space-y-3">
                    {student.attendances.map((record) => (
                        <div key={record.id} className="bg-card border-2 border-border p-5 rounded-xl flex items-center justify-between shadow-sm hover:shadow-lg transition-all hover-lift group">
                            <div>
                                <div className="font-bold text-foreground group-hover:text-primary transition-colors">{record.session.subject.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <FormattedTime date={record.timestamp} includeSeconds />
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    ))}
                    {attendanceCount === 0 && (
                        <div className="text-center py-16 text-muted-foreground bg-card border-2 border-dashed border-border rounded-2xl">
                            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No attendance records yet.</p>
                            <p className="text-sm mt-2">Start scanning QR codes to build your history!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
