"use client";

import { Share2, Check, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function ShareLinkButton({ path }: { path: string }) {
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const fullUrl = `${origin}${path}`;

    const handleCopy = () => {
        if (!origin) return;
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast.success("Event link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleCopy}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
            </button>
            <Link
                href={path}
                target="_blank"
                className="px-4 py-2 bg-muted hover:bg-border text-foreground text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
                <ExternalLink className="w-4 h-4" /> View Page
            </Link>
        </div>
    );
}
