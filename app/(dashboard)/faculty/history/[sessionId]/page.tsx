import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import SessionReport from "@/components/faculty/SessionReport";

export default async function SessionDetailPage({
    params
}: {
    params: Promise<{ sessionId: string }>
}) {
    const session = await getServerSession(authOptions);
    const { sessionId } = await params;

    if (!session || session.user.role !== "FACULTY") {
        redirect("/auth/login");
    }

    const dbSession = await prisma.session.findUnique({
        where: { id: parseInt(sessionId) },
        include: {
            subject: {
                include: {
                    faculty: {
                        include: { user: true }
                    }
                }
            },
            attendances: {
                include: {
                    student: { include: { user: true } }
                }
            },
            proxyAttempts: {
                include: {
                    student: { include: { user: true } }
                }
            }
        }
    });

    if (!dbSession) {
        notFound();
    }

    // Security check: Ensure this session belongs to the logged-in faculty
    const isPrimary = dbSession.subject.faculty?.user.email === session.user.email;

    if (!isPrimary) {
        redirect("/unauthorized");
    }

    return (
        <SessionReport
            sessionId={dbSession.id}
            subjectName={dbSession.subject.name}
            startTime={dbSession.startTime}
            endTime={dbSession.endTime}
            attendees={dbSession.attendances}
            proxies={dbSession.proxyAttempts}
        />
    );
}
