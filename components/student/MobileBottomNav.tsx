"use client";

import { LayoutDashboard, QrCode, User, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Tab = {
    href: string;
    label: string;
    icon: LucideIcon;
    isCenter?: boolean;
};

const tabs: Tab[] = [
    { href: "/student", label: "Home", icon: LayoutDashboard },
    { href: "/student/scan", label: "Scan QR", icon: QrCode, isCenter: true },
    { href: "/student/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Frosted glass background */}
            <div className="bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe">
                <div className="flex items-center justify-around px-2 h-16">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href;

                        if (tab.isCenter) {
                            // Center scan button — prominent CTA
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className="relative -mt-5 flex flex-col items-center group"
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200",
                                        isActive
                                            ? "bg-primary shadow-md scale-105"
                                            : "bg-primary opacity-90 hover:opacity-100 hover:scale-105"
                                    )}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold mt-1 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {tab.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className="flex flex-col items-center gap-1 py-2 px-3 group relative"
                            >
                                {/* Active indicator dot */}
                                {isActive && (
                                    <div className="absolute -top-0.5 w-5 h-1 rounded-full bg-primary" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 transition-all duration-200",
                                    isActive
                                        ? "text-primary scale-110"
                                        : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-semibold transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
