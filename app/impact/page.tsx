import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TrendingUp, Clock, ShieldAlert, ArrowLeft, CheckCircle, BarChart3, Users } from "lucide-react";

export default async function ImpactPage() {
    const headersList = await headers();
    const referer = headersList.get("referer");

    // Strict Access Control: Only allow access if coming from the landing page
    if (!referer || !referer.includes(process.env.NEXT_PUBLIC_APP_URL || "localhost")) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-border bg-card/80 backdrop-blur-sm p-5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Back to Home</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">
                            ScanX Impact
                        </span>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-start p-6 pt-12 md:pt-20 text-center space-y-20">

                {/* Hero */}
                <div className="max-w-4xl space-y-6 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                        <BarChart3 className="w-4 h-4" />
                        Targeting Efficiency
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
                        Real Results, <br />
                        <span className="text-primary">Real Integrity.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        See how ScanX transforms campus attendance from a burden into a seamless, data-driven insight engine.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
                    <StatCard
                        icon={Clock}
                        value="15 min"
                        label="Saved Per Lecture"
                        description="Eliminate roll calls. Faculty can focus on teaching, not tracking."
                        accent="border-t-primary"
                    />
                    <StatCard
                        icon={ShieldAlert}
                        value="100%"
                        label="Proxy Reduction"
                        description="Device fingerprinting makes it impossible to mark attendance for a friend."
                        accent="border-t-destructive"
                    />
                    <StatCard
                        icon={Users}
                        value="Zero"
                        label="Paper Waste"
                        description="Fully digital workflow. No more sign-in sheets to print, sign, or lose."
                        accent="border-t-chart-1"
                    />
                </div>

                {/* Benefits Section */}
                <div className="w-full max-w-5xl mx-auto text-left space-y-8 pb-20">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-10">Why Institutions Switch</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BenefitRow text="Accurate data for accreditation and grading" />
                        <BenefitRow text="Real-time analytics for student engagement" />
                        <BenefitRow text="Seamless integration with existing databases" />
                        <BenefitRow text="Mobile-first experience for students" />
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card/50 py-8 text-center text-muted-foreground text-sm">
                <div className="max-w-7xl mx-auto">
                    <p>&copy; {new Date().getFullYear()} ScanX System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function StatCard({ icon: Icon, value, label, description, accent }: any) {
    return (
        <div className={`p-8 rounded-xl bg-card border border-border ${accent} border-t-2 text-center hover:shadow-md transition-all`}>
            <Icon className="w-10 h-10 mx-auto mb-4 text-foreground" />
            <div className="text-4xl font-extrabold text-foreground mb-2">{value}</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{label}</div>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    )
}

function BenefitRow({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="mt-1 flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <p className="text-foreground font-medium">{text}</p>
        </div>
    )
}
