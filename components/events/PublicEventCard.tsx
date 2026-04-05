import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

export default function PublicEventCard({ event }: { event: any }) {
    const isFull = event.maxCapacity !== null && event.approvedCount >= event.maxCapacity;

    return (
        <div className="bg-card border border-border hover:border-primary/50 shadow-md hover:shadow-lg rounded-2xl p-6 transition-all group flex flex-col h-full relative overflow-hidden">
            {/* Status Ribbon */}
            {isFull ? (
                <div className="absolute top-4 -right-8 bg-red-500 text-white font-bold text-xs py-1 px-8 rotate-45 transform">
                    FULL
                </div>
            ) : event.maxCapacity ? (
                <div className="absolute top-4 -right-10 bg-green-500 text-white font-bold text-xs py-1 px-10 rotate-45 transform">
                    SPOTS LEFT
                </div>
            ) : null}

            <div className="mb-4 flex-1">
                <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-2">
                    {event.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3 line-clamp-2">
                    {event.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 text-xs font-medium mt-auto">
                    {event.maxCapacity !== null ? (
                        <span className={`px-2 py-1 rounded-md flex items-center gap-1 ${isFull ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-primary/10 text-primary'}`}>
                            <Users className="w-3 h-3" />
                            {isFull ? "At Capacity" : `${event.spotsRemaining} spots left`}
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Unlimited Capacity
                        </span>
                    )}

                    {event.requiresApproval && (
                        <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30">
                            Approval Required
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3 mb-6 bg-muted/40 p-4 rounded-xl border border-border/50">
                <div className="flex text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground mr-2 shrink-0 mt-0.5" />
                    <span className="font-medium">{new Date(event.eventDate).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {event.venue && (
                    <div className="flex text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mr-2 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-1" title={event.venue}>{event.venue}</span>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-2">
                <Link
                    href={`/events/${event.slug}`}
                    className={`w-full text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${isFull
                            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isFull ? "Join Waitlist / View Info" : "Register Now"}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
