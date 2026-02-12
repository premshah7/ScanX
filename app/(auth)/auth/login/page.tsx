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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-blue-500/20 shadow-lg">
                        <User className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome Back</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Sign in to your GeoGuard account</p>
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Email, Phone or Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pl-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter email, phone or username"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Password or OTP Flow */}
                    {authMode === "password" ? (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode("otp")}
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                    Log in via OTP?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all tracking-widest text-center font-mono text-lg"
                                            placeholder="123456"
                                            maxLength={6}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="text-xs text-blue-600 hover:underline w-full text-center"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium py-2.5 rounded-lg transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
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

                <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
