"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";

const navLinks = [
    { href: "/about", label: "About Us" },
    { href: "/impact", label: "Impact" },
    { href: "/developer", label: "Developer" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-card/30 p-4 md:p-5 sticky top-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                        <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-primary">
                        ScanX
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-2">
                    {navLinks.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="px-4 py-2 rounded-xl hover:bg-muted transition-all font-medium text-sm text-muted-foreground hover:text-foreground"
                        >
                            {l.label}
                        </Link>
                    ))}
                    <Link
                        href="/auth/login"
                        className="px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card transition-all font-medium text-sm hover:shadow-md"
                    >
                        Log In
                    </Link>
                    <Link
                        href="/auth/register"
                        className="px-4 py-2 rounded-xl bg-primary hover:shadow-xl transition-all font-medium text-primary-foreground text-sm hover:scale-105 shadow-lg"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                    aria-label="Toggle menu"
                >
                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden mt-3 pt-3 border-t border-border/50 flex flex-col gap-1 animate-slide-up">
                    {navLinks.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="px-4 py-2.5 rounded-xl hover:bg-muted transition-all font-medium text-sm text-muted-foreground hover:text-foreground"
                        >
                            {l.label}
                        </Link>
                    ))}
                    <div className="flex gap-2 mt-2">
                        <Link
                            href="/auth/login"
                            onClick={() => setOpen(false)}
                            className="flex-1 text-center px-4 py-2.5 rounded-xl bg-card/80 border border-border/50 hover:bg-card transition-all font-medium text-sm"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/auth/register"
                            onClick={() => setOpen(false)}
                            className="flex-1 text-center px-4 py-2.5 rounded-xl bg-primary hover:shadow-xl transition-all font-medium text-primary-foreground text-sm shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
