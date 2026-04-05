import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, MapPin, Info, ArrowRight, CheckCircle2, Clock, XCircle, TrendingUp, Search, Ticket, History as HistoryIcon } from "lucide-react";

export const metadata = {
    title: "Student Events | ScanX",
};

export default async function StudentEventsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
        redirect("/auth/login");
    }

    // Fetch user, their records and registrations
    const user = await prisma.user.findUnique({
        where: { id: parseInt(session.user.id) },
        include: {
            student: {
                include: {
                    attendances: {
                        include: {
                            session: true
                        }
                    }
                }
            },
            eventRegistrations: {
                include: {
                    event: true
                },
                orderBy: {
                    registeredAt: 'desc'
                }
            }
        }
    });

    if (!user) return redirect("/auth/login");

    const registrations = user.eventRegistrations;
    const stats = {
        total: registrations.length,
        approved: registrations.filter(r => r.status === "APPROVED").length,
        pending: registrations.filter(r => r.status === "PENDING").length,
    };

    return (
        <div className="min-h-screen text-foreground animate-slide-up">
            {/* Contextual Header */}
            <section className="mb-8">
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2 block font-headline">
                    Events Hub
                </span>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2 font-headline">
                    Your Registered Events
                </h1>
                <p className="text-muted-foreground font-body text-sm max-w-2xl">
                    Manage your event registrations and track your attendance status.
                    Registered as <span className="font-bold text-primary">{user.student?.enrollmentNo}</span>.
                </p>
            </section>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-sm flex justify-between items-center relative overflow-hidden group hover-lift transition-all">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 font-headline">Total Events Registered</p>
                        <h3 className="text-4xl font-extrabold text-foreground font-headline">{stats.total}</h3>
                        <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs bg-primary/5 px-2 py-1 rounded w-fit">
                            <TrendingUp className="w-3 h-3" />
                            Active Participation
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="w-32 h-32 text-primary" />
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover-lift transition-all">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 font-headline">Approved</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-extrabold text-emerald-500 font-headline">{stats.approved}</h3>
                        <span className="text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-tight">Passes</span>
                    </div>
                    <div className="w-full bg-emerald-500/10 h-1.5 rounded-full mt-4">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover-lift transition-all">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 font-headline">Pending</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-extrabold text-amber-500 font-headline">{stats.pending}</h3>
                        <span className="text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-tight">Reviews</span>
                    </div>
                    <div className="w-full bg-amber-500/10 h-1.5 rounded-full mt-4 flex items-center justify-center overflow-hidden">
                        <div className="h-full bg-amber-500 w-1/3 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-foreground font-headline flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4 text-primary" /> Event Timeline
                </h3>
                <Link href="/student/events/discover" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Register for New Events <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {/* Registration Grid */}
            {registrations.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-premium-outline/20 rounded-3xl p-12 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ticket className="w-10 h-10 text-primary opacity-40" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 font-headline">No event registrations found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                        Explore upcoming campus events and register to see them here.
                    </p>
                    <Link href="/events" className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2">
                        Discover Events <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {registrations.map((reg, index) => (
                        <div
                            key={reg.id}
                            className="bg-card rounded-3xl overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border"
                        >
                            <div className="h-44 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden flex items-center justify-center">
                                <div className="opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <Calendar className="w-24 h-24 text-primary" />
                                </div>
                                <div className="absolute top-4 right-4 capitalize">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] font-bold border ${reg.status === 'APPROVED' ? 'bg-emerald-500/90 text-white border-emerald-400' :
                                            reg.status === 'REJECTED' ? 'bg-red-500/90 text-white border-red-400' :
                                                'bg-amber-500/90 text-white border-amber-400'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${reg.status === 'APPROVED' ? 'animate-pulse' : ''}`}></span>
                                        {reg.status}
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-muted-foreground shadow-sm flex items-center gap-1 border border-border">
                                        <Clock className="w-3 h-3" />
                                        {new Date(reg.event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors font-headline line-clamp-1">
                                        {reg.event.name}
                                    </h4>
                                    {/* Attendance Status Check */}
                                    {user.student?.attendances.some(a => a.session.eventId === reg.eventId) && (
                                        <div className="bg-emerald-500/10 text-emerald-500 p-1 rounded-full flex items-center justify-center shrink-0 shadow-sm" title="Attendance Confirmed">
                                            <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-6 line-clamp-2 h-8">
                                    {reg.event.description || "No description provided for this event."}
                                </p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-primary" />
                                        </div>
                                        <span>
                                            {new Date(reg.event.eventDate).toLocaleDateString(undefined, {
                                                weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="line-clamp-1">{reg.event.venue || "Location TBD"}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    {reg.status === 'APPROVED' ? (
                                        user.student?.attendances.some(a => a.session.eventId === reg.eventId) ? (
                                            <div className="w-full py-3 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4" /> Attendance Verified
                                            </div>
                                        ) : (
                                            <Link
                                                href="/student/scan"
                                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                Mark Attendance
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )
                                    ) : reg.status === 'PENDING' ? (
                                        <div className="w-full py-3 bg-muted/50 text-amber-500 font-bold rounded-xl border border-amber-500/20 flex items-center justify-center gap-2 text-sm italic">
                                            <Clock className="w-4 h-4" /> Awaiting Approval
                                        </div>
                                    ) : (
                                        <div className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl border border-red-500/20 flex items-center justify-center gap-2 text-sm">
                                            <XCircle className="w-4 h-4" /> Registration Declined
                                        </div>
                                    )}

                                    <Link
                                        href={`/events/${reg.event.slug}`}
                                        className="w-full py-2.5 bg-background text-muted-foreground font-bold rounded-xl border border-border hover:bg-muted/50 transition-all flex items-center justify-center gap-2 text-xs"
                                    >
                                        <Info className="w-4 h-4 text-primary" /> Event Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Discover FAB */}
            <div className="fixed bottom-8 right-8 z-40 hidden md:block">
                <Link
                    href="/events"
                    className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-full font-bold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group"
                >
                    <Search className="w-5 h-5" />
                    <span>Discover More Events</span>
                </Link>
            </div>
        </div>
    );
}
