import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ember text-void font-medium hover:bg-ember-glow active:bg-ember-dim shadow-[0_0_0_1px_rgba(255,106,57,0.4)]",
  secondary:
    "bg-elevated text-text border border-hairline hover:border-text-faint hover:bg-elevated/80",
  ghost: "bg-transparent text-text-muted hover:text-text hover:bg-elevated",
  danger:
    "bg-transparent text-signal-fail border border-signal-fail/40 hover:bg-signal-fail/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded",
  md: "h-10 px-4 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-body transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
