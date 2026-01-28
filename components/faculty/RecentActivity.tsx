import { Clock, Users, ArrowRight, UserMinus } from "lucide-react";
import Link from "next/link";

type RecentActivityProps = {
    activities: {
        id: number;
        subjectName: string;
        date: Date;
        present: number;
        absent: number;
        proxies: number;
        total: number;
    }[];
};

export default function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-bold text-lg text-foreground">Recent Activity</h3>
                </div>
                <Link href="/faculty/history" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                {activities.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No recent sessions found.
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {activities.map((activity) => (
                            <Link
                                key={activity.id}
                                href={`/faculty/history/${activity.id}`}
                                className="block p-4 hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium text-foreground group-hover:text-blue-600 transition-colors">

                                        {activity.subjectName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(activity.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5 text-green-600/80">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Present: {activity.present}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-red-600/80">
                                        <UserMinus className="w-3.5 h-3.5" />
                                        <span>Absent: {activity.absent}</span>
                                    </div>
                                    {activity.proxies > 0 && (
                                        <div className="flex items-center gap-1.5 text-orange-400/80">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                            <span>{activity.proxies} Proxy</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
