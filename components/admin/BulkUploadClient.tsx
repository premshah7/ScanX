"use client";

import { useState } from "react";
import BulkUploadModal from "./BulkUploadModal";
import { Upload } from "lucide-react";

type Props = {
    userType: "STUDENT" | "FACULTY";
};

export default function BulkUploadClient({ userType }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
            >
                <Upload className="w-4 h-4" />
                Bulk Upload
            </button>

            {isOpen && (
                <BulkUploadModal
                    userType={userType}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
