import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, Users, Play } from "lucide-react";
import StartSessionButton from "@/components/faculty/StartSessionButton";
import Search from "@/components/Search";
import { getFacultyStats, getFacultyDefaulters, getFacultyAnalytics } from "@/actions/faculty";
import { getBatches } from "@/actions/batch";
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
    const [faculty, stats, defaulters, analytics, batchesRes] = await Promise.all([
        prisma.faculty.findUnique({
            where: { userId: Number(session.user.id) },
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
                        }
                    }
                }
            },
        }),
        getFacultyStats(session.user.email!),
        getFacultyDefaulters(session.user.email!),
        getFacultyAnalytics(session.user.email!),
        getBatches()
    ]);

    const batches = batchesRes.batches || [];

    if (!faculty) {
        return <div className="p-8 text-center text-red-400">Faculty record not found. Please contact admin.</div>;
    }

    return (
        <div className="text-white max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
                <p className="text-gray-400">Welcome back, {session.user.name}</p>
            </div>

            {/* 1. Key Metrics Cards */}
            <StatsCards stats={stats} />

            {/* 2. My Subjects (Moved to Top as requested) */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">My Subjects</h2>
                    <div className="w-full max-w-xs">
                        <Search placeholder="Search subjects..." />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faculty.subjects.map((subject) => {
                        const activeSession = subject.sessions[0];
                        return (
                            <div key={subject.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BookOpen className="w-24 h-24" />
                                </div>

                                <h2 className="text-xl font-bold mb-2 relative z-10">{subject.name}</h2>
                                <div className="flex items-center gap-2 text-gray-400 mb-6 relative z-10">
                                    <Users className="w-4 h-4" />
                                    <span>{subject.totalStudents} Students</span>
                                </div>

                                <div className="relative z-10">
                                    {activeSession ? (
                                        <Link
                                            href={`/faculty/session/${activeSession.id}`}
                                            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold flex items-center justify-center gap-2 animate-pulse"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            Resume Session
                                        </Link>
                                    ) : (
                                        <StartSessionButton subjectId={subject.id} batches={batches} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {faculty.subjects.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
                            <p className="text-gray-500">No subjects assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Analytics Section */}
            <AnalyticsWidgets analytics={analytics} />

            {/* 4. Bottom Grid: Recent Activity & Defaulters */}
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
