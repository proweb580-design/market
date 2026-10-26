import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent/85",
  secondary: "bg-surface text-text border border-line hover:border-white/20",
  ghost: "text-muted hover:text-text hover:bg-surface",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `inline-flex items-center justify-center gap-2 rounded-btn px-4 h-11 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${extra}`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; loading?: boolean };

export function Button({ variant, loading, disabled, className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass(variant, className)} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant };

export function LinkButton({ variant, className = "", ...rest }: LinkButtonProps) {
  return <Link className={buttonClass(variant, className)} {...rest} />;
}
