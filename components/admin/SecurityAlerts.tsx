"use client";

import { AlertTriangle, Smartphone } from "lucide-react";
import FormattedTime from "@/components/FormattedTime";

type Props = {
    alerts: any[];
};

export default function SecurityAlerts({ alerts }: Props) {
    if (alerts.length === 0) {
        return <div className="text-gray-400 text-sm">No recent alerts found.</div>;
    }

    return (
        <div className="space-y-4">
            {alerts.map((alert) => (
                <div key={alert.id} className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-sm text-red-200 font-medium">
                            Proxy Attempt Detected
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            <span className="text-white font-semibold">{alert.student.user.name}</span>
                            {" tried to mark attendance using "}
                            {alert.deviceOwner ? (
                                <span className="text-yellow-400 font-semibold">{alert.deviceOwner.user.name}'s</span>
                            ) : (
                                "an unknown"
                            )}
                            {" device."}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                            <Smartphone className="w-3 h-3" />
                            <FormattedTime date={alert.timestamp} includeSeconds />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
