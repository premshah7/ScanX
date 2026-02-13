import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, MapPin, Lock, Smartphone, ArrowRight, Sparkles } from "lucide-react";

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
            case "GUEST":
                redirect("/event/check-in");
            default:
                redirect("/auth/login");
        }
    }

    // If not logged in, show Landing Page
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white flex flex-col relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/10 dark:bg-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 p-5 sticky top-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 group">
                        <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            ScanX
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/auth/login"
                            className="px-5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all font-medium text-sm hover:shadow-md"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-5 py-2.5 rounded-xl gradient-primary hover:shadow-xl transition-all font-medium text-white text-sm hover:scale-105 shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-5xl space-y-8 animate-slide-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-blue-700 dark:text-blue-300 text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-default">
                        <Sparkles className="w-4 h-4" />
                        Fast, Smart, Seamless attendance
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        Attendance, <br />
                        <span className="text-gradient">Reimagined.</span>
                    </h1>

                    {/* Subheading */}
                    Say goodbye to proxies. ScanX uses advanced device fingerprinting to ensure <span className="font-semibold text-blue-600 dark:text-blue-400">100% authentic attendance</span>.

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/auth/login"
                            className="group px-8 py-4 rounded-2xl gradient-primary text-lg font-bold transition-all hover:shadow-2xl shadow-xl text-white flex items-center justify-center gap-2 hover:scale-105"
                        >
                            Login to Dashboard
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-8 py-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-300/50 dark:border-slate-700/50 text-lg font-bold transition-all hover:shadow-xl shadow-md text-slate-900 dark:text-white hover:scale-105"
                        >
                            Register as Student
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-24 w-full">
                    <FeatureCard
                        icon={Sparkles}
                        title="Smart Attendance"
                        description="Experience seamless, secure, and fast attendance marking with our advanced system."
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <FeatureCard
                        icon={Smartphone}
                        title="Device Lock"
                        description="One student, one device. Prevents logging in for friends using their phone."
                        gradient="from-purple-500 to-pink-500"
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Proxy Detection"
                        description="Advanced algorithms detect and flag suspicious attendance patterns instantly."
                        gradient="from-emerald-500 to-teal-500"
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                <div className="max-w-7xl mx-auto">
                    <p>&copy; {new Date().getFullYear()} ScanX System. All rights reserved.</p>
                    <p className="mt-2 text-xs">Built with security and accuracy in mind.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, gradient }: any) {
    return (
        <div className="group p-8 rounded-2xl glass-card hover:shadow-2xl transition-all text-left relative overflow-hidden hover-lift">
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

            {/* Icon */}
            <div className={`relative w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                <Icon className="w-7 h-7 text-white" />
            </div>

            {/* Content */}
            <h3 className="relative text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
            <p className="relative text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}
