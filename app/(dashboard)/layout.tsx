import { Sidebar } from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import MobileBottomNav from "@/components/student/MobileBottomNav";
import FacultyBottomNav from "@/components/faculty/FacultyBottomNav";
import { ThemeToggle } from "@/components/theme-toggle";
import LogoutButton from "@/components/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    const userRole = session?.user.role;
    const isStudent = userRole === "STUDENT";
    const isFaculty = userRole === "FACULTY";
    const hasMobileBottomNav = isStudent || isFaculty;

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Desktop Sidebar */}
            <Sidebar userRole={userRole} />

            {/* Mobile Sidebar & Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b bg-card flex items-center justify-between sticky top-0 z-20">
                    <span className="font-bold text-lg">ScanX</span>
                    {hasMobileBottomNav ? (
                        <div className="flex items-center gap-1">
                            <ThemeToggle isCollapsed />
                            <LogoutButton iconOnly className="!w-auto !p-2 rounded-xl" />
                        </div>
                    ) : (
                        <MobileSidebar>
                            <Sidebar userRole={userRole} />
                        </MobileSidebar>
                    )}
                </div>

                <main className={`flex-1 p-4 md:p-6 overflow-y-auto ${hasMobileBottomNav ? "pb-24 md:pb-6" : ""}`}>
                    {children}
                </main>

                {/* Mobile bottom nav */}
                {isStudent && <MobileBottomNav />}
                {isFaculty && <FacultyBottomNav />}
            </div>
        </div>
    );
}
