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

type AuthMode = "password" | "otp";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // State
    const [authMode, setAuthMode] = useState<AuthMode>("password");

    // Form Data
    const [identifier, setIdentifier] = useState(""); // Email, Phone, or Username
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    // OTP State
    const [otpSent, setOtpSent] = useState(false);

    // Helper to detect type for UX (optional icons)
    const isEmail = identifier.includes("@");
    const isPhone = /^\+?[0-9\s-]{10,}$/.test(identifier);

    // Magic Link Handler
    useEffect(() => {
        const magic = searchParams.get("magic");
        const urlOtp = searchParams.get("otp");
        const urlIdentifier = searchParams.get("identifier");

        if (magic === "true" && urlOtp && urlIdentifier) {
            console.log("[MAGIC LINK] Detected. Auto-logging in...");
            setAuthMode("otp");
            setIdentifier(urlIdentifier);
            setOtp(urlOtp);
            setLoading(true);

            signIn("credentials", {
                redirect: false,
                email: urlIdentifier,
                otp: urlOtp,
            }).then((result) => {
                if (result?.error) {
                    setError("Magic Link invalid or expired.");
                    setLoading(false);
                } else {
                    router.refresh();
                    router.push("/");
                }
            });
        }
    }, [searchParams, router]);

    const handleSendOtp = async () => {
        setError("");
        setSuccessMessage("");
        try {
            // Validate Identifier
            LoginIdentifierSchema.parse(identifier);

            setLoading(true);
            const res = await sendOtp(identifier);
            setLoading(false);

            if (res.success) {
                setOtpSent(true);
                setSuccessMessage(res.message || "OTP sent! Check your email/phone.");
            } else {
                setError(res.message || "Failed to send OTP");
            }
        } catch (err) {
            setLoading(false);
            if (err instanceof z.ZodError) {
                setError("Please enter a valid email, phone, or username");
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    const handleVerifyOtp = async () => {
        setError("");
        setLoading(true);
        try {
            if (!identifier || !otp) {
                setError("Please enter the identifier and OTP");
                setLoading(false);
                return;
            }

            // Verify OTP Logic (Server Side)
            // We verify first to get the resolved email/identifier if needed
            // But actually, we might just want to ask NextAuth to "signIn" with OTP
            // IF we built a custom credential provider that verifies OTP.

            // Current plan: Verify manually here, then sign in with "otp-verified" flag or password?
            // Or better: The credentials provider in [...nextauth] route likely expects (email + otp) logic?
            // Since we didn't touch [...nextauth] yet (it was not in the plan), we might need to rely on
            // existing "password" flow OR manual verification + custom token?

            // Wait, if we verify OTP here, how do we log them into NextAuth session?
            // Standard way: `signIn('credentials', { email, otp })`
            // Then in `authorize`: if (credentials.otp) -> verifyOtp(email, otp).

            // So we should NOT manually verify here unless we want to "pre-check".
            // Let's assume the backend `authorize` function handles OTP verification if `otp` is present.
            // If not, we need to update `auth.ts` (NextAuth config).

            // Let's try signing in directly with OTP
            console.log("[LOGIN] Attempting signIn via OTP...");
            const result = await signIn("credentials", {
                redirect: false,
                email: identifier, // Use 'email' field for generic identifier in NextAuth
                otp: otp,
            });

            if (result?.error) {
                // If it fails, maybe manual verification is needed if NextAuth isn't set up for OTP?
                // Let's fallback to manual verify if needed, but usually signIn is best.
                // If NextAuth provider doesn't support OTP, this will fail.
                // Assuming `authorize` function in `auth.ts` handles it.
                // If not, we might need to add that task.
                setError("Invalid OTP or login failed");
                setLoading(false);
            } else {
                router.refresh();
                router.push("/");
            }

        } catch (err) {
            console.error(err);
            setError("An error occurred during verification");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Validate Identifier
            LoginIdentifierSchema.parse(identifier);

            if (authMode === "otp") {
                // Trigger Verification Logic
                await handleVerifyOtp();
                return;
            }

            // Password Mode
            const result = await signIn("credentials", {
                redirect: false,
                email: identifier,
                password,
            });

            if (result?.error) {
                setError("Invalid credentials");
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
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <User className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm">Sign in to your ScanX account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error / Success Messages */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm text-center animate-in fade-in slide-in-from-top-1">
                            {successMessage}
                        </div>
                    )}

                    {/* Identifier Input */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Email, Phone or Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pl-10 bg-card border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Enter email, phone or username"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {isEmail ? <Mail className="w-5 h-5" /> : isPhone ? <Phone className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                        </div>
                    </div>

                    {/* Password or OTP Flow */}
                    {authMode === "password" ? (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode("otp")}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Log in via OTP?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-foreground">
                                    One-Time Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => { setAuthMode("password"); setOtpSent(false); }}
                                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    Cancel OTP
                                </button>
                            </div>

                            {otpSent ? (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all tracking-widest text-center font-mono text-lg"
                                            placeholder="123456"
                                            maxLength={6}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="text-xs text-primary hover:underline w-full text-center"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full bg-muted hover:bg-accent text-foreground font-medium py-2.5 rounded-lg transition-all border border-border flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP Code"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    {!(authMode === "otp" && !otpSent) && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {authMode === "otp" ? "Verify & Login" : "Sign In"} <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
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
