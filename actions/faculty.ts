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
                        where: { isActive: false },
                        select: { id: true }
                    },
                    students: {
                        include: { user: true }
                    },
                    batches: {
                        include: {
                            students: {
                                include: { user: true }
                            }
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

        const sessionIds = subject.sessions.map(s => s.id);

        // Merge direct and batch students
        const allStudents = [
            ...subject.students,
            ...subject.batches.flatMap(b => b.students)
        ];

        // Deduplicate students by ID
        const uniqueStudentsMap = new Map();
        allStudents.forEach(s => uniqueStudentsMap.set(s.id, s));
        const uniqueStudents = Array.from(uniqueStudentsMap.values());
        const studentIds = uniqueStudents.map(s => s.id);

        if (studentIds.length === 0) continue;

        // Optimized: Fetch counts from DB
        const attendanceCounts = await prisma.attendance.groupBy({
            by: ['studentId'],
            where: {
                sessionId: { in: sessionIds },
                studentId: { in: studentIds }
            },
            _count: { sessionId: true }
        });

        // Create a lookup map for attendance counts
        const attendanceMap = new Map();
        attendanceCounts.forEach(a => attendanceMap.set(a.studentId, a._count.sessionId));

        for (const student of uniqueStudents) {
            const attendedCount = attendanceMap.get(student.id) || 0;
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
                        select: {
                            id: true,
                            _count: { select: { attendances: true } }
                        }
                    },
                    students: { select: { id: true } },
                    batches: {
                        include: {
                            students: { select: { id: true } }
                        }
                    }
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
        // Count unique students (Direct + Batches)
        subject.students.forEach(s => uniqueStudentIds.add(s.id));
        subject.batches.forEach(b => b.students.forEach(s => uniqueStudentIds.add(s.id)));

        // Count sessions
        totalSessions += subject.sessions.length;

        // Calculate attendance metrics
        // We need the number of students *for this subject*
        const subjectStudentIds = new Set<number>();
        subject.students.forEach(s => subjectStudentIds.add(s.id));
        subject.batches.forEach(b => b.students.forEach(s => subjectStudentIds.add(s.id)));
        const subjectStudentCount = subjectStudentIds.size;

        if (subjectStudentCount > 0) {
            subject.sessions.forEach(session => {
                totalAttendanceCount += session._count.attendances;
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
            subjects: { select: { id: true } }
        }
    });

    if (!faculty) return { trend: [], recentActivity: [], proxyStats: { verified: 0, suspicious: 0 } };

    const subjectIds = faculty.subjects.map(s => s.id);

    // 1. Recent Activity (Fetch only top 5 directly)
    const recentSessions = await prisma.session.findMany({
        where: {
            subjectId: { in: subjectIds },
            isActive: false
        },
        orderBy: { startTime: 'desc' },
        take: 5,
        select: {
            id: true,
            startTime: true,
            subject: {
                select: {
                    name: true,
                    _count: { select: { students: true } },
                    batches: {
                        select: {
                            _count: { select: { students: true } }
                        }
                    }
                }
            },
            _count: {
                select: { attendances: true, proxyAttempts: true }
            }
        }
    });

    const recentActivity = recentSessions.map(session => {
        const directStudents = session.subject._count.students;
        const batchStudents = session.subject.batches.reduce((acc, b) => acc + b._count.students, 0);
        const totalStudents = directStudents + batchStudents;

        return {
            id: session.id,
            subjectName: session.subject.name,
            date: session.startTime,
            present: session._count.attendances,
            absent: totalStudents - session._count.attendances,
            proxies: session._count.proxyAttempts,
            total: totalStudents
        };
    });

    // 2. Proxy Stats
    const [verifiedCount, suspiciousCount] = await Promise.all([
        prisma.attendance.count({
            where: { session: { subjectId: { in: subjectIds } } }
        }),
        prisma.proxyAttempt.count({
            where: { session: { subjectId: { in: subjectIds } } }
        })
    ]);

    const proxyStats = {
        verified: verifiedCount,
        suspicious: suspiciousCount
    };

    // 3. Attendance Trend (Optimized: Fetch last 20 sessions to build 7-day trend)
    // Instead of fetching EVERYTHING, we just fetch the last 20 sessions which is usually enough to cover 7 days.
    const trendSessions = await prisma.session.findMany({
        where: {
            subjectId: { in: subjectIds },
            isActive: false
        },
        orderBy: { startTime: 'desc' },
        take: 20,
        select: {
            startTime: true,
            subject: {
                select: {
                    name: true,
                    _count: { select: { students: true } },
                    batches: { select: { _count: { select: { students: true } } } }
                }
            },
            _count: { select: { attendances: true } }
        }
    });

    const uniqueDateSessions = [];
    const seenDates = new Set();

    for (const session of trendSessions) {
        const dateStr = new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            // @ts-ignore
            session.dateStr = dateStr;
            uniqueDateSessions.push(session);
        }
        if (uniqueDateSessions.length >= 7) break;
    }

    const trend = uniqueDateSessions.map(session => {
        const directStudents = session.subject._count.students;
        const batchStudents = session.subject.batches.reduce((acc, b) => acc + b._count.students, 0);
        const totalStudents = directStudents + batchStudents;

        const percentage = totalStudents > 0
            ? (session._count.attendances / totalStudents) * 100
            : 0;

        return {
            // @ts-ignore
            date: session.dateStr,
            percentage: Math.round(percentage),
            subject: session.subject.name,
            present: session._count.attendances,
            absent: totalStudents - session._count.attendances
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

export async function getFacultyBatches(email: string) {
    if (!email) return { batches: [] };

    const faculty = await prisma.faculty.findFirst({
        where: { user: { email } },
        include: {
            batches: {
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { students: true }
                    }
                }
            }
        }
    });

    if (!faculty) return { batches: [] };
    return { batches: faculty.batches };
}
