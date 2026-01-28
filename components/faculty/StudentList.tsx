"use client";

import { useState } from "react";
import { Search, GraduationCap, Smartphone, ShieldCheck, Layers, Hash } from "lucide-react";

type Student = {
    id: number;
    name: string;
    email: string;
    rollNumber: string;
    enrollmentNo: string;
    batchName: string;
    semester: number;
    deviceRegistered: boolean;
    attendancePercentage: number;
    attendedClasses: number;
    totalClasses: number;
};

export default function StudentList({ students }: { students: Student[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBatch, setFilterBatch] = useState("All");

    const uniqueBatches = Array.from(new Set(students.map(s => s.batchName)));

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBatch = filterBatch === "All" || student.batchName === filterBatch;

        return matchesSearch && matchesBatch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Name, Roll No, or Enrollment..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <select
                        className="w-full md:w-48 p-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={filterBatch}
                        onChange={(e) => setFilterBatch(e.target.value)}
                    >
                        <option value="All">All Batches</option>
                        {uniqueBatches.map(batch => (
                            <option key={batch} value={batch}>{batch}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 font-semibold text-muted-foreground">Student Details</th>
                                <th className="p-4 font-semibold text-muted-foreground">Roll Number</th>
                                <th className="p-4 font-semibold text-muted-foreground">Batch</th>
                                <th className="p-4 font-semibold text-muted-foreground">Attendance</th>
                                <th className="p-4 font-semibold text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">{student.name}</div>
                                                <div className="text-sm text-muted-foreground">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-mono text-foreground">{student.rollNumber}</div>
                                        <div className="text-xs text-muted-foreground">Enroll: {student.enrollmentNo}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{student.batchName}</span>
                                            <span className="text-xs text-muted-foreground">Sem {student.semester}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-full max-w-[120px]">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold ${student.attendancePercentage >= 75 ? "text-green-600" : "text-red-500"}`}>
                                                    {student.attendancePercentage}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${student.attendancePercentage >= 75 ? "bg-green-500" : "bg-red-500"}`}
                                                    style={{ width: `${student.attendancePercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {student.deviceRegistered ? (
                                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                                <Smartphone className="w-4 h-4" />
                                                Device Trusted
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-500 text-sm font-medium">
                                                <ShieldCheck className="w-4 h-4" />
                                                Not Registered
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No students found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
