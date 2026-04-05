"use client";

import { rejectStudent } from "@/actions/admin";
import { X } from "lucide-react";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function RejectButton({ userId }: { userId: number }) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleReject = async () => {
        startTransition(async () => {
            const res = await rejectStudent(userId);
            if (res.error) {
                alert(res.error);
            } else {
                setShowConfirm(false);
                router.refresh();
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isPending}
                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Reject Request"
            >
                <X className="w-5 h-5" />
            </button>

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleReject}
                title="Reject Student Request"
                description="Are you sure you want to REJECT and DELETE this student request? This action cannot be undone."
                confirmText="Reject & Delete"
                variant="danger"
                loading={isPending}
            />
        </>
    );
}
