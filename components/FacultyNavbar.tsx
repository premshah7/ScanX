"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, History, LayoutDashboard, Calendar, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function FacultyNavbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    const links = [
        { href: "/faculty", label: "Dashboard", icon: LayoutDashboard },
        { href: "/faculty/history", label: "History", icon: History },
    ];

    return (
        <nav className="bg-card border-b border-border px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="font-bold text-xl hidden md:inline-block">GeoGuard</span>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                                isActive
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden md:inline">{link.label}</span>
                            {isActive && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-md" />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors px-2"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </nav>
    );
}
