import { prisma } from "@/lib/prisma";
import AddStudentForm from "@/components/admin/AddStudentForm";
import DeviceResetButton from "@/components/admin/DeviceResetButton";
import FlexibleUploadModal from "@/components/admin/FlexibleUploadModal";
import EditStudentModal from "@/components/admin/EditStudentModal";
import DeleteStudentButton from "@/components/admin/DeleteStudentButton";
import ResetAllDevicesButton from "@/components/admin/ResetAllDevicesButton";
import StudentTable from "@/components/admin/StudentTable";
import Pagination from "@/components/Pagination";
import { User, Smartphone } from "lucide-react";

import Search from "@/components/Search";

import PendingRequests from "@/components/admin/PendingRequests";
import AutoRefresh from "@/components/AutoRefresh";

import SemesterFilter from "@/components/admin/SemesterFilter";

export default async function StudentManagementPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        semester?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || "";
    const semester = params?.semester ? parseInt(params.semester) : undefined;
    const currentPage = Number(params?.page) || 1;
    const itemsPerPage = 20;

    const whereClause: any = {
        OR: [
            { user: { name: { contains: query, mode: 'insensitive' } } },
            { rollNumber: { contains: query, mode: 'insensitive' } },
            { enrollmentNo: { contains: query, mode: 'insensitive' } }
        ],
        user: { status: "APPROVED" }
    };

    if (semester) {
        whereClause.semester = semester;
    }

    const [students, totalCount, batches] = await Promise.all([
        prisma.student.findMany({
            where: whereClause,
            include: {
                user: true,
                batch: true,
            },
            orderBy: {
                rollNumber: 'asc'
            },
            take: itemsPerPage,
            skip: (currentPage - 1) * itemsPerPage,
        }),
        prisma.student.count({
            where: whereClause
        }),
        prisma.batch.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div>
            <AutoRefresh intervalMs={5000} />
            <div className="flex justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold whitespace-nowrap text-foreground">Student Management</h1>
                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="w-full max-w-md flex gap-2">
                        <Search placeholder="Search students..." />
                        <SemesterFilter />
                    </div>
                    <ResetAllDevicesButton />
                    <FlexibleUploadModal userType="STUDENT" />
                    <AddStudentForm batches={batches} />
                </div>
            </div>

            <PendingRequests />

            <StudentTable students={students} batches={batches} />

            <div className="mt-4 pb-8">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}
