"use server";

import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createFaculty(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const batchIdsRaw = formData.get("batchIds") as string;
    const batchIds: number[] = batchIdsRaw ? JSON.parse(batchIdsRaw) : [];

    if (!name || !email || !password) {
        return { error: "All fields are required" };
    }

    const session = await getServerSession(authOptions);
    if (session?.user.role !== "ADMIN") {
        return { error: "Unauthorized Access" };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: UserRole.FACULTY,
                },
            });

            await tx.faculty.create({
                data: {
                    userId: user.id,
                    batches: {
                        connect: batchIds.map((id) => ({ id })),
                    },
                },
            });
        });

        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating faculty:", error);
        if (error.code === "P2002") {
            return { error: "Email already exists" };
        }
        return { error: "Failed to create faculty" };
    }
}


export async function updateFaculty(facultyId: number, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const batchIdsRaw = formData.get("batchIds") as string;
    const batchIds: number[] = batchIdsRaw ? JSON.parse(batchIdsRaw) : [];

    const session = await getServerSession(authOptions);
    if (session?.user.role !== "ADMIN") {
        return { error: "Unauthorized Access" };
    }

    try {
        const faculty = await prisma.faculty.findUnique({
            where: { id: facultyId },
            include: { user: true }
        });

        if (!faculty) return { error: "Faculty not found" };

        if (email !== faculty.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) return { error: "Email already in use" };
        }

        const userData: any = {
            name,
            email
        };

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(password, salt);
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: faculty.userId },
                data: userData
            });

            await tx.faculty.update({
                where: { id: facultyId },
                data: {
                    batches: {
                        set: batchIds.map(id => ({ id }))
                    }
                }
            });
        });

        revalidatePath("/admin/faculty");
        return { success: true };

    } catch (error) {
        console.error("Error updating faculty:", error);
        return { error: "Failed to update faculty" };
    }
}

export async function createStudent(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rollNumber = formData.get("rollNumber") as string;
    const enrollmentNo = formData.get("enrollmentNo") as string;
    const batchId = formData.get("batchId") as string;
    const semester = formData.get("semester") as string;

    if (!name || !email || !password || !rollNumber || !enrollmentNo) {
        return { error: "All fields are required" };
    }

    const session = await getServerSession(authOptions);
    if (session?.user.role !== "ADMIN") {
        return { error: "Unauthorized Access" };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: UserRole.STUDENT,
                },
            });

            await tx.student.create({
                data: {
                    userId: user.id,
                    rollNumber,
                    enrollmentNo,
                    batchId: batchId ? parseInt(batchId) : null,
                    semester: semester ? parseInt(semester) : 1,
                },
            });
        });

        revalidatePath("/admin/students");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating student:", error);
        if (error.code === "P2002") {
            return { error: "Email, Roll Number, or Enrollment No already exists" };
        }
        return { error: "Failed to create student" };
    }
}

export async function resetDevice(studentId: number) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user.role !== "ADMIN") {
            return { error: "Unauthorized Access" };
        }
        await prisma.student.update({
            where: { id: studentId },
            data: {
                deviceHash: null,
                isDeviceResetRequested: false,
            },
        });
        revalidatePath("/admin/students");
        revalidatePath("/student");
        return { success: true };
    } catch (error) {
        console.error("Error resetting device:", error);
        return { error: "Failed to reset device" };
    }
}

export async function deleteUsers(userIds: number[]) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user.role !== "ADMIN") {
            return { error: "Unauthorized Access" };
        }
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: userIds,
                },
            },
        });

        revalidatePath("/admin/faculty");
        revalidatePath("/admin/students");
        return { success: true };
    } catch (error) {
        console.error("Error deleting users:", error);
        return { error: "Failed to delete users" };
    }
}

export async function getGlobalAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all finished sessions in last 30 days
    const sessions = await prisma.session.findMany({
        where: {
            startTime: { gte: thirtyDaysAgo },
            isActive: false
        },
        include: {
            _count: {
                select: { attendances: true }
            },
            subject: {
                select: { totalStudents: true }
            }
        },
        orderBy: { startTime: 'asc' }
    });

    // Group by date and calculate average attendance
    const dailyStats = new Map<string, { total: number; present: number }>();

    sessions.forEach(session => {
        const date = session.startTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (!dailyStats.has(date)) {
            dailyStats.set(date, { total: 0, present: 0 });
        }
        const stat = dailyStats.get(date)!;
        stat.total += session.subject.totalStudents;
        stat.present += session._count.attendances;
    });

    const trend = Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date,
        percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }));

    return trend;
}

export async function getSecurityOverview() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // 1. Daily Verified Count
    const attendances = await prisma.attendance.findMany({
        where: { timestamp: { gte: fourteenDaysAgo } },
        select: { timestamp: true }
    });

    const proxies = await prisma.proxyAttempt.findMany({
        where: { timestamp: { gte: fourteenDaysAgo } },
        select: { timestamp: true }
    });

    const dailyMap = new Map<string, { verified: number; suspicious: number }>();

    // Helper to init map entry
    const getEntry = (date: string) => {
        if (!dailyMap.has(date)) dailyMap.set(date, { verified: 0, suspicious: 0 });
        return dailyMap.get(date)!;
    };

    attendances.forEach(a => {
        const date = a.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        getEntry(date).verified++;
    });

    proxies.forEach(p => {
        const date = p.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        getEntry(date).suspicious++;
    });

    // Fill last 14 days
    const result = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const stats = dailyMap.get(dateStr) || { verified: 0, suspicious: 0 };
        result.push({ date: dateStr, ...stats });
    }

    return result;
}

export async function getActiveSessions() {
    return await prisma.session.findMany({
        where: { isActive: true },
        include: {
            subject: {
                include: {
                    faculty: {
                        include: { user: true }
                    }
                }
            },
            _count: {
                select: { attendances: true, proxyAttempts: true }
            }
        },
        orderBy: { startTime: 'desc' }
    });
}