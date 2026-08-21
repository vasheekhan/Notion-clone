import { useState, useEffect, useRef, useMemo } from "react";
import { Search, FileText, CornerDownLeft } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

interface Props {
  onClose: () => void;
}

export default function SearchModal({ onClose }: Props) {
  const { pages, setCurrentPage } = useWorkspace();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const active = pages.filter((p) => !p.isDeleted);

    if (!query.trim()) return active.slice(0, 10);

    const q = query.toLowerCase();
    return active
      .filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 20);
  }, [pages, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleSelect(index: number) {
    const page = results[index];
    if (page) {
      setCurrentPage(page);
      onClose();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="search-input"
          />

          <kbd className="search-kbd">ESC</kbd>
        </div>

        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-empty">
              {query ? `No pages match "${query}"` : "No pages yet"}
            </div>
          ) : (
            <>
              {!query && (
                <div className="search-section-label">Recent</div>
              )}

              {results.map((page, index) => (
                <button
                  key={page.id}
                  className={`search-result ${
                    index === selectedIndex ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <FileText size={14} className="search-result-icon" />

                  <span className="search-result-title">
                    {page.title || "Untitled"}
                  </span>

                  {index === selectedIndex && (
                    <CornerDownLeft size={12} className="search-enter" />
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="search-footer">
          <div className="search-hint">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>navigate</span>
          </div>
          <div className="search-hint">
            <kbd>↵</kbd>
            <span>open</span>
          </div>
          <div className="search-hint">
            <kbd>esc</kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    </div>
  );
}