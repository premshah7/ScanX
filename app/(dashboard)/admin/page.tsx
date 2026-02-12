import { prisma } from "@/lib/prisma";
import { Users, GraduationCap, ShieldAlert, Activity } from "lucide-react";
import PendingRequests from "@/components/admin/PendingRequests";
import SecurityAlerts from "@/components/admin/SecurityAlerts";
import { getGlobalAnalytics, getSecurityOverview, getActiveSessions } from "@/actions/admin";
import GlobalAnalytics from "@/components/admin/GlobalAnalytics";
import ActiveSessionsFeed from "@/components/admin/ActiveSessionsFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";


// ... (existing imports)
import AutoRefresh from "@/components/AutoRefresh";

async function getStats() {
    const [studentCount, facultyCount, proxyCount, activeSessionsCount, recentAlerts, trend, security, activeSessions] = await Promise.all([
        prisma.student.count(),
        prisma.faculty.count(),
        prisma.proxyAttempt.count(),
        prisma.session.count({ where: { isActive: true } }),
        prisma.proxyAttempt.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: {
                student: { include: { user: true } },
                deviceOwner: { include: { user: true } }
            }
        }),
        getGlobalAnalytics(),
        getSecurityOverview(),
        getActiveSessions()
    ]);

    return {
        studentCount,
        facultyCount,
        proxyCount,
        activeSessionsCount,
        recentAlerts,
        trend,
        security,
        activeSessions
    };
}

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/unauthorized");
    }

    const stats = await getStats();

    return (
        <div className="max-w-7xl mx-auto space-y-8 text-foreground animate-slide-up">
            <AutoRefresh intervalMs={10000} />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2 text-gradient">Admin Command Center</h1>
                    <p className="text-muted-foreground text-lg">System Status & Global Overview</p>
                </div>
                {/* <div className="flex gap-2">
                    <CreateOrganizerModal />
                </div> */}
            </div>

            <PendingRequests />

            {/* Key Metrics Grid - Enhanced with Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.studentCount}
                    icon={GraduationCap}
                    gradient="from-blue-500 to-cyan-500"
                />
                <StatCard
                    title="Total Faculty"
                    value={stats.facultyCount}
                    icon={Users}
                    gradient="from-purple-500 to-pink-500"
                />
                <StatCard
                    title="Active Sessions"
                    value={stats.activeSessionsCount}
                    icon={Activity}
                    gradient="from-emerald-500 to-teal-500"
                    pulse={stats.activeSessionsCount > 0}
                />
                <StatCard
                    title="Total Proxies"
                    value={stats.proxyCount}
                    icon={ShieldAlert}
                    gradient="from-rose-500 to-red-500"
                />
            </div>

            {/* Global Analytics */}
            <GlobalAnalytics trend={stats.trend} security={stats.security} />

            {/* Live Active Sessions Feed */}
            <ActiveSessionsFeed sessions={stats.activeSessions} />

            {/* Recent Alerts */}
            <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        Recent Security Alerts
                    </h2>
                </div>
                <SecurityAlerts alerts={stats.recentAlerts} />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, gradient, pulse = false }: any) {
    return (
        <div className={`group relative p-6 rounded-2xl bg-card border-2 border-border shadow-lg hover:shadow-2xl transition-all overflow-hidden hover-lift ${pulse ? 'pulse-slow' : ''}`}>
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

            {/* Content */}
            <div className="relative flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-4xl font-extrabold text-gradient">{value}</span>
            </div>
            <h3 className="relative font-semibold text-muted-foreground text-sm uppercase tracking-wide">{title}</h3>
        </div>
    );
}
