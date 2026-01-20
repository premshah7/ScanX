"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateIp } from "@/lib/ipCheck";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";

export async function markAttendance(token: string, deviceHash: string, userAgent: string) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
        return { error: "Unauthorized" };
    }

    const studentId = parseInt(session.user.id);

    // 1. Parse Token
    const [sessionIdStr, timestampStr] = token.split(":");
    const sessionId = parseInt(sessionIdStr);
    const timestamp = parseInt(timestampStr);

    if (isNaN(sessionId) || isNaN(timestamp)) {
        return { error: "Invalid QR Codes" };
    }

    // 2. Get IP
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] ||
        headerList.get("x-real-ip") ||
        "unknown";

    // 3. Get Session & Student
    const [dbSession, student] = await Promise.all([
        prisma.session.findUnique({ where: { id: sessionId } }),
        prisma.student.findUnique({ where: { userId: studentId } }),
    ]);

    if (!dbSession || !dbSession.isActive) {
        return { error: "Session is not active" };
    }

    if (!student) {
        return { error: "Student record not found" };
    }

    // 4. Check if already marked
    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            studentId: student.id,
            sessionId: sessionId,
        },
    });

    if (existingAttendance) {
        return { error: "Attendance already marked", success: true };
    }

    // --- NEW: GLOBAL DEVICE OWNERSHIP CHECK ---
    // Check if this device is already registered to another student.
    // This prevents shared devices even if the current student isn't bound yet.
    const deviceOwner = await prisma.student.findFirst({
        where: {
            deviceHash: deviceHash,
            id: { not: student.id } // Exclude self
        },
        include: { user: true }
    });

    if (deviceOwner) {
        // Log Proxy Attempt (The current student is trying to use someone else's device)
        await prisma.proxyAttempt.create({
            data: {
                studentId: student.id,
                sessionId: sessionId,
                attemptedHash: deviceHash,
                deviceOwnerId: deviceOwner.id // Record the victim
            },
        });

        return { error: "Device Verification Failed! This device is linked to another account. Proxy attempt recorded." };
    }

    // 5. IP Validation (Prefix Check)
    // Delegated to shared utility for consistent logging & checking
    const isIpValid = await validateIp();
    if (!isIpValid) {
        return { error: "You are not connected to the required network (IP Mismatch)." };
    }


    // 6. Device Validation (Anti-Proxy)
    let isProxy = false;

    if (!student.deviceHash) {
        // --- HEURISTIC REMOVED: Caused false positives for students on same WiFi ---
        /*
        const recentSharedActivity = await prisma.attendance.findFirst({
            where: {
                sessionId: sessionId,
                ipAddress: ip,
                userAgent: userAgent,
                studentId: { not: student.id }
            }
        });

        if (recentSharedActivity) {
            return { error: "Suspicious activity detected. You cannot use a device that was just used by another student." };
        }
        */


        // Bind Device (First time)
        await prisma.student.update({
            where: { id: student.id },
            data: { deviceHash: deviceHash },
        });
    } else if (student.deviceHash !== deviceHash) {
        // Mismatch!
        isProxy = true;
    }

    if (isProxy) {
        // Log Proxy Attempt
        await prisma.proxyAttempt.create({
            data: {
                studentId: student.id,
                sessionId: sessionId,
                attemptedHash: deviceHash,
            },
        });
        return { error: "Device Verification Failed! Proxy attempt recorded." };
    }

    // 7. Mark Attendance
    await prisma.attendance.create({
        data: {
            studentId: student.id,
            sessionId: sessionId,
            userAgent: userAgent,
            ipAddress: ip,
        },
    });

    revalidatePath("/student");
    return { success: true };
}
