import { useState, useRef } from "react";
import { X, User as UserIcon, Lock, Loader2, Check, Upload } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  updateProfile,
  changePassword,
} from "../../services/auth.service";
import { uploadImage } from "../../services/upload.service";
interface Props {
  onClose: () => void;
  initialTab?: "profile" | "password";
}

type Tab = "profile" | "password";

export default function SettingsModal({ onClose, initialTab = "profile" }: Props) {
  const { user, updateUser } = useWorkspace();
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Settings</h3>
          <button onClick={onClose} className="modal-close">
            <X size={16} />
          </button>
        </div>

        <div className="settings-body">
          {/* ─── Tabs ─── */}
          <div className="settings-tabs">
            <button
              className={`settings-tab ${tab === "profile" ? "active" : ""}`}
              onClick={() => setTab("profile")}
            >
              <UserIcon size={14} />
              Profile
            </button>

            <button
              className={`settings-tab ${tab === "password" ? "active" : ""}`}
              onClick={() => setTab("password")}
            >
              <Lock size={14} />
              Password
            </button>
          </div>

          {/* ─── Content ─── */}
          <div className="settings-content">
            {tab === "profile" && (
              <ProfileTab user={user} updateUser={updateUser} />
            )}
            {tab === "password" && <PasswordTab />}
          </div>
        </div>
      </div>
    </div>
  );
}



function ProfileTab({ user, updateUser }: any) {
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const url = await uploadImage(file, "avatars");
      setAvatar(url);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    try {
      const res = await updateProfile({ name, avatar });

      if (res.user) {
        updateUser({ name: res.user.name, avatar: res.user.avatar });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="settings-form">
      {/* Avatar Upload */}
      <div className="settings-avatar-section">
        <div className="settings-avatar-preview">
          {uploading ? (
            <div className="settings-avatar-initials">
              <Loader2 size={22} className="spin" />
            </div>
          ) : avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="settings-avatar-img"
            />
          ) : (
            <div className="settings-avatar-initials">{initials}</div>
          )}
        </div>

        <div className="settings-avatar-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: "none" }}
          />

          <button
            type="button"
            className="settings-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={14} />
            {avatar ? "Change photo" : "Upload photo"}
          </button>

          {avatar && (
            <button
              type="button"
              className="settings-btn settings-btn-ghost"
              onClick={() => setAvatar("")}
              disabled={uploading}
            >
              Remove
            </button>
          )}
        </div>

        <span className="settings-hint">
          JPG, PNG or WebP. Max 5MB.
        </span>
      </div>

      <div className="settings-field">
        <label className="settings-label">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="settings-input"
        />
      </div>

      <div className="settings-field">
        <label className="settings-label">Email</label>
        <input
          type="email"
          value={user?.email || ""}
          disabled
          className="settings-input settings-input-disabled"
        />
        <span className="settings-hint">Email cannot be changed</span>
      </div>

      {error && <div className="settings-error">{error}</div>}

      <div className="settings-actions">
        <button
          type="submit"
          className="settings-btn primary"
          disabled={loading || uploading}
        >
          {loading ? (
            <Loader2 size={14} className="spin" />
          ) : saved ? (
            <>
              <Check size={14} />
              Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}


function PasswordTab() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!oldPassword || !newPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await changePassword({ oldPassword, newPassword });

      setSaved(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="settings-form">
      <div className="settings-field">
        <label className="settings-label">Current Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter your current password"
          className="settings-input"
          autoComplete="current-password"
        />
      </div>

      <div className="settings-field">
        <label className="settings-label">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="settings-input"
          autoComplete="new-password"
        />
      </div>

      <div className="settings-field">
        <label className="settings-label">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          className="settings-input"
          autoComplete="new-password"
        />
      </div>

      {error && <div className="settings-error">{error}</div>}

      <div className="settings-actions">
        <button
          type="submit"
          className="settings-btn primary"
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={14} className="spin" />
          ) : saved ? (
            <>
              <Check size={14} />
              Password Changed!
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </div>
    </form>
  );
}