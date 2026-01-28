import { AlertTriangle, Mail } from "lucide-react";
import { Defaulter } from "@/actions/faculty";

export default function DefaultersList({ defaulters }: { defaulters: Defaulter[] }) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-bold text-lg text-foreground">Defaulters Watchlist</h3>
                </div>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {defaulters.length} At Risk
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                {defaulters.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No students below 75% attendance.</p>
                        <p className="text-xs mt-1">Good job!</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="p-4">Student</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4 text-right">Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {defaulters.map((d, i) => (
                                <tr key={`${d.rollNumber}-${d.subjectName}-${i}`} className="hover:bg-muted/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{d.studentName}</div>
                                        <div className="text-xs text-muted-foreground">{d.rollNumber}</div>
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {d.subjectName}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className={`font-bold ${d.percentage < 50 ? 'text-red-600' : 'text-orange-500'}`}>
                                            {d.percentage}%
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {d.sessionsAttended}/{d.totalSessions}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
