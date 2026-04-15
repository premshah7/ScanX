"use client";

import { useState, useTransition } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    User, 
    ShieldCheck, 
    Ban, 
    ArrowUpCircle, 
    Loader2,
    MoreHorizontal
} from "lucide-react";
import { toggleUserStatus, elevateToAdmin } from "@/actions/super-admin";
import { toast } from "sonner";

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
}

export default function AdminList({ initialUsers }: { initialUsers: AdminUser[] }) {
    const [isPending, startTransition] = useTransition();
    const [users, setUsers] = useState(initialUsers);

    const handleToggleStatus = async (userId: number, currentStatus: string) => {
        startTransition(async () => {
            const result = await toggleUserStatus(userId, currentStatus);
            if (result.success) {
                toast.success("User status updated");
                setUsers(prev => prev.map(u => 
                    u.id === userId 
                        ? { ...u, status: currentStatus === "APPROVED" ? "PENDING" : "APPROVED" } 
                        : u
                ));
            } else {
                toast.error(result.error || "Failed to update status");
            }
        });
    };

    const handleElevate = async (userId: number) => {
        startTransition(async () => {
            const result = await elevateToAdmin(userId);
            if (result.success) {
                toast.success("User elevated to Admin role");
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "ADMIN" } : u));
            } else {
                toast.error(result.error || "Failed to elevate user");
            }
        });
    };

    return (
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-lg">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="font-bold">Administrator</TableHead>
                        <TableHead className="font-bold">Role</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="font-bold">Joined</TableHead>
                        <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors group">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.role === "SUPER_ADMIN" ? "default" : "secondary"} className="font-mono">
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    className={cn(
                                        "font-bold",
                                        user.status === "APPROVED" 
                                            ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                            : "bg-red-500/10 text-red-600 border-red-500/20"
                                    )}
                                >
                                    {user.status === "APPROVED" ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {user.role === "FACULTY" && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleElevate(user.id)}
                                            disabled={isPending}
                                            className="h-8 gap-1 border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                                        >
                                            <ArrowUpCircle className="w-3.5 h-3.5" />
                                            Elevate
                                        </Button>
                                    )}
                                    {user.role !== "SUPER_ADMIN" && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleToggleStatus(user.id, user.status)}
                                            disabled={isPending}
                                            className={cn(
                                                "h-8 gap-1",
                                                user.status === "APPROVED" 
                                                    ? "border-red-500/20 text-red-600 hover:bg-red-500/10"
                                                    : "border-green-500/20 text-green-600 hover:bg-green-500/10"
                                            )}
                                        >
                                            {user.status === "APPROVED" ? (
                                                <><Ban className="w-3.5 h-3.5" /> Deactivate</>
                                            ) : (
                                                <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>
                                            )}
                                        </Button>
                                    )}
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                No administrative users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
