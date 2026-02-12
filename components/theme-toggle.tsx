"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    return (
        <Button
            variant="ghost"
            className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-muted w-full justify-start",
                isCollapsed && "justify-center px-0"
            )}
            onClick={cycleTheme}
            title="Toggle theme"
        >
            <Sun className={cn("w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0", !isCollapsed && "mr-2")} />
            <Moon className={cn("absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="ml-6">Theme</span>}
        </Button>
    );
}
