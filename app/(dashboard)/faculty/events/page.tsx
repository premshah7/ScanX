import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, MapPin, Eye, PlusCircle } from "lucide-react";

export default async function FacultyEventsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "FACULTY") {
        redirect("/auth/login");
    }

    const userId = parseInt(session.user.id);

    // Fetch events where the faculty is creator OR organizer
    const events = await prisma.event.findMany({
        where: {
            OR: [
                { createdById: userId },
                { organizers: { some: { userId } } }
            ]
        },
        orderBy: { eventDate: "asc" },
        include: {
            _count: {
                select: {
                    registrations: true
                }
            }
        }
    });

    const activeEvents = events.filter(e => e.isActive);
    const pastEvents = events.filter(e => !e.isActive);

    return (
        <div className="max-w-7xl mx-auto space-y-8 text-foreground animate-slide-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl shadow-sm border border-border gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-1">My Events</h1>
                    <p className="text-muted-foreground text-sm">Manage events, registrations, and launch sessions.</p>
                </div>
                <Link 
                    href="/faculty/events/new"
                    className="bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 text-sm shadow-md"
                >
                    <PlusCircle className="w-5 h-5" />
                    Create New Event
                </Link>
            </div>

            {/* Active Events */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold border-b border-border pb-2">Upcoming & Active Events</h2>
                {activeEvents.length === 0 ? (
                    <div className="text-center p-12 bg-muted/30 border border-border rounded-xl">
                        <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">You are not organizing any active events right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold border-b border-border pb-2 text-muted-foreground">Past Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                        {pastEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function EventCard({ event }: { event: any }) {
    return (
        <div className="bg-card border border-border hover:border-primary/50 shadow-md hover:shadow-lg rounded-2xl p-6 transition-all group flex flex-col">
            <div className="mb-4 flex-1">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                    {event.name}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-muted/50 w-fit px-2.5 py-1 rounded-md">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-foreground">{event._count.registrations}</span> Registrations
                </div>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</span>
                    <span className="font-medium">{new Date(event.eventDate).toLocaleDateString()}</span>
                </div>
                {event.venue && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Venue</span>
                        <span className="font-medium truncate max-w-[150px]" title={event.venue}>{event.venue}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-auto">
                <Link
                    href={`/faculty/events/${event.id}`}
                    className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                >
                    <Eye className="w-4 h-4" />
                    Manage Event
                </Link>
            </div>
        </div>
    );
}
