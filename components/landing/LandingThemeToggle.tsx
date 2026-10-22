"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";

export function LandingThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Placeholder during SSR to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="h-7 w-20 rounded border border-border/80 bg-muted/40 animate-pulse" />
        );
    }

    const currentTheme = theme || "system";

    return (
        <div
            role="radiogroup"
            aria-label="Color theme"
            className="inline-flex items-center p-0.5 rounded border border-border bg-muted/50 text-muted-foreground"
        >
            <button
                type="button"
                role="radio"
                aria-checked={currentTheme === "system"}
                aria-label="System theme"
                title="System theme"
                onClick={() => {
                    try {
                        setTheme("system");
                    } catch {}
                }}
                className={`p-1 rounded text-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring ${
                    currentTheme === "system"
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "hover:text-foreground"
                }`}
            >
                <Laptop className="w-3.5 h-3.5" />
            </button>

            <button
                type="button"
                role="radio"
                aria-checked={currentTheme === "light"}
                aria-label="Light theme"
                title="Light theme"
                onClick={() => {
                    try {
                        setTheme("light");
                    } catch {}
                }}
                className={`p-1 rounded text-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring ${
                    currentTheme === "light"
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "hover:text-foreground"
                }`}
            >
                <Sun className="w-3.5 h-3.5" />
            </button>

            <button
                type="button"
                role="radio"
                aria-checked={currentTheme === "dark"}
                aria-label="Dark theme"
                title="Dark theme"
                onClick={() => {
                    try {
                        setTheme("dark");
                    } catch {}
                }}
                className={`p-1 rounded text-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring ${
                    currentTheme === "dark"
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "hover:text-foreground"
                }`}
            >
                <Moon className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
