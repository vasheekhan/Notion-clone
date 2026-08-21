import { useState } from "react";
import { Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Field from "./Field";
import { forgotPassword } from "../../services/auth.service";
import { useToastContext } from "../../context/ToastContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

interface Errors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordForm({
  onBack,
  onSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const { success, error: showError } = useToastContext();

  function validate() {
    const e: Errors = {};

    if (!email) {
      e.email = "Enter your email address.";
    } else if (!emailRegex.test(email)) {
      e.email = "That doesn't look like a valid email.";
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
      await forgotPassword({ email });
      success("Reset Code Sent!", "Please check your email for the verification code.");
      onSuccess(email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to send reset email. Please try again.";

      if (errorMessage.toLowerCase().includes("user not found") || 
          errorMessage.toLowerCase().includes("email not found")) {
        setErrors({
          email: "No account found with this email address.",
          general: "Please check your email or create a new account."
        });
        showError("Account Not Found", "No account exists with this email");
      } else if (errorMessage.toLowerCase().includes("network")) {
        showError("Connection Error", "Please check your internet connection and try again.");
      } else if (errorMessage.toLowerCase().includes("rate limit") ||
                 errorMessage.toLowerCase().includes("too many")) {
        setErrors({
          general: "Too many attempts. Please wait before trying again."
        });
        showError("Rate Limited", "Please wait before requesting another code");
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
          Back to login
        </button>
      </div>

      <h2 className="title">Reset your password</h2>

      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "2rem",
          lineHeight: "1.5",
        }}
      >
        Enter your email address and we'll send you a verification code to reset
        your password.
      </p>

      {errors.general && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{errors.general}</span>
        </div>
      )}

      <Field icon={Mail} label="Email" error={errors.email} index={0}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email || errors.general) {
              setErrors({ ...errors, email: undefined, general: undefined });
            }
          }}
          disabled={loading}
        />
      </Field>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !email}
      >
        {loading ? <Loader2 size={16} className="spin" /> : "Send reset code"}
      </button>
    </form>
  );
}