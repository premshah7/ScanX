"use client";

import { useState } from "react";
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

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");

        // Parse facultyId as number because select value is string
        const facultyIdStr = formData.get("facultyId");
        if (!facultyIdStr) {
            setError("Please select a faculty");
            setLoading(false);
            return;
        }

        const name = formData.get("name") as string;
        const facultyId = parseInt(facultyIdStr as string);

        const result = await createSubject(name, facultyId);

        if (result?.error) {
            setError(result.error);
        } else {
            setIsOpen(false);
        }
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Subject
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
                <form action={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Subject Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Mathematics 101"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Assign Faculty</label>
                        <select
                            name="facultyId"
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none"
                        >
                            <option value="">Select Faculty...</option>
                            {facultyList.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2"
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
