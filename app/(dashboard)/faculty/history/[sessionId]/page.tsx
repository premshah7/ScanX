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
            event: {
                include: {
                    createdBy: true,
                    organizers: {
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
                    student: { include: { user: true } },
                    deviceOwner: { include: { user: true } }
                }
            }
        }
    });

    if (!dbSession) {
        notFound();
    }

    // Security check: Ensure this session belongs to the logged-in faculty
    const isPrimary = dbSession.subject?.faculty?.user.email === session.user.email;
    const isCreator = dbSession.event?.createdBy?.email === session.user.email;
    const isOrganizer = dbSession.event?.organizers?.some(o => o.user.email === session.user.email);

    if (!isPrimary && !isCreator && !isOrganizer) {
        redirect("/unauthorized");
    }

    return (
        <SessionReport
            sessionId={dbSession.id}
            subjectName={dbSession.subject?.name || dbSession.event?.name || "Event Session"}
            startTime={dbSession.startTime}
            endTime={dbSession.endTime}
            attendees={dbSession.attendances}
            proxies={await Promise.all(dbSession.proxyAttempts.map(async (proxy) => {
                if (proxy.deviceOwner) return proxy;
                try {
                    const c = await prisma.attendance.findFirst({
                        where: { sessionId: dbSession.id, studentId: { not: proxy.studentId } },
                        orderBy: { timestamp: 'desc' },
                        include: { student: { include: { user: true } } }
                    });
                    if (c) {
                        prisma.proxyAttempt.update({ where: { id: proxy.id }, data: { deviceOwnerId: c.studentId } }).catch(() => {});
                        return { ...proxy, deviceOwner: c.student, deviceOwnerId: c.studentId };
                    }
                } catch {}
                return proxy;
            }))}
        />
    );
}
