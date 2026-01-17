
import { prisma } from "@/lib/prisma";
import AddFacultyForm from "@/components/admin/AddFacultyForm";
import FacultyTable from "@/components/admin/FacultyTable";
import BulkUploadClient from "@/components/admin/BulkUploadClient";

export default async function FacultyManagementPage() {
    try {
        console.log("Fetching faculty list...");
        const facultyList = await prisma.faculty.findMany({
            include: {
                user: true,
                subjects: true,
            },
            orderBy: {
                id: 'desc'
            }
        });

        console.log("Faculty list fetched. Items:", facultyList.length);

        const serializedFaculty = facultyList.map((f) => ({
            ...f,
            user: {
                ...f.user,
                createdAt: f.user.createdAt.toISOString(),
            },
        }));

        console.log("Faculty list serialized.");

        return (
            <div>
                <div className="flex justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">Faculty Management</h1>
                    <div className="flex gap-3">
                        <BulkUploadClient userType="FACULTY" />
                        <AddFacultyForm />
                    </div>
                </div>

                <FacultyTable initialFaculty={serializedFaculty} />
            </div>
        );
    } catch (error: any) {
        console.error("Error loading faculty page:", error);
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
                <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Page</h2>
                <p className="text-red-400 mb-4">{error?.message || "An unexpected error occurred."}</p>
                <div className="text-left bg-black/50 p-4 rounded text-xs font-mono overflow-auto max-h-48">
                    {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
                </div>
            </div>
        );
    }
}
