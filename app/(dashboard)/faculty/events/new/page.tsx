import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import EventForm from "@/components/faculty/EventForm";

export default async function NewEventPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "FACULTY" && session.user.role !== "ADMIN")) {
        redirect("/auth/login");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 text-foreground animate-slide-up">
            <Link href="/faculty/events" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Events
            </Link>

            <div className="bg-card p-6 md:p-8 border border-border shadow-sm rounded-2xl">
                <div className="mb-8 border-b border-border pb-4">
                    <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
                        <PlusCircle className="w-8 h-8 text-primary" />
                        Create New Event
                    </h1>
                    <p className="text-muted-foreground mt-2">Initialize a new event to accept registrations and manage attendees.</p>
                </div>

                <EventForm />
            </div>
        </div>
    );
}
