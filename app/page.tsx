import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, MapPin, Lock, Smartphone } from "lucide-react";

export default async function Home() {
    const session = await getServerSession(authOptions);

    // If logged in, redirect to dashboard
    if (session) {
        switch (session.user.role) {
            case "ADMIN":
                redirect("/admin");
            case "FACULTY":
                redirect("/faculty");
            case "STUDENT":
                redirect("/student");
            default:
                redirect("/auth/login");
        }
    }

    // If not logged in, show Landing Page
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-gray-800 p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            GeoGuard
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/auth/login"
                            className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors font-medium"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                        <Lock className="w-4 h-4" />
                        Secure & Location-Based Attendance
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Attendance, <br />
                        <span className="text-blue-500">Reimagined.</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Say goodbye to proxies. GeoGuard uses advanced GPS geofencing and device fingerprinting to ensure 100% authentic attendance.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link
                            href="/auth/login"
                            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-bold transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
                        >
                            Login to Dashboard
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-8 py-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-lg font-bold transition-all hover:scale-105"
                        >
                            Register as Student
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24">
                    <FeatureCard
                        icon={MapPin}
                        title="GPS Geofencing"
                        description="Attendance can only be marked within the designated classroom boundaries."
                    />
                    <FeatureCard
                        icon={Smartphone}
                        title="Device Lock"
                        description="One student, one device. Prevents logging in for friends using their phone."
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Proxy Detection"
                        description="Advanced algorithms detect and flag suspicious attendance patterns instantly."
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} GeoGuard System. All rights reserved.
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: any) {
    return (
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-colors text-left">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}
