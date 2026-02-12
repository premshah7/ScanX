"use client";

import { LayoutDashboard, Users, GraduationCap, Settings, ShieldAlert, BookOpen, Layers, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const adminLinks = [
    // { href: "/admin", label: "Dashboard", icon: LayoutDashboard }, // Removed in favor of clickable Logo
    { href: "/admin/faculty", label: "Faculty", icon: Users },
    { href: "/admin/students", label: "Students", icon: GraduationCap },
    { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
    { href: "/admin/attendance", label: "Logs", icon: ShieldAlert },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/batches", label: "Batches", icon: Layers },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNavbar() {
    return <Navbar links={adminLinks} />;
}
