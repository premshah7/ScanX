import Link from "next/link";
import BulkAddStudentModal from "@/components/admin/BulkAddStudentModal";
import RemoveStudentFromBatchButton from "@/components/admin/RemoveStudentFromBatchButton";
import { getBatchDetails } from "@/actions/batch";
import { ArrowLeft, User, GraduationCap, Calendar, Mail } from "lucide-react";

export default async function BatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // ... existing initialization ...
    const { id } = await params;
    const { batch, error } = await getBatchDetails(parseInt(id));

    if (error || !batch) {
        return (
            <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-xl">
                <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
                <p className="text-destructive/80">{error || "Batch not found"}</p>
                <Link href="/admin/batches" className="inline-block mt-4 text-primary hover:text-primary/80">
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
                    className="p-2 bg-card border border-border hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{batch.name}</h1>
                    <p className="text-muted-foreground">Total Students: {batch._count.students}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Enrolled Students
                    </h2>
                    <BulkAddStudentModal batchId={batch.id} />
                </div>


                {batch.students.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No students enrolled in this batch yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Roll Number</th>
                                    <th className="p-4">Enrollment No</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {batch.students.map((student) => (
                                    <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-medium text-foreground">{student.user.name}</span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{student.rollNumber}</td>
                                        <td className="p-4 text-muted-foreground">{student.enrollmentNo}</td>
                                        <td className="p-4 text-muted-foreground flex items-center gap-2">
                                            <Mail className="w-3 h-3" />
                                            {student.user.email}
                                        </td>
                                        <td className="p-4">
                                            <RemoveStudentFromBatchButton
                                                studentId={student.id}
                                                batchId={batch.id}
                                                studentName={student.user.name}
                                            />
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
