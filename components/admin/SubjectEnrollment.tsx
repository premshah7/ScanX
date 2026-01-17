"use client";

import { useState, useEffect } from "react";
import { assignStudentsToSubject, removeStudentFromSubject, getStudentsForEnrollment, getSubjectDetails } from "@/actions/subject";
import { Loader2, Search, X, UserPlus, Trash2 } from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
    subjectId: number;
    subjectName: string;
    isOpen: boolean;
    onClose: () => void;
};

export default function SubjectEnrollment({ subjectId, subjectName, isOpen, onClose }: Props) {
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [loading, setLoading] = useState(true); // Initial load of subject details
    const [searchLoading, setSearchLoading] = useState(false);

    // Fetch Subject Details (Existing Enrolled Students)
    const fetchDetails = async () => {
        setLoading(true);
        const res = await getSubjectDetails(subjectId);
        if (res.subject) {
            setEnrolledStudents(res.subject.students);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && subjectId) {
            fetchDetails();
        }
    }, [isOpen, subjectId]);

    // Search for students to add
    useEffect(() => {
        const handleSearch = async () => {
            setSearchLoading(true);
            const res = await getStudentsForEnrollment(debouncedQuery);
            if (res.students) {
                // Filter out already enrolled
                const notEnrolled = res.students.filter(
                    (s: any) => !enrolledStudents.some((es) => es.id === s.id)
                );
                setSearchResults(notEnrolled);
            }
            setSearchLoading(false);
        };

        if (isOpen) handleSearch();
    }, [debouncedQuery, enrolledStudents, isOpen]);


    const handleAdd = async (studentId: number) => {
        // Optimistic update
        const studentToAdd = searchResults.find(s => s.id === studentId);
        if (!studentToAdd) return;

        // Temporarily move to enrolled
        setEnrolledStudents(prev => [...prev, studentToAdd]);
        setSearchResults(prev => prev.filter(s => s.id !== studentId));

        const res = await assignStudentsToSubject(subjectId, [studentId]);
        if (res.error) {
            // Revert on error
            alert("Failed to add student");
            fetchDetails(); // Reload heavy
        }
    };

    const handleRemove = async (studentId: number) => {
        // Optimistic
        const studentToRemove = enrolledStudents.find(s => s.id === studentId);
        if (!studentToRemove) return;

        setEnrolledStudents(prev => prev.filter(s => s.id !== studentId));
        // Add back to search results if it matches query, essentially refresh search

        const res = await removeStudentFromSubject(subjectId, studentId);
        if (res.error) {
            alert("Failed to remove student");
            fetchDetails();
        } else {
            // Re-trigger search to show this student as available again if applicable
            // We can just rely on the effect reacting to enrolledStudents change? 
            // Yes, useEffect([..., enrolledStudents,...]) triggers.
        }
    };

    if (!isOpen) return null;

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [adding, setAdding] = useState(false);

    // Reset selection when search results change dramatically or on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedIds(new Set());
            setLastSelectedIndex(null);
        }
    }, [isOpen]);

    const toggleSelection = (studentId: number, index: number, multiSelect: boolean) => {
        const newSelected = new Set(selectedIds);

        if (multiSelect && lastSelectedIndex !== null) {
            // Range Selection
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);

            for (let i = start; i <= end; i++) {
                const s = searchResults[i];
                if (s) newSelected.add(s.id);
            }
        } else {
            // Single Toggle
            if (newSelected.has(studentId)) {
                newSelected.delete(studentId);
            } else {
                newSelected.add(studentId);
            }
            setLastSelectedIndex(index);
        }

        setSelectedIds(newSelected);
    };

    const handleBatchAdd = async () => {
        if (selectedIds.size === 0) return;
        setAdding(true);

        const idsToAdd = Array.from(selectedIds);

        // Optimistic Update
        const studentsToAdd = searchResults.filter(s => selectedIds.has(s.id));
        setEnrolledStudents(prev => [...prev, ...studentsToAdd]);
        setSearchResults(prev => prev.filter(s => !selectedIds.has(s.id)));
        setSelectedIds(new Set());
        setLastSelectedIndex(null);

        const res = await assignStudentsToSubject(subjectId, idsToAdd);

        if (res.error) {
            alert("Failed to add students");
            fetchDetails(); // Revert/Reload
        }
        setAdding(false);
    };

    // ... (keep handleRemove as is) ...

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold">Manage Enrollment</h2>
                        <p className="text-gray-400 text-sm">{subjectName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Available Students (Search) */}
                    <div className="flex-1 p-6 border-r border-gray-800 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-blue-400" />
                                Add Students
                            </h3>
                            {selectedIds.size > 0 && (
                                <button
                                    onClick={handleBatchAdd}
                                    disabled={adding}
                                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                                >
                                    {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                    Add {selectedIds.size} Selected
                                </button>
                            )}
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or roll number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar select-none">
                            {searchLoading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : searchResults.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No matching students found.</p>
                            ) : (
                                searchResults.map((student, index) => {
                                    const isSelected = selectedIds.has(student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={(e) => toggleSelection(student.id, index, e.shiftKey)}
                                            className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-colors ${isSelected
                                                    ? "bg-blue-500/20 border-blue-500/50"
                                                    : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
                                                }`}
                                        >
                                            <div>
                                                <p className={`font-medium ${isSelected ? "text-blue-300" : "text-white"}`}>
                                                    {student.user.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{student.rollNumber}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-600"
                                                }`}>
                                                {isSelected && <Plus className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Enrolled Students */}
                    <div className="flex-1 p-6 flex flex-col min-h-0 bg-gray-900/50">
                        <h3 className="font-semibold text-gray-300 mb-4 flex items-center justify-between">
                            <span>Enrolled Students</span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{enrolledStudents.length}</span>
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : enrolledStudents.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No students enrolled yet.</p>
                            ) : (
                                enrolledStudents.map(student => (
                                    <div key={student.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                                        <div>
                                            <p className="font-medium text-white">{student.user.name}</p>
                                            <p className="text-xs text-gray-500">{student.rollNumber}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(student.id)}
                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors group"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon helper
function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
