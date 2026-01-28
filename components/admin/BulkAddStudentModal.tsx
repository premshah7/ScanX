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
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
            >
                <UserPlus className="w-4 h-4" />
                Add Students
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-background border border-border rounded-xl w-full max-w-2xl flex flex-col max-h-[85vh] shadow-xl">

                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-card rounded-t-xl z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <UserPlus className="w-5 h-5 text-primary" />
                                Add Students to Batch
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search & Content */}
                        <div className="p-6 overflow-hidden flex flex-col flex-1 bg-background">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or roll number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-input border border-input rounded-lg pl-10 pr-4 py-2 text-foreground focus:outline-none focus:border-ring"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-[300px] border border-border rounded-lg">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                        <p>No unassigned students found.</p>
                                        <p className="text-sm">Only students without a batch check are listed.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-muted text-muted-foreground sticky top-0">
                                            <tr>
                                                <th className="p-3 w-10 text-center">
                                                    <button onClick={toggleSelectAll} className="hover:text-foreground">
                                                        {isAllSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                    </button>
                                                </th>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Roll No</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredStudents.map((student) => {
                                                const isSelected = selectedIds.has(student.userId);
                                                return (
                                                    <tr
                                                        key={student.id}
                                                        onClick={() => toggleSelect(student.userId)}
                                                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                                    >
                                                        <td className="p-3 text-center text-muted-foreground">
                                                            {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-medium text-foreground">{student.user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{student.user.email}</div>
                                                        </td>
                                                        <td className="p-3 text-muted-foreground">{student.rollNumber}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-card rounded-b-xl flex justify-between items-center z-10">
                            <span className="text-muted-foreground text-sm">{selectedIds.size} students selected</span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={adding || selectedIds.size === 0}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
