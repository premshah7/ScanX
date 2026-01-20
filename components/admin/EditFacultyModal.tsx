"use client";

import { useState } from "react";
import { updateFaculty } from "@/actions/admin";
import { Loader2, Pencil, X, Save, Eye, EyeOff } from "lucide-react";

type Props = {
    faculty: {
        id: number;
        user: {
            name: string;
            email: string;
        };
        batches: { id: number; name: string }[];
    };
    batches?: { id: number, name: string }[];
    iconOnly?: boolean;
};

export default function EditFacultyModal({ faculty, batches, iconOnly = false }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: faculty.user.name,
        email: faculty.user.email,
        password: ""
    });

    const [selectedBatches, setSelectedBatches] = useState<number[]>(
        faculty.batches?.map(b => b.id) || []
    );

    const toggleBatch = (id: number) => {
        if (selectedBatches.includes(id)) {
            setSelectedBatches(selectedBatches.filter(b => b !== id));
        } else {
            setSelectedBatches([...selectedBatches, id]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        if (formData.password) data.append("password", formData.password);
        data.append("batchIds", JSON.stringify(selectedBatches));

        const res = await updateFaculty(faculty.id, data);

        if (res.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
        }
        setLoading(false);
    };

    return (
        <>
            {iconOnly ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <Pencil className="w-4 h-4" />
                    Edit Faculty
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Edit Faculty Profile</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">New Password (Optional)</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current"
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
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
