import { Users, Calendar, BarChart, TrendingUp } from "lucide-react";

type StatsCardsProps = {
    stats: {
        totalStudents: number;
        totalSessions: number;
        averageAttendance: number;
    };
};

export default function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-medium">Total Students</p>
                    <h3 className="text-2xl font-bold text-white">{stats.totalStudents}</h3>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-medium">Sessions Conducted</p>
                    <h3 className="text-2xl font-bold text-white">{stats.totalSessions}</h3>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-gray-400 text-sm font-medium">Avg. Attendance</p>
                    <h3 className="text-2xl font-bold text-white">{stats.averageAttendance}%</h3>
                </div>
            </div>
        </div>
    );
}
