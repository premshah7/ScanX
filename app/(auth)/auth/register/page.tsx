"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerStudent, registerGuest } from "@/actions/auth";
import { getBatches } from "@/actions/batch";
import { Loader2, UserPlus, GraduationCap, User, Mail, Lock, Hash, Layers, Phone, ALargeSmall } from "lucide-react";

type RegistrationMode = "student" | "guest";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState<RegistrationMode>("student");
    const [batches, setBatches] = useState<{ id: number; name: string }[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        enrollmentNo: "",
        batchId: "",
        // Guest Fields
        username: "",
        phone: ""
    });

    useEffect(() => {
        const fetchBatches = async () => {
            if (mode === "student") {
                const result = await getBatches();
                if (result.batches) {
                    setBatches(result.batches);
                }
            }
        };
        fetchBatches();
    }, [mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === "student") {
                const result = await registerStudent({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    rollNumber: formData.rollNumber,
                    enrollmentNo: formData.enrollmentNo,
                    batchId: formData.batchId ? parseInt(formData.batchId) : undefined
                });
                if (result.error) setError(result.error);
                else router.push("/auth/login?registered=true");
            } else {
                // Guest Registration
                const result = await registerGuest({
                    name: formData.name,
                    username: formData.username,
                    phone: formData.phone || undefined
                });
                if (result.error) setError(result.error);
                else router.push("/auth/login?guest_registered=true");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-xl">
                <div className="text-center mb-6">
                    <div className="mx-auto w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4">
                        <UserPlus className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Create Account</h1>
                    <p className="text-muted-foreground text-sm">Join ScanX</p>
                </div>

                {/* Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => { setMode("student"); setError(""); }}
                        className={`py-2 text-sm font-medium rounded-lg transition-all ${mode === "student"
                            ? "bg-card text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode("guest"); setError(""); }}
                        className={`py-2 text-sm font-medium rounded-lg transition-all ${mode === "guest"
                            ? "bg-card text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Event Guest
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Common: Name */}
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {mode === "student" ? (
                            <>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email Address"
                                        required
                                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        required
                                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                        <input
                                            name="rollNumber"
                                            value={formData.rollNumber}
                                            onChange={handleChange}
                                            placeholder="Roll No"
                                            required
                                            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                        <input
                                            name="enrollmentNo"
                                            value={formData.enrollmentNo}
                                            onChange={handleChange}
                                            placeholder="Enrollment"
                                            required
                                            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    <select
                                        name="batchId"
                                        value={formData.batchId}
                                        onChange={handleChange}
                                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                                    >
                                        <option value="">Select Batch (Optional)</option>
                                        {batches.map((batch) => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Guest Fields */}
                                <div className="relative">
                                    <ALargeSmall className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    <input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Unique Username"
                                        required
                                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number (Optional)"
                                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-md"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            mode === "student" ? "Create Student Account" : "Register for Event"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-muted-foreground text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
