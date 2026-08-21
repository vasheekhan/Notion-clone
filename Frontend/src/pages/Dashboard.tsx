
import { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "../context/WorkspaceContext";
import Sidebar from "../components/sidebar/Sidebar";
import Editor from "../components/editor/Editor";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import EmptyState from "../components/dashboard/EmptyState";
import AIPanel from "../components/ai/AIPanel";
import { markdownToTiptapNodes } from "../utils/markdownToTiptap";

import "../styles/dashboard.css";

function DashboardContent() {
  const { currentPage, loading } = useWorkspace();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 1024;
  });

  const [selectedText, setSelectedText] = useState("");
  const [editor, setEditor] = useState<any>(null);

  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setIsAIPanelOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-close sidebar on mobile when navigating to a page
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  }, [currentPage?.id]);

  // Save selection when AI panel opens
  useEffect(() => {
    if (isAIPanelOpen && editor) {
      const { from, to } = editor.state.selection;
      savedSelectionRef.current = { from, to };

      if (from !== to) {
        setSelectedText(editor.state.doc.textBetween(from, to, "\n"));
      } else {
        setSelectedText("");
      }
    }
  }, [isAIPanelOpen, editor]);

  useEffect(() => {
    setEditor(null);
    savedSelectionRef.current = null;
  }, [currentPage?.id]);

  const getPageContent = useCallback((): string => {
    if (!editor) return "";
    return editor.getText() || "";
  }, [editor]);

  const handleInsertAtCursor = useCallback(
    (text: string) => {
      if (!editor) return;
      const nodes = markdownToTiptapNodes(text);
      if (nodes.length === 0) return;

      const saved = savedSelectionRef.current;
      if (saved) {
        editor
          .chain()
          .focus()
          .setTextSelection(saved.to)
          .insertContent(nodes)
          .run();
      } else {
        editor.chain().focus().insertContent(nodes).run();
      }
      setIsAIPanelOpen(false);
    },
    [editor]
  );

  const handleInsertAtEnd = useCallback(
    (text: string) => {
      if (!editor) return;
      const nodes = markdownToTiptapNodes(text);
      if (nodes.length === 0) return;

      const endPos = editor.state.doc.content.size;
      editor
        .chain()
        .focus()
        .setTextSelection(endPos)
        .insertContent(nodes)
        .run();
      setIsAIPanelOpen(false);
    },
    [editor]
  );

  const handleReplace = useCallback(
    (text: string) => {
      if (!editor) return;
      const nodes = markdownToTiptapNodes(text);
      if (nodes.length === 0) return;

      const saved = savedSelectionRef.current;
      if (saved && saved.from !== saved.to) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: saved.from, to: saved.to })
          .insertContent(nodes)
          .run();
      } else {
        editor.chain().focus().insertContent(nodes).run();
      }
      setIsAIPanelOpen(false);
    },
    [editor]
  );

  if (loading) {
    return (
      <div className={`dashboard theme-${theme}`}>
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <span>Loading your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dashboard theme-${theme} ${
        isAIPanelOpen ? "ai-open" : ""
      } ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      {/* Backdrop — only shows on mobile via CSS */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar onClose={() => setIsSidebarOpen(false)} />

      <main className="dashboard-main">
        <DashboardHeader
          theme={theme}
          setTheme={setTheme}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <button
            className={`ai-toggle-btn ${isAIPanelOpen ? "active" : ""}`}
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            title="AI Assistant (⌘J)"
          >
            <Sparkles size={16} />
          </button>
        </DashboardHeader>

        <div className="dashboard-content">
          {currentPage ? (
            <Editor
              key={currentPage.id}
              page={currentPage}
              onEditorReady={setEditor}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      <AIPanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        pageId={currentPage?.id}
        pageTitle={currentPage?.title || ""}
        pageContent={getPageContent()}
        selectedText={selectedText}
        onInsertAtCursor={handleInsertAtCursor}
        onInsertAtEnd={handleInsertAtEnd}
        onReplace={handleReplace}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <WorkspaceProvider>
      <DashboardContent />
    </WorkspaceProvider>
  );
}