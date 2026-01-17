"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSubject(name: string, facultyId: number) {
    if (!name || !facultyId) {
        return { error: "Name and Faculty are required" };
    }

    try {
        await prisma.subject.create({
            data: {
                name,
                facultyId,
            },
        });

        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        console.error("Error creating subject:", error);
        return { error: "Failed to create subject" };
    }
}

export async function getSubjectDetails(subjectId: number) {
    try {
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                faculty: {
                    include: {
                        user: true
                    }
                },
                students: {
                    include: {
                        user: true
                    }
                }
            }
        });
        return { subject };
    } catch (error) {
        console.error("Error fetching subject details:", error);
        return { error: "Failed to fetch subject details" };
    }
}

export async function assignStudentsToSubject(subjectId: number, studentIds: number[]) {
    if (!subjectId || studentIds.length === 0) {
        return { error: "Subject and at least one student are required" };
    }

    try {
        await prisma.subject.update({
            where: { id: subjectId },
            data: {
                students: {
                    connect: studentIds.map((id) => ({ id })),
                },
            },
        });

        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        console.error("Error assigning students:", error);
        return { error: "Failed to assign students" };
    }
}

export async function removeStudentFromSubject(subjectId: number, studentId: number) {
    try {
        await prisma.subject.update({
            where: { id: subjectId },
            data: {
                students: {
                    disconnect: { id: studentId },
                },
            },
        });

        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        console.error("Error removing student:", error);
        return { error: "Failed to remove student" };
    }
}

export async function getStudentsForEnrollment(query: string = "") {
    try {
        const students = await prisma.student.findMany({
            where: {
                OR: [
                    { rollNumber: { contains: query, mode: "insensitive" } },
                    { user: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
            include: {
                user: true,
            },
            take: 20,
        });
        return { students };
    } catch (error) {
        console.error("Error fetching students:", error);
        return { error: "Failed to fetch student list" };
    }
}
