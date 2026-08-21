import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import SynapseLogo from "../auth/SynapseLogo";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import PageTree from "./PageTree";
import TrashModal from "./TrashModal";
import UserProfile from "./UserProfile";
import QuickActions from "./QuickActions";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { 
    pages, 
    createPage, 
    currentWorkspace, 
    creatingPage 
  } = useWorkspace();
  const [showTrash, setShowTrash] = useState(false);

  const rootPages = pages.filter((p) => !p.parentId && !p.isDeleted);
  const totalPages = pages.filter((p) => !p.isDeleted).length;

  async function handleCreatePage() {
    try {
      await createPage(null);
    } catch (err) {
      console.error("Failed to create page:", err);
      
    }
  }

  return (
    <aside className="sidebar">
      {/* ─── Brand ─── */}
      <div className="sidebar-brand">
        <SynapseLogo size={22} />
        <span className="sidebar-brand-name">synapse</span>

        {onClose && (
          <button
            className="sidebar-mobile-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ─── Workspace Switcher ─── */}
      <div className="sidebar-workspace">
        <WorkspaceSwitcher />
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="sidebar-quick">
        <QuickActions />
      </div>

      {/* ─── Pages ─── */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>
            Pages{" "}
            {totalPages > 0 && (
              <span className="sidebar-count">{totalPages}</span>
            )}
          </span>

          <button
            className="sidebar-icon-btn"
            onClick={handleCreatePage}
            title="New page"
            disabled={!currentWorkspace || creatingPage}
          >
            {creatingPage ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
          </button>
        </div>

        <PageTree pages={rootPages} allPages={pages} />
      </div>

      {/* ─── Trash button ─── */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-trash-btn"
          onClick={() => setShowTrash(true)}
        >
          <Trash2 size={14} />
          <span>Trash</span>
        </button>
      </div>

      {/* ─── User Profile (bottom) ─── */}
      <div className="sidebar-user">
        <UserProfile />
      </div>

      {showTrash && <TrashModal onClose={() => setShowTrash(false)} />}
    </aside>
  );
}