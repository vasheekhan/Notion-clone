import { useState, useEffect, useRef } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import SettingsModal from "./SettingsModal";

export default function UserProfile() {
  const { user, logout } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState<
    "profile" | "password" | null
  >(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  function openTab(tab: "profile" | "password") {
    setShowSettings(tab);
    setOpen(false);
  }

  return (
    <>
      <div className="user-profile" ref={menuRef}>
        <button
          className="user-profile-trigger"
          onClick={() => setOpen(!open)}
        >
          {(user as any)?.avatar ? (
            <img
              src={(user as any).avatar}
              alt="Avatar"
              className="user-avatar user-avatar-img"
            />
          ) : (
            <div className="user-avatar">{initials}</div>
          )}

          <div className="user-info">
            <div className="user-name">{user?.name || "User"}</div>
            <div className="user-email">{user?.email || "Loading..."}</div>
          </div>
        </button>

        {open && (
          <div className="user-menu">
            <div className="user-menu-header">
              {(user as any)?.avatar ? (
                <img
                  src={(user as any).avatar}
                  alt="Avatar"
                  className="user-avatar user-avatar-lg user-avatar-img"
                />
              ) : (
                <div className="user-avatar user-avatar-lg">{initials}</div>
              )}
              <div className="user-info">
                <div className="user-name">{user?.name || "User"}</div>
                <div className="user-email">{user?.email || ""}</div>
              </div>
            </div>

            <div className="user-menu-divider" />

            <button
              className="user-menu-item"
              onClick={() => openTab("profile")}
            >
              <UserIcon size={14} />
              My Profile
            </button>

            <button
              className="user-menu-item"
              onClick={() => openTab("password")}
            >
              <Settings size={14} />
              Account Settings
            </button>

            <div className="user-menu-divider" />

            <button
              className="user-menu-item user-menu-item-danger"
              onClick={logout}
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          initialTab={showSettings}
          onClose={() => setShowSettings(null)}
        />
      )}
    </>
  );
}