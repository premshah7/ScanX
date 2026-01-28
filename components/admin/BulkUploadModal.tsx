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

        // 1. Parse PDF
        const { parsePdfPreview } = await import("@/actions/bulk");
        const parseRes = await parsePdfPreview(formData);

        if (parseRes.error || !parseRes.rows) {
            setResult({ errors: [parseRes.error || "Failed to parse PDF"] });
            setLoading(false);
            return;
        }

        // 2. Map Rows to StudentData
        // Assuming format: Name | Email | Roll | Enrollment | Batch (Flexible)
        // Simple mapping based on index or assuming standard order for now to unblock
        const students = parseRes.rows.map(row => ({
            name: row[0] || "",
            email: row[1] || "",
            roll: row[2] || "",
            enrollment: row[3] || "",
            batch: row[4] || ""
        })).filter(s => s.email && s.email.includes("@"));

        // 3. Upload Parsed Data
        const res = await uploadBulkUsers(students, userType);

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
            <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <Upload className="w-5 h-5 text-primary" />
                        Bulk Upload {userType === "STUDENT" ? "Students" : "Faculty"}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {!result ? (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/20">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                                <span className="text-foreground font-medium mb-1">
                                    {file ? file.name : "Click to upload PDF"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Format: Name Email {userType === "STUDENT" ? "RollNo EnrollmentNo" : ""}
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 disabled:opacity-50"
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
                                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-foreground">{result.success || 0}</div>
                                <div className="text-sm text-green-500">Created</div>
                            </div>
                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg text-center">
                                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                                <div className="text-2xl font-bold text-foreground">{result.failed || 0}</div>
                                <div className="text-sm text-destructive">Failed</div>
                            </div>
                        </div>

                        {result.errors && result.errors.length > 0 && (
                            <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto custom-scrollbar">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Error Log:</h4>
                                <ul className="space-y-1">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="text-xs text-destructive font-mono">• {err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
