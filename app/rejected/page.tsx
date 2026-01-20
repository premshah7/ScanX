"use client";

import { Ban } from "lucide-react";
import { signOut } from "next-auth/react";

export default function RejectedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Ban className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Request Rejected</h1>
                <p className="text-gray-400 mb-8">
                    Your registration request has been rejected by the administrator.
                    Please contact support or the faculty for more information.
                </p>

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
