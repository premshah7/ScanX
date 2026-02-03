"use client";

import { createSession } from "@/actions/session";
import { Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartSessionButton({ subjectId, batches }: { subjectId: number, batches: { id: number, name: string }[] }) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
    const [isGlobalSession, setIsGlobalSession] = useState(false); // Default false - Explicit selection required
    const router = useRouter();

    const toggleBatch = (id: number) => {
        setIsGlobalSession(false);

        if (selectedBatchIds.includes(id)) {
            setSelectedBatchIds(selectedBatchIds.filter(b => b !== id));
        } else {
            setSelectedBatchIds([...selectedBatchIds, id]);
        }
    };

    const toggleGlobal = () => {
        const newValue = !isGlobalSession;
        setIsGlobalSession(newValue);
        if (newValue) {
            setSelectedBatchIds([]); // Clear specific batches if "All" is selected
        }
    };

    const handleStart = async () => {
        if (!isGlobalSession && selectedBatchIds.length === 0) return;

        setLoading(true);
        // If isGlobalSession is true, selectedBatchIds is empty [], which backend treats as "All Students".
        // If isGlobalSession is false, selectedBatchIds contains specific IDs.
        const result = await createSession(subjectId, selectedBatchIds);
        if (result.success) {
            router.push(`/faculty/session/${result.sessionId}`);
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    const isValid = isGlobalSession || selectedBatchIds.length > 0;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <Play className="w-4 h-4 fill-current" />
                Start Session
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-foreground mb-4">Start Attendance Session</h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-500 mb-2">Target Students</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                

                                {/* <div className="border-t border-border my-2"></div> */}

                                {batches.map(b => (
                                    <label key={b.id} className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg cursor-pointer hover:border-sidebar-accent transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedBatchIds.includes(b.id)}
                                            onChange={() => toggleBatch(b.id)}
                                            className="w-4 h-4 rounded border-border bg-card text-primary focus:ring-ring focus:ring-offset-0"
                                        />
                                        <span className="text-foreground">{b.name}</span>
                                    </label>
                                ))}
                                <label className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg cursor-pointer hover:border-sidebar-accent transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isGlobalSession}
                                        onChange={toggleGlobal}
                                        className="w-4 h-4 rounded border-border bg-card text-primary focus:ring-ring focus:ring-offset-0"
                                    />
                                    <span className="text-foreground font-semibold">All Students</span>
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 bg-muted p-3 rounded-lg border border-border">
                                {isGlobalSession
                                    ? "All students enrolled in this subject can mark attendance (Global Session)."
                                    : selectedBatchIds.length > 0
                                        ? `Only students in the selected ${selectedBatchIds.length} batch(es) will be considered for attendance.`
                                        : "Please select target students to start the session."}
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-5 py-2.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStart}
                                disabled={loading || !isValid}
                                className={`px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 min-w-[100px] transition-all
                                    ${loading || !isValid
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95"
                                    }`}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Session"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
