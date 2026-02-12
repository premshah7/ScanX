import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, Users, Play, Sparkles } from "lucide-react";
import { SessionStarter } from "@/components/faculty/SessionStarter";
import Search from "@/components/Search";
import { getFacultyStats, getFacultyDefaulters, getFacultyAnalytics, getFacultyBatches } from "@/actions/faculty";
import StatsCards from "@/components/faculty/StatsCards";
import DefaultersList from "@/components/faculty/DefaultersList";
import AnalyticsWidgets from "@/components/faculty/AnalyticsWidgets";
import RecentActivity from "@/components/faculty/RecentActivity";

export default async function FacultyDashboard({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const session = await getServerSession(authOptions);
    const params = await searchParams;
    const query = params?.query || "";

    if (!session || session.user.role !== "FACULTY") {
        redirect("/auth/login");
    }

    // Parallel data fetching
    const [user, stats, defaulters, analytics, batchesRes] = await Promise.all([
        prisma.user.findUnique({
            where: { id: Number(session.user.id) },
            include: {
                faculty: {
                    include: {
                        subjects: {
                            where: {
                                name: { contains: query, mode: 'insensitive' }
                            },
                            include: {
                                sessions: {
                                    where: { isActive: true },
                                    orderBy: { startTime: "desc" },
                                    take: 1
                                },
                                _count: {
                                    select: { students: true }
                                },
                                batches: {
                                    include: {
                                        _count: {
                                            select: { students: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }),
        getFacultyStats(session.user.email!),
        getFacultyDefaulters(session.user.email!),
        getFacultyAnalytics(session.user.email!),
        getFacultyBatches(session.user.email!)
    ]);

    const subjects = [
        ...(user?.faculty?.subjects || [])
    ];

    const batches = batchesRes.batches || [];

    if (!user) {
        return <div className="p-8 text-center text-red-400">User record not found. Please contact admin.</div>;
    }

    return (
        <div className="text-foreground max-w-7xl mx-auto space-y-8 animate-slide-up">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold mb-2 text-gradient">Faculty Dashboard</h1>
                <p className="text-muted-foreground text-lg">Welcome back, <span className="font-semibold text-foreground">{session.user.name}</span></p>
            </div>

            {/* Key Metrics Cards */}
            <StatsCards stats={stats} />

            {/* My Subjects Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        My Subjects
                    </h2>
                    <div className="w-full max-w-xs">
                        <Search placeholder="Search subjects..." />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => {
                        const activeSession = subject.sessions[0];
                        const batchStudents = subject.batches.reduce((acc, batch) => acc + batch._count.students, 0);
                        const totalStudents = subject._count.students + batchStudents;

                        return (
                            <div key={subject.id} className="group relative bg-card border-2 border-border rounded-2xl p-6 hover:shadow-2xl transition-all overflow-hidden hover-lift">
                                {/* Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Decorative Icon */}
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BookOpen className="w-24 h-24" />
                                </div>

                                {/* Content */}
                                <h2 className="text-xl font-bold mb-3 relative z-10">{subject.name}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground mb-6 relative z-10">
                                    <Users className="w-4 h-4" />
                                    <span className="font-medium">{totalStudents} Students</span>
                                </div>

                                {/* Action Button */}
                                <div className="relative z-10">
                                    {activeSession ? (
                                        <Link
                                            href={`/faculty/session/${activeSession.id}`}
                                            className="w-full py-3 gradient-success rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all pulse-slow"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            Resume Session
                                        </Link>
                                    ) : (
                                        <SessionStarter subjectId={subject.id} batches={batches} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {subjects.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-card rounded-2xl border-2 border-dashed border-border">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground text-lg">No subjects assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Section */}
            <AnalyticsWidgets analytics={analytics} />

            {/* Bottom Grid: Recent Activity & Defaulters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recent Activity */}
                <div className="lg:col-span-2">
                    <RecentActivity activities={analytics.recentActivity} />
                </div>

                {/* Right: Defaulters List */}
                <div className="lg:col-span-1 h-[600px] lg:sticky lg:top-8">
                    <DefaultersList defaulters={defaulters} />
                </div>
            </div>
        </div>
    );
}
