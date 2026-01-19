"use client";

import { useState } from "react";
import { Users, BookOpen, GraduationCap, Edit, Trash2 } from "lucide-react";
import SubjectEnrollment from "./SubjectEnrollment";
import EditSubjectModal from "./EditSubjectModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { deleteSubject } from "@/actions/subject";

type Subject = {
    id: number;
    name: string;
    faculty: {
        id: number;
        user: { name: string };
    };
    _count: {
        students: number;
    };
};

type Faculty = {
    id: number;
    user: {
        name: string;
    };
};

export default function SubjectList({ subjects, facultyList }: { subjects: Subject[], facultyList: Faculty[] }) {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    // State for delete confirmation
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (subject: Subject) => {
        setSubjectToDelete(subject);
    };

    const confirmDelete = async () => {
        if (!subjectToDelete) return;

        setIsDeleting(true);
        const result = await deleteSubject(subjectToDelete.id);

        if (result?.error) {
            alert(result.error);
        }

        setIsDeleting(false);
        setSubjectToDelete(null);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group relative"
                    >
                        {/* Actions (Top Right) */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setEditingSubject(subject)}
                                className="p-2 bg-gray-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg transition-colors"
                                title="Edit Subject"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(subject)}
                                className="p-2 bg-gray-800 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors"
                                title="Delete Subject"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 pr-12 truncate" title={subject.name}>{subject.name}</h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>Faculty: <span className="text-white">{subject.faculty.user.name}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <GraduationCap className="w-4 h-4" />
                                <span>Students: <span className="text-white">{subject._count.students}</span></span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedSubject(subject)}
                            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Manage Enrollment
                        </button>
                    </div>
                ))}

                {subjects.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-900/50 border border-gray-800 border-dashed rounded-xl">
                        No subjects found. Create one to get started.
                    </div>
                )}
            </div>

            {selectedSubject && (
                <SubjectEnrollment
                    subjectId={selectedSubject.id}
                    subjectName={selectedSubject.name}
                    isOpen={!!selectedSubject}
                    onClose={() => setSelectedSubject(null)}
                />
            )}

            {editingSubject && (
                <EditSubjectModal
                    subject={editingSubject}
                    isOpen={!!editingSubject}
                    onClose={() => setEditingSubject(null)}
                    facultyList={facultyList}
                />
            )}

            <ConfirmationModal
                isOpen={!!subjectToDelete}
                onClose={() => setSubjectToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Subject"
                description={`Are you sure you want to delete "${subjectToDelete?.name}"? This will permanently delete all associated sessions and attendance records.`}
                confirmText="Delete Subject"
                isLoading={isDeleting}
                variant="danger"
            />
        </>
    );
}
