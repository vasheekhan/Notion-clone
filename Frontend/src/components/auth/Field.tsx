import type{ LucideIcon } from "lucide-react";

interface FieldProps {
  icon: LucideIcon;
  label: string;
  error?: string;
  index?: number;
  children: React.ReactNode;
}

export default function Field({
  icon: Icon,
  label,
  error,
  index = 0,
  children,
}: FieldProps) {
  return (
    <label
      className="field"
      style={{
        animationDelay: `${0.08 * index}s`,
      }}
    >
      <span className="field-label">
        {label}
      </span>

      <div
        className={
          error
            ? "field-shell field-shell-error"
            : "field-shell"
        }
      >
        <Icon
          size={15}
          className="field-icon"
        />

        {children}
      </div>

      {error && (
        <span className="field-error">
          {error}
        </span>
      )}
    </label>
  );
}