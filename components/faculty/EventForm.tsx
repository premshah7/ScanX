"use client";

import { useState } from "react";
import { createEvent, updateEvent } from "@/actions/event";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Save } from "lucide-react";
import RegistrationFieldBuilder, { RegistrationField } from "@/components/events/RegistrationFieldBuilder";

interface EventFormProps {
    initialData?: {
        id: number;
        name: string;
        description?: string | null;
        eventDate: Date;
        venue?: string | null;
        maxCapacity?: number | null;
        requiresApproval: boolean;
        registrationFields: any;
    };
    isEdit?: boolean;
}

export default function EventForm({ initialData, isEdit = false }: EventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDate = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    const [fields, setFields] = useState<RegistrationField[]>(
        initialData?.registrationFields || [
            { id: "dept", name: "department", label: "Department / Organization", type: "text", required: true },
            { id: "disc", name: "discord", label: "Discord Username", type: "text", required: false }
        ]
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const form = new FormData(e.currentTarget);

        const data = {
            name: form.get("name") as string,
            description: form.get("description") as string,
            eventDate: form.get("eventDate") as string,
            venue: form.get("venue") as string,
            maxCapacity: form.get("maxCapacity") ? parseInt(form.get("maxCapacity") as string) : null,
            requiresApproval: form.get("requiresApproval") === "on",
            registrationFields: fields
        };

        try {
            let res;
            if (isEdit && initialData) {
                res = await updateEvent(initialData.id, data);
            } else {
                // Ensure maxCapacity is undefined rather than null for createEvent
                res = await createEvent({
                    ...data,
                    maxCapacity: data.maxCapacity || undefined
                });
            }

            if (res.error) {
                toast.error(res.error);
            } else if (res.success) {
                toast.success(isEdit ? "Event updated successfully!" : "Event created successfully!");
                if (isEdit) {
                    router.refresh(); // Refresh to show new data
                } else {
                    router.push(`/faculty/events/${(res as any).eventId}`);
                }
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
                        defaultValue={initialData?.name}
                        placeholder="e.g. Annual Tech Symposium 2026"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        defaultValue={initialData?.description || ""}
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
                        defaultValue={initialData ? formatDate(initialData.eventDate) : ""}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Venue / Location</label>
                    <input
                        type="text"
                        name="venue"
                        defaultValue={initialData?.venue || ""}
                        placeholder="e.g. Main Auditorium"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Maximum Capacity</label>
                    <input
                        type="number"
                        name="maxCapacity"
                        defaultValue={initialData?.maxCapacity || ""}
                        placeholder="Leave blank for unlimited"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 pt-6">
                    <input
                        type="checkbox"
                        name="requiresApproval"
                        id="requiresApproval"
                        defaultChecked={initialData?.requiresApproval}
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
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? "Update Event" : "Publish Event"}
                    {!loading && (isEdit ? <Save className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
                </button>
            </div>
        </form>
    );
}
