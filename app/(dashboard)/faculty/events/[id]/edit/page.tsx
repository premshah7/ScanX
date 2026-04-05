import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import EventForm from "@/components/faculty/EventForm";

export default async function EditEventPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "FACULTY" && session.user.role !== "ADMIN")) {
        redirect("/auth/login");
    }

    const eventId = parseInt(id);
    if (isNaN(eventId)) notFound();

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            organizers: true
        }
    });

    if (!event || !event.isActive) notFound();

    // Check organizer permission
    const isOrganizer = event.organizers.some(o => o.userId === parseInt(session.user.id));
    if (!isOrganizer && session.user.role !== "ADMIN") {
        redirect("/faculty/events");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 text-foreground animate-slide-up">
            <Link href={`/faculty/events/${id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Event Details
            </Link>

            <div className="bg-card p-6 md:p-8 border border-border shadow-sm rounded-2xl">
                <div className="mb-8 border-b border-border pb-4">
                    <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
                        <Edit3 className="w-8 h-8 text-primary" />
                        Edit Event
                    </h1>
                    <p className="text-muted-foreground mt-2">Update event details and registration requirements.</p>
                </div>

                <EventForm initialData={event} isEdit={true} />
            </div>
        </div>
    );
}
