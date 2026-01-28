import Link from "next/link";
import Image from "next/image";
import { BookOpen, ShieldAlert, History, GraduationCap } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import MobileSidebar from "@/components/MobileSidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function FacultyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const SidebarContent = () => (
        <>
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="GeoGuard Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold text-foreground">GeoGuard</span>
                </div>
                <ThemeToggle />
            </div>

            <nav className="flex-1 space-y-2">
                <Link
                    href="/faculty"
                    className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors hover:text-foreground"
                >
                    <BookOpen className="w-5 h-5" />
                    My Subjects
                </Link>
                <Link
                    href="/faculty/students"
                    className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors hover:text-foreground"
                >
                    <GraduationCap className="w-5 h-5" />
                    My Students
                </Link>
                <Link
                    href="/faculty/history"
                    className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors hover:text-foreground"
                >
                    <History className="w-5 h-5" />
                    History
                </Link>
            </nav>

            <LogoutButton />
        </>
    );

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="GeoGuard Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold text-foreground">GeoGuard</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <MobileSidebar>
                        <div className="pt-6 h-full flex flex-col">
                            <SidebarContent />
                        </div>
                    </MobileSidebar>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 text-foreground overflow-y-auto w-full relative">
                {children}
            </main>
        </div>
    );
}
