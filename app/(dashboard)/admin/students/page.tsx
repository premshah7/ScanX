import { prisma } from "@/lib/prisma";
import AddStudentForm from "@/components/admin/AddStudentForm";
import DeviceResetButton from "@/components/admin/DeviceResetButton";
import BulkUploadClient from "@/components/admin/BulkUploadClient";
import EditStudentModal from "@/components/admin/EditStudentModal";
import DeleteStudentButton from "@/components/admin/DeleteStudentButton";
import StudentTable from "@/components/admin/StudentTable";
import Pagination from "@/components/Pagination";
import { User, Smartphone } from "lucide-react";

import Search from "@/components/Search";

import PendingRequests from "@/components/admin/PendingRequests";

export default async function StudentManagementPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || "";
    const currentPage = Number(params?.page) || 1;
    const itemsPerPage = 20;

    const [students, totalCount, batches] = await Promise.all([
        prisma.student.findMany({
            where: {
                OR: [
                    { user: { name: { contains: query, mode: 'insensitive' } } },
                    { rollNumber: { contains: query, mode: 'insensitive' } },
                    { enrollmentNo: { contains: query, mode: 'insensitive' } }
                ]
            },
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
            where: {
                OR: [
                    { user: { name: { contains: query, mode: 'insensitive' } } },
                    { rollNumber: { contains: query, mode: 'insensitive' } },
                    { enrollmentNo: { contains: query, mode: 'insensitive' } }
                ]
            }
        }),
        prisma.batch.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold whitespace-nowrap">Student Management</h1>
                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="w-full max-w-md">
                        <Search placeholder="Search students..." />
                    </div>
                    <BulkUploadClient userType="STUDENT" />
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
