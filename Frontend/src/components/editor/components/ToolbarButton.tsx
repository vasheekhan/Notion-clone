import type { ReactNode } from "react";

interface ToolbarButtonProps {
  icon: ReactNode;
  isActive?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  icon,
  isActive = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex h-9 w-9 items-center justify-center
        rounded-md
        transition-colors
        ${
          isActive
            ? "bg-neutral-200 text-black"
            : "text-neutral-600 hover:bg-neutral-100"
        }
      `}
    >
      {icon}
    </button>
  );
}

export default ToolbarButton;