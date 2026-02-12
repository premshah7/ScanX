"use server";

import { generateOtp, verifyOtpCode } from "@/lib/otp";
import { prisma } from "@/lib/prisma"; // Assuming you might need user lookup later
import { User, Role } from "@prisma/client";

/**
 * Sends an OTP to the provided phone number.
 * Currently uses console.log for "sending".
 * Replace mock logic with SMS provider in production.
 */
export async function sendOtp(phone: string) {
    try {
        if (!phone) {
            return { success: false, message: "Phone number is required" };
        }

        // Generate and store OTP
        const code = await generateOtp(phone);

        // MOCK SEND: Log to console
        console.log(`[DEV-OTP] 📱 Phone: ${phone} -> Code: ${code}`);

        // TODO: Integrate SMS Provider here (Twilio, AWS SNS, etc.)

        return { success: true, message: "OTP sent successfully" };
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, message: "Failed to send OTP" };
    }
}

/**
 * Verifies the OTP code.
 */
export async function verifyOtp(phone: string, code: string) {
    try {
        if (!phone || !code) {
            return { success: false, message: "Phone and Code are required" };
        }

        const isValid = await verifyOtpCode(phone, code);

        if (!isValid) {
            return { success: false, message: "Invalid or expired OTP" };
        }

        return { success: true, message: "OTP verified successfully" };
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, message: "Verification failed" };
    }
}
