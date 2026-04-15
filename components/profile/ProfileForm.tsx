"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMyProfile } from "@/actions/profile";
import { Loader2, CheckCircle, AtSign, User, Phone } from "lucide-react";
import { toast } from "sonner";

interface UserData {
    name: string;
    email: string;
    phoneNumber: string | null;
}

export default function ProfileForm({ user }: { user: UserData }) {
    const [isPending, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaved(false);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await updateMyProfile(formData);
            if (result.success) {
                toast.success("Profile information updated");
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Full Name
                </Label>
                <Input 
                    id="name" 
                    name="name" 
                    defaultValue={user.name} 
                    required 
                    className="h-12 bg-muted/40 border-2 border-border rounded-xl focus:border-primary/50"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <AtSign className="w-3.5 h-3.5" /> Email Address
                </Label>
                <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={user.email} 
                    required 
                    className="h-12 bg-muted/40 border-2 border-border rounded-xl focus:border-primary/50"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                </Label>
                <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    defaultValue={user.phoneNumber || ""} 
                    placeholder="+91 XXXXX XXXXX"
                    className="h-12 bg-muted/40 border-2 border-border rounded-xl focus:border-primary/50"
                />
            </div>

            <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full h-14 rounded-2xl text-lg font-bold bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSaved ? (
                    <><CheckCircle className="w-5 h-5" /> All Changes Saved</>
                ) : (
                    "Update Personal Details"
                )}
            </Button>
        </form>
    );
}
