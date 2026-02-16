import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, BookOpen, Hash } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function FacultyProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "FACULTY") {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(session.user.id) },
        include: {
            faculty: {
                include: {
                    subjects: true
                }
            }
        }
    });

    if (!user || !user.faculty) {
        return <div className="p-8 text-foreground">Faculty record not found.</div>;
    }

    return (
        <div className="min-h-screen text-foreground animate-slide-up max-w-lg mx-auto">

            {/* Profile Avatar & Name */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-md mb-4">
                    <span className="font-bold text-white text-3xl">{user.name[0]}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
            </div>

            {/* Info Cards */}
            <div className="space-y-3 mb-6">
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Hash} label="Faculty ID" value={String(user.faculty.id)} />
                <InfoRow icon={BookOpen} label="Subjects" value={user.faculty.subjects.map(s => s.name).join(", ") || "None assigned"} />
            </div>

            {/* Theme & Logout */}
            <div className="space-y-2 border-t border-border pt-4">
                <ThemeToggle />
                <LogoutButton />
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover-lift">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-sm font-semibold text-foreground truncate">{value}</p>
            </div>
        </div>
    );
}
