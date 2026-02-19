import { prisma } from "@/lib/prisma";

/**
 * Generates a 6-digit OTP and stores it in the database.
 * Expires in 5 minutes.
 */
import { randomInt } from "crypto";

/**
 * Generates a 6-digit OTP and stores it in the database.
 * Expires in 5 minutes.
 */
export async function generateOtp(identifier: string) {
    // Security: Rate Limit Check
    const recentOtp = await prisma.otp.findFirst({
        where: {
            identifier,
            createdAt: { gt: new Date(Date.now() - 60 * 1000) } // 1 minute cooldown
        }
    });

    if (recentOtp) {
        throw new Error("Please wait 1 minute before requesting another OTP.");
    }

    // Generate 6-digit random code securely
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Upsert: Update existing OTP or create new one
    await prisma.otp.upsert({
        where: { identifier }, // Updated from phone
        update: {
            code,
            expiresAt,
            attempts: 0,
            createdAt: new Date(),
        },
        create: {
            identifier, // Updated from phone
            code,
            expiresAt,
        },
    });

    return code;
}

/**
 * Verifies the OTP for a given phone number.
 * Returns true if valid, false otherwise.
 * Deletes the OTP upon successful verification.
 */
export async function verifyOtpCode(identifier: string, code: string) {
    const record = await prisma.otp.findUnique({
        where: { identifier }, // Updated from phone
    });

    if (!record) return false;

    // Check expiration
    if (record.expiresAt < new Date()) {
        return false;
    }

    // Check code match
    if (record.code !== code) {
        // Increment attempts (optional logic)
        await prisma.otp.update({
            where: { identifier },
            data: { attempts: { increment: 1 } },
        });
        return false;
    }

    // Success: Delete the used OTP to prevent reuse
    await prisma.otp.delete({
        where: { identifier },
    });

    return true;
}
