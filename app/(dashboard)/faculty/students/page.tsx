import { getFacultyStudents } from "@/actions/faculty";
import StudentList from "@/components/faculty/StudentList";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function FacultyStudentsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "FACULTY") {
        redirect("/auth/login");
    }

    const students = await getFacultyStudents(session.user.email!);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Students</h1>
                <p className="text-muted-foreground">View and manage students assigned to your batches</p>
            </div>

            <StudentList students={students} />
        </div>
    );
}
