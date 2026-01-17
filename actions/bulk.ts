"use server";

import { extractTextFromPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type UserType = "STUDENT" | "FACULTY";

export async function uploadBulkUsers(formData: FormData, userType: UserType) {
    const file = formData.get("file") as File;

    if (!file) {
        return { error: "No file provided" };
    }

    if (file.type !== "application/pdf") {
        return { error: "File must be a PDF" };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const text = await extractTextFromPdf(buffer);

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        const salt = await bcrypt.genSalt(10);
        // Default password hash if missing (optimization)
        const defaultHash = await bcrypt.hash("password123", salt);

        for (const line of lines) {
            // Heuristic: Look for Email
            // Regex: SomeName SomeName email@example.com [rest]
            // This is loose matching.
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
            const match = line.match(emailRegex);

            if (!match) continue; // Skip lines without email (headers/footers)

            const email = match[0];
            const parts = line.split(/\s+/);
            const emailIndex = parts.findIndex(p => p.includes("@"));

            // Name is usually everything before email
            const name = parts.slice(0, emailIndex).join(" ");

            // Data after email
            const afterEmail = parts.slice(emailIndex + 1);

            if (!name || !email) {
                results.errors.push(`Invalid format line: ${line.substring(0, 20)}...`);
                results.failed++;
                continue;
            }

            try {
                // Check if user exists
                const existingUser = await prisma.user.findUnique({ where: { email } });
                if (existingUser) {
                    results.errors.push(`User already exists: ${email}`);
                    results.failed++;
                    continue;
                }

                const passwordHash = defaultHash; // Or parse from line if present

                if (userType === "FACULTY") {
                    await prisma.$transaction(async (tx) => {
                        const newUser = await tx.user.create({
                            data: {
                                name,
                                email,
                                password: passwordHash,
                                role: "FACULTY"
                            }
                        });
                        await tx.faculty.create({
                            data: { userId: newUser.id }
                        });
                    });
                } else {
                    // STUDENT
                    // Expects: Name Email [something?] RollNo EnrollmentNo
                    // If parsing is too hard, we might fail or use placeholdes.
                    // Let's assume the PDF *should* have: Name Email RollNo EnrollmentNo

                    const rollNumber = afterEmail[0];
                    const enrollmentNo = afterEmail[1];

                    if (!rollNumber || !enrollmentNo) {
                        results.errors.push(`Missing Rol/Enrollment for: ${email}`);
                        results.failed++;
                        continue;
                    }

                    await prisma.$transaction(async (tx) => {
                        const newUser = await tx.user.create({
                            data: {
                                name,
                                email,
                                password: passwordHash,
                                role: "STUDENT"
                            }
                        });
                        await tx.student.create({
                            data: {
                                userId: newUser.id,
                                rollNumber,
                                enrollmentNo
                            }
                        });
                    });
                }
                results.success++;

            } catch (err: any) {
                console.error("Row Error", err);
                results.failed++;
                results.errors.push(`DB Error for ${email}: ${err.message}`);
            }
        }

        revalidatePath("/admin/faculty");
        revalidatePath("/admin/students");
        return { success: true, stats: results };

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return { error: "Failed to process file" };
    }
}
