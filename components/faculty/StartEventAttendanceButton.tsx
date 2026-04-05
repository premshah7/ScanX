"use client";

import { useState } from "react";
import { createSession } from "@/actions/session";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Loader2 } from "lucide-react";

interface StartEventAttendanceButtonProps {
    eventId: number;
}

export default function StartEventAttendanceButton({ eventId }: StartEventAttendanceButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleStart() {
        setLoading(true);
        try {
            const res = await createSession(undefined, eventId);
            if (res.error) {
                toast.error(res.error);
            } else if (res.success) {
                toast.success("Attendance session started!");
                router.push(`/faculty/session/${res.sessionId}`);
            }
        } catch (error) {
            toast.error("Failed to start session");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleStart}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm active:scale-95 disabled:opacity-70"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Start Attendance
        </button>
    );
}
