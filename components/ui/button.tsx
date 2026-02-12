import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// BUTTON
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "success" | "warning"
    size?: "default" | "sm" | "lg" | "icon"
    loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", loading = false, children, disabled, ...props }, ref) => {
        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all",
            gradient: "gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all glow-hover",
            success: "gradient-success text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all",
            warning: "gradient-warning text-warning-foreground shadow-md hover:shadow-lg hover:scale-[1.02] transition-all",
            destructive: "bg-danger text-danger-foreground hover:bg-danger/90 shadow-md hover:shadow-lg transition-all",
            outline: "border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all",
            secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all",
            ghost: "hover:bg-accent hover:text-accent-foreground transition-all",
            link: "text-primary underline-offset-4 hover:underline",
        }
        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3 text-sm",
            lg: "h-12 rounded-lg px-8 text-base font-semibold",
            icon: "h-10 w-10",
        }
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"
