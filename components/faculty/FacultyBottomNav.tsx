"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
    href: string;
    label: string;
    icon: React.ElementType;
};

const tabs: Tab[] = [
    { href: "/faculty", label: "Home", icon: LayoutDashboard },
    { href: "/faculty/history", label: "History", icon: History },
    { href: "/faculty/profile", label: "Profile", icon: User },
];

export default function FacultyBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe">
                <div className="flex items-center justify-around px-2 h-16">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <tab.icon className={cn(
                                    "w-5 h-5 transition-transform duration-200",
                                    isActive && "scale-110"
                                )} />
                                <span className="text-[10px] font-semibold">{tab.label}</span>
                                {isActive && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full gradient-primary" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
