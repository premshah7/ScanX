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
    };
};

type EditSubjectModalProps = {
    subject: Subject;
    isOpen: boolean;
    onClose: () => void;
    facultyList: Faculty[];
};

export default function EditSubjectModal({ subject, isOpen, onClose, facultyList }: EditSubjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Initialize state with subject data when modal opens
    // Note: In Next.js server components pattern, pass data down. 
    // Since we receive `subject` prop, specific state might act as form value.

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

        const result = await updateSubject(subject.id, name, facultyId);

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
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Edit Subject</h2>

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
                            defaultValue={subject.name}
                            placeholder="e.g. Mathematics 101"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Assign Faculty</label>
                        <select
                            name="facultyId"
                            required
                            defaultValue={subject.faculty.id}
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
                            onClick={onClose}
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
