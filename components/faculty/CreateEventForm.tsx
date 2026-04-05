"use client";

import { useState } from "react";
import { createEvent } from "@/actions/event";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import RegistrationFieldBuilder, { RegistrationField } from "@/components/events/RegistrationFieldBuilder";

export default function CreateEventForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState<RegistrationField[]>([
        { id: "dept", name: "department", label: "Department / Organization", type: "text", required: true },
        { id: "disc", name: "discord", label: "Discord Username", type: "text", required: false }
    ]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = new FormData(e.currentTarget);
        
        const data = {
            name: form.get("name") as string,
            description: form.get("description") as string,
            eventDate: form.get("eventDate") as string,
            venue: form.get("venue") as string,
            maxCapacity: form.get("maxCapacity") ? parseInt(form.get("maxCapacity") as string) : undefined,
            requiresApproval: form.get("requiresApproval") === "on",
            registrationFields: fields
        };

        try {
            const res = await createEvent(data);
            if (res.error) {
                toast.error(res.error);
            } else if (res.success) {
                toast.success("Event created successfully!");
                router.push(`/faculty/events/${res.eventId}`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Event Name *</label>
                    <input 
                        name="name"
                        required
                        placeholder="e.g. Annual Tech Symposium 2026"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                    <textarea 
                        name="description"
                        rows={3}
                        placeholder="Provide details about the event..."
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Date & Time *</label>
                    <input 
                        type="datetime-local"
                        name="eventDate"
                        required
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Venue / Location</label>
                    <input 
                        type="text"
                        name="venue"
                        placeholder="e.g. Main Auditorium"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Maximum Capacity</label>
                    <input 
                        type="number"
                        name="maxCapacity"
                        placeholder="Leave blank for unlimited"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 pt-6">
                    <input 
                        type="checkbox"
                        name="requiresApproval"
                        id="requiresApproval"
                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="requiresApproval" className="text-sm font-medium text-foreground cursor-pointer">
                        Require Organizer Approval
                        <p className="text-xs text-muted-foreground font-normal">Guests will be marked as PENDING until approved.</p>
                    </label>
                </div>

                <div className="md:col-span-2 pt-6">
                    <RegistrationFieldBuilder initialFields={fields} onChange={setFields} />
                </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
                <button 
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-70"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Event"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </form>
    );
}
