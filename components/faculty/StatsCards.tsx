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
            <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Students</p>
                    <h3 className="text-2xl font-bold text-foreground">{stats.totalStudents}</h3>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-muted-foreground text-sm font-medium">Sessions Conducted</p>
                    <h3 className="text-2xl font-bold text-foreground">{stats.totalSessions}</h3>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-muted-foreground text-sm font-medium">Avg. Attendance</p>
                    <h3 className="text-2xl font-bold text-foreground">{stats.averageAttendance}%</h3>
                </div>
            </div>
        </div>
    );
}
