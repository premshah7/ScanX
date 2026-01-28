"use client";

import { useState } from "react";
import { createStudent } from "@/actions/admin";
import { Loader2, Plus, Eye, EyeOff } from "lucide-react";

export default function AddStudentForm({ batches }: { batches: { id: number; name: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");

        const result = await createStudent(formData);

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
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Student
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-foreground">Add New Student</h2>
                <form action={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                        <input name="name" type="text" required placeholder="Name" className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                        <input name="email" type="email" required placeholder="Email" className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required placeholder="Password"
                                minLength={6}
                                className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Roll Number</label>
                            <input name="rollNumber" type="text" required placeholder="Roll Number" className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Enrollment No</label>
                            <input name="enrollmentNo" type="text" required placeholder="Enrollment No" className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Semester</label>
                            <select
                                name="semester"
                                className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring appearance-none"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <option key={sem} value={sem}>
                                        Semester {sem}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Batch (Optional)</label>
                            <select
                                name="batchId"
                                className="w-full bg-input border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-ring appearance-none"
                            >
                                <option value="">No Batch</option>
                                {batches?.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

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
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
