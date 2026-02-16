"use client";


import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Eye, EyeOff, Mail, Phone, ArrowRight, MessageSquare, User } from "lucide-react";
import { sendOtp, verifyOtp } from "@/actions/otp"; // Server actions
import { z } from "zod";

// Local schemas for validation
const EmailSchema = z.string().email("Invalid email address");
const PhoneSchema = z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[0-9\s-]{10,}$/, "Invalid phone format");
const LoginIdentifierSchema = z.string().min(3, "Identifier must be at least 3 characters"); // Allow Username or Phone

type AuthMode = "password" | "otp";

function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // State
    const [authMode, setAuthMode] = useState<AuthMode>("password");

    // Form Data
    const [identifier, setIdentifier] = useState(""); // Email or Phone
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    const handleSendOtp = async () => {
        setError("");
        setSuccessMessage("");
        try {
            // Validate Phone STRICTLY for OTP
            PhoneSchema.parse(identifier);

            setLoading(true);
            const res = await sendOtp(identifier);
            setLoading(false);

            if (res.success) {
                setOtpSent(true);
                setSuccessMessage("OTP sent! Check your console (Dev Mode)");
            } else {
                setError(res.message || "Failed to send OTP");
            }
        } catch (err) {
            setLoading(false);
            if (err instanceof z.ZodError) {
                setError("Please enter a valid phone number for OTP");
            } else {
                setError("Please enter a valid phone number");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Validate Identifier
            // 1. Validate Identifier
            LoginIdentifierSchema.parse(identifier); // Allow Email, Phone, or Username (min 3 chars)

            // 2. Prepare Credentials
            const credentials: Record<string, string> = {
                email: identifier, // Mapping identifier to 'email' field for NextAuth
            };

            if (authMode === "password") {
                // Relaxed Frontend Check: Even if empty, let backend decide if password is required (for Guests)
                // But for better UX, maybe warn if empty and NOT a known guest? 
                // We don't know if they are guest yet. 
                // So we MUST allow empty password to pass to backend.
                credentials.password = password;
            } else {
                // OTP Mode - Strictly requires Phone
                PhoneSchema.parse(identifier); // Re-validate phone for OTP mode logic safety
                if (!otp) {
                    setError("Please enter the OTP");
                    setLoading(false);
                    return;
                }
                credentials.otp = otp;
            }
            // Hack: We need to pass a password to satisfy strict Types/Schema if necessary?
            // No, authorize checks for otp first.

            // 3. SignIn
            console.log("[LOGIN] Calling signIn with credentials:", { ...credentials, password: credentials.password ? "***" : "(empty)" });
            const result = await signIn("credentials", {
                redirect: false,
                ...credentials,
            });
            console.log("[LOGIN] Result:", result);

            if (result?.error) {
                setError(result.error === "CredentialsSignin" ? "Invalid credentials" : result.error);
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
                                <User className="w-5 h-5" />
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
