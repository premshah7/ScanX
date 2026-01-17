"use client";

import { useState } from "react";
import { uploadBulkUsers } from "@/actions/bulk";
import { Loader2, Upload, FileText, X, Check, AlertCircle } from "lucide-react";

type Props = {
    userType: "STUDENT" | "FACULTY";
    isOpen: boolean;
    onClose: () => void;
};

export default function BulkUploadModal({ userType, isOpen, onClose }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: number, failed?: number, errors?: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadBulkUsers(formData, userType);

        if (res.error) {
            setResult({ errors: [res.error] });
        } else if (res.stats) {
            setResult({
                success: res.stats.success,
                failed: res.stats.failed,
                errors: res.stats.errors
            });
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-400" />
                        Bulk Upload {userType === "STUDENT" ? "Students" : "Faculty"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {!result ? (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors bg-gray-800/20">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                                <FileText className="w-12 h-12 text-gray-500 mb-4" />
                                <span className="text-gray-300 font-medium mb-1">
                                    {file ? file.name : "Click to upload PDF"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Format: Name Email {userType === "STUDENT" ? "RollNo EnrollmentNo" : ""}
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Upload & Process
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                                <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">{result.success || 0}</div>
                                <div className="text-sm text-green-400">Created</div>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-center">
                                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">{result.failed || 0}</div>
                                <div className="text-sm text-red-400">Failed</div>
                            </div>
                        </div>

                        {result.errors && result.errors.length > 0 && (
                            <div className="bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto custom-scrollbar">
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Error Log:</h4>
                                <ul className="space-y-1">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="text-xs text-red-400 font-mono">• {err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
