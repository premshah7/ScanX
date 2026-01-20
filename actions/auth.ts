"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerStudent(data: {
    name: string;
    email: string;
    password: string;
    rollNumber: string;
    enrollmentNo: string;
    batchId?: number;
}) {
    if (!data.name || !data.email || !data.password || !data.rollNumber || !data.enrollmentNo) {
        return { error: "All fields are required" };
    }

    try {
        // 1. Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            return { error: "Email already registered" };
        }

        // 2. Check if roll number exists
        const existingRoll = await prisma.student.findUnique({
            where: { rollNumber: data.rollNumber }
        });
        if (existingRoll) {
            return { error: "Roll Number already registered" };
        }

        // 3. Check if enrollment number exists
        const existingEnroll = await prisma.student.findUnique({
            where: { enrollmentNo: data.enrollmentNo }
        });
        if (existingEnroll) {
            return { error: "Enrollment Number already registered" };
        }

        // 4. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // 5. Create User and Student
        // Prisma transaction to ensure consistency
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: "STUDENT",
                    status: "PENDING"
                }
            });

            await tx.student.create({
                data: {
                    userId: user.id,
                    rollNumber: data.rollNumber,
                    enrollmentNo: data.enrollmentNo,
                    batchId: data.batchId ? parseInt(data.batchId.toString()) : null
                }
            });
        });

        // revalidatePath("/"); // Optional?
        return { success: true };

    } catch (error) {
        console.error("Registration Error:", error);
        return { error: "Failed to register. Please try again." };
    }
}
