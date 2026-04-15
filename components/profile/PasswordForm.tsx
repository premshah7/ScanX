"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeMyPassword } from "@/actions/profile";
import { Loader2, CheckCircle, ShieldCheck, Lock, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function PasswordForm() {
    const [isPending, startTransition] = useTransition();
    const [isPswdSaved, setIsPswdSaved] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPswdSaved(false);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await changeMyPassword(formData);
            if (result.success) {
                toast.success("Password changed successfully");
                setIsPswdSaved(true);
                formRef.current?.reset();
                setTimeout(() => setIsPswdSaved(false), 3000);
            } else {
                toast.error(result.error || "Failed to change password");
            }
        });
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="oldPassword" title="Current Password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Old Password
                </Label>
                <div className="relative group">
                    <Input 
                        id="oldPassword" 
                        name="oldPassword" 
                        type={showOldPassword ? "text" : "password"} 
                        required 
                        placeholder="Enter current password"
                        className="h-12 bg-muted/40 border-2 border-border rounded-xl focus:border-primary/50 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword" title="New Password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> New Password
                </Label>
                <div className="relative group">
                    <Input 
                        id="newPassword" 
                        name="newPassword" 
                        type={showNewPassword ? "text" : "password"} 
                        required 
                        placeholder="Enter new password"
                        className="h-12 bg-muted/40 border-2 border-border rounded-xl focus:border-blue-500/50 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" title="Confirm Password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> Confirm Password
                </Label>
                <div className="relative group">
                    <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        placeholder="Repeat new password"
                        className="h-12 bg-muted/40 border-2 border-border rounded-xl focus:border-blue-500/50 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full h-14 rounded-2xl text-lg font-bold bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPswdSaved ? (
                    <><CheckCircle className="w-5 h-5" /> Password Updated</>
                ) : (
                    "Update Password Security"
                )}
            </Button>
        </form>
    );
}
