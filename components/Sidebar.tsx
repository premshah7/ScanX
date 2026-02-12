"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut, LucideIcon, LayoutDashboard, Users, GraduationCap, Settings, Calendar, History, User, Scan, ShieldAlert, BookOpen, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface SidebarProps {
    userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const getLinks = (role?: string) => {
        switch (role) {
            case "ADMIN":
                return [
                    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
                    { href: "/admin/students", label: "Students", icon: GraduationCap },
                    { href: "/admin/faculty", label: "Faculty", icon: Users },
                    { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
                    { href: "/admin/attendance", label: "Logs", icon: ShieldAlert },
                    { href: "/admin/batches", label: "Batches", icon: Layers },
                    { href: "/admin/settings", label: "Settings", icon: Settings },
                ];
            case "FACULTY":
                return [
                    { href: "/faculty", label: "Dashboard", icon: LayoutDashboard }, // Added
                    { href: "/faculty/history", label: "History", icon: History }, // Added
                ];

            case "STUDENT":
                return [
                    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
                    // { href: "/student/scan", label: "Scan QR", icon: Scan }, // Assuming this exists or will exist
                    // { href: "/student/history", label: "History", icon: History },
                    // { href: "/profile", label: "Profile", icon: User },
                ];
            default:
                return [];
        }
    };

    const links = getLinks(userRole);

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-4 m-4 bg-card border rounded-xl transition-all duration-300 shadow-sm",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className={cn("p-4 flex items-center mb-4 transition-all", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="GeoGuard Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold text-foreground">GeoGuard</span>
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    // Exact match for root dashboard links, partial match for others
                    const isRootDashboard = link.href === "/admin" || link.href === "/faculty" || link.href === "/student";
                    const isActive = pathname === link.href || (!isRootDashboard && pathname.startsWith(link.href + "/"));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            title={isCollapsed ? link.label : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted group relative",
                                isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={cn("p-4 border-t border-border flex flex-col gap-4", isCollapsed && "items-center")}>
                <ThemeToggle isCollapsed={isCollapsed} />

                <Button
                    variant="ghost"
                    className={cn(
                        "text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full justify-start",
                        isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    title="Logout"
                >
                    <LogOut className={cn("w-5 h-5", !isCollapsed && "mr-2")} />
                    {!isCollapsed && "Logout"}
                </Button>
            </div>
        </aside>
    );
}
