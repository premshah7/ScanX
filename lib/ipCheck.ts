import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function validateIp() {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings || !settings.isIpCheckEnabled) {
        return true; // IP check disabled
    }

    const headerList = await headers();
    let ip = headerList.get("x-forwarded-for")?.split(",")[0] ||
        headerList.get("x-real-ip") ||
        "unknown";

    // Normalize IPv6 Loopback
    if (ip === "::1") ip = "127.0.0.1";

    // Normalize IPv6-mapped IPv4 (::ffff:192.168.x.x)
    if (ip.startsWith("::ffff:")) ip = ip.substring(7);

    if (ip === "unknown") {
        console.warn("[IP Check] IP detection failed (unknown). Request headers may be missing 'x-forwarded-for'.");
        return false;
    }

    console.log(`[IP Check] Detected IP: "${ip}" | Allowed Prefix: "${settings.allowedIpPrefix}"`);

    const isValid = ip.startsWith(settings.allowedIpPrefix);

    if (!isValid) {
        console.warn(`[IP Check] FAIL: "${ip}" does not start with "${settings.allowedIpPrefix}"`);
    } else {
        console.log(`[IP Check] PASS`);
    }

    return isValid;
}

