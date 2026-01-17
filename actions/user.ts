"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteUsers(ids: number[], type: 'student' | 'faculty') {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return { error: "Unauthorized" };
        }

        if (!ids || ids.length === 0) {
            return { error: "No users selected" };
        }

        if (type === 'student') {
            // Because Attendance does not have onDelete: Cascade in schema for student relation,
            // we must manually delete them (or let Prisma handle it if we used cascading delete in schema).
            // To be safe and avoid migration right now, we delete related records.
            // But we have the USER IDs passed in (or Student IDs?).
            // Let's assume we receive USER IDs because that's the root of the identity.

            // Wait, if the UI passes Student IDs, we need to find the User IDs. 
            // If the UI passes User IDs, we can delete the User directly.
            // The Student table has `userId`. 
            // Let's assume the UI will pass the database ID of the specific entity (Student.id or Faculty.id) 
            // OR the User.id. 
            // Faculty/Student are 1:1 with User. Deleting User deletes them.
            // Standard approach: Pass User IDs.

            // However, the "Attendance" is linked to "Student.id", not "User.id".
            // So if I delete User -> cascade delete Student -> Fail because of Attendance.
            // So I need to find Student IDs for these User IDs.

            const students = await prisma.student.findMany({
                where: { userId: { in: ids } },
                select: { id: true }
            });
            const studentIds = students.map(s => s.id);

            if (studentIds.length > 0) {
                await prisma.attendance.deleteMany({
                    where: { studentId: { in: studentIds } }
                });
                await prisma.proxyAttempt.deleteMany({
                    where: { studentId: { in: studentIds } }
                });
            }
        }

        // Now delete the users (Cascades to Student/Faculty profiles)
        await prisma.user.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        revalidatePath(type === 'student' ? "/admin/students" : "/admin/faculty");
        return { success: true };

    } catch (error: any) {
        console.error("Error deleting users:", error);
        return { error: error.message || "Failed to delete users" };
    }
}
