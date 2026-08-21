import { ChevronRight, Clock, Menu } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import ThemeToggle from "../auth/ThemeToggle";

interface Props {
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
  onToggleSidebar?: () => void;   
  children?: React.ReactNode;     
}

function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardHeader({
  theme,
  setTheme,
  onToggleSidebar,
  children,
}: Props) {
  const { currentWorkspace, currentPage, pages } = useWorkspace();

  const breadcrumbPath: { id: string; title: string }[] = [];
  if (currentPage) {
    let node: any = currentPage;
    while (node) {
      breadcrumbPath.unshift({
        id: node.id,
        title: node.title || "Untitled",
      });
      node = node.parentId ? pages.find((p) => p.id === node.parentId) : null;
    }
  }

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        {onToggleSidebar && (
          <button
            className="dashboard-hamburger"
            onClick={onToggleSidebar}
            title="Menu"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="breadcrumb">
          <span className="breadcrumb-workspace">
            {currentWorkspace?.name || "Workspace"}
          </span>

          {breadcrumbPath.length > 0 && (
            <ChevronRight size={13} className="breadcrumb-sep" />
          )}

          {breadcrumbPath.map((item, index) => (
            <div key={item.id} className="breadcrumb-crumb">
              {index > 0 && (
                <ChevronRight size={13} className="breadcrumb-sep" />
              )}
              <span
                className={`breadcrumb-item ${
                  index === breadcrumbPath.length - 1
                    ? "breadcrumb-current"
                    : ""
                }`}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-header-right">
        {currentPage && (
          <>
            <div className="header-meta">
              <Clock size={12} />
              <span>Edited {timeAgo(currentPage.updatedAt)}</span>
            </div>

            <div className="header-divider" />
          </>
        )}

        {children && (
          <>
            {children}
            <div className="header-divider" />
          </>
        )}

        <div className="header-theme">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
}