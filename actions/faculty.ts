"use server";

import { prisma } from "@/lib/prisma";

export type Defaulter = {
    studentName: string;
    rollNumber: string;
    subjectName: string;
    percentage: number;
    sessionsAttended: number;
    totalSessions: number;
};

export async function getFacultyDefaulters(email: string): Promise<Defaulter[]> {
    if (!email) return [];

    const faculty = await prisma.faculty.findFirst({
        where: { user: { email } },
        include: {
            subjects: {
                include: {
                    sessions: {
                        where: { isActive: false }
                    },
                    students: {
                        include: {
                            user: true,
                            attendances: true
                        }
                    }
                }
            }
        }
    });

    if (!faculty) return [];

    const defaulters: Defaulter[] = [];

    for (const subject of faculty.subjects) {
        const totalSessions = subject.sessions.length;
        if (totalSessions === 0) continue;

        const sessionIds = new Set(subject.sessions.map(s => s.id));

        for (const student of subject.students) {
            const attendedCount = student.attendances.filter(a =>
                sessionIds.has(a.sessionId)
            ).length;

            const percentage = (attendedCount / totalSessions) * 100;

            if (percentage < 75) {
                defaulters.push({
                    studentName: student.user.name,
                    rollNumber: student.rollNumber,
                    subjectName: subject.name,
                    percentage: parseFloat(percentage.toFixed(1)),
                    sessionsAttended: attendedCount,
                    totalSessions: totalSessions
                });
            }
        }
    }

    return defaulters;
}

export async function getFacultyStats(email: string) {
    if (!email) return { totalStudents: 0, totalSessions: 0, averageAttendance: 0 };

    const faculty = await prisma.faculty.findFirst({
        where: { user: { email } },
        include: {
            subjects: {
                include: {
                    sessions: {
                        include: {
                            attendances: true
                        }
                    },
                    students: true
                }
            }
        }
    });

    if (!faculty) return { totalStudents: 0, totalSessions: 0, averageAttendance: 0 };

    const uniqueStudentIds = new Set<number>();
    let totalSessions = 0;
    let totalAttendanceCount = 0;
    let totalPossibleAttendance = 0;

    faculty.subjects.forEach(subject => {
        // Count unique students
        subject.students.forEach(s => uniqueStudentIds.add(s.id));

        // Count sessions
        totalSessions += subject.sessions.length;

        // Calculate attendance metrics
        const subjectStudentCount = subject.students.length;
        if (subjectStudentCount > 0) {
            subject.sessions.forEach(session => {
                totalAttendanceCount += session.attendances.length;
                totalPossibleAttendance += subjectStudentCount;
            });
        }
    });

    const averageAttendance = totalPossibleAttendance > 0
        ? (totalAttendanceCount / totalPossibleAttendance) * 100
        : 0;

    return {
        totalStudents: uniqueStudentIds.size,
        totalSessions,
        averageAttendance: parseFloat(averageAttendance.toFixed(1))
    };
}

export async function getFacultySubjects(email: string) {
    if (!email) return [];

    const faculty = await prisma.faculty.findFirst({
        where: { user: { email } },
        include: {
            subjects: {
                include: {
                    sessions: {
                        where: { isActive: true }
                    },
                    _count: {
                        select: { sessions: true }
                    }
                }
            }
        }
    });

    if (!faculty) return [];

    return faculty.subjects.map(sub => ({
        id: sub.id,
        name: sub.name,
        totalStudents: sub.totalStudents,
        totalSessions: sub._count.sessions,
        activeSessions: sub.sessions.length
    }));
}

export async function getFacultyHistory(email: string) {
    if (!email) return [];

    const faculty = await prisma.faculty.findFirst({
        where: { user: { email } },
        include: {
            subjects: {
                include: {
                    sessions: {
                        where: { isActive: false },
                        orderBy: { startTime: 'desc' },
                        include: {
                            _count: {
                                select: { attendances: true, proxyAttempts: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!faculty) return [];

    // Flatten sessions
    const history = faculty.subjects.flatMap(subject =>
        subject.sessions.map(session => ({
            id: session.id,
            subjectName: subject.name,
            startTime: session.startTime,
            endTime: session.endTime,
            attendanceCount: session._count.attendances,
            proxyCount: session._count.proxyAttempts
        }))
    ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return history;
}

export async function getFacultyAnalytics(email: string) {
    if (!email) return { trend: [], recentActivity: [], proxyStats: { verified: 0, suspicious: 0 } };

    const faculty = await prisma.faculty.findFirst({
        where: { user: { email } },
        include: {
            subjects: {
                include: {
                    sessions: {
                        where: { isActive: false },
                        orderBy: { startTime: 'desc' },
                        take: 10,
                        include: {
                            _count: {
                                select: { attendances: true, proxyAttempts: true }
                            },
                            attendances: true
                        }
                    },
                    students: true
                }
            }
        }
    });

    if (!faculty) return { trend: [], recentActivity: [], proxyStats: { verified: 0, suspicious: 0 } };

    const allSessions = faculty.subjects.flatMap(sub =>
        sub.sessions.map(s => ({
            ...s,
            subjectName: sub.name,
            totalStudents: sub.students.length
        }))
    ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const recentActivity = allSessions.slice(0, 5).map(session => ({
        id: session.id,
        subjectName: session.subjectName,
        date: session.startTime,
        present: session._count.attendances,
        absent: session.totalStudents - session._count.attendances,
        proxies: session._count.proxyAttempts,
        total: session.totalStudents
    }));

    // 2. Proxy Stats (Aggregate count of Attendance vs ProxyAttempts)
    const verifiedCount = await prisma.attendance.count({
        where: {
            session: {
                subject: { facultyId: faculty.id }
            }
        }
    });

    const suspiciousCount = await prisma.proxyAttempt.count({
        where: {
            session: {
                subject: { facultyId: faculty.id }
            }
        }
    });

    const proxyStats = {
        verified: verifiedCount,
        suspicious: suspiciousCount
    };

    // 3. Attendance Trend (Last 7 sessions sorted by date)
    const trend = allSessions.slice(0, 7).map(session => {
        const percentage = session.totalStudents > 0
            ? (session.attendances.length / session.totalStudents) * 100
            : 0;
        return {
            date: new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            percentage: Math.round(percentage),
            subject: session.subjectName
        };
    }).reverse();

    return {
        recentActivity,
        proxyStats,
        trend
    };
}

export async function getFacultyStudents(email: string) {
    if (!email) return [];

    const faculty = await prisma.faculty.findFirst({
        where: { user: { email } },
        include: {
            batches: {
                select: { id: true }
            },
            subjects: {
                include: {
                    sessions: {
                        select: { id: true }
                    }
                }
            }
        }
    });

    if (!faculty || faculty.batches.length === 0) return [];

    const batchIds = faculty.batches.map(b => b.id);

    // Get all valid session IDs for this faculty
    const facultySessionIds = new Set(
        faculty.subjects.flatMap(s => s.sessions.map(sess => sess.id))
    );
    const totalSessions = facultySessionIds.size;

    const students = await prisma.student.findMany({
        where: {
            batchId: { in: batchIds }
        },
        include: {
            user: { select: { name: true, email: true } },
            batch: { select: { name: true } },
            attendances: {
                where: {
                    sessionId: { in: Array.from(facultySessionIds) }
                },
                select: { sessionId: true }
            }
        },
        orderBy: { rollNumber: 'asc' }
    });

    return students.map(student => {
        const attendedCount = student.attendances.length;
        const percentage = totalSessions > 0
            ? Math.round((attendedCount / totalSessions) * 100)
            : 0;

        return {
            id: student.id,
            name: student.user.name,
            email: student.user.email,
            rollNumber: student.rollNumber,
            enrollmentNo: student.enrollmentNo,
            batchName: student.batch?.name || "Unassigned",
            semester: student.semester,
            deviceRegistered: !!student.deviceHash,
            attendancePercentage: percentage,
            attendedClasses: attendedCount,
            totalClasses: totalSessions
        };
    });
}
