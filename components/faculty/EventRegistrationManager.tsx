"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, FileSpreadsheet, Check, X, ShieldAlert, Clock, CheckCircle, Trash2 } from "lucide-react";
import { approveRegistration, rejectRegistration, deleteRegistration, exportRegistrations } from "@/actions/event-registration";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EventRegistrationManager({
    eventId,
    requiresApproval,
    initialRegistrations,
    customFields
}: {
    eventId: number;
    requiresApproval: boolean;
    initialRegistrations: any[];
    customFields: any[];
}) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
    const [isExporting, setIsExporting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    const filteredRegs = useMemo(() => {
        return initialRegistrations.filter(r => {
            const matchesSearch = r.user.name.toLowerCase().includes(search.toLowerCase()) ||
                (r.user.username && r.user.username.toLowerCase().includes(search.toLowerCase()));
            const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [initialRegistrations, search, statusFilter]);

    async function handleApprove(id: number) {
        startTransition(async () => {
            const promise = approveRegistration(id);
            toast.promise(promise, {
                loading: "Approving...",
                success: (res) => {
                    if (res.error) throw new Error(res.error);
                    router.refresh();
                    return "Registration approved.";
                },
                error: (err) => err.message
            });
        });
    }

    async function handleReject(id: number) {
        startTransition(async () => {
            const promise = rejectRegistration(id);
            toast.promise(promise, {
                loading: "Rejecting...",
                success: (res) => {
                    if (res.error) throw new Error(res.error);
                    router.refresh();
                    return "Registration rejected.";
                },
                error: (err) => err.message
            });
        });
    }

    async function handleDelete(id: number) {
        setDeleteId(id);
    }

    async function confirmDelete() {
        if (!deleteId) return;
        startTransition(async () => {
            try {
                const res = await deleteRegistration(deleteId);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("Guest removed successfully.");
                    router.refresh();
                    setDeleteId(null);
                }
            } catch (error) {
                toast.error("Failed to remove guest.");
            }
        });
    }

    async function handleExport() {
        setIsExporting(true);
        try {
            const res = await exportRegistrations(eventId);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            if (res.csv) {
                const blob = new Blob([res.csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = res.filename || "export.csv";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (e) {
            toast.error("Export failed");
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search names or usernames..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        title="Filter by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="py-2 px-3 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 border border-green-200 dark:border-green-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        {isExporting ? "Exporting..." : "Export CSV"}
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-card mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-5 py-3 whitespace-nowrap">Guest Info</th>
                                <th className="px-5 py-3 whitespace-nowrap">Status</th>
                                <th className="px-5 py-3 whitespace-nowrap">Registered On</th>
                                {customFields.map((f, i) => <th key={i} className="px-5 py-3 whitespace-nowrap">{f.label}</th>)}
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredRegs.map(reg => (
                                <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="font-semibold text-foreground whitespace-nowrap">{reg.user.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            {reg.user.username && <span>@{reg.user.username}</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        {reg.status === "APPROVED" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>}
                                        {reg.status === "PENDING" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                                        {reg.status === "REJECTED" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800"><ShieldAlert className="w-3.5 h-3.5" /> Rejected</span>}
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                                        {new Date(reg.registeredAt).toLocaleDateString()}
                                    </td>
                                    {customFields.map((f, i) => (
                                        <td key={i} className="px-5 py-3 max-w-[150px] truncate" title={String((reg.formData as any)?.[f.name] || "")}>
                                            {String((reg.formData as any)?.[f.name] || "-")}
                                        </td>
                                    ))}
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {reg.status === "PENDING" && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(reg.id)}
                                                        title="Approve"
                                                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900 border border-green-200 dark:border-green-800 transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(reg.id)}
                                                        title="Reject"
                                                        className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(reg.id)}
                                                title="Delete Guest"
                                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRegs.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-5 py-8 text-center text-muted-foreground">
                                        No registrations found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                loading={isPending}
                title="Remove Guest"
                description="Are you sure you want to remove this registration? The user will no longer be listed as a guest and their attendance records for this event may be affected."
                confirmText="Remove Guest"
                variant="danger"
            />
        </div>
    );
}
