import { useState } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle // 🔥 ADDED MISSING IMPORT
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Field from "../Field";
import Divider from "../Divider";
import GoogleButton from "../GoogleButton";
import { loginUser } from "../../../services/auth.service";
import { useToastContext } from "../../../context/ToastContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginFormProps {
  gotoSignup: () => void;
  gotoForgotPassword: () => void;
}

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm({
  gotoSignup,
  gotoForgotPassword,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();

  function validate() {
    const e: Errors = {};

    if (!email) {
      e.email = "Enter your email address.";
    } else if (!emailRegex.test(email)) {
      e.email = "That doesn't look like a valid email.";
    }

    if (!password) {
      e.password = "Enter your password.";
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
      const response = await loginUser({
        email,
        password,
      });

      if (response.success) {
        success("Welcome back!", `Logged in successfully as ${response.user?.name || "User"}`);
        navigate("/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      
      // Handle specific error types
      if (errorMessage.toLowerCase().includes("invalid email or password")) {
        setErrors({
          general: "Invalid email or password. Please check your credentials and try again."
        });
        showError("Login Failed", "Invalid email or password");
      } else if (errorMessage.toLowerCase().includes("google sign-in")) {
        setErrors({
          general: "This account uses Google Sign-In. Please use the Google login button."
        });
        showError("Login Failed", "This account uses Google Sign-In");
      } else if (errorMessage.toLowerCase().includes("network")) {
        showError("Connection Error", "Please check your internet connection and try again.");
      } else {
        setErrors({ general: errorMessage });
        showError("Login Failed", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="title">Login to Synapse</h2>

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
        />
      </Field>

      <Field icon={Lock} label="Password" error={errors.password} index={1}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password || errors.general) {
              setErrors({ ...errors, password: undefined, general: undefined });
            }
          }}
        />

        <button
          type="button"
          className="field-adorn"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </Field>

      <div
        style={{
          textAlign: "right",
          marginBottom: "1.5rem",
          marginTop: "-0.5rem",
        }}
      >
        <button
          type="button"
          onClick={gotoForgotPassword}
          style={{
            background: "none",
            border: "none",
            fontSize: "0.875rem",
            color: "var(--primary)",
            cursor: "pointer",
            textDecoration: "none",
            padding: 0,
          }}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : "Log in"}
      </button>

      <Divider />

      <GoogleButton loading={loading} onClick={handleGoogleLogin} />

      <p className="switch">
        New to Synapse{" "}
        <a onClick={gotoSignup}>Create an account</a>
      </p>
    </form>
  );
}