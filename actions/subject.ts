"use server";
// Actions for Subject Management (Create, Read, Update, Delete)

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSubject(name: string, primaryManagerId: number, batchIds: number[] = []) {
    if (!name || !primaryManagerId) {
        return { error: "Name and Primary Manager are required" };
    }

    try {
        const existingSubject = await prisma.subject.findFirst({
            where: {
                name: { equals: name, mode: "insensitive" },
                faculty: {
                    userId: primaryManagerId
                }
            }
        });

        if (existingSubject) {
            return { error: `Subject already exists for this faculty` };
        }


        // Check if primary manager is Faculty to set facultyId
        const primaryUser = await prisma.faculty.findUnique({
            where: { userId: primaryManagerId }
        });

        await prisma.subject.create({
            data: {
                name,
                facultyId: primaryUser ? primaryUser.id : null,
                batches: {
                    connect: batchIds.map(id => ({ id }))
                }
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

export async function updateSubject(id: number, name: string, facultyId: number, batchIds: number[] = []) {
    if (!id || !name || !facultyId) {
        return { error: "ID, Name and Faculty are required" };
    }

    try {
        await prisma.subject.update({
            where: { id },
            data: {
                name,
                facultyId,
                batches: {
                    set: batchIds.map(id => ({ id }))
                }
            },
        });

        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        console.error("Error updating subject:", error);
        return { error: "Failed to update subject" };
    }
}

export async function deleteSubject(id: number) {
    if (!id) {
        return { error: "Subject ID is required" };
    }

    try {
        await prisma.subject.delete({
            where: { id },
        });

        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        console.error("Error deleting subject:", error);
        return { error: "Failed to delete subject" };
    }
}
