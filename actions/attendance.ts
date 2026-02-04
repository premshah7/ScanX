"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateIp } from "@/lib/ipCheck";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";

export async function markAttendance(token: string, deviceHash: string, deviceId: string, userAgent: string) {
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
        prisma.student.findUnique({
            where: { userId: studentId },
            include: { user: true }
        }),
    ]);

    if (!dbSession || !dbSession.isActive) {
        return { error: "Session is not active" };
    }

    if (!student) {
        return { error: "Student record not found" };
    }

    // --- NEW: GLOBAL DEVICE OWNERSHIP CHECK (Sticky ID + Fingerprint) ---
    console.log(`[Attendance Debug] User: ${student.user.email} | Hash: ${deviceHash} | ID: ${deviceId}`);

    // Check if this device is already registered to another student.
    // We check BOTH the hardware fingerprint AND the persistent browser ID.
    const deviceOwner = await prisma.student.findFirst({
        where: {
            OR: [
                { deviceHash: deviceHash }, // Hardware match
                { deviceId: deviceId }      // Sticky ID match (Shared Browser Exploit)
            ],
            id: { not: student.id } // Exclude self
        },
        include: { user: true }
    });

    if (deviceOwner) {
        console.log(`[Attendance Debug] Device Owner Found: ${deviceOwner.user.email} (ID: ${deviceOwner.id})`);
        // Determine what matched for better logging
        const isStickyMatch = deviceOwner.deviceId === deviceId;
        const logHash = isStickyMatch ? `ID:${deviceId}` : `HASH:${deviceHash}`;

        // Log Proxy Attempt
        // Log Proxy Attempt (Upsert Logic)
        const existingProxy = await prisma.proxyAttempt.findFirst({
            where: {
                studentId: student.id,
                sessionId: sessionId
            }
        });

        if (existingProxy) {
            await prisma.proxyAttempt.update({
                where: { id: existingProxy.id },
                data: {
                    attemptedHash: logHash,
                    deviceOwnerId: deviceOwner.id,
                    timestamp: new Date()
                }
            });
        } else {
            await prisma.proxyAttempt.create({
                data: {
                    studentId: student.id,
                    sessionId: sessionId,
                    attemptedHash: logHash,
                    deviceOwnerId: deviceOwner.id
                },
            });
        }

        return { error: "Device Verification Failed! This device is linked to another account." };
    }

    // 5. Smart IP Lock & Validation
    const settings = await prisma.systemSettings.findFirst();
    const allowedPrefix = settings?.allowedIpPrefix || "";
    const isIpCheckEnabled = settings?.isIpCheckEnabled || false;

    // A. Strict Campus Check (If enabled)
    if (isIpCheckEnabled && allowedPrefix && !ip.startsWith(allowedPrefix)) {
        return { error: "You are not connected to the Office/Campus Network." };
    }

    // B. Heuristic Proxy Lock (For Non-Campus/VPN/Mobile Data)
    // If we are NOT enforcing strictly (or even if we are, and they are on a sub-network),
    // we want to prevent 1 IP from marking for 2 people unless it's the known massive-shared range.

    // Logic: If current IP is NOT the main campus range (or if no range defined), 
    // we treat it as potentially "personal" (Mobile Data/VPN).
    // On Personal IPs, we STRICTLY forbid sharing.

    const isCampusIp = allowedPrefix && ip.startsWith(allowedPrefix);

    /*
    if (!isCampusIp) {
        // This is an external/VPN/Mobile IP. Enforce 1-to-1 binding.
        const ipUsedByOther = await prisma.attendance.findFirst({
            where: {
                sessionId: sessionId,
                ipAddress: ip,
                studentId: { not: student.id }
            },
            include: { student: { include: { user: true } } }
        });

        if (ipUsedByOther) {
            return { error: `Network Conflict: This IP is already associated with another student (${ipUsedByOther.student.user.name}). If you are using a Hotspot or VPN, please disable it.` };
        }
    }
    */

    // 6. Device Validation (Anti-Proxy for current student)
    let isProxy = false;

    if (!student.deviceHash || !student.deviceId) {
        // Bind Device (First time) - Enforce both
        await prisma.student.update({
            where: { id: student.id },
            data: {
                deviceHash: deviceHash,
                deviceId: deviceId
            },
        });
    } else {
        // Verify consistency
        // If either the hardware hash OR the sticky ID changes, we flag it.
        // Changing browser (new sticky ID) is allowed ONLY if the hardware matches? 
        // No, strict mode: Both must match the registered profile.
        if (student.deviceHash !== deviceHash || student.deviceId !== deviceId) {
            isProxy = true;
        }
    }

    if (isProxy) {
        // Upsert Proxy Attempt
        const existingProxy = await prisma.proxyAttempt.findFirst({
            where: {
                studentId: student.id,
                sessionId: sessionId
            }
        });

        if (existingProxy) {
            await prisma.proxyAttempt.update({
                where: { id: existingProxy.id },
                data: {
                    attemptedHash: `HASH:${deviceHash}|ID:${deviceId}`,
                    timestamp: new Date()
                }
            });
        } else {
            await prisma.proxyAttempt.create({
                data: {
                    studentId: student.id,
                    sessionId: sessionId,
                    attemptedHash: `HASH:${deviceHash}|ID:${deviceId}`,
                },
            });
        }
        return { error: "Device Verification Failed! Please use your registered device and browser." };
    }

    // 7. Check if already marked (Moved AFTER device verification)
    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            studentId: student.id,
            sessionId: sessionId,
        },
    });

    if (existingAttendance) {
        return { error: "Attendance already marked", success: true };
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
