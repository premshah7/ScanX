
"use client";

import { useState } from "react";
import { User, Smartphone, Trash2, CheckSquare, Square, MinusSquare } from "lucide-react";
import DeviceResetButton from "@/components/admin/DeviceResetButton";
import EditStudentModal from "@/components/admin/EditStudentModal";
import DeleteStudentButton from "@/components/admin/DeleteStudentButton";
import { deleteUsers } from "@/actions/admin";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Student {
    id: number;
    userId: number;
    rollNumber: string;
    enrollmentNo: string;
    batchId: number | null;
    deviceHash: string | null;
    isDeviceResetRequested: boolean;
    user: {
        name: string;
        email: string;
    };
    batch?: {
        name: string;
    } | null;
}

interface StudentTableProps {
    students: Student[];
    batches: { id: number; name: string }[];
}

export default function StudentTable({ students, batches }: StudentTableProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Toggle specific student selection
    const toggleSelect = (userId: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedIds(newSelected);
    };

    // Toggle Select All
    const toggleSelectAll = () => {
        if (selectedIds.size === students.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(students.map(s => s.userId)));
        }
    };

    const handleBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            const result = await deleteUsers(Array.from(selectedIds));
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
                setSelectedIds(new Set()); // Clear selection
                setIsConfirmOpen(false);
            }
        } catch (error) {
            console.error("Bulk delete failed:", error);
            alert("Failed to delete selected students.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const isAllSelected = students.length > 0 && selectedIds.size === students.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < students.length;

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Bulk Action Header */}
            {selectedIds.size > 0 && (
                <div className="bg-blue-600/10 border-b border-blue-600/20 p-4 flex items-center justify-between">
                    <span className="text-blue-400 font-medium">
                        {selectedIds.size} student{selectedIds.size > 1 ? 's' : ''} selected
                    </span>
                    <button
                        onClick={() => setIsConfirmOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-400">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {isAllSelected ? (
                                        <CheckSquare className="w-5 h-5" />
                                    ) : isIndeterminate ? (
                                        <MinusSquare className="w-5 h-5" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="p-4">Student</th>
                            <th className="p-4">IDs</th>
                            <th className="p-4">Batch</th>
                            <th className="p-4">Device Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {students.map((student) => {
                            const isSelected = selectedIds.has(student.userId);
                            return (
                                <tr
                                    key={student.id}
                                    className={`transition-colors ${isSelected ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-gray-800/50'}`}
                                >
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => toggleSelect(student.userId)}
                                            className={`transition-colors ${isSelected ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{student.user.name}</div>
                                                <div className="text-xs text-gray-500">{student.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Roll:</span> <span className="text-gray-300">{student.rollNumber}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-500">Enroll:</span> <span className="text-gray-300">{student.enrollmentNo}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {student.batch ? (
                                            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">
                                                {student.batch.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {student.deviceHash ? (
                                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                                <Smartphone className="w-4 h-4" />
                                                Bound
                                                {student.isDeviceResetRequested && (
                                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full ml-2">
                                                        Reset Requested
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-sm">No Device</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <EditStudentModal student={student} batches={batches} iconOnly />
                                            <DeviceResetButton
                                                studentId={student.id}
                                                hasDevice={!!student.deviceHash}
                                                isRequested={student.isDeviceResetRequested}
                                            />
                                            <DeleteStudentButton
                                                userId={student.userId}
                                                studentName={student.user.name}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title={`Delete ${selectedIds.size} Students`}
                description={`Are you sure you want to delete these ${selectedIds.size} students? This action will permanently remove their accounts, attendance records, and everything associated with them.`}
                confirmText="Delete All"
                variant="danger"
                loading={isBulkDeleting}
            />
        </div>
    );
}
