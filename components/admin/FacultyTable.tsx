"use client";

import { useState } from "react";
import { User, Trash2 } from "lucide-react";
import { deleteUsers } from "@/actions/admin";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditFacultyModal from "@/components/admin/EditFacultyModal";
import { useRouter } from "next/navigation";
import FormattedTime from "@/components/FormattedTime";

// Define the type based on the Prisma query
interface FacultyMember {
    id: number;
    userId: number;
    user: {
        name: string;
        email: string;
        createdAt: string;
    };
    subjects: {
        id: number;
        name: string;
    }[];
    batches: {
        id: number;
        name: string;
    }[];
}

interface FacultyTableProps {
    initialFaculty: FacultyMember[];
    batches?: { id: number; name: string }[];
}

export default function FacultyTable({ initialFaculty, batches }: FacultyTableProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Toggle individual selection
    const toggleSelection = (userId: number) => {
        setSelectedIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    // Toggle all selection
    const toggleAll = () => {
        if (selectedIds.length === initialFaculty.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(initialFaculty.map((f) => f.userId));
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteUsers(selectedIds);

        if (result.success) {
            setSelectedIds([]);
            setIsDeleteDialogOpen(false);
            router.refresh();
        } else {
            alert("Failed to delete users");
            // Ideally use a toast notification here
        }
        setIsDeleting(false);
    };

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Bulk Action Header */}
            {selectedIds.length > 0 && (
                <div className="bg-gray-800 p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                    <span className="text-gray-200 font-medium">
                        {selectedIds.length} selected
                    </span>
                    <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
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
                            <th className="p-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === initialFaculty.length && initialFaculty.length > 0}
                                    onChange={toggleAll}
                                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500/20"
                                />
                            </th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Subjects</th>
                            <th className="p-4">Batches</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {initialFaculty.map((faculty) => (
                            <tr
                                key={faculty.id}
                                className={`hover:bg-gray-800/50 transition-colors ${selectedIds.includes(faculty.userId) ? 'bg-blue-500/5' : ''}`}
                            >
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(faculty.userId)}
                                        onChange={() => toggleSelection(faculty.userId)}
                                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500/20"
                                    />
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="font-medium text-white">{faculty.user.name}</span>
                                </td>
                                <td className="p-4 text-gray-400">{faculty.user.email}</td>
                                <td className="p-4">
                                    {faculty.subjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {faculty.subjects.map((sub) => (
                                                <span
                                                    key={sub.id}
                                                    className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded"
                                                >
                                                    {sub.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">None</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {faculty.batches && faculty.batches.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {faculty.batches.map((b) => (
                                                <span key={b.id} className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                                                    {b.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">None</span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-500">
                                    <FormattedTime date={faculty.user.createdAt} dateOnly />
                                </td>
                                <td className="p-4">
                                    <EditFacultyModal faculty={faculty} iconOnly />
                                </td>
                            </tr>
                        ))}
                        {initialFaculty.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No faculty members found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Faculty Members"
                description={`Are you sure you want to delete ${selectedIds.length} faculty member(s)? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}
