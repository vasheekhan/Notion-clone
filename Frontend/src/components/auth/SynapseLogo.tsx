interface SynapseLogoProps {
  size?: number;
}

export default function SynapseLogo({
  size = 26,
}: SynapseLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="16"
        y1="46"
        x2="32"
        y2="18"
        stroke="var(--mark-line)"
        strokeWidth="2"
      />

      <line
        x1="32"
        y1="18"
        x2="48"
        y2="46"
        stroke="var(--mark-line)"
        strokeWidth="2"
      />

      <line
        x1="16"
        y1="46"
        x2="48"
        y2="46"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeDasharray="6 5"
        className="pulse-line"
      />

      <circle
        cx="32"
        cy="18"
        r="5.5"
        fill="var(--bg)"
        stroke="var(--accent-2)"
        strokeWidth="2"
      />

      <circle
        cx="16"
        cy="46"
        r="5.5"
        fill="var(--bg)"
        stroke="var(--accent)"
        strokeWidth="2"
      />

      <circle
        cx="48"
        cy="46"
        r="5.5"
        fill="var(--bg)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
    </svg>
  );
}