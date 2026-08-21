import { useEffect, useState } from "react";
import { X, RotateCcw, Trash2 } from "lucide-react";
import {
  getTrash,
  restorePage,
  permanentDeletePage,
} from "../../services/page.service";
import { useWorkspace } from "../../context/WorkspaceContext";
import type { Page } from "../../types";

interface Props {
  onClose: () => void;
}

export default function TrashModal({ onClose }: Props) {
  const { refreshPages } = useWorkspace();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await getTrash();
      setPages(res.pages || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRestore(id: string) {
    await restorePage(id);
    await load();
    await refreshPages();
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this page?")) return;
    await permanentDeletePage(id);
    await load();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Trash</h3>
          <button onClick={onClose} className="modal-close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-empty">Loading...</div>
          ) : pages.length === 0 ? (
            <div className="modal-empty">Trash is empty.</div>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="trash-item">
                <span className="trash-item-title">
                  {page.title || "Untitled"}
                </span>

                <div className="trash-item-actions">
                  <button
                    onClick={() => handleRestore(page.id)}
                    title="Restore"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(page.id)}
                    title="Delete forever"
                    className="danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}