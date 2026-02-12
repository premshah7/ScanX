import { Radio, Users, Clock, BookOpen } from "lucide-react";
import Link from "next/link";

type ActiveSessionsFeedProps = {
    sessions: {
        id: number;
        startTime: Date;
        subject: {
            name: string;
            totalStudents: number;
            faculty: {
                user: {
                    name: string;
                };
            } | null;
        };
        _count: {
            attendances: number;
            proxyAttempts: number;
        };
    }[];
};

export default function ActiveSessionsFeed({ sessions }: ActiveSessionsFeedProps) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-600">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <h3 className="font-bold text-lg text-foreground">Live Operations</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {sessions.length} Active Sessions
                </div>
            </div>

            <div className="p-6">
                {sessions.length === 0 ? (
                    <div className="text-center py-12 border border-border border-dashed rounded-lg">
                        <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <p className="text-muted-foreground">No active sessions at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sessions.map((session) => (
                            <Link
                                key={session.id}
                                href={`/admin/logs?sessionId=${session.id}`} // Or a specific session monitor page if we had one
                                className="bg-muted/50 border border-border hover:border-blue-500/50 rounded-lg p-5 transition-all group hover:bg-card hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-foreground group-hover:text-blue-600 transition-colors">
                                            {session.subject.name}
                                        </h4>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <Users className="w-3 h-3" />
                                            {session.subject.faculty?.user?.name || "Multiple Organizers"}
                                        </div>
                                    </div>
                                    <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-mono border border-green-200">
                                        LIVE
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Started
                                        </span>
                                        <span className="text-foreground font-mono">
                                            {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${(session._count.attendances / session.subject.totalStudents) * 100}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-foreground font-bold">{session._count.attendances} <span className="text-muted-foreground font-normal">Present</span></span>
                                        <span className="text-foreground font-bold">{session.subject.totalStudents} <span className="text-muted-foreground font-normal">Total</span></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
