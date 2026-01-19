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
            };
        };
        _count: {
            attendances: number;
            proxyAttempts: number;
        };
    }[];
};

export default function ActiveSessionsFeed({ sessions }: ActiveSessionsFeedProps) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-500">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <h3 className="font-bold text-lg text-white">Live Operations</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {sessions.length} Active Sessions
                </div>
            </div>

            <div className="p-6">
                {sessions.length === 0 ? (
                    <div className="text-center py-12 border border-gray-800 border-dashed rounded-lg">
                        <Radio className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-20" />
                        <p className="text-gray-500">No active sessions at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sessions.map((session) => (
                            <Link
                                key={session.id}
                                href={`/admin/logs?sessionId=${session.id}`} // Or a specific session monitor page if we had one
                                className="bg-black/40 border border-gray-800 hover:border-blue-500/50 rounded-lg p-5 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {session.subject.name}
                                        </h4>
                                        <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                            <Users className="w-3 h-3" />
                                            {session.subject.faculty.user.name}
                                        </div>
                                    </div>
                                    <div className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded font-mono">
                                        LIVE
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Started
                                        </span>
                                        <span className="text-white font-mono">
                                            {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${(session._count.attendances / session.subject.totalStudents) * 100}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white font-bold">{session._count.attendances} <span className="text-gray-500 font-normal">Present</span></span>
                                        <span className="text-white font-bold">{session.subject.totalStudents} <span className="text-gray-500 font-normal">Total</span></span>
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
