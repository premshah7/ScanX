import { Sidebar } from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    const userRole = session?.user.role;

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Desktop Sidebar */}
            <Sidebar userRole={userRole} />

            {/* Mobile Sidebar & Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="md:hidden p-4 border-b bg-card flex items-center justify-between sticky top-0 z-20">
                    <span className="font-bold text-lg">GeoGuard</span>
                    <MobileSidebar>
                        <Sidebar userRole={userRole} />
                    </MobileSidebar>
                </div>

                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
