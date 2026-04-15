import { getPublicEvents } from "@/actions/event";
import PublicEventCard from "@/components/events/PublicEventCard";
import { Calendar, Search, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Discover Events | ScanX',
    description: 'Browse upcoming campus events to register and attend.',
}

export const dynamic = "force-dynamic";

export default async function StudentDiscoverEventsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
        redirect("/auth/login");
    }

    const { events, error } = await getPublicEvents();

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="max-w-2xl">
                    <Link 
                        href="/student/events" 
                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary mb-6 transition-all group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs font-extrabold uppercase tracking-widest">Back to My Events</span>
                    </Link>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                        <Star className="w-3.5 h-3.5" />
                        <span>Discover Experiences</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                        Browse Upcoming <span className="text-primary">Events</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Find exciting campus events to attend. Register here to gain entry and mark your attendance seamlessly.
                    </p>
                </div>
            </div>

            {/* Event Grid */}
            {error ? (
                <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-center font-medium border border-red-100 dark:border-red-900/30">
                    {error}
                </div>
            ) : !events || events.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 border border-border rounded-3xl">
                    <div className="mx-auto w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No Upcoming Events</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Check back soon! Our organizers are planning new events.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event: any) => (
                        <PublicEventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
