import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminUsers } from "@/actions/super-admin";
import AdminList from "@/components/super-admin/AdminList";
import CreateAdminModal from "@/components/super-admin/CreateAdminModal";
import { Users, ShieldAlert, History } from "lucide-react";

export default async function AdminManagementPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/unauthorized");
    }

    const adminUsers = await getAdminUsers();

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-2">
                <div>
                    <h1 className="text-4xl font-extrabold mb-3 text-primary flex items-center gap-3">
                        <ShieldAlert className="w-9 h-9" />
                        Admin Management
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Monitor and manage account access for Administrators and Faculty. You can promote, deactivate or create new administrative accounts here.
                    </p>
                </div>
                <div className="flex shrink-0">
                    <CreateAdminModal />
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-primary font-bold text-sm uppercase tracking-wider mb-1">Active Admins</p>
                        <p className="text-4xl font-black text-primary">
                            {adminUsers.filter(u => u.role === "ADMIN" && u.status === "APPROVED").length}
                        </p>
                    </div>
                    <Users className="w-12 h-12 text-primary/20" />
                </div>
                <div className="bg-orange-500/5 border-2 border-orange-500/10 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-orange-600 font-bold text-sm uppercase tracking-wider mb-1">Faculty Access</p>
                        <p className="text-4xl font-black text-orange-600">
                            {adminUsers.filter(u => u.role === "FACULTY" && u.status === "APPROVED").length}
                        </p>
                    </div>
                    <Users className="w-12 h-12 text-orange-500/20" />
                </div>
                <div className="bg-red-500/5 border-2 border-red-500/10 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-red-600 font-bold text-sm uppercase tracking-wider mb-1">Inactive Accounts</p>
                        <p className="text-4xl font-black text-red-600">
                            {adminUsers.filter(u => u.status !== "APPROVED").length}
                        </p>
                    </div>
                    <History className="w-12 h-12 text-red-500/20" />
                </div>
            </div>

            {/* Admin Table Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-foreground">Global Admin List</h2>
                    <span className="text-sm text-muted-foreground font-medium">Showing {adminUsers.length} total staff members</span>
                </div>
                <AdminList initialUsers={adminUsers} />
            </div>
            
            <div className="p-8 rounded-2xl bg-muted/30 border-2 border-dashed border-border flex flex-col items-center text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-muted-foreground/40" />
                <h3 className="text-xl font-bold">Security Notice</h3>
                <p className="text-muted-foreground max-w-lg">
                    Changes made here take effect immediately upon the next user login. Ensure 2FA is active for all Super Admin accounts to maintain platform integrity.
                </p>
            </div>
        </div>
    );
}
