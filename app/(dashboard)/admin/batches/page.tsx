"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getBatches, createBatch, deleteBatch } from "@/actions/batch";
import { Loader2, Plus, Trash2, Layers, Eye } from "lucide-react";

type Batch = {
    id: number;
    name: string;
    _count: {
        students: number;
    };
};

export default function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [newBatchName, setNewBatchName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const fetchBatches = async () => {
        setLoading(true);
        const result = await getBatches();
        if (result.batches) {
            setBatches(result.batches);
        } else if (result.error) {
            setError(result.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBatchName.trim()) return;

        setCreating(true);
        setError("");
        const result = await createBatch(newBatchName);

        if (result.success) {
            setNewBatchName("");
            fetchBatches();
        } else {
            setError(result.error || "Failed to create batch");
        }
        setCreating(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? Verify no students are assigned first.")) return;

        const result = await deleteBatch(id);
        if (result.success) {
            fetchBatches();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Batch Management
            </h1>

            {/* Create Batch Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    Create New Batch
                </h2>
                <form onSubmit={handleCreate} className="flex gap-4">
                    <input
                        type="text"
                        value={newBatchName}
                        onChange={(e) => setNewBatchName(e.target.value)}
                        placeholder="Batch Name (e.g. Batch A)"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={creating || !newBatchName.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Batch
                    </button>
                </form>
                {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
            </div>

            {/* Batch List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-400" />
                        Existing Batches
                    </h2>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : batches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No batches found. Create one to get started.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {batches.map((batch) => (
                            <div key={batch.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                                <Link
                                    href={`/admin/batches/${batch.id}`}
                                    className="flex-1 group cursor-pointer"
                                >
                                    <h3 className="font-medium text-white text-lg group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                        {batch.name}
                                        <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                    </h3>
                                    <p className="text-sm text-gray-400 group-hover:text-gray-300">Total Students: {batch._count.students}</p>
                                </Link>
                                <button
                                    onClick={() => handleDelete(batch.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                                    title="Delete Batch"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
