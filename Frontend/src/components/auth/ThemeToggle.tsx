import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

interface ThemeToggleProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export default function ThemeToggle({
  theme,
  setTheme,
}: ThemeToggleProps) {
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}
    </button>
  );
}