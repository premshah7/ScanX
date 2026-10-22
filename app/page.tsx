import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import QRCode from "react-qr-code";
import {
    Camera,
    Smartphone,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    FileSpreadsheet,
    FileText,
    ArrowRight,
    Lock,
    Clock,
    UserCheck,
    RefreshCw,
    ExternalLink,
    HelpCircle,
    Download,
    Users,
    Github,
    Linkedin,
    Mail,
} from "lucide-react";

export default async function Home() {
    const session = await getServerSession(authOptions);

    // Maintain original routing logic for logged-in accounts
    if (session) {
        switch (session.user.role) {
            case "SUPER_ADMIN":
                redirect("/super-admin");
            case "ADMIN":
                redirect("/admin");
            case "FACULTY":
                redirect("/faculty");
            case "STUDENT":
                redirect("/student");
            case "GUEST":
                redirect("/guest/events");
            default:
                redirect("/auth/login");
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main id="main-content" className="flex-1 flex flex-col">
                {/* ─── HERO SECTION (ASYMMETRIC, LEFT-ALIGNED) ─── */}
                <section className="px-4 sm:px-6 py-12 md:py-20 lg:py-24 border-b border-border bg-card/40">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left: Copy & Actions (7 cols on lg) */}
                        <div className="lg:col-span-7 text-left space-y-6">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-border bg-card text-muted-foreground font-mono text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" aria-hidden="true" />
                                Hardware-locked attendance protocol
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.12]">
                                Classroom attendance verified at the student's device.
                            </h1>

                            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                                ScanX pairs dynamically rotating QR codes with browser hardware fingerprinting. Students mark presence only from their own handset, while lecturers watch live rosters update in real time.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                                <Link
                                    href="/auth/register"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs min-h-[44px]"
                                >
                                    <span>Register as student</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                <Link
                                    href="/auth/login"
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                                >
                                    <span>Sign in to dashboard</span>
                                    <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </div>

                            <div className="pt-4 border-t border-border/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-mono">
                                <span>No app store install required</span>
                                <span className="hidden sm:inline">&middot;</span>
                                <span>PWA mobile browser ready</span>
                                <span className="hidden sm:inline">&middot;</span>
                                <span>Auditable records in PostgreSQL</span>
                            </div>
                        </div>

                        {/* Right: Realistic Product Specimen (5 cols on lg) */}
                        <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
                            <div className="w-full max-w-sm sm:max-w-md space-y-3">
                                {/* Student Phone Frame Simulation */}
                                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                                    {/* Mobile Top Bar */}
                                    <div className="px-4 py-2 bg-muted/60 border-b border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                                        <span>scanx.campus.edu/scan</span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                            Camera Live
                                        </span>
                                    </div>

                                    {/* Scanner Viewfinder Box */}
                                    <div className="p-4 bg-muted/20">
                                        <div className="relative aspect-4/3 rounded-lg border-2 border-dashed border-primary/40 bg-background flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                                            {/* Corner brackets */}
                                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary" />
                                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary" />
                                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary" />
                                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary" />

                                            {/* Real QR Matrix */}
                                            <div className="p-2 bg-white rounded-md border border-border/80 shadow-xs mb-2">
                                                <QRCode
                                                    value="https://scanx.campus.edu/session/live-demo?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.scanx-demo-qr-token"
                                                    size={104}
                                                    level="M"
                                                    bgColor="#FFFFFF"
                                                    fgColor="#0F172A"
                                                />
                                            </div>

                                            {/* <p className="text-[11px] font-medium text-foreground">Align QR code within frame</p> */}
                                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Token validity: 4.0s rotation</p>
                                        </div>

                                        {/* Verified Pill */}
                                        <div className="mt-3 p-3 rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                                            <div className="text-left text-xs">
                                                <p className="font-semibold text-emerald-900 dark:text-emerald-200">Attendance Recorded</p>
                                                <p className="text-emerald-800/80 dark:text-emerald-300/80 text-[11px] font-mono">
                                                    CS302 &middot; Roll 21BCE1042 &middot; 09:42:18
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Teacher Live Dashboard Specimen (Offset Below) */}
                                <div className="rounded-lg border border-border bg-card p-3 shadow-xs text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                            <span className="font-semibold text-foreground">Lecture Session #14 &middot; CS302</span>
                                        </div>
                                        <span className="font-mono text-[11px] text-muted-foreground">Batch A &amp; B</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                                        <div className="p-2 rounded border border-border bg-muted/40">
                                            <span className="text-muted-foreground block text-[10px] uppercase">Present</span>
                                            <span className="font-bold text-foreground text-sm">48 students</span>
                                        </div>
                                        <div className="p-2 rounded border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-destructive">
                                            <span className="block text-[10px] uppercase font-sans font-medium">Flagged Mismatch</span>
                                            <span className="font-bold text-sm">1 attempt</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── HOW IT WORKS (NUMBERED PROGRESSIVE SEQUENCE) ─── */}
                <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="text-left max-w-2xl mb-12">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Workflow</div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            How ScanX operates in a physical lecture
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            A verified, deterministic attendance cycle that completes during class entry without disrupting lecture minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 rounded-lg border border-border bg-card flex flex-col justify-between">
                            <div>
                                <div className="font-mono text-xs font-semibold text-primary mb-3">01 / LAUNCH</div>
                                <h3 className="text-base font-semibold text-foreground mb-2">Lecturer starts session</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Faculty selects the scheduled subject and batch. The classroom projector displays a live signed QR code that automatically rotates every 4 seconds.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border font-mono text-[11px] text-muted-foreground">
                                Token: Signed JWT &middot; 4s TTL
                            </div>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-card flex flex-col justify-between">
                            <div>
                                <div className="font-mono text-xs font-semibold text-primary mb-3">02 / SCAN</div>
                                <h3 className="text-base font-semibold text-foreground mb-2">Student scans from seat</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The student opens the camera in their browser. ScanX compares their handset fingerprint against their registered profile in under 2 seconds.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border font-mono text-[11px] text-muted-foreground">
                                Check: FingerprintJS + sticky cookie
                            </div>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-card flex flex-col justify-between">
                            <div>
                                <div className="font-mono text-xs font-semibold text-primary mb-3">03 / AUDIT</div>
                                <h3 className="text-base font-semibold text-foreground mb-2">Session closes &amp; exports</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Lecturer ends attendance. Roster timestamps are locked and ready for instant PDF autoTable export or CSV download for departmental records.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border font-mono text-[11px] text-muted-foreground">
                                Format: Formatted PDF &amp; CSV
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── WHAT STUDENTS GET (STUDENT BENEFIT + SPECIMEN) ─── */}
                <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-6 text-left space-y-4">
                            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">For Enrolled Students</div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                                A simple scan receipt and personal attendance ledger.
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Students never have to wonder whether their roll number was called or misheard. ScanX gives students immediate verification and historical visibility.
                            </p>

                            <ul className="space-y-3 pt-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span><strong>Browser PWA:</strong> Add to phone home screen with zero background battery drain or constant GPS tracking.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span><strong>Subject Threshold Warnings:</strong> See attended vs total lectures with automated warnings if attendance falls below 75%.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <span><strong>Device Replacement Requests:</strong> Replaced your smartphone? Submit a self-service reset request directly to the admin.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Student Ledger Specimen Card */}
                        <div className="lg:col-span-6">
                            <div className="rounded-lg border border-border bg-card p-5 shadow-xs text-left max-w-md mx-auto lg:ml-auto">
                                <div className="flex items-center justify-between pb-3 border-b border-border">
                                    <div>
                                        <p className="text-xs font-mono text-muted-foreground">STUDENT PROFILE</p>
                                        <p className="font-semibold text-sm text-foreground">Alex Morgan &middot; 21BCE1042</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                                        Handset Locked
                                    </span>
                                </div>

                                <div className="space-y-3 pt-3">
                                    <div className="p-3 rounded border border-border bg-muted/30">
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="font-medium text-foreground">Computer Networks (CS304)</span>
                                            <span className="font-mono font-bold text-foreground">91.4%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: "91.4%" }} />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono mt-1 block">32 of 35 classes attended</span>
                                    </div>

                                    <div className="p-3 rounded border border-border bg-muted/30">
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="font-medium text-foreground">Database Management (CS301)</span>
                                            <span className="font-mono font-bold text-foreground">78.1%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-amber-600 h-full rounded-full" style={{ width: "78.1%" }} />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono mt-1 block">25 of 32 classes attended (Threshold: 75%)</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                                    <span>Registered Handset: #8f2a91…</span>
                                    <span className="text-primary hover:underline cursor-pointer">Reset request &rarr;</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── WHAT TEACHERS GET (TEACHER COCKPIT TOOLS) ─── */}
                <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="text-left max-w-2xl mb-12">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">For Faculty &amp; Instructors</div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            Complete lecture control without administrative drag.
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            Run your lecture without wasting 15 minutes calling out roll numbers. Verify real-time presence and instantly download accreditation-ready rosters.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                        <div className="p-5 rounded-lg border border-border bg-card">
                            <div className="w-8 h-8 rounded border border-border bg-muted/50 flex items-center justify-center mb-3 text-primary">
                                <RefreshCw className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">Rotating Tokens</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                The projector QR code updates automatically every 4 seconds. Screenshots sent via chat apps expire before peers can scan them.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-card">
                            <div className="w-8 h-8 rounded border border-border bg-muted/50 flex items-center justify-center mb-3 text-destructive">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">Live Mismatch Alerts</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                If a student attempts to log in from another student's phone, the screen flags both names and roll numbers immediately.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-card">
                            <div className="w-8 h-8 rounded border border-border bg-muted/50 flex items-center justify-center mb-3 text-primary">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">Accreditation PDF</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                1-click formatted PDF generation with clean autoTable borders, course codes, timestamps, and faculty signatures.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-card">
                            <div className="w-8 h-8 rounded border border-border bg-muted/50 flex items-center justify-center mb-3 text-primary">
                                <Users className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">Defaulters Radar</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Filter students falling below institutional threshold rules (e.g. 75%) before exams to notify parents or academic counseling.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── DEVICE LOCK & PROXY FLAGGING EXPLAINED HONESTLY ─── */}
                <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-10 text-left">
                        <div className="max-w-3xl space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-muted text-muted-foreground font-mono text-xs">
                                <Lock className="w-3.5 h-3.5 text-primary" />
                                Security Architecture
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                                How device locking and proxy detection actually works.
                            </h2>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We believe in honest security claims. No digital system can physically prevent two students from standing together and handing over a physical phone. Here is what ScanX actually enforces in code:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div className="p-4 rounded-md border border-border bg-background">
                                    <div className="font-mono text-xs font-semibold text-foreground mb-1">1. Fingerprint Hash</div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Canvas rendering, screen depth, and device hardware signatures are hashed via FingerprintJS to generate a unique visitor ID.
                                    </p>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-background">
                                    <div className="font-mono text-xs font-semibold text-foreground mb-1">2. Sticky Handset Cookie</div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        A secure persistent cookie stores the handset identifier. If Student B attempts to scan on Student A's phone, the device owner is detected.
                                    </p>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-background">
                                    <div className="font-mono text-xs font-semibold text-foreground mb-1">3. Mismatch Quarantine</div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        The scan is blocked, attendance is not marked, a ProxyAttempt audit row is saved in PostgreSQL, and the teacher's UI displays a red alert.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 text-xs text-muted-foreground font-mono bg-muted/40 p-3 rounded border border-border">
                                Reality check: One handset cannot mark attendance for two enrolled accounts. Any device swap requires admin review.
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── OLD REGISTER VS SCANX (DENSE COMPARISON MATRIX) ─── */}
                <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="text-left max-w-2xl mb-10">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Contrast</div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            Paper registers vs. ScanX protocol
                        </h2>
                    </div>

                    <div className="rounded-lg border border-border overflow-x-auto bg-card">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/70 text-muted-foreground border-b border-border font-mono text-[11px] uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5 sm:px-4">Dimension</th>
                                    <th className="p-3.5 sm:px-4">Paper Roll Call</th>
                                    <th className="p-3.5 sm:px-4 text-primary font-semibold">ScanX Digital Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr>
                                    <td className="p-3.5 sm:px-4 font-semibold text-foreground">Lecture time spent</td>
                                    <td className="p-3.5 sm:px-4 text-muted-foreground">10 to 15 minutes of teacher callouts</td>
                                    <td className="p-3.5 sm:px-4 text-foreground font-medium">~60 seconds during regular classroom entry</td>
                                </tr>
                                <tr>
                                    <td className="p-3.5 sm:px-4 font-semibold text-foreground">Proxy vulnerability</td>
                                    <td className="p-3.5 sm:px-4 text-muted-foreground">Unchecked sign-in sheets, peer answering</td>
                                    <td className="p-3.5 sm:px-4 text-foreground font-medium">Hardware-bound fingerprint blocks duplicate handset usage</td>
                                </tr>
                                <tr>
                                    <td className="p-3.5 sm:px-4 font-semibold text-foreground">Accreditation audit</td>
                                    <td className="p-3.5 sm:px-4 text-muted-foreground">Manual compilation from loose, worn binders</td>
                                    <td className="p-3.5 sm:px-4 text-foreground font-medium">Instant PDF autoTable export with exact timestamps</td>
                                </tr>
                                <tr>
                                    <td className="p-3.5 sm:px-4 font-semibold text-foreground">Dispute resolution</td>
                                    <td className="p-3.5 sm:px-4 text-muted-foreground">Student memory vs faculty memory</td>
                                    <td className="p-3.5 sm:px-4 text-foreground font-medium">Deterministic database log with exact second &amp; IP record</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ─── IMPACT SECTION (#impact ANCHOR) ─── */}
                <section id="impact" className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="text-left max-w-2xl mb-12">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Impact</div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            Measurable institutional outcomes
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            Factual operational metrics from eliminating manual roll call friction.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                        <div className="p-5 rounded-lg border border-border bg-card">
                            <Clock className="w-5 h-5 text-primary mb-3" />
                            <div className="text-2xl font-bold font-mono text-foreground mb-1">12–15 min</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Instruction time restored</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Teachers begin lecturing immediately instead of spending the opening quarter of class reading names aloud.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-card">
                            <FileSpreadsheet className="w-5 h-5 text-primary mb-3" />
                            <div className="text-2xl font-bold font-mono text-foreground mb-1">Zero Paper</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Semester roster sheets</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Complete digital transition. No physical attendance registers to print, bind, store, or physically search through.
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-border bg-card">
                            <UserCheck className="w-5 h-5 text-primary mb-3" />
                            <div className="text-2xl font-bold font-mono text-foreground mb-1">10+</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Campus verification sessions</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Verified sessions conducted across enrolled department batches with auditable timestamps.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── ABOUT US SECTION (#about ANCHOR) ─── */}
                <section id="about" className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border text-center">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">About Us</div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            Built for college classrooms, not corporate boardrooms.
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            ScanX was created to address a persistent university headache: traditional roll calls consume substantial instruction time, while paper sign-in sheets invite casual proxy attendance.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Rather than imposing expensive biometric hardware terminals or battery-draining continuous GPS tracking, ScanX leverages modern web standards. By treating attendance as a cryptographic verification problem at the moment of lecture entry, universities get reliable data without friction.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
                            <div className="p-4 rounded-md border border-border bg-card">
                                <h3 className="font-semibold text-xs text-foreground mb-1">Privacy-Conscious Verification</h3>
                                <p className="text-xs text-muted-foreground">
                                    No background location tracking. Hardware inspection runs strictly during the active scan window.
                                </p>
                            </div>
                            <div className="p-4 rounded-md border border-border bg-card">
                                <h3 className="font-semibold text-xs text-foreground mb-1">Low-Bandwidth Optimization</h3>
                                <p className="text-xs text-muted-foreground">
                                    Payloads are under 2KB, operating reliably even across congested university Wi-Fi subnets.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── DEVELOPER SECTION (#developer ANCHOR) ─── */}
                <section id="developer" className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div>
                            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Developer</div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                                Project authorship &amp; maintainer
                            </h2>
                        </div>

                        <div className="p-6 sm:p-8 rounded-lg border border-border bg-card flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
                            <div className="w-16 h-16 rounded-md bg-muted border border-border flex items-center justify-center font-mono text-lg font-bold text-primary">
                                PS
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Prem Shah</h3>
                                    <p className="text-xs text-muted-foreground font-mono">Full Stack Developer &middot; Darshan University</p>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                                    Designed and engineered ScanX to modernize academic attendance management through device-bound verification and real-time faculty dashboards.
                                </p>

                                <div className="flex items-center justify-center gap-4 pt-2">
                                    <a
                                        href="https://github.com/premshah7"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
                                        aria-label="Prem Shah on GitHub"
                                    >
                                        <Github className="w-4 h-4" />
                                        <span>GitHub</span>
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/prem-shah77"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
                                        aria-label="Prem Shah on LinkedIn"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        <span>LinkedIn</span>
                                    </a>
                                    <a
                                        href="mailto:shahprem1823@gmail.com"
                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
                                        aria-label="Email Prem Shah"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span>Email</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FREQUENTLY ASKED QUESTIONS (#faq ANCHOR) ─── */}
                <section id="faq" className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="text-left max-w-2xl mb-10">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Questions</div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                            Frequently asked questions
                        </h2>
                    </div>

                    <div className="max-w-3xl space-y-3 text-left">
                        <details className="group p-4 rounded-lg border border-border bg-card">
                            <summary className="font-semibold text-xs sm:text-sm text-foreground cursor-pointer flex items-center justify-between">
                                <span>What happens if a student changes or replaces their smartphone?</span>
                                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&darr;</span>
                            </summary>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                Students can click "Request Device Reset" directly from their profile. The request queues in the department administrator panel, who verifies the student and resets the device hash with one click.
                            </p>
                        </details>

                        <details className="group p-4 rounded-lg border border-border bg-card">
                            <summary className="font-semibold text-xs sm:text-sm text-foreground cursor-pointer flex items-center justify-between">
                                <span>Does ScanX track student locations when not in class?</span>
                                <summary className="sr-only">Toggle answer</summary>
                                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&darr;</span>
                            </summary>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                No. ScanX does not run any background tracking service. Hardware verification takes place exclusively in the browser at the precise moment the QR code is scanned.
                            </p>
                        </details>

                        <details className="group p-4 rounded-lg border border-border bg-card">
                            <summary className="font-semibold text-xs sm:text-sm text-foreground cursor-pointer flex items-center justify-between">
                                <span>Can guests attend public campus symposiums or workshops?</span>
                                <summary className="sr-only">Toggle answer</summary>
                                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&darr;</span>
                            </summary>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                Yes. ScanX includes an Event Guest registration mode, allowing external visitors to receive an event pass and register attendance at conferences without enrolling as semester students.
                            </p>
                        </details>

                        <details className="group p-4 rounded-lg border border-border bg-card">
                            <summary className="font-semibold text-xs sm:text-sm text-foreground cursor-pointer flex items-center justify-between">
                                <span>What formats are supported for attendance exports?</span>
                                <summary className="sr-only">Toggle answer</summary>
                                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&darr;</span>
                            </summary>
                            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                Instructors can export formatted PDF rosters with autoTable formatting for physical filing, or download raw CSV spreadsheets for import into university management ERP systems.
                            </p>
                        </details>
                    </div>
                </section>

                {/* ─── FINAL CALL TO ACTION (PLAIN WORDS, NO OVERSIZED GRADIENT BANNER) ─── */}
                <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto w-full">
                    <div className="p-8 sm:p-12 rounded-lg border border-border bg-card text-left max-w-3xl">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-2">
                            Ready to run verified attendance in your next lecture?
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                            Sign in with your faculty or student credentials, or enroll your student account in under two minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs min-h-[44px]"
                            >
                                Sign in to ScanX
                            </Link>
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center justify-center px-4 py-2.5 rounded-md border border-border bg-background hover:bg-muted text-xs sm:text-sm font-medium text-foreground transition-colors min-h-[44px]"
                            >
                                Register student account
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ─── INSTITUTIONAL FOOTER ─── */}
            <footer className="border-t border-border bg-card py-8 text-xs text-muted-foreground">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1 text-left">
                        <div className="font-semibold text-foreground tracking-tight">ScanX Protocol</div>
                        <p className="text-[11px]">Academic attendance and hardware verification infrastructure.</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-medium">
                        <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
                        <a href="#impact" className="hover:text-foreground transition-colors">Impact</a>
                        <a href="#developer" className="hover:text-foreground transition-colors">Developer</a>
                        <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
                        <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign in</Link>
                        <Link href="/auth/register" className="hover:text-foreground transition-colors">Register</Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 mt-6 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono">
                    <p>&copy; {new Date().getFullYear()} ScanX. Verified attendance protocol.</p>
                    <p>All verification records logged in PostgreSQL</p>
                </div>
            </footer>
        </div>
    );
}
