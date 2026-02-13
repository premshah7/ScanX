import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, Users, Play } from "lucide-react";
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
        <div className="text-foreground max-w-7xl mx-auto animate-slide-up">

            {/* ─── Header ─── */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gradient truncate">
                            {session.user.name}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Faculty Dashboard</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg flex-shrink-0 ml-4">
                        <span className="font-bold text-white text-lg">
                            {session.user.name?.[0] || "F"}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Stats Row ─── */}
            <StatsCards stats={stats} />

            {/* ─── My Subjects ─── */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        My Subjects
                    </h2>
                    <div className="w-full max-w-[200px]">
                        <Search placeholder="Search subjects..." />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => {
                        const activeSession = subject.sessions[0];
                        const batchStudents = subject.batches.reduce((acc, batch) => acc + batch._count.students, 0);
                        const totalStudents = subject._count.students + batchStudents;

                        return (
                            <div key={subject.id} className="group relative bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-all overflow-hidden hover-lift">
                                {/* Decorative gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-foreground mb-2 truncate">{subject.name}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-medium">{totalStudents} Students</span>
                                    </div>

                                    {/* Action Button */}
                                    {activeSession ? (
                                        <Link
                                            href={`/faculty/session/${activeSession.id}`}
                                            className="w-full py-2.5 gradient-success rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all pulse-slow text-white"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            Resume Session
                                        </Link>
                                    ) : (
                                        <SessionStarter subjectId={subject.id} batches={batches} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {subjects.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                            <p className="text-muted-foreground">No subjects assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Analytics ─── */}
            <div className="mb-6">
                <AnalyticsWidgets analytics={analytics} />
            </div>

            {/* ─── Bottom Grid: Recent Activity & Defaulters ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentActivity activities={analytics.recentActivity} />
                </div>
                <div className="lg:col-span-1 h-[500px] lg:sticky lg:top-8">
                    <DefaultersList defaulters={defaulters} />
                </div>
            </div>
        </div>
    );
}
