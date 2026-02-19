
import { prisma } from "@/lib/prisma";
import { validateIp } from "@/lib/ipCheck";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, deviceHash, deviceId, userAgent, userId } = body;

        // 0. Manual Auth Simulation
        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // 0.1 Security: Authenticated Check
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Parse Token
        const [sessionIdStr, timestampStr] = token.split(":");
        const sessionId = parseInt(sessionIdStr);
        const timestamp = parseInt(timestampStr);

        if (isNaN(sessionId) || isNaN(timestamp)) {
            return NextResponse.json({ error: "Invalid QR Codes" }, { status: 400 });
        }

        // 2. PARALLEL DATA FETCHING (Phase 1)
        // Fetch Student, Session, and SystemSettings together
        const [student, dbSession, settings] = await Promise.all([
            prisma.student.findUnique({
                where: { userId: parseInt(userId) },
                include: { user: true }
            }),
            prisma.session.findUnique({ where: { id: sessionId } }),
            prisma.systemSettings.findFirst()
        ]);

        if (!student) {
            return NextResponse.json({ error: "Student record not found" }, { status: 404 });
        }

        if (!dbSession || !dbSession.isActive) {
            return NextResponse.json({ error: "Session is not active" }, { status: 400 });
        }

        // 3. IP Validation (Inline to avoid extra DB call)
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0] ||
            headerList.get("x-real-ip") ||
            "unknown";

        // Normalize IP (Simplified from ipCheck.ts)
        let normalizedIp = ip;
        if (ip === "::1") normalizedIp = "127.0.0.1";
        if (ip.startsWith("::ffff:")) normalizedIp = ip.substring(7);

        if (settings?.isIpCheckEnabled && !normalizedIp.startsWith(settings.allowedIpPrefix)) {
            return NextResponse.json({ error: "IP Mismatch" }, { status: 403 });
        }

        // 4. PARALLEL VALIDATION CHECKS (Phase 2)
        // Check Attendance existence, Heuristic, and Device Ownership together
        const [existingAttendance, heuristicProxy, deviceOwner] = await Promise.all([
            prisma.attendance.findFirst({
                where: { studentId: student.id, sessionId: sessionId }
            }),
            prisma.attendance.findFirst({
                where: {
                    sessionId: sessionId,
                    ipAddress: normalizedIp,
                    userAgent: userAgent,
                    studentId: { not: student.id }
                }
            }),
            prisma.student.findFirst({
                where: {
                    OR: [{ deviceHash: deviceHash }, { deviceId: deviceId }],
                    id: { not: student.id }
                }
            })
        ]);

        if (existingAttendance) {
            return NextResponse.json({ error: "Attendance already marked", success: true });
        }

        /*
        if (heuristicProxy) {
            return NextResponse.json({ error: "Suspicious activity blocked (Heuristic)" }, { status: 403 });
        }
        */

        if (deviceOwner) {
            return NextResponse.json({ error: "Device Verification Failed (Ownership)" }, { status: 403 });
        }

        // 5. PARALLEL WRITES (Phase 3)
        const writeOperations = [];

        // 6. Device Binding/Validation (LOAD TEST: SKIPPED to prevent Row Locking on small dataset)
        // In a real scenario, binding happens once. Here we skip it to test INSERT throughput.
        /*
        if (!student.deviceHash || student.deviceHash !== deviceHash) {
             writeOperations.push(prisma.student.update({
                where: { id: student.id },
                data: { deviceHash: deviceHash, deviceId: deviceId }
            }));
        }
        */

        // 7. Mark Attendance
        writeOperations.push(prisma.attendance.create({
            data: {
                studentId: student.id,
                sessionId: sessionId,
                userAgent: userAgent,
                ipAddress: normalizedIp,
            },
        }));

        await Promise.all(writeOperations);

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
