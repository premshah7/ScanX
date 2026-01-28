import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This route serves as a cron job target to clean up stale sessions
export async function GET(req: NextRequest) {
    try {
        // Define stale threshold (e.g., 4 hours ago)
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

        // Find and update stale sessions
        const result = await prisma.session.updateMany({
            where: {
                isActive: true,
                startTime: {
                    lt: fourHoursAgo
                }
            },
            data: {
                isActive: false,
                endTime: new Date() // Set end time to now (or maybe start + 4h?)
            }
        });

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${result.count} stale sessions.`,
            count: result.count
        });
    } catch (error) {
        console.error("Cron session cleanup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
