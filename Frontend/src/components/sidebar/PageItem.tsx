import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
} from "lucide-react";
import type { Page } from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import PageTree from "./PageTree";

interface Props {
  page: Page;
  depth: number;
  childPages: Page[];
  allPages: Page[];
}

const MAX_DEPTH = 10;

export default function PageItem({
  page,
  depth,
  childPages,
  allPages,
}: Props) {
  const { currentPage, setCurrentPage, createPage, deletePage } =
    useWorkspace();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = currentPage?.id === page.id;
  const hasChildren = childPages.length > 0;
  const canAddChild = depth < MAX_DEPTH;

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleAddChild(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await createPage(page.id);
    setExpanded(true);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete "${page.title || "Untitled"}"?`)) {
      await deletePage(page.id);
    }
    setMenuOpen(false);
  }

  function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/dashboard?page=${page.id}`
    );
    setMenuOpen(false);
  }

  return (
    <>
      <div
        className={`page-item ${isActive ? "active" : ""}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => setCurrentPage(page)}
      >
        {/* Caret / File Icon */}
        <button
          className="page-item-caret"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded(!expanded);
          }}
        >
          {hasChildren ? (
            <ChevronRight
              size={12}
              className={`caret-icon ${expanded ? "expanded" : ""}`}
            />
          ) : (
            <FileText size={12} className="file-icon" />
          )}
        </button>

        {/* Title */}
        <span className="page-item-title">
          {page.icon && <span className="page-item-icon">{page.icon}</span>}
          <span className="page-item-text">
            {page.title || "Untitled"}
          </span>
        </span>

        {/* Actions */}
        <div className="page-item-actions" ref={menuRef}>
          <button
            className="page-item-action"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            title="More"
          >
            <MoreHorizontal size={14} />
          </button>

          {canAddChild && (
            <button
              className="page-item-action"
              onClick={handleAddChild}
              title="Add sub-page"
            >
              <Plus size={14} />
            </button>
          )}

          {menuOpen && (
            <div className="page-item-menu">
              <button
                onClick={handleCopyLink}
                className="page-menu-item"
              >
                <Copy size={12} />
                Copy link
              </button>

              <div className="page-menu-divider" />

              <button
                onClick={handleDelete}
                className="page-menu-item page-menu-item-danger"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <PageTree
          pages={childPages}
          allPages={allPages}
          depth={depth + 1}
        />
      )}
    </>
  );
}