import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, KeyRound, AlertCircle } from "lucide-react";
import Field from "./Field";
import { resetPassword } from "../../services/auth.service";
import { useToastContext } from "../../context/ToastContext";

interface ResetPasswordFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface Errors {
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPasswordForm({
  email,
  onBack,
  onSuccess,
}: ResetPasswordFormProps) {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const { success, error: showError } = useToastContext();

  function validate() {
    const e: Errors = {};

    if (!otp) {
      e.otp = "Enter the verification code.";
    } else if (otp.length !== 6) {
      e.otp = "Verification code must be 6 digits.";
    }

    if (!newPassword) {
      e.newPassword = "Enter your new password.";
    } else if (newPassword.length < 8) {
      e.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      e.confirmPassword = "Confirm your new password.";
    } else if (confirmPassword !== newPassword) {
      e.confirmPassword = "Passwords do not match.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await resetPassword({
        email,
        otp,
        newPassword,
      });
      
      success("Password Reset!", "Your password has been successfully updated. You can now log in with your new password.");
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to reset password.";

      if (errorMessage.toLowerCase().includes("otp") || 
          errorMessage.toLowerCase().includes("code") ||
          errorMessage.toLowerCase().includes("invalid")) {
        setErrors({ 
          otp: "Invalid or expired verification code.",
          general: "Please check your verification code and try again."
        });
        showError("Invalid Code", "Please check your verification code");
      } else if (errorMessage.toLowerCase().includes("expired")) {
        setErrors({
          otp: "Verification code has expired.",
          general: "Please request a new reset code."
        });
        showError("Code Expired", "Please request a new verification code");
      } else if (errorMessage.toLowerCase().includes("password")) {
        setErrors({ newPassword: "Password doesn't meet requirements." });
        showError("Invalid Password", errorMessage);
      } else if (errorMessage.toLowerCase().includes("network")) {
        showError("Connection Error", "Please check your internet connection and try again.");
      } else {
        setErrors({ general: errorMessage });
        showError("Reset Failed", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <h2 className="title">Enter new password</h2>

      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "2rem",
          lineHeight: "1.5",
        }}
      >
        Enter the verification code sent to <strong>{email}</strong> and choose
        a new password.
      </p>

      {errors.general && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{errors.general}</span>
        </div>
      )}

      <Field
        icon={KeyRound}
        label="Verification Code"
        error={errors.otp}
        index={0}
      >
        <input
          type="text"
          placeholder="123456"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
            if (errors.otp || errors.general) {
              setErrors({ ...errors, otp: undefined, general: undefined });
            }
          }}
          disabled={loading}
          maxLength={6}
          style={{ textAlign: "center", letterSpacing: "0.5em" }}
        />
      </Field>

      <Field
        icon={Lock}
        label="New Password"
        error={errors.newPassword}
        index={1}
      >
        <input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword || errors.general) {
              setErrors({ ...errors, newPassword: undefined, general: undefined });
            }
          }}
          disabled={loading}
        />

        <button
          type="button"
          className="field-adorn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </Field>

      <Field
        icon={Lock}
        label="Confirm New Password"
        error={errors.confirmPassword}
        index={2}
      >
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword || errors.general) {
              setErrors({ ...errors, confirmPassword: undefined, general: undefined });
            }
          }}
          disabled={loading}
        />

        <button
          type="button"
          className="field-adorn"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </Field>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : "Reset password"}
      </button>
    </form>
  );
}