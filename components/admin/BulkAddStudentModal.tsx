"use client";

import { useState, useEffect } from "react";
import { getUnassignedStudents, addStudentsToBatch } from "@/actions/batch";
import { Loader2, UserPlus, X, CheckSquare, Square, Search } from "lucide-react";
import { useRouter } from "next/navigation";

type Student = {
    id: number;
    userId: number;
    rollNumber: string;
    enrollmentNo: string;
    user: {
        name: string;
        email: string;
    };
};

type Props = {
    batchId: number;
};

export default function BulkAddStudentModal({ batchId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen]);

    const fetchStudents = async () => {
        setLoading(true);
        const res = await getUnassignedStudents();
        if (res.students) {
            setStudents(res.students as unknown as Student[]); // Type assertion needed due to simple type matching
        }
        setLoading(false);
    };

    const toggleSelect = (userId: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredStudents.map(s => s.userId)));
        }
    };

    const handleAdd = async () => {
        if (selectedIds.size === 0) return;
        setAdding(true);
        const res = await addStudentsToBatch(batchId, Array.from(selectedIds));
        if (res.success) {
            setIsOpen(false);
            setSelectedIds(new Set());
            router.refresh();
        } else {
            alert(res.error || "Failed to add students");
        }
        setAdding(false);
    };

    const filteredStudents = students.filter(s =>
        s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAllSelected = filteredStudents.length > 0 && selectedIds.size === filteredStudents.length;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
            >
                <UserPlus className="w-4 h-4" />
                Add Students
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl flex flex-col max-h-[85vh]">

                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-xl z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-400" />
                                Add Students to Batch
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search & Content */}
                        <div className="p-6 overflow-hidden flex flex-col flex-1">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or roll number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-[300px] border border-gray-800 rounded-lg">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                                        <p>No unassigned students found.</p>
                                        <p className="text-sm">Only students without a batch check are listed.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-800 text-gray-400 sticky top-0">
                                            <tr>
                                                <th className="p-3 w-10 text-center">
                                                    <button onClick={toggleSelectAll} className="hover:text-white">
                                                        {isAllSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                    </button>
                                                </th>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Roll No</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredStudents.map((student) => {
                                                const isSelected = selectedIds.has(student.userId);
                                                return (
                                                    <tr
                                                        key={student.id}
                                                        onClick={() => toggleSelect(student.userId)}
                                                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10' : 'hover:bg-gray-800/50'}`}
                                                    >
                                                        <td className="p-3 text-center text-gray-400">
                                                            {isSelected ? <CheckSquare className="w-5 h-5 text-blue-400" /> : <Square className="w-5 h-5" />}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-medium text-white">{student.user.name}</div>
                                                            <div className="text-xs text-gray-500">{student.user.email}</div>
                                                        </td>
                                                        <td className="p-3 text-gray-300">{student.rollNumber}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-800 bg-gray-900 rounded-b-xl flex justify-between items-center z-10">
                            <span className="text-gray-400 text-sm">{selectedIds.size} students selected</span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={adding || selectedIds.size === 0}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {adding && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add Selected
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
