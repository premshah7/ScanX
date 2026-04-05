import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EventRegistrationManager from "@/components/faculty/EventRegistrationManager";
import { ArrowLeft, Ticket, Edit } from "lucide-react";
import Link from "next/link";
import ShareLinkButton from "@/components/faculty/ShareLinkButton";
import StartEventAttendanceButton from "@/components/faculty/StartEventAttendanceButton";
import DownloadAttendanceButton from "@/components/faculty/DownloadAttendanceButton";

export default async function FacultyEventDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "FACULTY") {
        redirect("/auth/login");
    }

    const userId = parseInt(session.user.id);
    const eventId = parseInt(id);

    if (isNaN(eventId)) notFound();

    // Check authorization: Must be creator OR organizer
    const event = await prisma.event.findFirst({
        where: {
            id: eventId,
            OR: [
                { createdById: userId },
                { organizers: { some: { userId } } }
            ]
        },
        include: {
            _count: {
                select: {
                    registrations: true
                }
            }
        }
    });

    if (!event) {
        redirect("/unauthorized"); // Or notFound, but they might just not have auth
    }

    // Fetch initial registrations to pass to client component
    const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        orderBy: { registeredAt: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true, username: true, phoneNumber: true } },
            reviewedBy: { select: { name: true } }
        }
    });

    // Parse registration fields structure for the table
    const registrationFields = (event.registrationFields as any[]) || [];

    // Fetch all sessions (past or active) for this event
    const sessions = await prisma.session.findMany({
        where: { eventId },
        orderBy: { startTime: "desc" },
        include: {
            _count: {
                select: {
                    attendances: true
                }
            }
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-foreground animate-slide-up">
            <Link href="/faculty/events" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Events
            </Link>

            <div className="bg-card p-6 border border-border shadow-sm rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-1">{event.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
                            <Ticket className="w-4 h-4" /> {event._count.registrations} Registrations
                        </span>
                        {event.maxCapacity && (
                            <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
                                Capacity: {event.maxCapacity}
                            </span>
                        )}
                        {!event.isActive && (
                            <span className="text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-md">Event Closed</span>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <StartEventAttendanceButton eventId={event.id} />
                    <Link 
                        href={`/faculty/events/${event.id}/edit`}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-zinc-700 shadow-sm active:scale-95"
                    >
                        <Edit className="w-4 h-4" /> Edit Event
                    </Link>
                    <ShareLinkButton path={`/events/${event.slug}`} />
                </div>
            </div>

            {/* Attendance Logs Section */}
            {sessions.length > 0 && (
                <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Attendance Logs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.map((s, idx) => (
                            <div key={s.id} className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold">Session #{sessions.length - idx}</p>
                                    <p className="text-[10px] text-muted-foreground">{new Date(s.startTime).toLocaleString()}</p>
                                    <p className="text-xs mt-1 font-medium text-primary">{s._count.attendances} Attendees</p>
                                </div>
                                <DownloadAttendanceButton sessionId={s.id} eventName={event.name} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden p-6">
                <div className="mb-6 border-b border-border pb-4 flex justify-between items-end">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">Registration Manager</h2>
                        <p className="text-muted-foreground text-sm mt-1">Review guests and approve or reject their access to scanning attendance.</p>
                    </div>
                </div>

                <EventRegistrationManager
                    eventId={event.id}
                    requiresApproval={event.requiresApproval}
                    initialRegistrations={registrations}
                    customFields={registrationFields}
                />
            </div>
        </div>
    );
}
