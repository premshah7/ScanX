"use client";


import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Eye, EyeOff, Mail, Phone, ArrowRight, MessageSquare, User } from "lucide-react";
import { sendOtp, verifyOtp } from "@/actions/otp"; // Server actions
import { z } from "zod";

// Local schemas for validation
const LoginIdentifierSchema = z.string().min(3, "Identifier must be at least 3 characters"); // Allow Username, Email or Phone

type AuthMode = "password" | "otp" | "guest";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loginType, setLoginType] = useState<"student" | "guest">("student");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Form Data
    const [identifier, setIdentifier] = useState(""); // Email, Phone, or Username
    const [password, setPassword] = useState("");

    // Helper to detect type for UX (optional icons)
    const isEmail = identifier.includes("@");
    const isPhone = /^\+?[0-9\s-]{10,}$/.test(identifier);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Validate Identifier
            LoginIdentifierSchema.parse(identifier);

            if (loginType === "guest") {
                // Guest Login (Username only)
                const result = await signIn("credentials", {
                    redirect: false,
                    email: identifier,
                    password: "", // Guest accounts typically use passwordless login via username
                });

                if (result?.error) {
                    setError("Invalid guest username or account not found");
                    setLoading(false);
                } else {
                    router.refresh();
                    router.push("/");
                }
                return;
            }

            // Student Login (Password)
            const result = await signIn("credentials", {
                redirect: false,
                email: identifier,
                password: password,
            });

            if (result?.error) {
                setError("Invalid credentials or account mismatch");
                setLoading(false);
            } else {
                router.refresh();
                router.push("/");
            }
        } catch (err) {
            setLoading(false);
            if (err instanceof z.ZodError) {
                setError(err.issues[0].message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-xl transition-all">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-sm font-headline">
                        <User className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-1 font-headline">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm font-body">
                        {loginType === "student" ? "Sign in to your ScanX account" : "Access your registered events as Guest"}
                    </p>
                </div>

                {/* Login Type Toggle */}
                <div className="flex bg-secondary rounded-lg p-1 mb-8 transition-all">
                    <button
                        type="button"
                        onClick={() => { setLoginType("student"); setError(""); setSuccessMessage(""); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                            loginType === "student" 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Student / Staff
                    </button>
                    <button
                        type="button"
                        onClick={() => { setLoginType("guest"); setError(""); setSuccessMessage(""); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                            loginType === "guest" 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Guest
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error / Success Messages */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-1 font-medium">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm text-center animate-in fade-in slide-in-from-top-1 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-5 transition-all duration-300">
                        {/* Identifier Input */}
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-semibold text-foreground mb-1.5 px-0.5">
                                {loginType === "student" ? "Enrollment, Email, or Mobile" : "Guest Username"}
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-10 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={loginType === "student" ? "enrollment, email, or phone" : "Enter your guest username"}
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    {isEmail ? <Mail className="w-4 h-4" /> : isPhone ? <Phone className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                            </div>
                            {loginType === "guest" && (
                                <p className="text-[10px] text-muted-foreground mt-1.5 px-1 italic">
                                    Use the username shown after your event registration.
                                </p>
                            )}
                        </div>

                        {/* Password (Student Mode Only) */}
                        {loginType === "student" && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-center mb-1.5 px-0.5">
                                    <label className="block text-sm font-semibold text-foreground font-headline">
                                        Password
                                    </label>
                                    <Link href="/auth/forgot-password" className="text-xs font-bold text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                                        placeholder="Enter your password"
                                    />
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] mt-2 group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {loginType === "student" ? "Sign In" : "Sign In as Guest"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-muted-foreground text-sm">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
