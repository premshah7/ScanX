"use client";

import { useState } from "react";
import { registerForEvent } from "@/actions/event-registration";
import { Loader2, ArrowRight, Users } from "lucide-react";

type FieldDef = {
    name: string;
    label: string;
    type: "text" | "number" | "boolean" | "email" | "date";
    required: boolean;
};

export default function EventRegistrationForm({
    eventSlug,
    dynamicFields,
    currentUser
}: {
    eventSlug: string;
    dynamicFields: FieldDef[];
    currentUser: { name: string; username: string } | null;
}) {
    const [isStudent, setIsStudent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [registeredUsername, setRegisteredUsername] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        setRegisteredUsername(null);

        const form = new FormData(e.currentTarget);
        
        let guestData: any = { 
            name: "", 
            username: "", 
            phone: "", 
            password: "",
            isStudent: isStudent,
            enrollmentNo: form.get("enrollment_no") as string
        };
        let formDataObj: Record<string, any> = {};

        if (currentUser) {
            guestData.name = currentUser.name;
            guestData.username = currentUser.username || (form.get("guest_username") as string);
        } else if (!isStudent) {
            guestData.name = form.get("guest_name") as string;
            guestData.username = form.get("guest_username") as string;
            guestData.phone = form.get("guest_phone") as string || "";
            guestData.password = form.get("guest_password") as string || "";
        }

        for (const field of dynamicFields) {
            const val = form.get(`custom_${field.name}`);
            formDataObj[field.name] = val;
            if (field.type === "boolean") {
                formDataObj[field.name] = form.get(`custom_${field.name}`) === "on";
            }
        }

        try {
            const res = await registerForEvent(eventSlug, guestData, formDataObj);
            
            if (res.error) {
                setError(res.error);
            } else if (res.success) {
                setSuccessMsg(res.message || "Successfully registered!");
                if (res.username) setRegisteredUsername(res.username);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (successMsg) {
        return (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5 text-center animate-fade-in">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full text-green-600 mx-auto flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-green-800 dark:text-green-300 font-bold mb-1">Registration Complete!</h4>
                <p className="text-sm text-green-700 dark:text-green-400 mb-4">{successMsg}</p>
                {registeredUsername && !currentUser && (
                    <div className="bg-white dark:bg-black/20 p-4 rounded-lg border border-green-200 dark:border-green-800/50 inline-block text-left w-full max-w-sm mx-auto">
                        <p className="text-xs text-green-700 dark:text-green-400/80 uppercase tracking-wider font-semibold mb-1">Your Login Username</p>
                        <p className="text-xl font-mono font-bold text-foreground select-all bg-muted py-2 px-3 rounded text-center border overflow-hidden text-ellipsis">{registeredUsername}</p>
                        <p className="text-xs text-muted-foreground mt-3 text-center">Please save this username. You can use it to log in without a password.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg">
                    {error}
                </div>
            )}

            {!currentUser && (
                <div className="space-y-4">
                    {/* Student Toggle */}
                    <div 
                        onClick={() => setIsStudent(!isStudent)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                            isStudent 
                            ? "border-primary bg-primary/5 shadow-md" 
                            : "border-border bg-muted/20 hover:border-primary/50"
                        }`}
                    >
                        <div>
                            <p className={`font-bold transition-colors ${isStudent ? "text-primary" : "text-foreground"}`}>
                                I am a Student
                            </p>
                            <p className="text-xs text-muted-foreground mr-1">Link with your existing student account</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isStudent ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground"
                        }`}>
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    {isStudent ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-semibold text-foreground mb-1.5">Enrollment Number *</label>
                            <input 
                                name="enrollment_no"
                                required={isStudent}
                                placeholder="enroll"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all uppercase"
                            />
                            <p className="text-xs text-muted-foreground mt-1.5 px-1 italic">
                                Your registration will be linked to your student profile.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                                <h3 className="font-bold text-primary mb-1 text-sm">Guest Account Required</h3>
                                <p className="text-xs text-primary/80">
                                    Not a student? Create a quick guest account to reserve your spot.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name *</label>
                                <input 
                                    name="guest_name"
                                    required={!isStudent}
                                    placeholder="John Doe"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Username *</label>
                                <input 
                                    name="guest_username"
                                    required={!isStudent}
                                    placeholder="johndoe123"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Phone (Optional)</label>
                                <input 
                                    name="guest_phone"
                                    placeholder="+1 234 567 8900"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                                <input 
                                    name="guest_password"
                                    type="password"
                                    placeholder="Optional"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {currentUser && (
                <div className="space-y-4">
                    <div className="bg-muted px-4 py-3 rounded-xl border border-border text-sm flex justify-between items-center">
                        <span className="text-muted-foreground">Registering as</span>
                        <span className="font-bold text-foreground">{currentUser.name} {currentUser.username ? `(@${currentUser.username})` : ''}</span>
                    </div>

                    {!currentUser.username && (
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">Set a Username *</label>
                            <input 
                                name="guest_username"
                                required
                                placeholder="Choose a unique username"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            />
                            <p className="text-xs text-muted-foreground mt-1 text-red-500 font-medium">Your profile is missing a username. Please set one to continue.</p>
                        </div>
                    )}
                </div>
            )}

            {dynamicFields.length > 0 && !isStudent && !currentUser && (
                <div className="pt-2">
                    <div className="h-px bg-border mb-4"></div>
                    <h4 className="font-semibold text-sm mb-3">Additional Information</h4>
                    <div className="space-y-4">
                        {dynamicFields.map((field, i) => (
                            <div key={i}>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === "text" && (
                                    <input 
                                        name={`custom_${field.name}`}
                                        required={field.required}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    />
                                )}
                                {field.type === "email" && (
                                    <input 
                                        name={`custom_${field.name}`}
                                        type="email"
                                        required={field.required}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    />
                                )}
                                {field.type === "date" && (
                                    <input 
                                        name={`custom_${field.name}`}
                                        type="date"
                                        required={field.required}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    />
                                )}
                                {field.type === "number" && (
                                    <input 
                                        name={`custom_${field.name}`}
                                        type="number"
                                        required={field.required}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    />
                                )}
                                {field.type === "boolean" && (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            name={`custom_${field.name}`}
                                            type="checkbox"
                                            required={field.required}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-muted-foreground">Yes</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                    <>Complete Registration <ArrowRight className="w-4 h-4" /></>
                )}
            </button>
        </form>
    );
}
