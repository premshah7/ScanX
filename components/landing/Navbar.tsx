"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { LandingThemeToggle } from "./LandingThemeToggle";

const navItems = [
    { href: "#about", label: "About Us" },
    { href: "#impact", label: "Impact" },
    { href: "#developer", label: "Developer" },
    { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleAnchorClick = () => {
        setMobileOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-[2px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                {/* Brand Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity"
                    aria-label="ScanX Home"
                >
                    <div className="w-6 h-6 relative rounded overflow-hidden shrink-0">
                        <Image
                            src="/logo.svg"
                            alt="ScanX mark"
                            width={24}
                            height={24}
                            priority
                            className="object-contain"
                        />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">ScanX</span>
                </Link>

                {/* Desktop Nav */}
                <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-5">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="h-4 w-px bg-border" aria-hidden="true" />

                    <div className="flex items-center gap-3">
                        <LandingThemeToggle />

                        <Link
                            href="/auth/login"
                            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        >
                            Log in
                        </Link>

                        <Link
                            href="/auth/register"
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-xs font-medium text-primary-foreground transition-colors shadow-xs"
                        >
                            Get started
                        </Link>
                    </div>
                </nav>

                {/* Mobile Header Actions */}
                <div className="flex items-center gap-2 md:hidden">
                    <LandingThemeToggle />

                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border px-4 py-3 bg-card flex flex-col gap-1 shadow-sm">
                    <nav aria-label="Mobile Navigation" className="flex flex-col">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={handleAnchorClick}
                                className="px-3 py-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors min-h-[44px] flex items-center"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex gap-2 pt-2 border-t border-border mt-1">
                        <Link
                            href="/auth/login"
                            onClick={() => setMobileOpen(false)}
                            className="flex-1 text-center py-2.5 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground min-h-[44px] flex items-center justify-center"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/auth/register"
                            onClick={() => setMobileOpen(false)}
                            className="flex-1 text-center py-2.5 rounded-md bg-primary hover:bg-primary/90 text-xs font-medium text-primary-foreground min-h-[44px] flex items-center justify-center shadow-xs"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
