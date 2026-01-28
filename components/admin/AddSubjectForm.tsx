"use client";

import { useState, useRef } from "react";
import { createSubject } from "@/actions/subject";
import { Loader2, Plus } from "lucide-react";

type Faculty = {
    id: number;
    user: {
        name: string;
    };
};

export default function AddSubjectForm({ facultyList }: { facultyList: Faculty[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isSubmitting = useRef(false);

    // Batch selection state
    const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
    const [availableBatches, setAvailableBatches] = useState<{ id: number, name: string }[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<number[]>([]);

    const handleFacultyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const facultyId = parseInt(e.target.value);
        setSelectedFaculty(facultyId || null);
        setSelectedBatches([]); // Reset batches

        if (facultyId) {
            // Fetch batches for this faculty (We might need a server action for this or pass all data)
            // For now, let's assume valid batches are passed or we fetch them.
            // Actually, we don't have batches in facultyList prop effectively.
            // We need to fetch them.
            // WORKAROUND: For now, we will just show ALL batches from a prop if available, 
            // OR we'll trigger a server action to get faculty's batches.
            // Let's implement a quick action to get faculty batches.
            const res = await getFacultyBatches(facultyId);
            if (res.batches) setAvailableBatches(res.batches);
        } else {
            setAvailableBatches([]);
        }
    };

    const toggleBatch = (id: number) => {
        if (selectedBatches.includes(id)) {
            setSelectedBatches(selectedBatches.filter(b => b !== id));
        } else {
            setSelectedBatches([...selectedBatches, id]);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        setLoading(true);
        setError("");

        try {
            const facultyIdStr = formData.get("facultyId");
            if (!facultyIdStr) {
                setError("Please select a faculty");
                setLoading(false);
                isSubmitting.current = false;
                return;
            }

            const name = formData.get("name") as string;
            const facultyId = parseInt(facultyIdStr as string);

            // Pass selected batch IDs
            const result = await createSubject(name, facultyId, selectedBatches);

            if (result?.error) {
                setError(result.error);
            } else {
                setIsOpen(false);
                setSelectedBatches([]);
                setSelectedFaculty(null);
            }
        } finally {
            setLoading(false);
            isSubmitting.current = false;
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Subject
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border p-6 rounded-xl w-full max-w-md shadow-lg flex flex-col max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4 text-foreground">Add New Subject</h2>
                <form action={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Subject Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Mathematics 101"
                            className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Assign Faculty</label>
                        <select
                            name="facultyId"
                            required
                            onChange={handleFacultyChange}
                            className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring appearance-none"
                        >
                            <option value="">Select Faculty...</option>
                            {facultyList.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedFaculty && (
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Assign Batches (Optional)</label>
                            {availableBatches.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No batches assigned to this faculty.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableBatches.map(batch => (
                                        <button
                                            key={batch.id}
                                            type="button"
                                            onClick={() => toggleBatch(batch.id)}
                                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedBatches.includes(batch.id)
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : "bg-muted border-border text-muted-foreground hover:border-primary"
                                                }`}
                                        >
                                            {batch.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                                Check batches to automatically enroll their students.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Subject
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper action to get batches (Needs to be imported or defined)
import { getFacultyBatches } from "@/actions/admin";
