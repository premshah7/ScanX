"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function getOrSetDeviceId() {
    const cookieStore = await cookies();
    const existingDeviceId = cookieStore.get("device_id");

    if (existingDeviceId) {
        return existingDeviceId.value;
    }

    // Generate new ID if not present
    const newDeviceId = uuidv4();

    // Set HttpOnly Cookie
    cookieStore.set("device_id", newDeviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
    });

    return newDeviceId;
}

export async function setDeviceOwnerCookie(studentId: number) {
    try {
        const cookieStore = await cookies();
        cookieStore.set("device_owner_student_id", studentId.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        });
    } catch (e) {
        console.error("Failed to set device owner cookie", e);
    }
}
