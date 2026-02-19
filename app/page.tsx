import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, MapPin, Lock, Smartphone, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

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
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Animated Background Elements - REMOVED */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Glow effects removed as per user request */}
            </div>

            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-5xl space-y-8 animate-slide-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-primary text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-default">
                        <Sparkles className="w-4 h-4" />
                        Fast, Smart, Seamless attendance
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        No Proxies, <br />
                        <span className="text-primary">Just Authentic Attendance.</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg text-muted-foreground">Say goodbye to proxies. ScanX uses advanced device fingerprinting to ensure <span className="font-semibold text-primary">100% authentic attendance</span>.</p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/auth/login"
                            className="group px-8 py-4 rounded-2xl bg-primary text-lg font-bold transition-all hover:shadow-2xl shadow-xl text-primary-foreground flex items-center justify-center gap-2 hover:scale-105"
                        >
                            Login to Dashboard
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-8 py-4 rounded-2xl bg-card/80 backdrop-blur-sm hover:bg-card border-2 border-border/50 text-lg font-bold transition-all hover:shadow-xl shadow-md text-foreground hover:scale-105"
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
                        color="#86a7c8"
                    />
                    <FeatureCard
                        icon={Smartphone}
                        title="Device Lock"
                        description="One student, one device. Prevents logging in for friends using their phone."
                        color="#5a7ca6"
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Proxy Detection"
                        description="Advanced algorithms detect and flag suspicious attendance patterns instantly."
                        color="#466494"
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border/50 backdrop-blur-xl bg-card/30 py-8 text-center text-muted-foreground text-sm">
                <div className="max-w-7xl mx-auto">
                    <p>&copy; {new Date().getFullYear()} ScanX System. All rights reserved.</p>
                    <p className="mt-2 text-xs">Built with security and accuracy in mind.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
    return (
        <div className="group p-8 rounded-2xl glass-card hover:shadow-2xl transition-all text-left relative overflow-hidden hover-lift">
            {/* Color Background on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity" style={{ backgroundColor: color }}></div>

            {/* Icon */}
            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all" style={{ backgroundColor: color }}>
                <Icon className="w-7 h-7 text-white" />
            </div>

            {/* Content */}
            <h3 className="relative text-xl font-bold mb-3 text-foreground">{title}</h3>
            <p className="relative text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}
