import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EventRegistrationManager from "@/components/faculty/EventRegistrationManager";
import OrganizerManager from "@/components/faculty/OrganizerManager";
import ShareLinkButton from "@/components/faculty/ShareLinkButton";
import { ArrowLeft, Ticket, Calendar, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";

export default async function AdminEventDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/login");
    }

    const eventId = parseInt(id);
    if (isNaN(eventId)) notFound();

    // Admin has access to any event, no authorization check needed.
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            createdBy: { select: { id: true, name: true, email: true } },
            organizers: {
                include: { user: { select: { id: true, name: true, email: true } } }
            },
            _count: {
                select: {
                    registrations: true
                }
            }
        }
    });

    if (!event) {
        notFound();
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

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-foreground animate-slide-up">
            <Link href="/admin/events" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Global Events
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
                    <ShareLinkButton path={`/events/${event.slug}`} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event Details & Admins Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
                            <Calendar className="w-5 h-5 text-primary" /> Event Overview
                        </h2>
                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-muted-foreground font-medium mb-1">Date</dt>
                                <dd className="font-semibold">{new Date(event.eventDate).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd>
                            </div>
                            {event.venue && (
                                <div>
                                    <dt className="text-muted-foreground font-medium mb-1">Venue</dt>
                                    <dd className="font-semibold flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-muted-foreground" /> {event.venue}
                                    </dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-muted-foreground font-medium mb-1">Approval Mode</dt>
                                <dd className="font-semibold">
                                    {event.requiresApproval ? (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">Manual Approval</span>
                                    ) : (
                                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">Auto-Approve</span>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground font-medium mb-1">Visibility</dt>
                                <dd className="font-semibold">
                                    {event.isPublic ? "Public Directory" : "Unlisted / Hidden"}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
                         <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
                            <ShieldCheck className="w-5 h-5 text-primary" /> Organizers
                        </h2>
                        <OrganizerManager 
                            eventId={event.id}
                            initialOrganizers={event.organizers}
                            canManage={true}
                        />
                    </div>
                </div>

                {/* Registration Manager Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden p-6 h-full">
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
            </div>
        </div>
    );
}
