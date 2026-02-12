import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div
            className={cn(
                "rounded-full border-transparent border-t-primary border-r-primary animate-spin",
                sizeClasses[size],
                className
            )}
        />
    );
}

interface LoadingOverlayProps {
    message?: string;
    fullPage?: boolean;
}

export function LoadingOverlay({ message = "Loading...", fullPage = false }: LoadingOverlayProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center bg-background/80 backdrop-blur-sm z-50",
                fullPage ? "fixed inset-0" : "absolute inset-0"
            )}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>

                    {/* Spinning Gradient Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>

                    {/* Inner Pulsing Circle */}
                    <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse"></div>
                </div>

                {message && (
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
