import { prisma } from "@/lib/prisma";

/**
 * Generates a 6-digit OTP and stores it in the database.
 * Expires in 5 minutes.
 */
export async function generateOtp(phone: string) {
    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Upsert: Update existing OTP or create new one
    await prisma.otp.upsert({
        where: { phone },
        update: {
            code,
            expiresAt,
            attempts: 0,
            createdAt: new Date(),
        },
        create: {
            phone,
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
export async function verifyOtpCode(phone: string, code: string) {
    const record = await prisma.otp.findUnique({
        where: { phone },
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
            where: { phone },
            data: { attempts: { increment: 1 } },
        });
        return false;
    }

    // Success: Delete the used OTP to prevent reuse
    await prisma.otp.delete({
        where: { phone },
    });

    return true;
}
