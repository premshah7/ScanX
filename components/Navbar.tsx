"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import MobileSidebar from "@/components/MobileSidebar";
import LogoutButton from "@/components/LogoutButton";

interface NavbarProps {
    links: {
        href: string;
        label: string;
        icon: React.ElementType;
    }[];
}

export function Navbar({ links }: NavbarProps) {
    const pathname = usePathname();

    return (
        <nav className="border-b bg-card px-4 py-3 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image
                            src="/logo.svg"
                            alt="ScanX Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        ScanX
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    <ThemeToggle />
                    <div className="h-6 w-px bg-border mx-2" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* Mobile Menu */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <MobileSidebar>
                        <div className="pt-6 h-full flex flex-col">
                            <Link href="/" className="flex items-center gap-3 mb-8 px-2 hover:opacity-80 transition-opacity">
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                                    <Image
                                        src="/logo.svg"
                                        alt="ScanX Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-xl font-bold text-foreground">ScanX</span>
                            </Link>

                            <nav className="flex-1 space-y-2">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-muted",
                                            pathname === link.href ? "text-foreground bg-muted font-medium" : "text-muted-foreground"
                                        )}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <LogoutButton />
                        </div>
                    </MobileSidebar>
                </div>
            </div>
        </nav>
    );
}
