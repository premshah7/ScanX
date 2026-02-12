"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createSession(subjectId: number, batchIds?: number[]) {
    try {
        const userSession = await getServerSession(authOptions);
        if (userSession?.user.role !== "FACULTY") {
            return { error: "Unauthorized Access" };
        }
        const session = await prisma.session.create({
            data: {
                subjectId,
                isActive: true,
                batches: batchIds && batchIds.length > 0 ? {
                    connect: batchIds.map(id => ({ id }))
                } : undefined,
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
        const userSession = await getServerSession(authOptions);
        if (userSession?.user.role !== "FACULTY") {
            return { error: "Unauthorized Access" };
        }
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
    try {
        // Parallelize Counts (Lightweight)
        const [attendanceCount, proxyCount] = await Promise.all([
            prisma.attendance.count({ where: { sessionId } }),
            prisma.proxyAttempt.count({ where: { sessionId } })
        ]);

        // Parallelize Lists (Heavier) - Reduced limit to 20 to save bandwidth/DB load
        const [recentAttendance, recentProxies] = await Promise.all([
            prisma.attendance.findMany({
                where: { sessionId },
                orderBy: { timestamp: 'desc' },
                take: 20,
                include: {
                    student: {
                        include: { user: true }
                    }
                }
            }),
            prisma.proxyAttempt.findMany({
                where: { sessionId },
                orderBy: { timestamp: 'desc' },
                take: 20,
                include: {
                    student: {
                        include: { user: true }
                    },
                    deviceOwner: {
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
    } catch (error) {
        console.error("Error fetching session stats:", error);
        // Return fallback data to prevent UI crash
        return {
            attendanceCount: 0,
            proxyCount: 0,
            recentAttendance: [],
            recentProxies: []
        };
    }
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
                            include: {
                                user: true,
                                batch: true
                            }
                        },
                        batches: {
                            include: {
                                students: {
                                    include: {
                                        user: true,
                                        batch: true
                                    }
                                }
                            }
                        }
                    }
                },
                batches: true
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
        const presentStudentIds = new Set(attendance.map(a => a.studentId));
        const targetBatchIds = new Set(session.batches.map(b => b.id));

        // Merge Students from Subject Directly + Students from Subject's Batches
        const allStudentsMap = new Map<number, any>();

        // Add directly enrolled students
        session.subject.students.forEach(s => allStudentsMap.set(s.id, s));

        // Add students from batches associated with the subject
        session.subject.batches.forEach(b => {
            b.students.forEach(s => allStudentsMap.set(s.id, s));
        });

        const uniqueStudents = Array.from(allStudentsMap.values());

        console.log(`[DEBUG] Session ID: ${sessionId} | Subject: ${session.subject.name}`);
        console.log(`[DEBUG] Target Batches: ${[...targetBatchIds].join(", ") || "None (All Allowed)"}`);
        console.log(`[DEBUG] Total Unique Students: ${uniqueStudents.length}`);
        console.log(`[DEBUG] Present Students: ${presentStudentIds.size}`);

        // Filter enrolled students who are NOT in the present set AND match batch criteria
        const absentStudents = uniqueStudents.filter(
            student => {
                const isPresent = presentStudentIds.has(student.id);
                if (isPresent) return false; // Already present, not absent

                // Check Batch Eligibility
                // If session has specific batches, student MUST belong to one of them
                if (targetBatchIds.size > 0) {
                    return student.batchId && targetBatchIds.has(student.batchId);
                }

                return true;
            }
        ).map(student => ({
            rollNumber: student.rollNumber,
            name: student.user.name,
            email: student.user.email,
            batchName: student.batch?.name || "Unassigned"
        }));

        console.log(`[DEBUG] Calculated Absent Students: ${absentStudents.length}`);

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
