"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getOrSetDeviceId() {
    const cookieStore = await cookies();
    let deviceId = cookieStore.get("device_id")?.value;

    if (!deviceId) {
        // Generate new ID if not present
        deviceId = uuidv4();

        // Set HttpOnly Cookie
        cookieStore.set("device_id", deviceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        });
    }

    try {
        const session = await getServerSession(authOptions);
        if (session && session.user.role === "STUDENT") {
            const student = await prisma.student.findUnique({
                where: { userId: Number(session.user.id) },
                select: { id: true, deviceId: true }
            });
            if (student) {
                if (!student.deviceId) {
                    await prisma.student.update({
                        where: { id: student.id },
                        data: { deviceId }
                    });
                }
                cookieStore.set("device_owner_student_id", student.id.toString(), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 365 * 10,
                });
            }
        }
    } catch (e) {
        console.warn("Failed to sync device owner in getOrSetDeviceId", e);
    }

    return deviceId;
}

export async function setDeviceOwnerCookie(studentId: number) {
    try {
        const cookieStore = await cookies();
        cookieStore.set("device_owner_student_id", studentId.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        });
    } catch (e) {
        console.error("Failed to set device owner cookie", e);
    }
}
