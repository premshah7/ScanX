import Scanner from "@/components/student/Scanner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStudentStatus } from "@/actions/student";

export default async function ScanPage() {
    // Fetch status server-side to prevent unauthorized scanning
    const [studentStatus, session] = await Promise.all([
        getStudentStatus(),
        getServerSession(authOptions)
    ]);

    if (session && session.user.role === "STUDENT") {
        const cookieStore = await cookies();
        const student = await prisma.student.findUnique({
            where: { userId: Number(session.user.id) },
            select: { id: true, deviceId: true }
        });
        if (student) {
            const currentDeviceId = cookieStore.get("device_id")?.value;
            if (currentDeviceId && !student.deviceId) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: { deviceId: currentDeviceId }
                }).catch(() => {});
            }
            cookieStore.set("device_owner_student_id", student.id.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 365 * 10,
            });
        }
    }

    const isResetRequested = studentStatus?.isDeviceResetRequested || false;

    return (
        <div className="min-h-screen bg-gray-950 p-6 flex flex-col">
            <div className="mb-6">
                <Link href="/student" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Scan QR Code</h1>
                    <p className="text-gray-400">Point your camera at the session QR code</p>
                </div>

                <Scanner isDeviceResetRequested={isResetRequested} />
            </div>
        </div>
    );
}
