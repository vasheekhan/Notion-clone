import { Sparkles, Plus, FileText } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function EmptyState() {
  const { createPage, currentWorkspace, pages } = useWorkspace();

  const hasPages = pages.some((p) => !p.isDeleted);

  async function handleCreate() {
    await createPage(null);
  }

  return (
    <div className="empty-state">
      <div className="empty-state-inner">
        <div className="empty-icon-wrap">
          {hasPages ? (
            <FileText size={30} className="empty-icon" />
          ) : (
            <Sparkles size={30} className="empty-icon" />
          )}
        </div>

        <h1 className="empty-title">
          {hasPages ? "No page selected" : "Welcome to Synapse"}
        </h1>

        <p className="empty-subtitle">
          {hasPages
            ? "Select a page from the sidebar to start writing."
            : "Your second brain for capturing ideas, notes, and everything in between."}
        </p>

        {currentWorkspace && !hasPages && (
          <button className="empty-btn primary" onClick={handleCreate}>
            <Plus size={16} />
            Create your first page
          </button>
        )}
      </div>
    </div>
  );
}