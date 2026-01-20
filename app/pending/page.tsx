"use client";

import { Loader2, Clock } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PendingPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(async () => {
            // Force session update to check for status changes
            const newSession = await update();
            if (newSession?.user?.status === "APPROVED") {
                router.push("/student");
                router.refresh();
            }
            if (newSession?.user?.status === "REJECTED") {
                router.push("/rejected");
                router.refresh();
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [router, update]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                {/* Background decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full -z-10"></div>

                <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Clock className="w-10 h-10 text-blue-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Approval Pending</h1>
                <p className="text-gray-400 mb-8">
                    Your account is currently waiting for administrator approval.
                    This page will automatically update once you are approved.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking status...</span>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}
