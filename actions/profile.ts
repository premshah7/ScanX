"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type StudentUpdateData = {
    name: string;
    email: string;
    rollNumber: string;
    enrollmentNo: string;
    password?: string;
};

type FacultyUpdateData = {
    name: string;
    email: string;
    password?: string;
};

export async function updateStudentProfile(studentId: number, data: StudentUpdateData) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    try {
        // Fetch student to verify ownership if not admin
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });

        if (!student) return { error: "Student not found" };

        const isAdmin = session.user.role === "ADMIN";
        const isOwner = session.user.role === "STUDENT" && parseInt(session.user.id) === student.userId;

        if (!isAdmin && !isOwner) {
            return { error: "You are not authorized to edit this profile" };
        }

        // Validate unique constraints (Email, Roll, Enrollment)

        // 1. Check Email uniqueness if changed
        if (data.email !== student.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
            if (existingUser) return { error: "Email already in use" };
        }

        // 2. Check Roll No uniqueness if changed
        if (data.rollNumber !== student.rollNumber) {
            const existing = await prisma.student.findUnique({ where: { rollNumber: data.rollNumber } });
            if (existing) return { error: "Roll Number already exists" };
        }

        // 3. Check Enrollment No uniqueness if changed
        if (data.enrollmentNo !== student.enrollmentNo) {
            const existing = await prisma.student.findUnique({ where: { enrollmentNo: data.enrollmentNo } });
            if (existing) return { error: "Enrollment Number already exists" };
        }

        const userData: any = {
            name: data.name,
            email: data.email
        };

        if (data.password && data.password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(data.password, salt);
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: student.userId },
                data: userData
            }),
            prisma.student.update({
                where: { id: studentId },
                data: {
                    rollNumber: data.rollNumber,
                    enrollmentNo: data.enrollmentNo
                }
            })
        ]);

        revalidatePath("/admin/students");
        revalidatePath("/student");
        return { success: true };

    } catch (error: any) {
        console.error("Update Profile Error:", error);
        return { error: "Failed to update profile" };
    }
}

export async function updateFacultyProfile(facultyId: number, data: FacultyUpdateData) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    if (session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const faculty = await prisma.faculty.findUnique({
            where: { id: facultyId },
            include: { user: true }
        });

        if (!faculty) return { error: "Faculty not found" };

        if (data.email !== faculty.user.email) {
            const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
            if (existingUser) return { error: "Email already in use" };
        }

        const userData: any = {
            name: data.name,
            email: data.email
        };

        if (data.password && data.password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(data.password, salt);
        }

        await prisma.user.update({
            where: { id: faculty.userId },
            data: userData
        });

        revalidatePath("/admin/faculty");
        return { success: true };

    } catch (error) {
        console.error("Update Faculty Error:", error);
        return { error: "Failed to update faculty" };
    }
}
