"use client";

import { useState } from "react";
import { searchFaculty, addOrganizer, removeOrganizer } from "@/actions/event";
import { Loader2, Plus, X, Search, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function OrganizerManager({ 
    eventId, 
    initialOrganizers,
    canManage
}: { 
    eventId: number, 
    initialOrganizers: any[],
    canManage: boolean
}) {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isMutating, setIsMutating] = useState<number | null>(null);
    const router = useRouter();

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (val.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const results = await searchFaculty(val);
        // Filter out already existing organizers
        const existingIds = new Set(initialOrganizers.map(o => o.userId));
        setSearchResults(results.filter((r: any) => !existingIds.has(r.id)));
        setIsSearching(false);
    };

    const handleAdd = async (userId: number, name: string) => {
        setIsMutating(userId);
        const res = await addOrganizer(eventId, userId);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Added ${name} as organizer`);
            setQuery("");
            setSearchResults([]);
            router.refresh();
        }
        setIsMutating(null);
    };

    const handleRemove = async (userId: number, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        
        setIsMutating(userId);
        const res = await removeOrganizer(eventId, userId);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Removed ${name}`);
            router.refresh();
        }
        setIsMutating(null);
    };

    return (
        <div className="space-y-6">
            {/* Current Organizers List */}
            <div className="space-y-3">
                {initialOrganizers.map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                org.role === "CREATOR" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-primary/20 text-primary"
                            }`}>
                                {org.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    {org.user.name}
                                    {org.role === "CREATOR" ? (
                                        <span className="text-[10px] uppercase font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Creator
                                        </span>
                                    ) : (
                                        <span className="text-[10px] uppercase font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-sm">
                                            Organizer
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-muted-foreground">{org.user.email}</p>
                            </div>
                        </div>

                        {canManage && org.role !== "CREATOR" && (
                            <button
                                onClick={() => handleRemove(org.userId, org.user.name)}
                                disabled={isMutating === org.userId}
                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                                title="Remove Organizer"
                            >
                                {isMutating === org.userId ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Organizer Form */}
            {canManage && (
                <div className="bg-card border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
                        <Search className="w-4 h-4" /> Find Faculty/Admins
                    </h4>
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearch}
                            placeholder="Search by name or email..."
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {query.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1 max-h-48 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <div key={user.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(user.id, user.name)}
                                            disabled={isMutating === user.id}
                                            className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:bg-primary/90 flex items-center gap-1"
                                        >
                                            {isMutating === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                            Add
                                        </button>
                                    </div>
                                ))
                            ) : !isSearching ? (
                                <p className="text-xs text-muted-foreground text-center p-2">No matching faculty found or they are already organizers.</p>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
