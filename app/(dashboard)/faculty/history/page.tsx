import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFacultyHistory } from "@/actions/faculty";
import HistoryTable from "@/components/faculty/HistoryTable";

export default async function FacultyHistoryPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "FACULTY") {
        redirect("/auth/login");
    }

    const history = await getFacultyHistory(session.user.email || "");

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Session History</h1>
                <p className="text-gray-400">View and export past attendance records</p>
            </div>

            <HistoryTable sessions={history} />
        </div>
    );
}
