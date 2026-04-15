"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkSuperAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized Access: Super Admin only");
    }
    return session;
}

export async function getAdminUsers() {
    try {
        await checkSuperAdmin();
        return await prisma.user.findMany({
            where: {
                role: { in: ["ADMIN", "FACULTY", "SUPER_ADMIN"] }
            },
            orderBy: { createdAt: "desc" }
        });
    } catch (e) {
        return [];
    }
}

export async function toggleUserStatus(userId: number, currentStatus: string) {
    try {
        await checkSuperAdmin();
        const newStatus = currentStatus === "APPROVED" ? "PENDING" : "APPROVED";
        
        await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus as any }
        });
        
        revalidatePath("/super-admin/admins");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to toggle status" };
    }
}

export async function elevateToAdmin(userId: number) {
    try {
        await checkSuperAdmin();
        await prisma.user.update({
            where: { id: userId },
            data: { role: "ADMIN" }
        });
        revalidatePath("/super-admin/admins");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to elevate role" };
    }
}

export async function createAdminAccount(formData: FormData) {
    try {
        await checkSuperAdmin();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!name || !email || !password) {
            return { error: "All fields are required" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN",
                status: "APPROVED"
            }
        });
        
        revalidatePath("/super-admin/admins");
        return { success: true };
    } catch (error: any) {
        if (error.code === "P2002") return { error: "Email already exists" };
        return { error: error.message || "Failed to create admin" };
    }
}

export async function getPlatformAuditStats() {
    try {
        await checkSuperAdmin();
        const [totalEvents, totalStudents, totalAttendance] = await Promise.all([
            prisma.event.count(),
            prisma.student.count(),
            prisma.attendance.count(),
        ]);
        return { totalEvents, totalStudents, totalAttendance };
    } catch (e) {
        return { totalEvents: 0, totalStudents: 0, totalAttendance: 0 };
    }
}
