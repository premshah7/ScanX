"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSession(subjectId: number) {
    try {
        const session = await prisma.session.create({
            data: {
                subjectId,
                isActive: true,
            },
        });
        revalidatePath("/faculty");
        return { success: true, sessionId: session.id };
    } catch (error) {
        console.error("Error creating session:", error);
        return { error: "Failed to create session" };
    }
}

export async function endSession(sessionId: number) {
    try {
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                isActive: false,
                endTime: new Date(),
            },
        });
        revalidatePath(`/faculty/session/${sessionId}`);
        revalidatePath("/faculty");
        return { success: true };
    } catch (error) {
        console.error("Error ending session:", error);
        return { error: "Failed to end session" };
    }
}

export async function getSessionStats(sessionId: number) {
    const [attendanceCount, proxyCount, recentAttendance, recentProxies] = await Promise.all([
        prisma.attendance.count({ where: { sessionId } }),
        prisma.proxyAttempt.count({ where: { sessionId } }),
        prisma.attendance.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: {
                student: {
                    include: { user: true }
                }
            }
        }),
        prisma.proxyAttempt.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: {
                student: {
                    include: { user: true }
                }
            }
        })
    ]);

    return {
        attendanceCount,
        proxyCount,
        recentAttendance,
        recentProxies
    };
}

export async function getSessionAttendance(sessionId: number) {
    try {
        // 1. Fetch Session with Subject and Enrolled Students
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                subject: {
                    include: {
                        students: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        if (!session) {
            return { error: "Session not found" };
        }

        // 2. Fetch Present Students (Attendance Records)
        const attendance = await prisma.attendance.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'asc' },
            include: {
                student: {
                    include: { user: true }
                }
            }
        });

        // 3. Calculate Absent Students
        // Get IDs of students who are present
        const presentStudentIds = new Set(attendance.map(a => a.studentId));

        // Filter enrolled students who are NOT in the present set
        const absentStudents = session.subject.students.filter(
            student => !presentStudentIds.has(student.id)
        ).map(student => ({
            rollNumber: student.rollNumber,
            name: student.user.name,
            email: student.user.email
        }));

        return {
            success: true,
            present: attendance,
            absent: absentStudents,
            subjectName: session.subject.name,
            date: session.startTime
        };
    } catch (error) {
        console.error("Error fetching session attendance:", error);
        return { error: "Failed to fetch attendance records" };
    }
}
