"use client";

import { useState, useEffect } from "react";
import { updateSubject } from "@/actions/subject";
import { Loader2, Save, X } from "lucide-react";

type Faculty = {
    id: number;
    user: {
        name: string;
    };
};

type Subject = {
    id: number;
    name: string;
    faculty: {
        id: number;
        user: { name: string };
    } | null;
    batches?: { id: number; name: string }[];
};

type EditSubjectModalProps = {
    subject: Subject;
    isOpen: boolean;
    onClose: () => void;
    facultyList: Faculty[];
};


// Helper action to get batches
import { getFacultyBatches } from "@/actions/admin";

export default function EditSubjectModal({ subject, isOpen, onClose, facultyList }: EditSubjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Batch selection state
    const [selectedFaculty, setSelectedFaculty] = useState<number>(subject.faculty?.id || 0);
    const [availableBatches, setAvailableBatches] = useState<{ id: number, name: string }[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<number[]>(subject.batches?.map(b => b.id) || []);

    // Initial load of batches for the current faculty
    useEffect(() => {
        if (isOpen && subject.faculty?.id) {
            fetchBatches(subject.faculty.id);
            setSelectedFaculty(subject.faculty.id);
            setSelectedBatches(subject.batches?.map(b => b.id) || []);
        }
    }, [isOpen, subject]);

    const fetchBatches = async (facultyId: number) => {
        const res = await getFacultyBatches(facultyId);
        if (res.batches) setAvailableBatches(res.batches);
        else setAvailableBatches([]);
    };

    const handleFacultyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const facultyId = parseInt(e.target.value);
        setSelectedFaculty(facultyId);

        // If faculty changes, existing batch selections are invalid if they belong to diff faculty.
        // But here we are just fetching new batches.
        // Ideally we should clear selected batches if faculty changes, UNLESS the new faculty has same batches (unlikely unique ids).
        if (facultyId !== subject.faculty?.id) {
            setSelectedBatches([]);
        }

        if (facultyId) {
            await fetchBatches(facultyId);
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
        setLoading(true);
        setError("");

        const facultyIdStr = formData.get("facultyId");
        if (!facultyIdStr) {
            setError("Please select a faculty");
            setLoading(false);
            return;
        }

        const name = formData.get("name") as string;
        const facultyId = parseInt(facultyIdStr as string);

        const result = await updateSubject(subject.id, name, facultyId, selectedBatches);

        if (result?.error) {
            setError(result.error);
        } else {
            onClose();
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border p-6 rounded-xl w-full max-w-md relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 text-foreground">Edit Subject</h2>

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
                            defaultValue={subject.name}
                            placeholder="e.g. Mathematics 101"
                            className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Assign Faculty</label>
                        <select
                            name="facultyId"
                            required
                            defaultValue={subject.faculty?.id || ""}
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
                            onClick={onClose}
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
