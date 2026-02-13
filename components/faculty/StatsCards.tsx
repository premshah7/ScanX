import { Users, Calendar, TrendingUp } from "lucide-react";

type StatsCardsProps = {
    stats: {
        totalStudents: number;
        totalSessions: number;
        averageAttendance: number;
    };
};

const cards = [
    {
        key: "students",
        label: "Total Students",
        icon: Users,
        gradient: "from-blue-500 to-indigo-600",
        getValue: (s: StatsCardsProps["stats"]) => String(s.totalStudents),
    },
    {
        key: "sessions",
        label: "Sessions",
        icon: Calendar,
        gradient: "from-purple-500 to-violet-600",
        getValue: (s: StatsCardsProps["stats"]) => String(s.totalSessions),
    },
    {
        key: "attendance",
        label: "Avg. Attendance",
        icon: TrendingUp,
        gradient: "from-emerald-500 to-teal-600",
        getValue: (s: StatsCardsProps["stats"]) => `${s.averageAttendance}%`,
    },
];

export default function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
            {cards.map((card) => (
                <div key={card.key} className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm hover-lift transition-all">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md mb-3`}>
                        <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-foreground">{card.getValue(stats)}</p>
                    <p className="text-muted-foreground text-xs md:text-sm font-medium mt-0.5">{card.label}</p>
                </div>
            ))}
        </div>
    );
}
