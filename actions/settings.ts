"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: {
                allowedIpPrefix: "",
                isIpCheckEnabled: false
            }
        });
    }

    return settings;
}

export async function updateSystemSettings(formData: FormData) {
    try {
        const allowedIpPrefix = formData.get("allowedIpPrefix") as string;
        const isIpCheckEnabled = formData.get("isIpCheckEnabled") === "on";

        // Upsert ensures we update if exists, create if not (though getSystemSettings ensures existence usually)
        const existing = await prisma.systemSettings.findFirst();

        if (existing) {
            await prisma.systemSettings.update({
                where: { id: existing.id },
                data: {
                    allowedIpPrefix,
                    isIpCheckEnabled
                }
            });
        } else {
            await prisma.systemSettings.create({
                data: {
                    allowedIpPrefix,
                    isIpCheckEnabled
                }
            });
        }

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { error: "Failed to update settings" };
    }
}
