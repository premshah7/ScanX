import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Users, Ticket, CheckCircle, ShieldAlert } from "lucide-react";
import EventRegistrationForm from "@/components/events/EventRegistrationForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EventLandingPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    const event = await prisma.event.findUnique({
        where: { slug, isActive: true },
        include: {
            organizers: {
                include: { user: { select: { name: true, email: true } } }
            },
            createdBy: { select: { name: true } },
            _count: {
                select: {
                    registrations: {
                        where: { status: { in: ["APPROVED", "PENDING"] } }
                    }
                }
            }
        }
    });

    if (!event) {
        notFound();
    }

    const { _count, maxCapacity, registrationFields } = event;
    const registeredCount = _count.registrations;
    const isFull = maxCapacity !== null && registeredCount >= maxCapacity;

    let existingRegistration: any = null;
    let currentUser = null;

    if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (dbUser) {
            currentUser = {
                name: dbUser.name || "",
                username: dbUser.username || "",
            };

            existingRegistration = await prisma.eventRegistration.findFirst({
                where: { eventId: event.id, userId: dbUser.id }
            });
        }
    }

    // Determine registration status string
    let regStatusMsg = null;
    if (existingRegistration) {
        if (existingRegistration.status === "APPROVED") regStatusMsg = "You are approved to attend this event!";
        else if (existingRegistration.status === "PENDING") regStatusMsg = "Your registration is pending approval.";
        else if (existingRegistration.status === "REJECTED") regStatusMsg = "Your registration was declined. Please contact the organizers.";
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-900 via-primary to-indigo-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://patterns.vercel.app/circuit-board.svg')] mix-blend-overlay"></div>
                <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-indigo-100 font-semibold text-sm mb-6 border border-white/20 shadow-sm animate-fade-in">
                        {event.requiresApproval ? "Approval Required" : "Open Registration"}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight animate-slide-up leading-tight">
                        {event.name}
                    </h1>
                    {event.description && (
                        <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            {event.description}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {event.eventDate && (
                            <div className="flex items-center gap-2 font-medium bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                                <Calendar className="w-5 h-5 text-indigo-300" />
                                {new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        )}
                        {event.venue && (
                            <div className="flex items-center gap-2 font-medium bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                                <MapPin className="w-5 h-5 text-indigo-300" />
                                {event.venue}
                            </div>
                        )}
                        {maxCapacity && (
                            <div className="flex items-center gap-2 font-medium bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                                <Users className="w-5 h-5 text-indigo-300" />
                                {registeredCount} / {maxCapacity} Spots Taken
                            </div>
                        )}
                    </div>
                </div>
                {/* Decorative wave divider */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent"></div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Info */}
                    <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="bg-card border border-border shadow-xl rounded-2xl p-8 backdrop-blur-xl">
                            <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                                <Ticket className="w-6 h-6 text-primary" />
                                About the Event
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
                                {event.description ? (
                                    <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
                                ) : (
                                    <p className="italic">No description provided for this event.</p>
                                )}
                            </div>

                            <hr className="my-8 border-border" />

                            <h3 className="text-xl font-semibold mb-4 text-foreground">Organized By</h3>
                            <div className="flex flex-wrap gap-3">
                                {event.organizers.length > 0 ? (
                                    event.organizers.map(org => (
                                        <div key={org.id} className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-xl border border-border/50">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                                {org.user.name[0]?.toUpperCase() || "O"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{org.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{org.user.email}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-xl border border-border/50">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                            {event.createdBy?.name[0]?.toUpperCase() || "A"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{event.createdBy?.name || "Admin"}</p>
                                            <p className="text-xs text-muted-foreground">Admin/Creator</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Registration Side Panel */}
                    <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <div className="bg-card border-2 border-border shadow-2xl rounded-2xl p-6 sticky top-8">
                            {existingRegistration ? (
                                <div className="text-center py-6">
                                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Registration Found</h3>
                                    <p className={`font-medium ${existingRegistration.status === 'APPROVED' ? 'text-green-600 dark:text-green-400' :
                                        existingRegistration.status === 'REJECTED' ? 'text-red-600 dark:text-red-400' :
                                            'text-yellow-600 dark:text-yellow-500'
                                        }`}>
                                        {regStatusMsg}
                                    </p>
                                </div>
                            ) : isFull ? (
                                <div className="text-center py-6">
                                    <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                        <ShieldAlert className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Event is Full</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Maximum capacity ({maxCapacity}) has been reached. Walk-ins may not be allowed.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-foreground mb-1">Reserve Your Spot</h3>
                                        {event.requiresApproval && (
                                            <p className="text-xs text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg inline-block border border-amber-200 dark:border-amber-900">
                                                Awaits organizer approval
                                            </p>
                                        )}
                                    </div>

                                    <EventRegistrationForm 
                                        eventSlug={event.slug} 
                                        dynamicFields={(registrationFields as any[]) || []}
                                        currentUser={currentUser}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
