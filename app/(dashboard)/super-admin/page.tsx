import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ShieldAlert, Activity, ShieldCheck } from "lucide-react";
import AutoRefresh from "@/components/AutoRefresh";

async function getSuperAdminStats() {
    const [adminCount, facultyCount, systemSettings] = await Promise.all([
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "FACULTY" } }),
        prisma.systemSettings.findFirst(),
    ]);

    return { adminCount, facultyCount, systemSettings };
}

export default async function SuperAdminPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    if (session.user.role !== "SUPER_ADMIN") {
        redirect("/unauthorized");
    }

    const stats = await getSuperAdminStats();

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
            <AutoRefresh intervalMs={15000} />
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2 text-primary">Platform Governance</h1>
                    <p className="text-muted-foreground text-lg">Super Admin Control Panel</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-card border-2 border-border shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-muted-foreground">Total Admins</h3>
                    </div>
                    <p className="text-3xl font-bold">{stats.adminCount}</p>
                </div>

                <div className="p-6 rounded-2xl bg-card border-2 border-border shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-muted-foreground">Total Faculty</h3>
                    </div>
                    <p className="text-3xl font-bold">{stats.facultyCount}</p>
                </div>

                <div className="p-6 rounded-2xl bg-card border-2 border-border shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-muted-foreground">System Status</h3>
                    </div>
                    <p className="text-3xl font-bold">Healthy</p>
                </div>

                <div className="p-6 rounded-2xl bg-card border-2 border-border shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-muted-foreground">Global Activity</h3>
                    </div>
                    <p className="text-3xl font-bold">Active</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-primary" />
                    Administrative Controls
                </h2>
                <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Manage Administrative Users
                    </button>
                    <button className="px-8 py-4 rounded-xl border-2 border-border text-foreground font-bold hover:bg-muted transition-all flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        Security Logs
                    </button>
                </div>
            </div>
            
            {/* Admin Management Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card rounded-2xl p-6 border-2 border-border">
                    <h3 className="text-xl font-bold mb-4">Recently Managed Admins</h3>
                    <div className="text-muted-foreground text-center py-12 border-2 border-dashed border-border rounded-xl">
                        No recent activity to display.
                    </div>
                </div>
                <div className="bg-card rounded-2xl p-6 border-2 border-border">
                    <h3 className="text-xl font-bold mb-4">Platform Health Monitor</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <span className="font-medium">Database Connection</span>
                            <span className="text-green-500 font-bold">OPTIMAL</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <span className="font-medium">Authentication Service</span>
                            <span className="text-green-500 font-bold">OPTIMAL</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <span className="font-medium">Email Provider</span>
                            <span className="text-green-500 font-bold">OPTIMAL</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
