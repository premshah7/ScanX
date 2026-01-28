import { prisma } from "@/lib/prisma";
import { Smartphone, RefreshCw, Loader2, UserPlus } from "lucide-react";
import DeviceResetButton from "@/components/admin/DeviceResetButton";
import ApproveButton from "@/components/admin/ApproveButton";
import RejectButton from "@/components/admin/RejectButton";

export default async function PendingRequests() {
    // 1. Fetch pending device resets
    const pendingResets = await prisma.student.findMany({
        where: { isDeviceResetRequested: true },
        include: { user: true },
    });

    // 2. Fetch pending account approvals
    const pendingApprovals = await prisma.student.findMany({
        where: { user: { status: "PENDING" } },
        include: { user: true },
    });

    if (pendingResets.length === 0 && pendingApprovals.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6 mb-8">
            {/* Account Approvals */}
            {pendingApprovals.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-blue-700">Pending Account Approvals</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingApprovals.map(student => (
                            <div key={student.id} className="bg-card border border-border p-4 rounded-lg flex items-center justify-between shadow-sm">
                                <div>
                                    <div className="font-bold text-foreground">{student.user.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.user.email}</div>
                                    <div className="text-xs text-muted-foreground">Roll: {student.rollNumber}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ApproveButton userId={student.user.id} />
                                    <RejectButton userId={student.user.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Device Resets */}
            {pendingResets.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="w-5 h-5 text-yellow-600" />
                        <h2 className="text-lg font-bold text-yellow-700">Pending Device Reset Requests</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingResets.map(student => (
                            <div key={student.id} className="bg-card border border-border p-4 rounded-lg flex items-center justify-between shadow-sm">
                                <div>
                                    <div className="font-bold text-foreground">{student.user.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                                </div>
                                <DeviceResetButton
                                    studentId={student.id}
                                    hasDevice={!!student.deviceHash}
                                    isRequested={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
