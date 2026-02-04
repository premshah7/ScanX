"use client";

import { updateSystemSettings, getCurrentIp } from "@/actions/settings";
import { Loader2, Save, Globe, Wand2 } from "lucide-react";
import { useState } from "react";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [prefix, setPrefix] = useState(initialSettings.allowedIpPrefix || "");

    const handleAutoConfig = async () => {
        try {
            const ip = await getCurrentIp();
            // Convert "192.168.1.50" -> "192.168.1."
            const parts = ip.split(".");
            if (parts.length === 4) {
                const newPrefix = `${parts[0]}.${parts[1]}.${parts[2]}.`;
                setPrefix(newPrefix);
                setMessage("IP Detected & Applied!");
            } else {
                setPrefix(ip); // Fallback for IPv6 or weird formats
            }
        } catch (error) {
            console.error("Failed to detect IP", error);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setMessage("");

        const result = await updateSystemSettings(formData);

        if (result.success) {
            setMessage("Settings updated successfully");
        } else {
            setMessage("Failed to update settings");
        }
        setLoading(false);
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-lg">
            <div className="flex items-center gap-4 p-4 bg-muted/50 border border-border rounded-lg">
                <Globe className="w-8 h-8 text-blue-600" />
                <div>
                    <h3 className="text-lg font-medium text-foreground">IP Restriction</h3>
                    <p className="text-sm text-muted-foreground">Limit attendance to a specific network.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="isIpCheckEnabled"
                    name="isIpCheckEnabled"
                    defaultChecked={initialSettings.isIpCheckEnabled}
                    className="w-5 h-5 rounded border-input bg-background text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isIpCheckEnabled" className="text-foreground font-medium">
                    Enable IP Check
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Allowed IP Prefix (e.g., 192.168.1.)
                </label>
                <div className="flex gap-2">
                    <input
                        name="allowedIpPrefix"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="192.168.1."
                        className="flex-1 bg-background border border-input rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    />
                    <button
                        type="button"
                        onClick={handleAutoConfig}
                        className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg flex items-center gap-2 transition-colors border border-border"
                        title="Auto-detect current network"
                    >
                        <Wand2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Auto Config</span>
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Only students with IPs starting with this prefix will be able to mark attendance.
                </p>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/20" : "bg-destructive/15 text-destructive border border-destructive/20"}`}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
            </button>
        </form>
    );
}
