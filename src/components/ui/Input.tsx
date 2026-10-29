import { useId, type ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & { label: string; error?: string };

export function Input({ label, error, id, className = "", ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm text-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="h-11 rounded-btn border border-line bg-surface px-3 text-text placeholder:text-muted/70 hover:border-accent/40 aria-[invalid=true]:border-danger disabled:opacity-50"
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
