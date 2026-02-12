"use client";

import { useEffect, useState } from "react";
import { getStudentStatus } from "@/actions/student";
import { Smartphone } from "lucide-react";
import RequestResetButton from "@/components/student/RequestResetButton";
import { useRouter } from "next/navigation";

interface DeviceStatusProps {
    initialDeviceHash: string | null;
    initialDeviceId: string | null;
    initialIsRequested: boolean;
}

export default function DeviceStatus({ initialDeviceHash, initialDeviceId, initialIsRequested }: DeviceStatusProps) {
    const router = useRouter();
    const [deviceHash, setDeviceHash] = useState(initialDeviceHash);
    const [deviceId, setDeviceId] = useState(initialDeviceId);
    const [isRequested, setIsRequested] = useState(initialIsRequested);

    // Polling logic to check for status updates
    useEffect(() => {
        const interval = setInterval(async () => {
            // Only poll if tab is visible to save resources
            if (document.visibilityState === "visible") {
                const status = await getStudentStatus();
                if (status) {
                    // Check if state has changed from what we currently display
                    const hashChanged = status.deviceHash !== deviceHash;
                    const idChanged = status.deviceId !== deviceId;
                    const requestChanged = status.isDeviceResetRequested !== isRequested;

                    if (hashChanged || requestChanged || idChanged) {
                        setDeviceHash(status.deviceHash);
                        setDeviceId(status.deviceId);
                        setIsRequested(status.isDeviceResetRequested);

                        // If device became unbound (reset approved), refresh the whole page
                        // so the "Mark Attendance" button and other logic updates too
                        if (hashChanged) {
                            router.refresh();
                        }
                    }
                }
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [deviceHash, deviceId, isRequested, router]);

    return (
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg transition-all hover:shadow-xl hover:bg-white/10">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${deviceHash ? 'bg-gradient-to-b from-emerald-400 to-teal-500' : 'bg-gradient-to-b from-amber-400 to-orange-500'}`} />

            <div className="p-5 pl-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${deviceHash ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Smartphone className="w-6 h-6" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground text-lg tracking-tight">
                                {deviceHash ? 'Device Linked' : 'Device Unlinked'}
                            </h3>
                            <span className={`flex h-2.5 w-2.5 rounded-full ${deviceHash ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
                        </div>

                        <p className="text-sm text-muted-foreground font-medium">
                            {deviceHash
                                ? 'Permission granted to mark attendance'
                                : 'Scan a QR code to link this device'
                            }
                        </p>

                        {deviceHash && deviceId && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">ID</span>
                                <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                                    {deviceId.substring(0, 8)}...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {deviceHash && (
                    <div className="pl-4 border-l border-white/10">
                        <RequestResetButton isRequested={isRequested} />
                    </div>
                )}
            </div>
        </div>
    );
}
