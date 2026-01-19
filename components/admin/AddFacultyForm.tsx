"use client";

import { useState } from "react";
import { createFaculty } from "@/actions/admin";
import { Loader2, Plus, Eye, EyeOff } from "lucide-react";

export default function AddFacultyForm({ batches }: { batches: { id: number, name: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedBatches, setSelectedBatches] = useState<number[]>([]);

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

        // Add batchIds to formData
        formData.append('batchIds', JSON.stringify(selectedBatches));

        const result = await createFaculty(formData);

        if (result?.error) {
            setError(result.error);
        } else {
            setIsOpen(false);
            setSelectedBatches([]); // Reset selections
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
                Add Faculty
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>
                <form action={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            name="name"
                            type="text"
                            required placeholder="Name"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required placeholder="Email"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required placeholder="Password"
                                minLength={6}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Assign Batches</label>
                        <div className="flex flex-wrap gap-2">
                            {batches?.map(batch => (
                                <button
                                    key={batch.id}
                                    type="button"
                                    onClick={() => toggleBatch(batch.id)}
                                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedBatches.includes(batch.id)
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                                        }`}
                                >
                                    {batch.name}
                                </button>
                            ))}
                        </div>
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
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}