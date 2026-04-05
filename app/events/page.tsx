import { getPublicEvents } from "@/actions/event";
import PublicEventCard from "@/components/events/PublicEventCard";
import Navbar from "@/components/landing/Navbar";
import { Calendar, Search, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Events | ScanX',
    description: 'Discover and register for upcoming events hosted on ScanX.',
}

export const dynamic = "force-dynamic";

export default async function EventsDirectoryPage() {
    const session = await getServerSession(authOptions);

    // Redirect logged-in students to their dashboard version of this page 
    // to avoid the public landing navbar
    if (session?.user.role === "STUDENT") {
        redirect("/student/events/discover");
    }

    const { events, error } = await getPublicEvents();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Discover Experiences</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                        Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Events</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Browse our directory of academic, cultural, and professional events. Register to secure your spot and seamlessly track your attendance using the ScanX mobile app.
                    </p>
                </div>

                {/* Event Grid */}
                {error ? (
                    <div className="p-6 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-center font-medium border border-red-200 dark:border-red-900">
                        {error}
                    </div>
                ) : !events || events.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 border-2 border-dashed border-border rounded-3xl">
                        <div className="mx-auto w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No Upcoming Events</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Check back soon! Our organizers are always planning something new and exciting.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {events.map((event: any) => (
                            <PublicEventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
                <p>&copy; {new Date().getFullYear()} ScanX. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
