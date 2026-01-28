"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { Activity, ShieldAlert } from "lucide-react";

type GlobalAnalyticsProps = {
    trend: { date: string; percentage: number }[];
    security: { date: string; verified: number; suspicious: number }[];
};

export default function GlobalAnalytics({ trend, security }: GlobalAnalyticsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 1. Global Attendance Trend */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-[350px] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Campus Attendance Trend
                    </h3>
                    <span className="text-xs text-muted-foreground">Last 30 Days</span>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                        <AreaChart data={trend}>
                            <defs>
                                <linearGradient id="colorGlobal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                                tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#111827' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="percentage"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorGlobal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Security Overview (Verified vs Suspicious) */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-[350px] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-orange-600" />
                        Security Overview
                    </h3>
                    <span className="text-xs text-muted-foreground">Last 14 Days</span>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                        <BarChart data={security}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px', color: '#374151' }} />
                            <Bar dataKey="verified" name="Verified Sessions" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="suspicious" name="Proxy Attempts" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
