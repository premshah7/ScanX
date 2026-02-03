"use client";

import { useState } from "react";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { resetAllDevices } from "@/actions/admin";

export default function ResetAllDevicesButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleReset = async () => {
        try {
            setIsLoading(true);
            const res = await resetAllDevices();

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("All student devices have been reset successfully");
                setShowConfirm(false);
            }
        } catch (error) {
            toast.error("Failed to reset devices");
        } finally {
            setIsLoading(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-card w-full max-w-md rounded-xl border border-destructive/20 shadow-lg overflow-hidden">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-destructive">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Confirm Reset</h3>
                        </div>

                        <div className="space-y-2">
                            <p className="text-muted-foreground">
                                Are you sure you want to reset device registration for <strong className="text-foreground">ALL students</strong>?
                            </p>
                            <p className="text-sm text-yellow-500/90 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                                This will allow every student to register a new device on their next login. This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reset"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-destructive/20"
            title="Reset All Devices"
        >
            <RefreshCw className="w-5 h-5" />
        </button>
    );
}
