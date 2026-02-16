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
        // Parallelize checks and hashing for speed
        const [existingUser, existingRoll, existingEnroll, hashedPassword] = await Promise.all([
            prisma.user.findUnique({ where: { email: data.email } }),
            prisma.student.findUnique({ where: { rollNumber: data.rollNumber } }),
            prisma.student.findUnique({ where: { enrollmentNo: data.enrollmentNo } }),
            bcrypt.hash(data.password, 10)
        ]);

        if (existingUser) return { error: "Email already registered" };
        if (existingRoll) return { error: "Roll Number already registered" };
        if (existingEnroll) return { error: "Enrollment Number already registered" };

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

export async function registerGuest(data: {
    name: string;
    username: string;
    password?: string;
    phone?: string;
}) {
    if (!data.name || !data.username) {
        return { error: "Name and Username are required" };
    }

    try {
        const { randomUUID } = await import("crypto");
        const passwordToHash = data.password || randomUUID();

        // Parallelize checks and hashing
        const [existingUser, existingPhone, hashedPassword] = await Promise.all([
            prisma.user.findUnique({ where: { username: data.username } }),
            data.phone ? prisma.user.findUnique({ where: { phoneNumber: data.phone } }) : Promise.resolve(null),
            bcrypt.hash(passwordToHash, 10)
        ]);

        if (existingUser) return { error: "Username already taken" };
        if (existingPhone) return { error: "Phone number already registered" };

        // Dummy email for uniqueness constraint
        const email = `guest_${data.username.toLowerCase().replace(/\s+/g, '')}@event.scanx.local`;

        await prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                phoneNumber: data.phone || null,
                email: email,
                password: hashedPassword,
                role: "GUEST",
                status: "APPROVED",
                student: {
                    create: {
                        rollNumber: `GUEST-${data.username.toUpperCase().slice(0, 10)}`,
                        enrollmentNo: `EVT-${randomUUID().slice(0, 8).toUpperCase()}`,
                        batchId: null,
                    }
                }
            }
        });

        return { success: true };

    } catch (error) {
        console.error("Guest Registration Error:", error);
        return { error: "Failed to register guest" };
    }
}
