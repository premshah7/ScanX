import Link from "next/link";
import BulkAddStudentModal from "@/components/admin/BulkAddStudentModal";
import { getBatchDetails } from "@/actions/batch";
import { ArrowLeft, User, GraduationCap, Calendar, Mail } from "lucide-react";

export default async function BatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // ... existing initialization ...
    const { id } = await params;
    const { batch, error } = await getBatchDetails(parseInt(id));

    if (error || !batch) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
                <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
                <p className="text-red-400">{error || "Batch not found"}</p>
                <Link href="/admin/batches" className="inline-block mt-4 text-blue-400 hover:text-blue-300">
                    &larr; Back to Batches
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/admin/batches"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">{batch.name}</h1>
                    <p className="text-gray-400">Total Students: {batch._count.students}</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                        Enrolled Students
                    </h2>
                    <BulkAddStudentModal batchId={batch.id} />
                </div>


                {batch.students.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No students enrolled in this batch yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800 text-gray-400">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Roll Number</th>
                                    <th className="p-4">Enrollment No</th>
                                    <th className="p-4">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {batch.students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <span className="font-medium text-white">{student.user.name}</span>
                                        </td>
                                        <td className="p-4 text-gray-300">{student.rollNumber}</td>
                                        <td className="p-4 text-gray-300">{student.enrollmentNo}</td>
                                        <td className="p-4 text-gray-400 flex items-center gap-2">
                                            <Mail className="w-3 h-3" />
                                            {student.user.email}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
