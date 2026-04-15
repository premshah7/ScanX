"use client";

import { useTransition, useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { createAdminAccount } from "@/actions/super-admin";
import { toast } from "sonner";

export default function CreateAdminModal() {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createAdminAccount(formData);
            if (result.success) {
                toast.success("New administrator created successfully");
                setIsOpen(false);
            } else {
                setError(result.error || "Something went wrong");
                toast.error(result.error || "Failed to create administrator");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl px-6 py-5 bg-primary text-white font-bold hover:opacity-90 transition-all flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add New Admin
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl overflow-hidden p-0 animate-scale-up">
                <div className="h-2 bg-primary"></div>
                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold text-primary">New Platform Admin</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-lg">
                            Grant administrative access to a new user.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                placeholder="Enter full name" 
                                required 
                                className="h-12 bg-muted/30 border-2 border-border rounded-xl focus:border-primary/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Work Email</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                placeholder="Enter work email" 
                                required 
                                className="h-12 bg-muted/30 border-2 border-border rounded-xl focus:border-primary/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Temporary Password</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder="Enter initial password" 
                                required 
                                className="h-12 bg-muted/30 border-2 border-border rounded-xl focus:border-primary/50 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isPending} 
                            className="w-full h-14 rounded-xl text-lg font-bold bg-primary text-white hover:opacity-90 transition-all shadow-lg"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
