"use client";

import { TrendingUp, ShieldCheck, Info } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

type AnalyticsWidgetsProps = {
    analytics: {
        trend: { date: string; percentage: number; subject: string }[];
        proxyStats: { verified: number; suspicious: number };
    };
};

export default function AnalyticsWidgets({ analytics }: AnalyticsWidgetsProps) {
    const { trend, proxyStats } = analytics;

    // Process proxy data for Pie Chart
    const proxyData = [
        { name: 'Verified', value: proxyStats.verified },
        { name: 'Suspicious', value: proxyStats.suspicious },
    ];
    const COLORS = ['#22c55e', '#ef4444']; // Green, Red
    const totalChecks = proxyStats.verified + proxyStats.suspicious;
    const reliabilityScore = totalChecks > 0
        ? Math.round((proxyStats.verified / totalChecks) * 100)
        : 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trend Graph - Recharts AreaChart */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-[300px] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Attendance Trend
                    </h3>
                    <span className="text-xs text-muted-foreground">Last 7 Sessions</span>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trend}>
                            <defs>
                                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#111827' }}
                                labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="percentage"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAttendance)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Proxy Meter - Recharts PieChart */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-[300px] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        System Reliability
                    </h3>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={proxyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {proxyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#111827' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-3xl font-bold text-foreground">{reliabilityScore}%</div>
                        <div className="text-xs text-muted-foreground uppercase">Secure</div>
                    </div>
                </div>

                <div className="flex justify-center gap-8 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{proxyStats.verified}</span>
                            <span className="text-xs text-muted-foreground">Verified</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{proxyStats.suspicious}</span>
                            <span className="text-xs text-muted-foreground">Suspicious</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
