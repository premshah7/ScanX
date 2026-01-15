import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function validateIp() {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings || !settings.isIpCheckEnabled) {
        return true; // IP check disabled
    }

    const headerList = await headers();
    // Get IP from common forward headers or fallback
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] ||
        headerList.get("x-real-ip") ||
        "unknown";

    if (ip === "unknown") return false;

    // Simple prefix check
    // In production, use a CIDR library
    console.log(`[IP Check] Detected IP: ${ip}, Allowed Prefix: ${settings.allowedIpPrefix}`);

    if (ip === "unknown") {
        console.warn("[IP Check] IP detection failed (unknown). Request headers may be missing 'x-forwarded-for'.");
        return false;
    }

    const isValid = ip.startsWith(settings.allowedIpPrefix);
    console.log(`[IP Check] Result: ${isValid ? "PASS" : "FAIL"}`);
    return isValid;
}
