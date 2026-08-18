"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  title?: string;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  badge?: string;
  size?: "sm" | "default" | "lg";
  variant?: "primary" | "outline" | "secondary";
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  title,
  label,
  onClick,
  disabled,
  className = "",
  icon,
  badge,
  size = "default",
  variant = "primary",
}) => {
  const displayText =
    label ||
    (title
      ? title.toLowerCase().startsWith("generate")
        ? title
        : `Generate ${title}`
      : "Generate Flashcards");

  const sizeClasses = {
    sm: "h-8 px-3 text-xs gap-1.5",
    default: "h-10 px-4 text-xs md:text-sm gap-2",
    lg: "h-11 px-5 text-sm gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent shadow-xs hover:shadow-sm",
    outline:
      "bg-background hover:bg-muted/80 text-foreground border border-border/80 shadow-xs",
    secondary:
      "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-transparent shadow-xs",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none cursor-pointer active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <Sparkles className="w-4 h-4 shrink-0" />
      )}

      <span>{displayText}</span>

      {badge && (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-background/20 text-current border border-current/20">
          {badge}
        </span>
      )}
    </button>
  );
};

export default GenerateButton;
