
import { sendOtp, verifyOtp } from "../actions/otp";
import { prisma } from "../lib/prisma";
import { generateOtp } from "../lib/otp";

async function runTest() {
    console.log("--- Starting OTP Test ---");

    const testEmail = "test_otp_user@darshan.ac.in";
    const testUsername = "test_otp_user_darshan";

    // 1. Setup User
    console.log("1. Setting up Test User...");
    let user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: "Test OTP User",
                email: testEmail,
                username: testUsername,
                password: "password123", // not used
                role: "STUDENT",
                status: "APPROVED"
            }
        });
    }
    console.log("User ready:", user.id);

    // 2. Test Email OTP
    console.log("\n2. Testing Send OTP (Email)...");
    const sendRes = await sendOtp(testEmail);
    console.log("Send Result:", sendRes);

    if (!sendRes.success) throw new Error("Failed to send OTP to email");

    // Fetch OTP code directly (cheat for test)
    const otpRecord = await prisma.otp.findUnique({ where: { identifier: testEmail } });
    if (!otpRecord) throw new Error("OTP record not found");
    console.log("Fetched OTP Code:", otpRecord.code);

    console.log("Verifying OTP (Email)...");
    const verifyRes = await verifyOtp(testEmail, otpRecord.code);
    console.log("Verify Result:", verifyRes);
    if (!verifyRes.success) throw new Error("Failed to verify OTP with email");


    // 3. Test Username OTP
    console.log("\n3. Testing Send OTP (Username)...");
    const sendRes2 = await sendOtp(testUsername);
    console.log("Send Result:", sendRes2);
    if (!sendRes2.success) throw new Error("Failed to send OTP to username");

    // It should have sent to email, so identifier in OTP table is email
    const otpRecord2 = await prisma.otp.findUnique({ where: { identifier: testEmail } });
    console.log("Fetched OTP Code (via Username request):", otpRecord2?.code);

    console.log("Verifying OTP (Username)...");
    const verifyRes2 = await verifyOtp(testUsername, otpRecord2!.code);
    console.log("Verify Result:", verifyRes2);
    if (!verifyRes2.success) throw new Error("Failed to verify OTP with username");

    // Cleanup
    console.log("\nCleaning up...");
    await prisma.otp.deleteMany({ where: { identifier: testEmail } });
    await prisma.user.delete({ where: { email: testEmail } });

    console.log("--- Test Passed ---");
}

runTest().catch(console.error);
