import { getSystemSettings } from "@/actions/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
    const settings = await getSystemSettings();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-foreground">System Settings</h1>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
