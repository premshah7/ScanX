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
        <div className="max-w-7xl mx-auto space-y-8 text-foreground">
            <AutoRefresh intervalMs={10000} />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Admin Command Center</h1>
                    <p className="text-muted-foreground">System Status & Global Overview</p>
                </div>
            </div>

            <PendingRequests />

            {/* 1. Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.studentCount}
                    icon={GraduationCap}
                    color="blue"
                />
                <StatCard
                    title="Total Faculty"
                    value={stats.facultyCount}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Active Sessions"
                    value={stats.activeSessionsCount}
                    icon={Activity}
                    color="green"
                />
                <StatCard
                    title="Total Proxies"
                    value={stats.proxyCount}
                    icon={ShieldAlert}
                    color="red"
                />
            </div>

            {/* 2. Global Analytics (Trend & Security) */}
            <GlobalAnalytics trend={stats.trend} security={stats.security} />

            {/* 3. Live Active Sessions Feed */}
            <ActiveSessionsFeed sessions={stats.activeSessions} />

            {/* 4. Recent Alerts (Bottom Log) */}
            {/* 4. Recent Alerts (Bottom Log) */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        Recent Security Alerts
                    </h2>
                </div>
                <SecurityAlerts alerts={stats.recentAlerts} />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900",
        purple: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900",
        green: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900",
        red: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900",
    }[color as string] || "bg-card text-foreground border-border";

    return (
        <div className={`p-6 rounded-xl border ${colorClasses}`}>
            <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8" />
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <h3 className="font-medium opacity-80">{title}</h3>
        </div>
    );
}
