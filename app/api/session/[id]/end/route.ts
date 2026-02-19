
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const sessionId = parseInt(id);
        if (isNaN(sessionId)) {
            return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
        }

        // Security: Auth Check
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "FACULTY")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Add 10 minutes buffer to endTime if needed, or just set isActive: false
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                isActive: false,
                endTime: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Auto-end session error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
