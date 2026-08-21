import { useEffect, useState } from "react";
import { Search, FileText, Home } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import SearchModal from "./SearchModal";

export default function QuickActions() {
  const { setCurrentPage } = useWorkspace();
  const [showSearch, setShowSearch] = useState(false);

  
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <div className="quick-actions">
        <button
          className="quick-action"
          onClick={() => setCurrentPage(null)}
          title="Home"
        >
          <Home size={14} />
          <span>Home</span>
        </button>

        <button
          className="quick-action"
          onClick={() => setShowSearch(true)}
          title="Search"
        >
          <Search size={14} />
          <span>Search</span>
          <kbd className="quick-action-kbd">⌘K</kbd>
        </button>

        <button
          className="quick-action"
          onClick={() => setCurrentPage(null)}
          title="All pages"
        >
          <FileText size={14} />
          <span>All Pages</span>
        </button>
      </div>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}