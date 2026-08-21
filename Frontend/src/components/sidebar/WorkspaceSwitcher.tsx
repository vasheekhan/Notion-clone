import { useState } from "react";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function WorkspaceSwitcher() {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    creatingWorkspace, 
  } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createWorkspace(name.trim());
      setName("");
      setCreating(false);
      setOpen(false);
    } catch (err) {
      
      console.error("Failed to create workspace:", err);
    }
  }

  return (
    <div className="ws-switcher">
      <button
        className="ws-switcher-trigger"
        onClick={() => setOpen(!open)}
        disabled={creatingWorkspace} 
      >
        <span className="ws-name">
          {currentWorkspace?.name || "No workspace"}
        </span>
        {creatingWorkspace ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ChevronDown size={14} />
        )}
      </button>

      {open && (
        <div className="ws-dropdown">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              className={`ws-item ${
                currentWorkspace?.id === ws.id ? "active" : ""
              } ${ws.id.startsWith('temp_') ? "optimistic" : ""}`} 
              onClick={() => {
                setCurrentWorkspace(ws);
                setOpen(false);
              }}
            >
              {ws.name}
              {ws.id.startsWith('temp_') && (
                <Loader2 size={12} className="animate-spin ml-1" />
              )}
            </button>
          ))}

          <div className="ws-divider" />

          {creating ? (
            <form onSubmit={handleCreate} className="ws-create-form">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                className="ws-create-input"
                disabled={creatingWorkspace}
              />
            </form>
          ) : (
            <button
              className="ws-item ws-item-add"
              onClick={() => setCreating(true)}
              disabled={creatingWorkspace}
            >
              <Plus size={14} />
              New workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}