
import { prisma } from "../lib/prisma";

async function clearOtps() {
    console.log("Clearing OTP table to allow schema migration...");
    await prisma.otp.deleteMany({});
    console.log("OTP table cleared.");
}

clearOtps().catch(console.error);
