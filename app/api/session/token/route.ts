import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";

const QR_SECRET = process.env.NEXT_PUBLIC_QR_SECRET || "fallback_secret";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "FACULTY" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Generate Signed Token
    const payload = {
        sessionId: parseInt(sessionId),
        timestamp: Date.now(),
        type: "attendance_qr"
    };

    const token = jwt.sign(payload, QR_SECRET, { expiresIn: "30s" }); // Short expiry for security

    return NextResponse.json({ token });
}
