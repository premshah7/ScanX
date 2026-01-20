"use server";

import { extractTextFromPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type UserType = "STUDENT" | "FACULTY";

export async function uploadBulkUsers(formData: FormData, userType: UserType) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "ADMIN") {
        return { error: "Unauthorized Access" };
    }

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

        // --- PARSING LOGIC START ---

        interface ParsedUser {
            name: string;
            email: string;
            rollNumber?: string;
            enrollmentNo?: string;
            batchName?: string;
        }

        let usersToCreate: ParsedUser[] = [];
        const errors: string[] = [];

        const hasEndEmails = lines.some(l => l.trim().match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/));

        if (hasEndEmails && userType === "STUDENT") {
            const tempStudents: ParsedUser[] = [];
            let usedLineIndices = new Set<number>();
            const ignoredHeaders = ["Name", "Email", "Roll No.", "Enrollment No.", "Batch", "Break"];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (ignoredHeaders.some(h => line.includes(h))) continue;

                const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)$/);
                if (emailMatch) {
                    const email = emailMatch[0];
                    // Name is everything before email
                    const name = line.substring(0, line.lastIndexOf(email)).trim();

                    // Look ahead for Roll/Enroll
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        // Expecting "Roll Enrollment" e.g. "344 2301..."
                        const parts = nextLine.split(/\s+/);
                        if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
                            tempStudents.push({
                                name,
                                email,
                                rollNumber: parts[0],
                                enrollmentNo: parts.slice(1).join(" ") // Join rest in case of spaces (unlikely for enroll)
                            });
                            usedLineIndices.add(i);
                            usedLineIndices.add(i + 1);
                            i++; // Skip next line
                        }
                    }
                }
            }

            // If we found students, look for batches
            if (tempStudents.length > 0) {
                const potentialBatches = lines.filter((l, idx) => {
                    const content = l.trim();
                    if (usedLineIndices.has(idx)) return false;
                    if (content.length === 0) return false;
                    if (ignoredHeaders.some(h => content.includes(h))) return false;
                    // Heuristic for batch: Short string, often starts with 'B' or is a date range
                    // Since we consumed all student data lines, hopefully only batches are left.
                    return true;
                });

                // Align batches
                if (potentialBatches.length === tempStudents.length) {
                    usersToCreate = tempStudents.map((s, i) => ({
                        ...s,
                        batchName: potentialBatches[i]
                    }));
                } else {
                    // Fallback: If counts don't match, we can't safely assign batches.
                    // But we can still create students if we accept missing ID (will fail later if batch required?)
                    // Or just proceed and let the standard logic try? 
                    // For now, assume this strategy succeeded if we found students.
                    // If batch count mismatch, maybe log error or assign null.
                    // Given the "convert this pdf" request, we should try our best.
                    // Let's assume the alignment is intended.
                    // If batch missing, just set null.
                    usersToCreate = tempStudents.map((s, i) => ({
                        ...s,
                        batchName: potentialBatches[i] || undefined
                    }));

                    if (potentialBatches.length !== tempStudents.length) {
                        errors.push(`Warning: Found ${tempStudents.length} students but ${potentialBatches.length} batch entries. Batch assignment may be incorrect.`);
                    }
                }
            }
        }

        // Strategy 2: Standard/Single-Line Format (Fallback if Strategy 1 found nothing)
        if (usersToCreate.length === 0) {
            for (const line of lines) {
                const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                if (!emailMatch) continue;

                const email = emailMatch[0];
                const parts = line.split(/\s+/);
                const emailIndex = parts.findIndex(p => p.includes("@"));

                // Basic validation
                if (emailIndex === -1) continue;

                const name = parts.slice(0, emailIndex).join(" ");
                const afterEmail = parts.slice(emailIndex + 1);

                if (userType === "FACULTY") {
                    usersToCreate.push({ name, email });
                } else {
                    // Student Standard: Email Roll Enroll Batch...
                    if (afterEmail.length >= 2) {
                        usersToCreate.push({
                            name,
                            email,
                            rollNumber: afterEmail[0],
                            enrollmentNo: afterEmail[1],
                            batchName: afterEmail.slice(2).join(" ").trim()
                        });
                    }
                }
            }
        }

        // --- DB PROCESSING START ---

        const results = {
            success: 0,
            failed: 0,
            errors: errors
        };

        const salt = await bcrypt.genSalt(10);
        const defaultHash = await bcrypt.hash("password123", salt);

        const chunk = <T>(arr: T[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
        const chunks = chunk(usersToCreate, 5); // Reduced from 50 to 5 to prevent connection pool exhaustion

        for (const batch of chunks) {
            await Promise.all(batch.map(async (userData) => {
                try {
                    // Check existence
                    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
                    if (existingUser) {
                        results.errors.push(`User already exists: ${userData.email}`);
                        results.failed++;
                        return;
                    }

                    if (userType === "FACULTY") {
                        await prisma.$transaction(async (tx) => {
                            const newUser = await tx.user.create({
                                data: {
                                    name: userData.name,
                                    email: userData.email,
                                    password: defaultHash,
                                    role: "FACULTY"
                                }
                            });
                            await tx.faculty.create({
                                data: { userId: newUser.id }
                            });
                        });
                    } else {
                        // Resolve Batch
                        let targetBatchId: number | null = null;
                        if (userData.batchName) {
                            const batch = await prisma.batch.findUnique({ where: { name: userData.batchName } });
                            if (batch) {
                                targetBatchId = batch.id;
                            } else {
                                // Optional: Create batch if missing? No, better to fail/warn.
                                results.errors.push(`Batch not found "${userData.batchName}" for ${userData.email}`);
                                results.failed++;
                                return;
                            }
                        }

                        if (!userData.rollNumber || !userData.enrollmentNo) {
                            results.errors.push(`Missing Roll/Enrollment for ${userData.email}`);
                            results.failed++;
                            return;
                        }

                        await prisma.$transaction(async (tx) => {
                            const newUser = await tx.user.create({
                                data: {
                                    name: userData.name,
                                    email: userData.email,
                                    password: defaultHash,
                                    role: "STUDENT"
                                }
                            });
                            await tx.student.create({
                                data: {
                                    userId: newUser.id,
                                    rollNumber: userData.rollNumber!,
                                    enrollmentNo: userData.enrollmentNo!,
                                    batchId: targetBatchId
                                }
                            });
                        });
                    }
                    results.success++;

                } catch (err: any) {
                    console.error("Row Error", err);
                    results.failed++;
                    results.errors.push(`DB Error for ${userData.email}: ${err.message}`);
                }
            }));
        }

        revalidatePath("/admin/faculty");
        revalidatePath("/admin/students");
        return { success: true, stats: results };

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return { error: "Failed to process file" };
    }
}
