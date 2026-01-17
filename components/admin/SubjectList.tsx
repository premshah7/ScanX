"use client";

import { useState } from "react";
import { Users, BookOpen, GraduationCap } from "lucide-react";
import SubjectEnrollment from "./SubjectEnrollment";

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

export default function SubjectList({ subjects }: { subjects: Subject[] }) {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">ID: {subject.id}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{subject.name}</h3>

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
        </>
    );
}
