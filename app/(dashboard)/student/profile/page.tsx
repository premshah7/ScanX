import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, Hash, BookOpen, Layers, GraduationCap } from "lucide-react";
import EditStudentModal from "@/components/admin/EditStudentModal";
import LogoutButton from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/theme-toggle";
import DeviceStatus from "@/components/student/DeviceStatus";

export default async function StudentProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
        redirect("/auth/login");
    }

    const [student, batches] = await Promise.all([
        prisma.student.findUnique({
            where: { userId: Number(session.user.id) },
            include: { user: true }
        }),
        prisma.batch.findMany({ orderBy: { name: 'asc' } })
    ]);

    if (!student) {
        return <div className="p-8 text-foreground">Student record not found.</div>;
    }

    const batch = batches.find(b => b.id === student.batchId);

    return (
        <div className="min-h-screen text-foreground animate-slide-up max-w-lg mx-auto">

            {/* Profile Avatar & Name */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-md mb-4">
                    <span className="font-bold text-white text-3xl">{student.user.name[0]}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground">{student.user.name}</h1>
                <p className="text-muted-foreground text-sm mt-1">{student.user.email}</p>
                <div className="mt-3">
                    <EditStudentModal student={student} batches={batches} />
                </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-3 mb-6">
                <InfoRow icon={Hash} label="Roll Number" value={student.rollNumber} />
                <InfoRow icon={GraduationCap} label="Enrollment No" value={student.enrollmentNo} />
                <InfoRow icon={BookOpen} label="Semester" value={`Semester ${student.semester}`} />
                <InfoRow icon={Layers} label="Batch" value={batch?.name || "Not assigned"} />
                <InfoRow icon={Mail} label="Email" value={student.user.email} />
            </div>

            {/* Device Status */}
            <div className="mb-6">
                <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-wider">Device</h3>
                <DeviceStatus
                    initialDeviceHash={student.deviceHash}
                    initialDeviceId={student.deviceId}
                    initialIsRequested={student.isDeviceResetRequested}
                />
            </div>

            {/* Theme & Logout */}
            <div className="space-y-2 border-t border-border pt-4">
                <ThemeToggle />
                <LogoutButton />
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover-lift">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-sm font-semibold text-foreground truncate">{value}</p>
            </div>
        </div>
    );
}
